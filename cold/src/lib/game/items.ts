import type { RankId } from "./ranks";

/**
 * The merchandise. `baseCommission` is what a flawless single-unit close pays
 * before the persona multiplier, so it carries most of the economy's balance.
 */

export type Item = {
  id: string;
  name: string;
  /** Rolodex subtitle - the pitch the player is stuck with. */
  tagline: string;
  /** Icon key for the hand-drawn vector set. */
  icon: string;
  /** Dollars per unit, as quoted to the client. */
  unitPrice: number;
  /** Payout for a perfect one-unit close, before persona difficulty. */
  baseCommission: number;
  /** The inconvenient truth the broker must talk around. */
  catch: string;
  unlockedAt: RankId;
};

export const ITEMS: Item[] = [
  {
    id: "pen",
    name: "The Pen",
    tagline: "A pen. Just a pen. Sell it anyway.",
    icon: "pen",
    unitPrice: 19,
    baseCommission: 220,
    catch: "It is a completely ordinary ballpoint pen and the client already owns several.",
    unlockedAt: "intern",
  },
  {
    id: "timeshare",
    name: "Timeshare in Scranton",
    tagline: "Two weeks a year. February and the other February.",
    icon: "timeshare",
    unitPrice: 4_900,
    baseCommission: 480,
    catch: "The available weeks are in February and the pool is 'seasonally closed' year-round.",
    unlockedAt: "intern",
  },
  {
    id: "lunar-acre",
    name: "One Acre of the Moon",
    tagline: "Certified. Framed. Entirely unenforceable.",
    icon: "moon",
    unitPrice: 349,
    baseCommission: 640,
    catch: "The deed is legally meaningless and the certificate is laminated printer paper.",
    unlockedAt: "junior",
  },
  {
    id: "ostrich-futures",
    name: "Ostrich Futures",
    tagline: "The protein of the 21st century. Allegedly.",
    icon: "ostrich",
    unitPrice: 12_000,
    baseCommission: 900,
    catch: "The farm is one man named Randy and the birds have not been independently verified.",
    unlockedAt: "junior",
  },
  {
    id: "vowel-rights",
    name: "Naming Rights to a Vowel",
    tagline: "Own the letter E. In perpetuity. Sort of.",
    icon: "vowel",
    unitPrice: 50_000,
    baseCommission: 1_500,
    catch: "No institution recognises the ownership of letters, which the client may notice.",
    unlockedAt: "shark",
  },
  {
    id: "haunted-condo",
    name: "Haunted Beachfront Condo",
    tagline: "Ocean view, motivated seller, loud nights.",
    icon: "condo",
    unitPrice: 210_000,
    baseCommission: 2_600,
    catch: "Three documented hauntings and the beach eroded in 2019.",
    unlockedAt: "wolf",
  },
];

export const ITEMS_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): Item {
  const item = ITEMS_BY_ID.get(id);
  if (!item) throw new Error(`Unknown item: ${id}`);
  return item;
}
