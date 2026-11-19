"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import type { Item } from "@/lib/game/items";
import type { Persona } from "@/lib/game/personas";
import { callRequiredRank, callUnlocked, rankById } from "@/lib/game/unlocks";
import { HowToPlay } from "@/components/ui/HowToPlay";
import { useState } from "react";
import { useHydrated, useProgress, useRank } from "@/lib/store/progress";
import { CallScreen } from "./CallScreen";

/**
 * Client-side rank check. The call must not start (it dials on mount) until
 * the saved rank is known, so nothing renders until hydration finishes.
 */
export function CallGate({ persona, item }: { persona: Persona; item: Item }) {
  const hydrated = useHydrated();
  const rank = useRank();
  const seen = useProgress((s) => s.tutorialSeen);
  const [tutorialDone, setTutorialDone] = useState(false);

  if (!hydrated) {
    return <p className="py-16 text-center font-mono text-xs text-ink-faint">Checking your badge&hellip;</p>;
  }
  if (!callUnlocked(persona.id, item.id, rank.id)) {
    const needed = rankById(callRequiredRank(persona.id, item.id));
    return (
      <Panel tone="paper" className="mx-auto max-w-md p-6 text-center">
        <PanelTitle>Above your pay grade</PanelTitle>
        <p className="mt-3 text-sm">
          {persona.name} and {item.name} together need the rank of <strong>{needed.name}</strong>. You are
          currently {rank.name}. Earn more commission on easier calls first.
        </p>
        <ButtonLink href="/rolodex" variant="gold" className="mt-5">
          Back to the Rolodex
        </ButtonLink>
      </Panel>
    );
  }
  // First-ever call: show the rules before the phone starts ringing (it dials on mount).
  if (!seen && !tutorialDone) return <HowToPlay open onClose={() => setTutorialDone(true)} />;
  return <CallScreen persona={persona} item={item} />;
}
