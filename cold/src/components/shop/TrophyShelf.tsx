"use client";

import Link from "next/link";
import { getShopItem, shopArt } from "@/lib/game/shop";
import { useHydrated, useProgress } from "@/lib/store/progress";

/** Row of owned shop items. Renders nothing until hydrated and at least one thing is owned. */
export function TrophyShelf({ className = "" }: { className?: string }) {
  const hydrated = useHydrated();
  const owned = useProgress((s) => s.owned);
  const items = owned.flatMap((id) => getShopItem(id) ?? []);
  if (!hydrated || items.length === 0) return null;
  return (
    <section aria-label="Trophy shelf" className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-2 border-b-4 border-brass/70 pb-1">
        {items.map((item) => (
          <li key={item.id}>
            <Link href="/shop" title={item.name}>
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG */}
              <img src={shopArt(item.id)} width={56} height={56} alt={item.name} className="h-14 w-14" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
