"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Reveals the client's line a character at a time, so a reply reads as someone
 * talking rather than a block of text appearing.
 *
 * We do this client-side on a complete response instead of streaming from
 * Groq: the end-of-call tokens are stripped server-side before anything is
 * revealed, so `[CLOSED]` can never flash on screen mid-sentence.
 */

const MS_PER_CHAR = 16;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Read as a subscription rather than in an effect, so a player who asked their
 * system for less motion gets whole lines from the very first render.
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );
}

export function useTypewriter(text: string | null, enabled: boolean) {
  const reducedMotion = usePrefersReducedMotion();
  const animate = enabled && !reducedMotion;
  const full = text ?? "";

  const [revealedCount, setRevealedCount] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [shownText, setShownText] = useState(text);

  // A new line restarts the reveal. Adjusted during render rather than in an
  // effect, which is the supported way to react to a changed input.
  if (shownText !== text) {
    setShownText(text);
    setRevealedCount(0);
    setSkipped(false);
  }

  useEffect(() => {
    if (!animate || full === "") return;

    const timer = setInterval(() => {
      setRevealedCount((count) => {
        if (count >= full.length) {
          clearInterval(timer);
          return count;
        }
        return count + 1;
      });
    }, MS_PER_CHAR);

    return () => clearInterval(timer);
  }, [animate, full]);

  const revealed = !animate || skipped ? full : full.slice(0, revealedCount);

  return {
    revealed,
    done: revealed.length >= full.length,
    /** Lets an impatient player jump to the end of the line. */
    skip: () => setSkipped(true),
  };
}
