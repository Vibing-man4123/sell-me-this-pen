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
    blurb: "Did they actually enjoy the call, or were they counting the seconds?",
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
    blurb: "The only part of the call that is actually hard.",
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
    blurb: "Did a specific ask actually leave your mouth?",
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
export const VERDICT_JSON_SCHEMA = z.toJSONSchema(VerdictSchema, { target: "draft-7" });

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
