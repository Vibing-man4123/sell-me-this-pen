"use client";

import { RankBadge } from "@/components/art/RankBadge";
import { formatMoney } from "@/lib/game/payout";
import { useHydrated, useProgress, useRank } from "@/lib/store/progress";

/** Balance and rank, shown only after localStorage has been read (no hydration mismatch). */
export function BalanceChip({ className = "" }: { className?: string }) {
  const hydrated = useHydrated();
  const balance = useProgress((s) => s.balance);
  const rank = useRank();
  return (
    <p className={`font-mono text-xs text-ink-soft ${className}`} aria-live="polite">
      {hydrated ? (
        <>
          Balance <strong className="text-coral">{formatMoney(balance)}</strong> &middot;{" "}
          <RankBadge rank={rank.id} size={22} className="inline-block align-middle" /> {rank.name}
        </>
      ) : (
        " "
      )}
    </p>
  );
}
