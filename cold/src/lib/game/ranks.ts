/**
 * Rank ladder. Ranks gate which Rolodex entries exist and nothing else -
 * they never multiply payout, so progression stays readable.
 */

export const RANK_IDS = ["intern", "junior", "shark", "wolf", "legend"] as const;
export type RankId = (typeof RANK_IDS)[number];

export type Rank = {
  id: RankId;
  name: string;
  /** Lifetime earnings required to hold this rank. */
  threshold: number;
  /** Shown on promotion. */
  flavour: string;
};

export const RANKS: Rank[] = [
  {
    id: "intern",
    name: "Intern",
    threshold: 0,
    flavour: "You have a desk. Technically. It is a folding table next to the printer, and the printer has a name, and the name is Kevin.",
  },
  {
    id: "junior",
    name: "Junior Broker",
    threshold: 2_500,
    flavour: "A real phone, a real chair, and a manager who has started pronouncing your name correctly.",
  },
  {
    id: "shark",
    name: "Shark",
    threshold: 15_000,
    flavour: "Conversations stop when you walk past. Half respect, half concern, all of it noted.",
  },
  {
    id: "wolf",
    name: "Wolf",
    threshold: 60_000,
    flavour: "Corner office. Two phones. One of them has never been explained and never will be.",
  },
  {
    id: "legend",
    name: "Legend",
    threshold: 250_000,
    flavour: "There is a framed photo of you in the lobby. Nobody authorised it. Nobody has dared to take it down.",
  },
];

export const RANK_ORDER: Record<RankId, number> = RANK_IDS.reduce(
  (acc, id, i) => ({ ...acc, [id]: i }),
  {} as Record<RankId, number>
);

export function rankFromEarnings(totalEarned: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (totalEarned >= rank.threshold) current = rank;
  }
  return current;
}

export function nextRank(current: RankId): Rank | null {
  return RANKS[RANK_ORDER[current] + 1] ?? null;
}

/** True if `held` is at least as senior as `required`. */
export function hasRank(held: RankId, required: RankId): boolean {
  return RANK_ORDER[held] >= RANK_ORDER[required];
}

/** 0-1 progress toward the next rank, for the HUD bar. */
export function rankProgress(totalEarned: number): number {
  const current = rankFromEarnings(totalEarned);
  const next = nextRank(current.id);
  if (!next) return 1;
  const span = next.threshold - current.threshold;
  return Math.min(1, Math.max(0, (totalEarned - current.threshold) / span));
}
