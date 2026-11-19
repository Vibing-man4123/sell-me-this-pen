import { hasRank, RANKS, type Rank, type RankId } from "./ranks";
import { ITEMS, getItem, type Item } from "./items";
import { PERSONAS, getPersona, type Persona } from "./personas";

/**
 * Single source of truth for what a rank unlocks. The data lives in the
 * `unlockedAt` field of each persona and item; a call needs both.
 */

export function personaUnlocked(persona: Persona, held: RankId): boolean {
  return hasRank(held, persona.unlockedAt);
}

export function itemUnlocked(item: Item, held: RankId): boolean {
  return hasRank(held, item.unlockedAt);
}

/** The highest rank requirement among the persona and the item. */
export function callRequiredRank(personaId: string, itemId: string): RankId {
  const a = getPersona(personaId).unlockedAt;
  const b = getItem(itemId).unlockedAt;
  return hasRank(a, b) ? a : b;
}

export function callUnlocked(personaId: string, itemId: string, held: RankId): boolean {
  return hasRank(held, callRequiredRank(personaId, itemId));
}

export function rankById(id: RankId): Rank {
  return RANKS.find((r) => r.id === id) ?? RANKS[0];
}

/** What first becomes available at exactly this rank. */
export function newlyUnlocked(rank: RankId): { personas: Persona[]; items: Item[] } {
  return {
    personas: PERSONAS.filter((p) => p.unlockedAt === rank),
    items: ITEMS.filter((i) => i.unlockedAt === rank),
  };
}
