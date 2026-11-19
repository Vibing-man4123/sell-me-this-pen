import { personaArt, type PersonaMood } from "@/lib/art/assets";

export type PersonaPortraitProps = {
  personaId: string;
  mood?: PersonaMood;
  /** Rendered size in px. The art is resolution-independent. */
  size?: number;
  className?: string;
  /** Accessible name; omit for decorative use alongside a visible name. */
  title?: string;
  /** Above the fold: load now, at high priority. Everything else is lazy. */
  eager?: boolean;
};

/** Client portrait, drawn from /public/art/characters (see lib/art/assets.ts). */
export function PersonaPortrait({
  personaId,
  mood = "neutral",
  size = 160,
  className,
  title,
  eager = false,
}: PersonaPortraitProps) {
  const src = personaArt(personaId, mood);
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG files, nothing to optimise
    <img
      src={src}
      width={size}
      height={size}
      alt={title ?? ""}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
