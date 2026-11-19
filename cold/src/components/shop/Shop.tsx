"use client";

import { ButtonLink, Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { formatMoney } from "@/lib/game/payout";
import { SHOP_ITEMS, shopArt, shopItemUnlocked } from "@/lib/game/shop";
import { rankById } from "@/lib/game/unlocks";
import type { RankId } from "@/lib/game/ranks";
import { useHydrated, useProgress, useRank } from "@/lib/store/progress";

export function Shop() {
  const hydrated = useHydrated();
  const balance = useProgress((s) => s.balance);
  const owned = useProgress((s) => s.owned);
  const buy = useProgress((s) => s.buy);
  const rank = useRank();
  const held: RankId = hydrated ? rank.id : "intern";

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHOP_ITEMS.map((item) => {
          const isOwned = hydrated && owned.includes(item.id);
          const open = shopItemUnlocked(item, held);
          const affordable = hydrated && balance >= item.price;
          return (
            <li key={item.id}>
              <Panel tone="paper" className={`flex h-full flex-col gap-2 p-4 ${open ? "" : "border-dashed"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG */}
                <img
                  src={shopArt(item.id)}
                  width={160}
                  height={160}
                  alt=""
                  className={`mx-auto h-40 w-40 ${open ? "" : "opacity-50 grayscale"}`}
                />
                <p className="font-display text-lg font-bold">{item.name}</p>
                <p className="flex-1 text-sm text-ink-soft">{item.blurb}</p>
                <p className="font-mono text-sm font-semibold text-coral">{formatMoney(item.price)}</p>
                {isOwned ? (
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-palm">Owned</p>
                ) : !open ? (
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-ink-faint">
                    Unlocks at {rankById(item.unlockedAt!).name}
                  </p>
                ) : (
                  <Button variant="gold" disabled={!affordable} onClick={() => buy(item.id)}>
                    {affordable ? "Buy" : "Can't afford"}
                  </Button>
                )}
              </Panel>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-center gap-3">
        <ButtonLink href="/rolodex" variant="gold">
          Back to the Rolodex
        </ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Title screen
        </ButtonLink>
      </div>
    </div>
  );
}
