/**
 * Surfaces. `paper` is a memo on the desk - cream, grained, faintly inset.
 * `card` is the clean white panel the office furniture sits on. Everything
 * in the game is one of these two.
 */

type Tone = "paper" | "card";

const TONES: Record<Tone, string> = {
  paper: "texture-paper text-ink border-brass/70",
  card: "bg-shell text-ink border-brass/40",
};

export type PanelProps = React.ComponentProps<"div"> & { tone?: Tone };

export function Panel({ tone = "card", className = "", ...props }: PanelProps) {
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
