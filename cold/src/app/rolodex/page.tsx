import type { Metadata } from "next";
import { TrophyShelf } from "@/components/shop/TrophyShelf";
import { Rolodex } from "@/components/rolodex/Rolodex";
import { HowToPlayLauncher } from "@/components/ui/HowToPlay";
import { BalanceChip } from "@/components/ui/BalanceChip";
import { Eyebrow } from "@/components/ui/Panel";
import { ART } from "@/lib/art/assets";
import { GAME_TITLE } from "@/lib/game/constants";

export const metadata: Metadata = {
  title: `The Rolodex - ${GAME_TITLE}`,
  description: "Pick a client and something indefensible to sell them.",
};

export default function RolodexPage() {
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
          <Eyebrow className="inline-block rounded-card bg-sand px-2.5 py-1 font-semibold text-ink opacity-100">Tonight&apos;s call sheet</Eyebrow>
          <h1 className="mt-2 font-display text-4xl font-black text-ink">The Rolodex</h1>
          <BalanceChip className="mt-2" />
          <HowToPlayLauncher autoOpen className="mt-3" />
        </header>
        <TrophyShelf />
        <Rolodex />
      </div>
    </main>
  );
}
