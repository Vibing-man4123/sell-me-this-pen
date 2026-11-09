/**
 * Flat-vector icons for the merchandise. Same ink outline and palette as the
 * portraits so the Rolodex reads as one drawn set. 64x64 viewBox.
 */

const INK = "#141210";
const stroke = { stroke: INK, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const thin = { stroke: INK, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const GOLD = "#c9a227";
const GOLD_LIGHT = "#e8c25a";
const PAPER = "#f3e8d5";
const OXBLOOD = "#6f1f2b";
const NAVY = "#122a44";
const FELT = "#1b3a2d";
const BRASS = "#b08d57";

const ICONS: Record<string, React.ReactNode> = {
  pen: (
    <>
      <path d="M18 46 L44 20 l6 6 L24 52 l-9 3 z" fill={GOLD} {...stroke} />
      <path d="M44 20 l6 6" fill="none" {...thin} />
      <path d="M18 46 l6 6" fill="none" {...thin} />
      <path d="M15 55 l4 -9 6 6 z" fill={INK} {...thin} />
    </>
  ),
  timeshare: (
    <>
      <path d="M10 30 L32 14 L54 30 v22 h-44 z" fill={PAPER} {...stroke} />
      <path d="M26 52 v-14 h12 v14" fill={OXBLOOD} {...stroke} />
      <path d="M6 31 L32 11 L58 31" fill="none" {...stroke} />
      {/* permanently closed pool */}
      <path d="M14 44 q4 -3 8 0" fill="none" {...thin} />
    </>
  ),
  moon: (
    <>
      <circle cx="32" cy="32" r="20" fill={PAPER} {...stroke} />
      <circle cx="25" cy="25" r="4" fill="none" {...thin} />
      <circle cx="39" cy="38" r="5.5" fill="none" {...thin} />
      <circle cx="40" cy="22" r="3" fill="none" {...thin} />
      {/* a flag nobody authorised */}
      <path d="M44 14 v-9" fill="none" {...stroke} />
      <path d="M44 5 l10 3 l-10 3 z" fill={GOLD} {...thin} />
    </>
  ),
  ostrich: (
    <>
      <ellipse cx="26" cy="42" rx="16" ry="12" fill={PAPER} {...stroke} />
      <path d="M34 34 C36 20 40 14 44 12" fill="none" {...stroke} />
      <circle cx="45" cy="11" r="6" fill={PAPER} {...stroke} />
      <path d="M50 11 l7 2 l-7 2 z" fill={GOLD} {...thin} />
      <circle cx="46" cy="10" r="1.6" fill={INK} />
      <path d="M20 53 v7" fill="none" {...stroke} />
      <path d="M30 53 v7" fill="none" {...stroke} />
      {/* the chart Randy showed you */}
      <path d="M12 40 l6 -5 l5 4" fill="none" {...thin} />
    </>
  ),
  vowel: (
    <>
      <rect x="8" y="10" width="48" height="44" rx="4" fill={NAVY} {...stroke} />
      {/* the letter E, allegedly now owned */}
      <path d="M25 19 v26" fill="none" {...stroke} strokeWidth={4} stroke={GOLD_LIGHT} />
      <path d="M25 19 h16" fill="none" {...stroke} strokeWidth={4} stroke={GOLD_LIGHT} />
      <path d="M25 32 h12" fill="none" {...stroke} strokeWidth={4} stroke={GOLD_LIGHT} />
      <path d="M25 45 h16" fill="none" {...stroke} strokeWidth={4} stroke={GOLD_LIGHT} />
      <circle cx="48" cy="48" r="7" fill={GOLD} {...thin} />
      <path d="M45 48 l2.5 2.5 l4 -5" fill="none" {...thin} />
    </>
  ),
  condo: (
    <>
      <path d="M14 54 v-34 h26 v34 z" fill={PAPER} {...stroke} />
      <path d="M40 54 v-24 h12 v24 z" fill={PAPER} {...stroke} />
      {[24, 32].map((y) => (
        <g key={y}>
          <rect x="20" y={y} width="7" height="6" fill={GOLD} {...thin} />
          <rect x="30" y={y} width="7" height="6" fill={NAVY} {...thin} />
        </g>
      ))}
      <path d="M6 58 q8 -5 16 0 q8 5 16 0 q8 -5 16 0" fill="none" {...stroke} stroke={FELT} />
      {/* resident */}
      <path d="M44 36 q4 -6 8 0 v8 q-4 4 -8 0 z" fill="#ffffff" opacity="0.8" {...thin} />
    </>
  ),
  rolodex: (
    <>
      <path d="M8 46 q24 -10 48 0 v8 h-48 z" fill={BRASS} {...stroke} />
      <path d="M32 44 v-28" fill="none" {...stroke} />
      <path d="M32 18 q-16 -8 -16 10 q0 8 16 14" fill={PAPER} {...stroke} />
      <path d="M32 18 q16 -8 16 10 q0 8 -16 14" fill={PAPER} {...stroke} />
    </>
  ),
};

export type ItemIconProps = {
  icon: string;
  size?: number;
  className?: string;
  title?: string;
};

export function ItemIcon({ icon, size = 64, className, title }: ItemIconProps) {
  const art = ICONS[icon];
  if (!art) return null;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {art}
    </svg>
  );
}

export const ICON_KEYS = Object.keys(ICONS);
