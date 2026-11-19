import { CallRequestSchema, type CallResponse } from "@/lib/api/contracts";
import { ERROR_COPY } from "@/lib/api/errors";
import {
  badRequestResponse,
  errorResponse,
  groqErrorResponse,
  readJson,
} from "@/lib/api/respond";
import { CALL_CONFIG } from "@/lib/game/constants";
import { getItem } from "@/lib/game/items";
import { getPersona } from "@/lib/game/personas";
import { brokerTurnsUsed, type CallOutcome, type Turn } from "@/lib/game/transcript";
import {
  buildClientOpeningInstruction,
  buildClientSystemPrompt,
  buildFinalTurnNudge,
} from "@/lib/prompts/clientPrompt";
import { chat, GroqError, MODELS, type ChatMessage } from "@/lib/server/groq";

/**
 * One exchange of a cold call: takes the transcript so far, returns what the
 * client says next and whether the call is now over.
 *
 * The API key lives only in this process - the browser talks to this route and
 * never to Groq.
 */

/** The client's end-of-call tokens. Stripped before anything reaches the UI. */
const TOKENS: { token: string; outcome: Extract<CallOutcome, "closed" | "hangup"> }[] = [
  { token: "[CLOSED]", outcome: "closed" },
  { token: "[HANGUP]", outcome: "hangup" },
];

function readTokens(raw: string): { reply: string; outcome: CallOutcome } {
  let reply = raw;
  let outcome: CallOutcome = "open";

  for (const { token, outcome: hit } of TOKENS) {
    if (reply.includes(token)) {
      outcome = hit;
      reply = reply.split(token).join("");
    }
  }

  // Models occasionally invent bracketed stage directions despite the prompt;
  // drop any leftovers so the player never sees the machinery.
  reply = reply.replace(/\[[A-Z_]{3,}\]/g, "").trim();

  return { reply, outcome };
}

/** Transcript -> chat messages. The client model is the assistant. */
function toMessages(turns: Turn[]): ChatMessage[] {
  return turns.map((t) => ({
    role: t.role === "broker" ? "user" : "assistant",
    content: t.content,
  }));
}

export async function POST(request: Request) {
  const parsed = CallRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequestResponse(parsed.error);

  const { personaId, itemId, turns } = parsed.data;
  const persona = getPersona(personaId);
  const item = getItem(itemId);

  const used = brokerTurnsUsed(turns);
  if (used > CALL_CONFIG.maxTurns) {
    return errorResponse(
      {
        error: {
          kind: "bad_request",
          title: "That call is already over",
          message: "You used your exchanges. Hang up and take the grading.",
          retryable: false,
        },
      },
      409
    );
  }

  const isLastExchange = used === CALL_CONFIG.maxTurns;

  const messages: ChatMessage[] = [
    { role: "system", content: buildClientSystemPrompt(persona, item) },
  ];

  if (turns.length === 0) {
    // The phone is still ringing: the client speaks first.
    messages.push({ role: "user", content: buildClientOpeningInstruction(persona) });
  } else {
    messages.push(...toMessages(turns));
    if (isLastExchange) {
      messages.push({ role: "system", content: buildFinalTurnNudge() });
    }
  }

  let result;
  try {
    result = await chat({
      model: MODELS.client(),
      messages,
      maxTokens: CALL_CONFIG.clientMaxTokens,
      temperature: 0.9,
    });
  } catch (err) {
    if (err instanceof GroqError) return groqErrorResponse(err);
    throw err;
  }

  let { reply, outcome: tokenOutcome } = readTokens(result.text);

  // Models sometimes parrot an earlier line verbatim. One retry, with a nudge.
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const said = new Set(turns.filter((t) => t.role !== "broker").map((t) => norm(t.content)));
  if (reply && said.has(norm(reply))) {
    try {
      const retry = await chat({
        model: MODELS.client(),
        messages: [
          ...messages,
          { role: "system", content: "(Director's note: you just repeated an earlier line word for word. Say something new: escalate or change your objection.)" },
        ],
        maxTokens: CALL_CONFIG.clientMaxTokens,
        temperature: 1,
      });
      const again = readTokens(retry.text);
      if (again.reply) ({ reply, outcome: tokenOutcome } = again);
    } catch {
      // keep the original reply
    }
  }

  if (reply === "") {
    return errorResponse(
      { error: { kind: "bad_output", ...ERROR_COPY.bad_output, retryable: true } },
      502
    );
  }

  // Running out of exchanges ends the call too, unless the client already ended
  // it themselves - an explicit close or hangup always wins over the clock.
  const outcome: CallOutcome =
    tokenOutcome !== "open" ? tokenOutcome : isLastExchange ? "timeout" : "open";

  const body: CallResponse = {
    reply,
    outcome,
    turnsLeft: Math.max(0, CALL_CONFIG.maxTurns - used),
  };
  return Response.json(body);
}
