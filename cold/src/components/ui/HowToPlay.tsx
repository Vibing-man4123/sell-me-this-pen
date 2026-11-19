"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Panel";
import { useHydrated, useProgress } from "@/lib/store/progress";

const STEPS = [
  {
    title: "Pick a mark",
    body: "Open the Rolodex and choose a client and something indefensible to sell them. Every Intern starts with a polite dentist and a pen. Nobody stays an Intern.",
  },
  {
    title: "Pitch in your own words",
    body: "Type what you would actually say. The client is an AI with moods, a budget and a short fuse. Twelve exchanges, then the line goes dead.",
  },
  {
    title: "Ask for the sale",
    body: "Listen for the objection, answer it, then close. Say the words: ask for the order. Charm without a close earns you a handshake and nothing else.",
  },
  {
    title: "Get paid, buy junk",
    body: "Your manager grades the tape and pays commission. Spend it at the Lifestyle Shop on things nobody needs, and rank up to meet worse clients.",
  },
];

/** The four-card how-to-play dialog. Native <dialog>: focus trap and Esc come free. */
export function HowToPlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const markSeen = useProgress((s) => s.markTutorialSeen);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setStep(0);
      d.showModal();
      d.querySelector<HTMLElement>("[data-primary]")?.focus();
    } else if (!open && d.open) d.close();
  }, [open]);

  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  function finish() {
    markSeen();
    onClose();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="htp-title"
      // Esc fires "cancel" then "close"; both must land on the same state.
      onClose={() => {
        markSeen();
        onClose();
      }}
      className="m-auto w-[min(92vw,30rem)] rounded-card border-2 border-brass bg-sand p-0 text-ink shadow-desk backdrop:bg-ink/60"
    >
      {open && (
        <div className="p-6">
          <Eyebrow className="text-brass">
            How to play &middot; {step + 1} of {STEPS.length}
          </Eyebrow>
          <h2 id="htp-title" className="mt-2 font-display text-2xl font-black">
            {s.title}
          </h2>
          <p className="mt-3 min-h-28 text-ink-soft" aria-live="polite">
            {s.body}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={finish} className="min-h-11">
              Skip
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)} className="min-h-11">
                  Back
                </Button>
              )}
              <Button
                data-primary
                className="min-h-11"
                onClick={() => (last ? finish() : setStep(step + 1))}
              >
                {last ? "Start dialling" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

/**
 * Title-screen / rolodex entry point: opens itself once for a first-time
 * player, and doubles as the "How to play" link afterwards.
 */
export function HowToPlayLauncher({
  autoOpen = false,
  className = "",
}: {
  autoOpen?: boolean;
  className?: string;
}) {
  const hydrated = useHydrated();
  const seen = useProgress((s) => s.tutorialSeen);
  const [manual, setManual] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const open = manual || (autoOpen && hydrated && !seen && !dismissed);

  return (
    <>
      <button
        type="button"
        onClick={() => setManual(true)}
        className={`inline-flex min-h-11 items-center rounded-card border-2 border-brass/60 bg-shell px-4 font-sans text-sm font-semibold uppercase tracking-[0.12em] text-ink hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light ${className}`}
      >
        How to play
      </button>
      <HowToPlay
        open={open}
        onClose={() => {
          setManual(false);
          setDismissed(true);
        }}
      />
    </>
  );
}
