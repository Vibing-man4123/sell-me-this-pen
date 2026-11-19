import type { Metadata } from "next";
import { Shop } from "@/components/shop/Shop";
import { TrophyShelf } from "@/components/shop/TrophyShelf";
import { BalanceChip } from "@/components/ui/BalanceChip";
import { Eyebrow } from "@/components/ui/Panel";
import { ART } from "@/lib/art/assets";
import { GAME_TITLE } from "@/lib/game/constants";

export const metadata: Metadata = {
  title: `Lifestyle Shop - ${GAME_TITLE}`,
  description: "Spend the commission on a lifestyle nobody asked for.",
};

export default function ShopPage() {
  return (
    <main className="relative flex-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${ART.backgrounds.desk})` }}
      />
      <div className="pointer-events-none absolute inset-0 vignette" />
      <div className="relative mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="text-center">
          <Eyebrow className="text-brass">Purely decorative. Zero effect on your sales</Eyebrow>
          <h1 className="mt-2 font-display text-4xl font-black text-ink">Lifestyle Shop</h1>
          <BalanceChip className="mt-2" />
        </header>
        <TrophyShelf />
        <Shop />
      </div>
    </main>
  );
}
