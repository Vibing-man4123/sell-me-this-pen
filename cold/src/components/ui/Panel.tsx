/**
 * Surfaces. `paper` is a memo on the desk (dark ink on cream), `navy` is the
 * office itself. Everything in the game sits on one of these two.
 */

type Tone = "paper" | "navy";

const TONES: Record<Tone, string> = {
  paper: "texture-paper text-ink border-brass/70",
  navy: "bg-navy-800 text-paper border-brass/30",
};

export type PanelProps = React.ComponentProps<"div"> & { tone?: Tone };

export function Panel({ tone = "navy", className = "", ...props }: PanelProps) {
  return (
    <div
      className={`rounded-card border shadow-desk ${TONES[tone]} ${className}`}
      {...props}
    />
  );
}

export function PanelTitle({ className = "", ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={`font-display text-xl font-bold tracking-tight ${className}`}
      {...props}
    />
  );
}

/** Small all-caps label used above values and in card headers. */
export function Eyebrow({ className = "", ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={`font-mono text-[0.68rem] uppercase tracking-[0.22em] opacity-70 ${className}`}
      {...props}
    />
  );
}
