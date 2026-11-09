import Link from "next/link";

/**
 * The only button in the game. Chunky, slightly 3D, like a key on a desk phone.
 */

type Variant = "gold" | "ghost" | "oxblood";

const VARIANTS: Record<Variant, string> = {
  gold:
    "bg-gold text-ink border-brass hover:bg-gold-light active:translate-y-0.5 shadow-[0_4px_0_0_var(--color-brass)] active:shadow-[0_1px_0_0_var(--color-brass)]",
  ghost:
    "bg-navy-800 text-paper border-brass/60 hover:border-gold hover:text-gold-light active:translate-y-0.5 shadow-[0_4px_0_0_#060d16] active:shadow-[0_1px_0_0_#060d16]",
  oxblood:
    "bg-oxblood text-paper border-oxblood-light hover:bg-oxblood-light active:translate-y-0.5 shadow-[0_4px_0_0_#4a141d] active:shadow-[0_1px_0_0_#4a141d]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-card border-2 px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-[0.12em] transition-all disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light";

export type ButtonProps = React.ComponentProps<"button"> & { variant?: Variant };

export function Button({ variant = "gold", className = "", ...props }: ButtonProps) {
  return <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}

export type ButtonLinkProps = React.ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({ variant = "gold", className = "", ...props }: ButtonLinkProps) {
  return <Link className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}
