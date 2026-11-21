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
import { closeBlocked, lieState } from "@/lib/game/lies";
import { priceContext, priceNote, suspiciousAmounts } from "@/lib/game/prices";
import { cleanLanguage, readReply } from "@/lib/game/reply";
import { capSentences, dropBackToBackPhrases } from "@/lib/game/tics";
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
    { role: "system", content: buildClientSystemPrompt(persona, item, turns) },
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

  let { reply, outcome: tokenOutcome } = readReply(result);

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
      const again = readReply(retry);
      if (again.reply) ({ reply, outcome: tokenOutcome } = again);
    } catch {
      // keep the original reply
    }
  }

  // Models misquote money ("a nine-dollar plastic stick" for a 19-dollar pen).
  // One retry with the real price; if that is still off, keep whichever reply
  // gets fewer amounts wrong (ties keep the first).
  const prices = priceContext(persona, item, turns);
  const misquoted = suspiciousAmounts(reply, prices);
  if (misquoted.length > 0) {
    console.error(`[call] misquoted ${misquoted.join(", ")} (price ${item.unitPrice}); retrying once`);
    try {
      const retry = await chat({
        model: MODELS.client(),
        messages: [
          ...messages,
          { role: "assistant", content: reply },
          { role: "system", content: priceNote(item.unitPrice, misquoted) },
        ],
        maxTokens: CALL_CONFIG.clientMaxTokens,
        temperature: 0.9,
      });
      const again = readReply(retry);
      if (again.reply && suspiciousAmounts(again.reply, prices).length < misquoted.length) {
        ({ reply, outcome: tokenOutcome } = again);
      }
    } catch {
      // keep the original reply
    }
  }

  // A caught lie blocks the close until the caller owns it and talks straight
  // for one more exchange (lib/game/lies.ts). The prompt says so; this holds
  // the line when the model forgets. If the retry still closes, it stands.
  const lie = lieState(turns);
  if (tokenOutcome === "closed" && closeBlocked(lie)) {
    console.error(`[call] close blocked by lie state ${lie.kind}; retrying once`);
    try {
      const retry = await chat({
        model: MODELS.client(),
        messages: [
          ...messages,
          { role: "assistant", content: reply },
          {
            role: "system",
            content:
              lie.kind === "unowned"
                ? "(Director's note: you just agreed to buy, but you caught this caller lying and they never owned it. Write that reply again: you do NOT agree, and you say why. No [CLOSED].)"
                : "(Director's note: you just agreed to buy, but the caller only just owned their lie. Write that reply again: acknowledge it, but do not agree yet; they need one more honest exchange. No [CLOSED].)",
          },
        ],
        maxTokens: CALL_CONFIG.clientMaxTokens,
        temperature: 0.9,
      });
      const again = readReply(retry);
      if (again.reply && again.outcome !== "closed") ({ reply, outcome: tokenOutcome } = again);
    } catch {
      // keep the original reply
    }
  }

  // Swears swapped and signature lines rationed in code (the prompt alone does
  // not hold), and the sentence limit enforced. A reply that ends the call
  // keeps its full length so the client's actual terms or goodbye are never cut.
  reply = dropBackToBackPhrases(cleanLanguage(reply.replace(/\s*\n\s*/g, " ")), persona, turns);
  if (tokenOutcome === "open") reply = capSentences(reply, 4);

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
