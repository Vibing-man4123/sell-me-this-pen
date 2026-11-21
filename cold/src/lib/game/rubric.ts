import { z } from "zod";

/**
 * The scoring rubric. This is the contract between the LLM judge and the
 * economy: the judge returns exactly this shape, `scoreCall()` turns it into
 * money. Changing weights re-balances the whole game, so they live here alone.
 */

export const CRITERIA = ["charisma", "confidence", "objectionHandling", "closing"] as const;
export type Criterion = (typeof CRITERIA)[number];

type CriterionSpec = {
  /** Shown in the results screen. */
  label: string;
  /** Share of the weighted score. Must sum to 1 across all criteria. */
  weight: number;
  /** One-liner for the player, under the bar. */
  blurb: string;
  /** Anchors fed to the judge so scores don't drift between calls. */
  anchors: { score: number; meaning: string }[];
};

export const RUBRIC: Record<Criterion, CriterionSpec> = {
  charisma: {
    label: "Charisma",
    weight: 0.2,
    blurb: "Did they enjoy the call, or were they checking the clock and the exits?",
    anchors: [
      { score: 0, meaning: "Robotic, read off a script, zero warmth or personality." },
      { score: 3, meaning: "Polite but forgettable. No rapport, no reason to keep listening." },
      { score: 6, meaning: "Likeable. Used the client's name/world, landed at least one human moment." },
      { score: 9, meaning: "Magnetic. The client is enjoying this against their own better judgement." },
    ],
  },
  confidence: {
    label: "Confidence",
    weight: 0.2,
    blurb: "Conviction, not volume. Hedging is where commission goes to die.",
    anchors: [
      { score: 0, meaning: "Apologised for calling, asked permission to speak, folded instantly." },
      { score: 3, meaning: "Hedged constantly ('maybe', 'if you want', 'sorry to bother')." },
      { score: 6, meaning: "Steady. Made clear statements and held them under light pushback." },
      { score: 9, meaning: "Total assumed authority. Priced the deal like it was already closed." },
    ],
  },
  objectionHandling: {
    label: "Objection Handling",
    weight: 0.35,
    blurb: "The only part of the call that is actually hard. Everything else is just talking.",
    anchors: [
      { score: 0, meaning: "Ignored every objection or just repeated the pitch louder." },
      { score: 3, meaning: "Acknowledged objections but had no answer and let them stand." },
      { score: 6, meaning: "Addressed the real objection, reframed it, moved the conversation forward." },
      { score: 9, meaning: "Turned objections into reasons to buy, using the client's own words." },
    ],
  },
  closing: {
    label: "Closing",
    weight: 0.25,
    blurb: "Did a specific ask actually leave your mouth, or just a vibe?",
    anchors: [
      { score: 0, meaning: "Never asked for anything. Call just... ended." },
      { score: 3, meaning: "A vague 'so, let me know' with no commitment attached." },
      { score: 6, meaning: "Made a clear, specific ask with a number and a next step." },
      { score: 9, meaning: "Closed hard, handled the flinch, confirmed the commitment out loud." },
    ],
  },
};

/** Fails loudly at import time if the weights ever stop summing to 1. */
const WEIGHT_SUM = CRITERIA.reduce((acc, c) => acc + RUBRIC[c].weight, 0);
if (Math.abs(WEIGHT_SUM - 1) > 1e-9) {
  throw new Error(`Rubric weights must sum to 1, got ${WEIGHT_SUM}`);
}

export const SCORE_MIN = 0;
export const SCORE_MAX = 10;

const scoreField = (criterion: Criterion) =>
  z
    .number()
    .int()
    .min(SCORE_MIN)
    .max(SCORE_MAX)
    .describe(`${RUBRIC[criterion].label} (0-10). ${RUBRIC[criterion].blurb}`);

/** Exactly what the judge model must return. */
export const VerdictSchema = z.object({
  charisma: scoreField("charisma"),
  confidence: scoreField("confidence"),
  objectionHandling: scoreField("objectionHandling"),
  closing: scoreField("closing"),
  closedDeal: z
    .boolean()
    .describe(
      "True only if the client clearly agreed to buy or commit in their own words. Vague interest is false."
    ),
  unitsSold: z
    .number()
    .int()
    .min(0)
    .max(99)
    .describe("How many units the client agreed to. 0 if closedDeal is false, otherwise at least 1."),
  bestLine: z
    .string()
    .max(240)
    .describe("The single strongest thing the broker said, quoted verbatim from the transcript."),
  worstLine: z
    .string()
    .max(240)
    .describe("The single weakest thing the broker said, quoted verbatim from the transcript."),
  coaching: z
    .string()
    .max(600)
    .describe(
      "2-3 sentences of feedback, written as a sleazy 90s sales manager chewing out his rookie. Harsh, funny, but genuinely actionable."
    ),
});

export type Verdict = z.infer<typeof VerdictSchema>;

/** JSON Schema handed to the LLM for structured output. Derived, never hand-maintained. */
export const VERDICT_JSON_SCHEMA = stripBounds(z.toJSONSchema(VerdictSchema, { target: "draft-7" }));

/**
 * Groq's strict mode rejects the WHOLE generation with a 400 when any string
 * is a few characters over maxLength (this caused ~50% of gradings to 502).
 * So the schema we send carries shape only; bounds are enforced by
 * `normalizeVerdict` on our side, where overshoot is trimmed, not fatal.
 */
function stripBounds<T>(node: T): T {
  if (Array.isArray(node)) return node.map(stripBounds) as T;
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "maxLength" || k === "minLength" || k === "minimum" || k === "maximum") continue;
      out[k] = stripBounds(v);
    }
    return out as T;
  }
  return node;
}

/** Clamps scores and trims over-long text so a near-miss is not a failed call. */
export function normalizeVerdict(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const v = { ...(raw as Record<string, unknown>) };
  for (const c of CRITERIA) {
    if (typeof v[c] === "number") v[c] = Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(v[c] as number)));
  }
  if (typeof v.unitsSold === "number") v.unitsSold = Math.min(99, Math.max(0, Math.round(v.unitsSold)));
  for (const [k, max] of [["bestLine", 240], ["worstLine", 240], ["coaching", 600]] as const) {
    if (typeof v[k] === "string" && (v[k] as string).length > max) v[k] = trimText(v[k] as string, max);
  }
  return v;
}

/**
 * Cuts over-long text at the last sentence end that fits, else the last word
 * break, so the results screen never shows "your spreadshee". No ellipsis is
 * added: a quote must stay a verbatim substring of the broker's line.
 */
export function trimText(text: string, max: number): string {
  if (text.length <= max) return text;
  const head = text.slice(0, max);
  const sentence = head.match(/^[\s\S]*[.!?\u2026]["'\u201d\u2019)]*(?=\s)/);
  if (sentence && sentence[0].length >= max / 2) return sentence[0].trim();
  const space = head.lastIndexOf(" ");
  return (space > 0 ? head.slice(0, space) : head).replace(/[\s,;:-]+$/, "");
}

/** 0-10, weighted. The single number the payout formula consumes. */
export function weightedScore(v: Pick<Verdict, Criterion>): number {
  return CRITERIA.reduce((acc, c) => acc + v[c] * RUBRIC[c].weight, 0);
}

/** Flavour label for the results screen. */
export function gradeLabel(weighted: number): string {
  if (weighted >= 9) return "Legendary";
  if (weighted >= 7.5) return "Closer";
  if (weighted >= 6) return "Solid";
  if (weighted >= 4) return "Shaky";
  if (weighted >= 2) return "Rough";
  return "Call security";
}
