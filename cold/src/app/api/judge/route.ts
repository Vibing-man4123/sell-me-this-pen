import { JudgeRequestSchema, type JudgeResponse } from "@/lib/api/contracts";
import { ERROR_COPY } from "@/lib/api/errors";
import {
  badRequestResponse,
  errorResponse,
  groqErrorResponse,
  readJson,
} from "@/lib/api/respond";
import { getItem } from "@/lib/game/items";
import { computePayout } from "@/lib/game/payout";
import { getPersona } from "@/lib/game/personas";
import { normalizeVerdict, VERDICT_JSON_SCHEMA, VerdictSchema, type Verdict } from "@/lib/game/rubric";
import type { CallOutcome, Turn } from "@/lib/game/transcript";
import { buildJudgeSystemPrompt, buildJudgeUserPrompt } from "@/lib/prompts/judgePrompt";
import { chat, GroqError, MODELS, type ChatMessage } from "@/lib/server/groq";

/**
 * Grades a finished call and converts the verdict into money.
 *
 * The payout is computed here rather than in the browser so the number the
 * player banks comes from one place, and so Phase 2's persistence has a single
 * authoritative figure to store.
 */

/**
 * The judge is a reasoning model: its thinking shares this budget with the
 * answer, so the ceiling is well above the size of the JSON itself. A tighter
 * cap returns an empty message instead of a verdict - verified, not theorised.
 */
const JUDGE_MAX_TOKENS = 2_500;

/** Verbatim-quote fields the judge sometimes paraphrases or pads. */
const QUOTE_FIELDS = ["bestLine", "worstLine"] as const;

/**
 * Brings the verdict in line with what actually happened.
 *
 * `[CLOSED]` and `[HANGUP]` are deterministic and win outright - letting a
 * model contradict them would make the same transcript pay differently on a
 * re-grade.
 *
 * A call that merely ran out of time is the one ambiguous case, and it is not
 * rare: the client sometimes agrees in plain words ("one unit, card on file")
 * and simply never emits the token. Forcing those to "no sale" would underpay
 * a deal the player genuinely closed, so there - and only there - the judge's
 * reading of the transcript stands.
 */
function reconcile(verdict: Verdict, outcome: Exclude<CallOutcome, "open">): Verdict {
  // "timeout" and "walkaway" both land here: the call ended without the client
  // ever emitting a token, so only the transcript can say what happened.
  const closedDeal =
    outcome === "closed" ? true : outcome === "hangup" ? false : verdict.closedDeal;

  return {
    ...verdict,
    closedDeal,
    unitsSold: closedDeal ? Math.max(1, verdict.unitsSold) : 0,
  };
}

/** True if the quote fields are really quotes from the broker. */
function quotesAreReal(verdict: Verdict, turns: Turn[]): boolean {
  const brokerText = turns
    .filter((t) => t.role === "broker")
    .map((t) => t.content.toLowerCase())
    .join("\n");

  return QUOTE_FIELDS.every((field) => {
    const quote = verdict[field].trim().toLowerCase();
    // An empty quote is legitimate when the broker barely spoke.
    if (quote === "") return true;
    return brokerText.includes(quote);
  });
}

async function requestVerdict(messages: ChatMessage[]): Promise<{ text: string }> {
  const result = await chat({
    model: MODELS.judge(),
    messages,
    maxTokens: JUDGE_MAX_TOKENS,
    temperature: 0.3,
    jsonSchema: { name: "verdict", schema: VERDICT_JSON_SCHEMA },
  });
  return { text: result.text };
}

export async function POST(request: Request) {
  const parsed = JudgeRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequestResponse(parsed.error);

  const { personaId, itemId, turns, outcome } = parsed.data;
  const persona = getPersona(personaId);
  const item = getItem(itemId);

  const messages: ChatMessage[] = [
    { role: "system", content: buildJudgeSystemPrompt() },
    { role: "user", content: buildJudgeUserPrompt(persona, item, turns, outcome) },
  ];

  // Groq enforces the JSON Schema, but not the parts of the contract that are
  // ours: integer ranges, string lengths, and quotes that are actually quotes.
  // One retry, with the specific complaint attached.
  let verdict: Verdict | null = null;
  let lastProblem = "";
  let transientRetried = false;

  for (let attempt = 0; attempt < 2 && verdict === null; attempt++) {
    if (attempt > 0) {
      messages.push({
        role: "user",
        content: `Your previous answer was rejected: ${lastProblem}. Return a corrected JSON verdict, same schema, nothing else.`,
      });
    }

    let text: string;
    try {
      ({ text } = await requestVerdict(messages));
    } catch (err) {
      // One bounded retry for transient upstream trouble (5xx, bad generation).
      // Never for rate limits or config - those must not be hammered.
      if (
        err instanceof GroqError &&
        (err.kind === "upstream" || err.kind === "bad_output") &&
        !transientRetried
      ) {
        transientRetried = true;
        console.error(`[judge] transient ${err.kind}, retrying once: ${err.message}`);
        await new Promise((r) => setTimeout(r, 600));
        attempt--;
        continue;
      }
      if (err instanceof GroqError) return groqErrorResponse(err);
      throw err;
    }

    let candidate: unknown;
    try {
      candidate = JSON.parse(text);
    } catch {
      lastProblem = "it was not valid JSON";
      continue;
    }

    const check = VerdictSchema.safeParse(normalizeVerdict(candidate));
    if (!check.success) {
      lastProblem = check.error.issues
        .map((i) => `${i.path.join(".")} ${i.message}`)
        .join("; ");
      continue;
    }

    if (!quotesAreReal(check.data, turns)) {
      lastProblem =
        "bestLine and worstLine must be copied character-for-character from the BROKER lines in the transcript";
      continue;
    }

    verdict = check.data;
  }

  if (verdict === null) {
    console.error(`[judge] bad_output after retries: ${lastProblem}`);
    return errorResponse(
      {
        error: {
          kind: "bad_output",
          ...ERROR_COPY.bad_output,
          retryable: true,
          detail: lastProblem,
        },
      },
      502
    );
  }

  const reconciled = reconcile(verdict, outcome);
  const body: JudgeResponse = {
    verdict: reconciled,
    payout: computePayout(itemId, personaId, reconciled),
  };
  return Response.json(body);
}
