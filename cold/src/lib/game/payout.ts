import { getItem } from "./items";
import { getPersona } from "./personas";
import { CRITERIA, RUBRIC, gradeLabel, weightedScore, type Verdict } from "./rubric";

/**
 * Verdict -> dollars. Kept pure and dependency-free so the results screen can
 * show the exact arithmetic it used; players trust a payout they can follow.
 */

/** Share of commission still paid on a lost call, scaled by score. */
const NO_SALE_RATE = 0.06;
/** Floor of the score curve on a won call - even a sloppy close pays something. */
const CLOSE_FLOOR = 0.3;
/** Extra commission per additional unit beyond the first, with diminishing effect. */
const UNIT_BONUS = 0.35;
const MAX_UNIT_FACTOR = 3;

export type PayoutBreakdown = {
  base: number;
  difficulty: number;
  weighted: number;
  grade: string;
  scoreFactor: number;
  unitFactor: number;
  closedDeal: boolean;
  /** Final, rounded dollars added to the player's balance. */
  total: number;
  /** Per-criterion rows for the results screen. */
  rows: { criterion: string; label: string; score: number; weight: number; contribution: number }[];
};

export function computePayout(
  itemId: string,
  personaId: string,
  verdict: Verdict
): PayoutBreakdown {
  const item = getItem(itemId);
  const persona = getPersona(personaId);

  const weighted = weightedScore(verdict);
  const scoreFactor = weighted / 10;
  const units = verdict.closedDeal ? Math.max(1, verdict.unitsSold) : 0;
  const unitFactor = Math.min(MAX_UNIT_FACTOR, 1 + UNIT_BONUS * Math.max(0, units - 1));

  const rate = verdict.closedDeal
    ? (CLOSE_FLOOR + (1 - CLOSE_FLOOR) * scoreFactor) * unitFactor
    : NO_SALE_RATE * scoreFactor;

  const total = Math.round((item.baseCommission * persona.difficulty * rate) / 10) * 10;

  return {
    base: item.baseCommission,
    difficulty: persona.difficulty,
    weighted,
    grade: gradeLabel(weighted),
    scoreFactor,
    unitFactor,
    closedDeal: verdict.closedDeal,
    total,
    rows: CRITERIA.map((c) => ({
      criterion: c,
      label: RUBRIC[c].label,
      score: verdict[c],
      weight: RUBRIC[c].weight,
      contribution: verdict[c] * RUBRIC[c].weight,
    })),
  };
}

export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}
