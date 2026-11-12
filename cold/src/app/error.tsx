"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Panel } from "@/components/ui/Panel";

/**
 * Last line of defence. The call screen handles every failure it can name;
 * this catches the ones it cannot, so a thrown error reads as the building
 * having a bad night rather than as a white screen on a school Chromebook.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="relative flex flex-1 items-center justify-center p-6">
      <div className="pointer-events-none absolute inset-0 vignette" />
      <Panel tone="card" className="relative max-w-lg p-8 text-center">
        <Eyebrow className="text-brass">Building-wide fault</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-black text-foil">
          Something in the office caught fire
        </h1>
        <p className="mt-3 text-ink-soft">
          Not the good kind of fire. Nobody is hurt, the commission is safe, and the phones
          come back as soon as someone resets the breaker.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Reset the breaker</Button>
          <ButtonLink href="/" variant="ghost">
            Back to the desk
          </ButtonLink>
        </div>
        {error.digest && (
          <p className="mt-5 font-mono text-[0.68rem] text-ink-faint">
            Incident {error.digest}
          </p>
        )}
      </Panel>
    </main>
  );
}
