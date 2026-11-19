"use client";

import { useSyncExternalStore } from "react";
import { isMuted, setMuted, subscribeMuted, unlockAudio } from "@/lib/sfx";

/** Small sound on/off switch. Preference persists in localStorage. */
export function MuteToggle({ className = "" }: { className?: string }) {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);
  return (
    <button
      type="button"
      aria-pressed={muted}
      aria-label={muted ? "Sound off. Turn sound on" : "Sound on. Turn sound off"}
      onClick={() => {
        setMuted(!muted);
        if (muted) unlockAudio();
      }}
      className={`rounded-card border border-brass/40 bg-shell min-h-10 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft hover:border-gold ${className}`}
    >
      {muted ? "Sound off" : "Sound on"}
    </button>
  );
}
