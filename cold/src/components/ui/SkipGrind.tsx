"use client";

import { Button } from "@/components/ui/Button";
import { useHydrated, useProgress, useRank } from "@/lib/store/progress";

const LABEL = "Skip the grind (your uncle owns the firm)";

/** Viewer shortcut: jump straight to the top rank with money to spend. Hidden once there. */
export function SkipGrind({ link = false }: { link?: boolean }) {
  const hydrated = useHydrated();
  const skipGrind = useProgress((s) => s.skipGrind);
  const rank = useRank();
  if (!hydrated || rank.id === "legend") return null;
  if (link)
    return (
      <button type="button" onClick={skipGrind} className="font-mono text-xs text-ink-faint underline hover:text-brass">
        {LABEL}
      </button>
    );
  return (
    <Button variant="coral" onClick={skipGrind}>
      {LABEL}
    </Button>
  );
}
