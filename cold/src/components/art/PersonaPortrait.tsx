import type { PortraitKey } from "@/lib/game/personas";

/**
 * Hand-built flat-vector portraits - Option A from the plan.
 *
 * One shared face construction (shoulders, neck, head, ears, nose) with a
 * per-persona layer of hair, garment, expression and props. Thick ink outline,
 * flat fills, no gradients, strictly the project palette plus four skin tones.
 * Adding a persona means adding one entry to PORTRAITS, not drawing a new face.
 */

const INK = "#141210";
const SKIN = {
  light: "#f0c9a4",
  mid: "#d9a271",
  tan: "#b9794c",
  deep: "#8a5433",
} as const;

const PALETTE = {
  navy: "#122a44",
  navyDeep: "#0b1a2b",
  felt: "#1b3a2d",
  oxblood: "#6f1f2b",
  brass: "#b08d57",
  gold: "#c9a227",
  goldLight: "#e8c25a",
  paper: "#f3e8d5",
  paperDim: "#ddcdb0",
  mint: "#4ec9a8",
  white: "#fbf7ef",
  grey: "#9c9c96",
} as const;

type Expression = "warm" | "smirk" | "fond" | "scowl" | "breezy" | "suspicious";

type PortraitSpec = {
  /** Flat backdrop behind the bust. */
  backdrop: string;
  skin: keyof typeof SKIN;
  /** Shirt / scrubs / hoodie fill. */
  garment: string;
  expression: Expression;
  /** Mass that belongs behind the head - long hair, big volume. */
  hairBack?: React.ReactNode;
  /** Everything over the skull and forehead. */
  hair: React.ReactNode;
  /** Collar, tie, necklace - drawn over the garment. */
  neckwear?: React.ReactNode;
  /** Glasses, hats, earrings - drawn over everything. */
  props?: React.ReactNode;
};

const stroke = { stroke: INK, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const thinStroke = { stroke: INK, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/* ---------- expression layer ---------- */

function Eyes({ expression }: { expression: Expression }) {
  switch (expression) {
    case "fond": // soft, nearly closed
      return (
        <>
          <path d="M60 68 q7 6 14 0" fill="none" {...stroke} />
          <path d="M86 68 q7 6 14 0" fill="none" {...stroke} />
        </>
      );
    case "scowl":
      return (
        <>
          <path d="M60 70 h13" fill="none" {...stroke} />
          <path d="M87 70 h13" fill="none" {...stroke} />
          <circle cx="67" cy="73" r="2.6" fill={INK} />
          <circle cx="93" cy="73" r="2.6" fill={INK} />
        </>
      );
    case "suspicious":
      return (
        <>
          <path d="M59 71 q8 -5 15 0" fill="none" {...stroke} />
          <path d="M86 71 q8 -5 15 0" fill="none" {...stroke} />
          <circle cx="68" cy="70" r="2.2" fill={INK} />
          <circle cx="94" cy="70" r="2.2" fill={INK} />
        </>
      );
    case "smirk":
      return (
        <>
          <circle cx="67" cy="69" r="4.2" fill={PALETTE.white} {...thinStroke} />
          <circle cx="93" cy="69" r="4.2" fill={PALETTE.white} {...thinStroke} />
          <circle cx="68.5" cy="69.5" r="2.1" fill={INK} />
          <circle cx="94.5" cy="69.5" r="2.1" fill={INK} />
        </>
      );
    default: // warm, breezy
      return (
        <>
          <circle cx="67" cy="69" r="4.6" fill={PALETTE.white} {...thinStroke} />
          <circle cx="93" cy="69" r="4.6" fill={PALETTE.white} {...thinStroke} />
          <circle cx="67" cy="69.5" r="2.3" fill={INK} />
          <circle cx="93" cy="69.5" r="2.3" fill={INK} />
        </>
      );
  }
}

function Brows({ expression }: { expression: Expression }) {
  const paths: Record<Expression, [string, string]> = {
    warm: ["M59 58 q7 -4 14 -1", "M87 57 q7 -3 14 1"],
    smirk: ["M59 59 q7 -6 14 1", "M87 60 q7 -7 14 -1"],
    fond: ["M59 57 q7 -3 14 0", "M87 57 q7 -3 14 0"],
    scowl: ["M57 56 q8 3 16 6", "M87 62 q8 -3 16 -6"],
    breezy: ["M58 56 q8 -5 15 -1", "M87 55 q8 -4 15 1"],
    suspicious: ["M56 59 q9 2 17 4", "M87 63 q9 -2 17 -4"],
  };
  const [left, right] = paths[expression];
  return (
    <>
      <path d={left} fill="none" {...stroke} />
      <path d={right} fill="none" {...stroke} />
    </>
  );
}

function Mouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case "warm":
      return <path d="M68 90 q12 11 24 0" fill="none" {...stroke} />;
    case "smirk":
      return (
        <>
          <path d="M68 92 q13 6 23 -4" fill="none" {...stroke} />
          <path d="M91 88 l1 -4" fill="none" {...thinStroke} />
        </>
      );
    case "fond":
      return <path d="M69 90 q11 8 22 -1" fill="none" {...stroke} />;
    case "scowl":
      return <path d="M67 94 q13 -8 26 -1" fill="none" {...stroke} />;
    case "breezy":
      return (
        <>
          <path d="M70 89 q10 9 20 0" fill={PALETTE.oxblood} {...stroke} />
          <path d="M70 89 h20" fill="none" {...thinStroke} />
        </>
      );
    case "suspicious":
      return <path d="M69 93 h22" fill="none" {...stroke} />;
  }
}

/* ---------- per-persona layers ---------- */

const PORTRAITS: Record<PortraitKey, PortraitSpec> = {
  dentist: {
    backdrop: PALETTE.mint,
    skin: "light",
    garment: "#7fd4bd",
    expression: "warm",
    hair: (
      <>
        {/* chin-length bob */}
        <path
          d="M47 72 C44 40 60 30 80 30 C100 30 116 40 113 72 C113 60 106 52 98 50 C92 59 68 59 62 50 C54 52 47 60 47 72 Z"
          fill="#6b4423"
          {...stroke}
        />
        <path d="M47 60 q-4 16 1 26" fill="#6b4423" {...stroke} />
        <path d="M113 60 q4 16 -1 26" fill="#6b4423" {...stroke} />
      </>
    ),
    neckwear: (
      <>
        <path d="M66 118 l14 14 l14 -14" fill="none" {...stroke} />
        <circle cx="52" cy="78" r="3" fill={PALETTE.paper} {...thinStroke} />
        <circle cx="108" cy="78" r="3" fill={PALETTE.paper} {...thinStroke} />
      </>
    ),
    props: (
      <>
        {/* round wire glasses */}
        <circle cx="67" cy="69" r="13" fill="none" {...thinStroke} />
        <circle cx="93" cy="69" r="13" fill="none" {...thinStroke} />
        <path d="M80 69 h0.5" fill="none" {...thinStroke} />
        <path d="M54 68 l-6 -2" fill="none" {...thinStroke} />
        <path d="M106 68 l6 -2" fill="none" {...thinStroke} />
      </>
    ),
  },

  crypto: {
    backdrop: PALETTE.gold,
    skin: "mid",
    garment: PALETTE.navyDeep,
    expression: "smirk",
    hair: (
      <>
        {/* slicked undercut with a hard part */}
        <path
          d="M50 60 C50 34 64 28 80 28 C98 28 112 36 111 58 C104 46 92 42 78 44 C68 45 58 50 50 60 Z"
          fill={INK}
          {...stroke}
        />
        <path d="M63 44 q10 -8 24 -4" fill="none" {...thinStroke} />
        {/* soul patch */}
        <path d="M77 100 h6 v5 h-6 z" fill={INK} {...thinStroke} />
      </>
    ),
    neckwear: (
      <>
        {/* hoodie drawstrings */}
        <path d="M70 118 q10 10 20 0" fill="none" {...stroke} />
        <path d="M73 122 l-2 18" fill="none" {...stroke} />
        <path d="M87 122 l2 18" fill="none" {...stroke} />
      </>
    ),
    props: (
      <>
        {/* sunglasses parked on the forehead */}
        <path d="M54 48 h52" fill="none" {...stroke} />
        <rect x="56" y="42" width="20" height="11" rx="3" fill={PALETTE.navyDeep} {...thinStroke} />
        <rect x="84" y="42" width="20" height="11" rx="3" fill={PALETTE.navyDeep} {...thinStroke} />
      </>
    ),
  },

  grandma: {
    backdrop: PALETTE.oxblood,
    skin: "light",
    garment: "#b0718a",
    expression: "fond",
    hair: (
      <>
        {/* set curls */}
        <path
          d="M48 70 C44 42 60 28 80 28 C100 28 116 42 112 70 C108 56 100 48 80 48 C60 48 52 56 48 70 Z"
          fill={PALETTE.white}
          {...stroke}
        />
        <circle cx="56" cy="46" r="9" fill={PALETTE.white} {...stroke} />
        <circle cx="72" cy="36" r="10" fill={PALETTE.white} {...stroke} />
        <circle cx="90" cy="35" r="10" fill={PALETTE.white} {...stroke} />
        <circle cx="105" cy="46" r="9" fill={PALETTE.white} {...stroke} />
      </>
    ),
    neckwear: (
      <>
        {/* cardigan + pearls */}
        <path d="M66 118 l14 16 l14 -16" fill="none" {...stroke} />
        {[62, 70, 79, 88, 96].map((x, i) => (
          <circle key={x} cx={x} cy={i === 2 ? 128 : 123 + Math.abs(2 - i) * 1.5} r="4" fill={PALETTE.paper} {...thinStroke} />
        ))}
      </>
    ),
    props: (
      <>
        {/* cat-eye glasses */}
        <path d="M54 66 h22 q4 0 3 5 q-2 7 -12 7 q-12 0 -13 -8 z" fill="none" {...thinStroke} />
        <path d="M106 66 h-22 q-4 0 -3 5 q2 7 12 7 q12 0 13 -8 z" fill="none" {...thinStroke} />
        <path d="M76 67 h8" fill="none" {...thinStroke} />
        <path d="M52 62 l-5 -3" fill="none" {...thinStroke} />
        <path d="M108 62 l5 -3" fill="none" {...thinStroke} />
      </>
    ),
  },

  cfo: {
    backdrop: PALETTE.navy,
    skin: "light",
    garment: PALETTE.paperDim,
    expression: "scowl",
    hair: (
      <>
        {/* receding grey: bald through the middle, mass left at the temples */}
        <path
          d="M50 62 C50 46 56 40 64 42 C72 44 76 48 80 48 C86 48 94 42 102 44 C109 46 111 54 110 62 C108 52 102 50 96 52 C88 54 84 56 80 56 C74 56 68 50 60 50 C55 50 51 55 50 62 Z"
          fill={PALETTE.grey}
          {...stroke}
        />
        <path d="M58 50 q8 -4 16 0" fill="none" {...thinStroke} />
        <path d="M90 50 q8 -4 14 2" fill="none" {...thinStroke} />
        {/* moustache */}
        <path d="M66 86 q14 -6 28 0 q-6 6 -14 6 q-8 0 -14 -6 z" fill={PALETTE.grey} {...stroke} />
      </>
    ),
    neckwear: (
      <>
        {/* shirt collar + oxblood tie */}
        <path d="M66 116 l14 12 l14 -12" fill={PALETTE.white} {...stroke} />
        <path d="M80 128 l-7 -7 h14 z" fill={PALETTE.oxblood} {...stroke} />
        <path d="M80 128 l-6 32 h12 z" fill={PALETTE.oxblood} {...stroke} />
      </>
    ),
  },

  influencer: {
    backdrop: "#e7a9b8",
    skin: "tan",
    garment: PALETTE.white,
    expression: "breezy",
    hairBack: (
      /* long blowout falling behind the shoulders */
      <path
        d="M50 44 C50 24 64 16 80 16 C96 16 110 24 110 44 C124 64 136 112 132 150 L104 150 C106 112 104 82 100 62 L60 62 C56 82 54 112 56 150 L28 150 C24 112 36 64 50 44 Z"
        fill={PALETTE.brass}
        {...stroke}
      />
    ),
    hair: (
      <>
        {/* centre-parted fringe hugging the skull */}
        <path
          d="M50 58 C50 32 64 24 80 24 C96 24 110 32 110 58 C103 44 92 40 83 42 L80 28 L77 42 C68 40 57 44 50 58 Z"
          fill={PALETTE.brass}
          {...stroke}
        />
      </>
    ),
    neckwear: <path d="M64 118 q16 14 32 0" fill="none" {...stroke} />,
    props: (
      <>
        {/* hoop earrings */}
        <circle cx="49" cy="86" r="8" fill="none" {...thinStroke} />
        <circle cx="111" cy="86" r="8" fill="none" {...thinStroke} />
      </>
    ),
  },

  doomsday: {
    backdrop: PALETTE.felt,
    skin: "mid",
    garment: "#5d6b4a",
    expression: "suspicious",
    hair: (
      <>
        {/* full beard, drawn before the cap */}
        <path
          d="M49 72 C46 104 60 124 80 124 C100 124 114 104 111 72 C110 92 100 96 96 98 C92 112 68 112 64 98 C60 96 50 92 49 72 Z"
          fill={PALETTE.grey}
          {...stroke}
        />
        <path d="M64 98 q16 10 32 0" fill="none" {...thinStroke} />
      </>
    ),
    neckwear: <path d="M64 120 l16 10 l16 -10" fill="none" {...stroke} />,
    props: (
      <>
        {/* trucker cap */}
        <path
          d="M48 54 C48 32 62 24 80 24 C98 24 112 32 112 54 Z"
          fill={PALETTE.oxblood}
          {...stroke}
        />
        <path d="M44 54 h72 q6 0 6 5 h-84 q0 -5 6 -5 z" fill={PALETTE.oxblood} {...stroke} />
        <path d="M80 26 v26" fill="none" {...thinStroke} />
      </>
    ),
  },
};

export type PersonaPortraitProps = {
  portrait: PortraitKey;
  /** Rendered size in px. The art is resolution-independent. */
  size?: number;
  className?: string;
  /** Accessible name; omit for decorative use alongside a visible name. */
  title?: string;
};

export function PersonaPortrait({ portrait, size = 160, className, title }: PersonaPortraitProps) {
  const spec = PORTRAITS[portrait];
  const skin = SKIN[spec.skin];

  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect x="0" y="0" width="160" height="160" fill={spec.backdrop} />
      {/* desk-lamp pool of light behind the head */}
      <circle cx="80" cy="66" r="52" fill="#ffffff" opacity="0.14" />

      {/* shoulders */}
      <path
        d="M14 160 C18 128 50 114 80 114 C110 114 142 128 146 160 Z"
        fill={spec.garment}
        {...stroke}
      />
      {/* neck */}
      <path d="M70 96 h20 v22 h-20 z" fill={skin} {...stroke} />
      {spec.neckwear}

      {spec.hairBack}

      {/* ears */}
      <circle cx="49" cy="76" r="7" fill={skin} {...stroke} />
      <circle cx="111" cy="76" r="7" fill={skin} {...stroke} />

      {/* head */}
      <ellipse cx="80" cy="70" rx="31" ry="35" fill={skin} {...stroke} />

      {spec.hair}

      <Brows expression={spec.expression} />
      <Eyes expression={spec.expression} />
      {/* nose */}
      <path d="M80 74 v9 q0 3 4 3" fill="none" {...stroke} />
      <Mouth expression={spec.expression} />

      {spec.props}
    </svg>
  );
}

export const PORTRAIT_KEYS = Object.keys(PORTRAITS) as PortraitKey[];
