import { hasRank, type RankId } from "./ranks";
import { ART } from "@/lib/art/assets";

/**
 * Lifestyle Shop. Purely cosmetic: nothing here touches payout, scoring or
 * difficulty. Owning an item only puts it on the trophy shelf.
 */

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  blurb: string;
  /** Rank needed before the item can be bought. Omitted = available from the start. */
  unlockedAt?: RankId;
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: "cigar", name: "Cut-Glass Cigar Set", price: 400, blurb: "Smells like a closed deal. Mostly smells like a closed window." },
  { id: "suit", name: "Pinstripe Power Suit", price: 1_200, blurb: "Shoulders wide enough to need their own parking space and a permit." },
  { id: "watch", name: "Gold Wristwatch", price: 3_000, blurb: "More face than wrist. Tells the time, plus your net worth if you tilt it.", unlockedAt: "junior" },
  { id: "office", name: "Corner Office", price: 6_000, blurb: "Two windows, a leather chair, and a globe nobody has ever dared to spin.", unlockedAt: "junior" },
  { id: "car", name: "Red Sports Car", price: 15_000, blurb: "Pop-up headlights. Pop-up regrets. Zero cup holders.", unlockedAt: "shark" },
  { id: "yacht", name: "Yacht, Many Decks", price: 40_000, blurb: "Far too many decks for its length. Tiny flag. Huge confidence.", unlockedAt: "wolf" },
  { id: "chopper", name: "Helicopter", price: 90_000, blurb: "The yacht was starting to feel a little ground-level.", unlockedAt: "legend" },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

export function shopArt(id: string): string {
  return ART.shop(id);
}

export function shopItemUnlocked(item: ShopItem, held: RankId): boolean {
  return item.unlockedAt === undefined || hasRank(held, item.unlockedAt);
}
