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
  /** Optional. Brochure selling points the broker can lean on (briefing / Rolodex detail). */
  facts?: string[];
  /** Optional. Extra defects the client may poke at, beyond `catch`. */
  defects?: string[];
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
    catch: "It is a completely ordinary ballpoint pen, and the client owns eleven of them in a mug that says WORLD'S OKAYEST.",
    facts: ["Writes on paper. Reliably.", "Clicks. Satisfyingly.", "Blue ink, like a serious person."],
    defects: ["There is a gas-station pen in every drawer already.", "The cap is chewed. Nobody will say by whom."],
    unlockedAt: "intern",
  },
  {
    id: "timeshare",
    name: "Timeshare in Scranton",
    tagline: "Two weeks a year. February and the other February.",
    icon: "timeshare",
    unitPrice: 4_900,
    baseCommission: 480,
    catch: "Both weeks are in February and the pool is 'seasonally closed' all year, including summer.",
    facts: ["Sleeps six, if they are close.", "Walking distance to a very large parking lot.", "Complimentary lanyard."],
    defects: ["The 'lake view' is a puddle with a nice name.", "Cancelling requires a notary and a goat."],
    unlockedAt: "intern",
  },
  {
    id: "lunar-acre",
    name: "One Acre of the Moon",
    tagline: "Certified. Framed. Entirely unenforceable.",
    icon: "moon",
    unitPrice: 349,
    baseCommission: 640,
    catch: "The deed means nothing and the certificate is laminated printer paper with a gold sticker.",
    facts: ["Zero property tax, because zero governments agree.", "Unobstructed views. Of space.", "Comes framed. The frame is real."],
    defects: ["Nobody can visit, including you.", "The seller also 'owns' Mars and is vague about it."],
    unlockedAt: "junior",
  },
  {
    id: "ostrich-futures",
    name: "Ostrich Futures",
    tagline: "The protein of the 21st century. Allegedly.",
    icon: "ostrich",
    unitPrice: 12_000,
    baseCommission: 900,
    catch: "The farm is one man named Randy, and the birds have never been independently counted.",
    facts: ["Bigger than a chicken, so by volume it is the better deal.", "Randy has 'a really good feeling'.", "Birds are, per Randy, 'basically already paid for'."],
    defects: ["Nobody has seen a single ostrich invoice.", "One of the birds is named Compliance and does not behave."],
    unlockedAt: "junior",
  },
  {
    id: "vowel-rights",
    name: "Naming Rights to a Vowel",
    tagline: "Own the letter E. In perpetuity. Sort of.",
    icon: "vowel",
    unitPrice: 50_000,
    baseCommission: 1_500,
    catch: "No institution on Earth recognises ownership of a letter, and the client is already using the letter E, for free, right now, in this sentence.",
    facts: ["The most-used letter in English, so basically a toll road.", "Comes with a certificate in a font you can sort of feel.", "Ownership starts immediately, depending on who you ask."],
    defects: ["Everyone already uses E for free.", "The seller keeps saying 'sort of' about the 'perpetuity'."],
    unlockedAt: "shark",
  },
  {
    id: "haunted-condo",
    name: "Haunted Beachfront Condo",
    tagline: "Ocean view, motivated seller, loud nights.",
    icon: "condo",
    unitPrice: 210_000,
    baseCommission: 2_600,
    catch: "Three documented hauntings, and the beach eroded in 2019, so the 'beachfront' is now a parking lot with sand in it.",
    facts: ["Ghosts do not pay rent, but they do not ask for it either.", "Motivated seller. Extremely motivated. Will not stay for the showing.", "Built-in security: it screams."],
    defects: ["The ghost has opinions about your furniture.", "The ocean view is mostly a very confident puddle."],
    unlockedAt: "wolf",
  },
];

export const ITEMS_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): Item {
  const item = ITEMS_BY_ID.get(id);
  if (!item) throw new Error(`Unknown item: ${id}`);
  return item;
}
