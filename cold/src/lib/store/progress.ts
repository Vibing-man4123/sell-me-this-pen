"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getShopItem, shopItemUnlocked } from "@/lib/game/shop";
import { RANKS, RANK_ORDER, rankFromEarnings, type Rank, type RankId } from "@/lib/game/ranks";

/**
 * Player progression, persisted to localStorage.
 *
 * `skipHydration` keeps the server render and the first client render identical
 * (both see the empty initial state); `useHydrated()` rehydrates after mount,
 * and components show store-derived numbers only once it returns true.
 */

export const HISTORY_CAP = 50;
const STORE_VERSION = 4;

export type CallRecord = {
  /** Unique per call; recording the same id twice is a no-op. */
  id: string;
  personaId: string;
  itemId: string;
  payout: number;
  /** Weighted score out of SCORE_MAX. */
  score: number;
  grade: string;
  closedDeal: boolean;
  timestamp: number;
};

type ProgressState = {
  balance: number;
  lifetimeEarnings: number;
  history: CallRecord[];
  /** Highest rank the player has been promoted to. Persisted; the promotion moment fires only when this rises. */
  highestRankSeen: RankId;
  /** Set by recordCall when that call earned a promotion; in memory only, read by the results screen. */
  promotion: RankId | null;
  /** Shop item ids the player owns (cosmetic only). */
  owned: string[];
  /** The how-to-play card has been shown (and dismissed) once. */
  tutorialSeen: boolean;
  markTutorialSeen: () => void;
  /** Buys a shop item. False (and nothing changes) if unknown, owned, rank-locked or unaffordable. */
  buy: (id: string) => boolean;
  /** Banks a payout. Returns false if this call id was already recorded. */
  recordCall: (record: CallRecord) => boolean;
  /** Spends from balance. Returns false (and changes nothing) if it would go negative. */
  spend: (amount: number) => boolean;
  reset: () => void;
  /** Viewer shortcut: top rank, a fat balance, tutorial skipped. No promotion popup. */
  skipGrind: () => void;
};

const initial = { balance: 0, lifetimeEarnings: 0, history: [] as CallRecord[],
  highestRankSeen: "intern" as RankId,
  owned: [] as string[],
  tutorialSeen: false,
  promotion: null as RankId | null,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,
      recordCall: (record) => {
        if (get().history.some((r) => r.id === record.id)) return false;
        const payout = Math.max(0, Math.round(record.payout));
        set((s) => {
          const lifetimeEarnings = s.lifetimeEarnings + payout;
          const rank = rankFromEarnings(lifetimeEarnings).id;
          const promoted = RANK_ORDER[rank] > RANK_ORDER[s.highestRankSeen];
          return {
            balance: s.balance + payout,
            lifetimeEarnings,
            history: [record, ...s.history].slice(0, HISTORY_CAP),
            highestRankSeen: promoted ? rank : s.highestRankSeen,
            promotion: promoted ? rank : null,
          };
        });
        return true;
      },
      spend: (amount) => {
        if (!Number.isFinite(amount) || amount <= 0 || amount > get().balance) return false;
        set((s) => ({ balance: s.balance - amount }));
        return true;
      },
      buy: (id) => {
        const item = getShopItem(id);
        const s = get();
        if (!item || s.owned.includes(id)) return false;
        if (!shopItemUnlocked(item, rankFromEarnings(s.lifetimeEarnings).id)) return false;
        if (!s.spend(item.price)) return false;
        set((st) => ({ owned: [...st.owned, id] }));
        return true;
      },
      markTutorialSeen: () => set({ tutorialSeen: true }),
      skipGrind: () => {
        const top = RANKS[RANKS.length - 1];
        set((s) => ({
          lifetimeEarnings: Math.max(s.lifetimeEarnings, top.threshold),
          balance: s.balance + 100_000,
          highestRankSeen: top.id,
          tutorialSeen: true,
        }));
      },
      // A reset wipes money, not the memory of having read the instructions.
      reset: () => set({ ...initial, tutorialSeen: get().tutorialSeen }),
    }),
    {
      name: "smtp-progress",
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        balance: s.balance,
        lifetimeEarnings: s.lifetimeEarnings,
        history: s.history,
        highestRankSeen: s.highestRankSeen,
        owned: s.owned,
        tutorialSeen: s.tutorialSeen,
      }),
      // Add a case per version bump; unknown shapes fall back to the initial state.
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== "object") return initial as unknown as ProgressState;
        let p = persisted as Partial<ProgressState>;
        if (version < 2) {
          // v1 had no highestRankSeen: start from the rank already earned so nobody is retro-promoted.
          p = { ...p, highestRankSeen: rankFromEarnings(p.lifetimeEarnings ?? 0).id };
        }
        if (version < 3) {
          // v2 had no shop: nothing owned yet.
          p = { ...p, owned: [] };
        }
        if (version < 4) {
          // v3 had no tutorial: anyone who already played has no need of it.
          p = { ...p, tutorialSeen: (p.history?.length ?? 0) > 0 };
        }
        return p as ProgressState;
      },
    }
  )
);

/** True once localStorage has been read into the store (client only). */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let cancelled = false;
    Promise.resolve(useProgress.persist.rehydrate()).finally(() => {
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return hydrated;
}

/** Current rank, derived from lifetime earnings (never from balance). */
export function useRank(): Rank {
  return rankFromEarnings(useProgress((s) => s.lifetimeEarnings));
}
