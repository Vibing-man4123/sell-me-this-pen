import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { GAME_TITLE } from "@/lib/game/constants";

/**
 * A palette bake-off, built to settle one decision: does the game stay a dark
 * brokerage at 9pm, or move to Miami?
 *
 * Three candidates are rendered side by side on real game furniture - a call
 * header, two chat bubbles, a payout - because a palette judged as swatches
 * always looks better than the same palette judged as an interface.
 *
 * Temporary. Delete this route once the call is made.
 */

export const metadata: Metadata = { title: `Palette bake-off - ${GAME_TITLE}` };

type Palette = {
  id: string;
  name: string;
  pitch: string;
  cost: string;
  /** Page/app background. */
  bg: string;
  /** Raised surface - panels, the transcript area. */
  surface: string;
  /** Surface one step up, used for the client's speech bubble. */
  surfaceUp: string;
  /** Broker's bubble and anything that should read as paper. */
  paper: string;
  /** Primary text on `bg` and `surface`. */
  text: string;
  /** Secondary text. */
  textDim: string;
  /** Outlines, borders, trim. */
  line: string;
  /** Money, highlights, the good stuff. */
  accent: string;
  accentLight: string;
  /** Alert / score bars / danger. */
  hot: string;
  /** The live-call indicator, and nothing else. */
  live: string;
  /** Text colour that sits on `paper`. */
  onPaper: string;
};

const PALETTES: Palette[] = [
  {
    id: "night",
    name: "Night Desk",
    pitch:
      "What the game ships with today. A brokerage at 9pm: navy walls, brass lamps, oxblood leather. Restrained and grown-up.",
    cost: "Zero. It is already built.",
    bg: "#070f1a",
    surface: "#0b1a2b",
    surfaceUp: "#122a44",
    paper: "#f3e8d5",
    text: "#f3e8d5",
    textDim: "#a89778",
    line: "#b08d57",
    accent: "#c9a227",
    accentLight: "#e8c25a",
    hot: "#6f1f2b",
    live: "#4ec9a8",
    onPaper: "#141210",
  },
  {
    id: "daylight",
    name: "Miami Daylight",
    pitch:
      "Your brief, read literally: golden orange, creamy white, light blue sky. A bright art-deco interface - the game stops being moody and starts being funny.",
    cost: "The real change. The app flips from a dark interface to a light one.",
    bg: "#bfe3f2",
    surface: "#fdf4e6",
    surfaceUp: "#ffffff",
    paper: "#fdf4e6",
    text: "#243447",
    textDim: "#6c7f91",
    line: "#2b3d4f",
    accent: "#f0922f",
    accentLight: "#ffc061",
    hot: "#e8536f",
    live: "#17a98c",
    onPaper: "#243447",
  },
  {
    id: "sunset",
    name: "Miami Sunset",
    pitch:
      "Miami after dark. Keeps a deep background so the existing screens survive, but swaps navy and brass for dusk purple, hot orange and neon teal.",
    cost: "Cheap. Same light/dark structure as today, different hex values.",
    bg: "#1b1033",
    surface: "#2a1a4a",
    surfaceUp: "#3d2663",
    paper: "#fdeedd",
    text: "#fdeedd",
    textDim: "#b9a3c9",
    line: "#ff8a4c",
    accent: "#ffa33d",
    accentLight: "#ffd071",
    hot: "#ff5c8a",
    live: "#3fe0c8",
    onPaper: "#2a1a4a",
  },
];

/** A miniature of the call screen, drawn entirely from one palette. */
function CallMock({ p }: { p: Palette }) {
  return (
    <div
      style={{ backgroundColor: p.bg, borderColor: p.line }}
      className="rounded-md border p-3"
    >
      {/* Header: who you called, and the live indicator. */}
      <div
        style={{ backgroundColor: p.surface, borderColor: p.line }}
        className="flex items-center gap-2 rounded border px-2.5 py-2"
      >
        <div
          style={{ backgroundColor: p.surfaceUp, borderColor: p.line }}
          className="size-7 shrink-0 rounded border"
        />
        <div className="min-w-0 flex-1">
          <p style={{ color: p.text }} className="font-display text-xs leading-tight font-bold">
            Dr. Brenda Kalb
          </p>
          <p style={{ color: p.textDim }} className="font-mono text-[0.5rem] tracking-widest uppercase">
            Suburban Dentist
          </p>
        </div>
        <span className="flex items-center gap-1">
          <span style={{ backgroundColor: p.live }} className="size-1.5 rounded-full" />
          <span style={{ color: p.live }} className="font-mono text-[0.5rem] tracking-widest uppercase">
            On the line
          </span>
        </span>
      </div>

      {/* Two bubbles: client left, broker right. */}
      <div className="mt-2.5 space-y-2">
        <div
          style={{ backgroundColor: p.surfaceUp, borderColor: p.line, color: p.text }}
          className="max-w-[85%] rounded rounded-bl-none border px-2.5 py-1.5 text-[0.7rem] leading-snug"
        >
          I have someone numb in room two, so make it quick.
        </div>
        <div
          style={{ backgroundColor: p.paper, borderColor: p.line, color: p.onPaper }}
          className="ml-auto max-w-[85%] rounded rounded-br-none border px-2.5 py-1.5 text-[0.7rem] leading-snug"
        >
          Thirty seconds and you can say no at the end. Fair?
        </div>
      </div>

      {/* The payout, which is where the accent colour has to earn its keep. */}
      <div
        style={{ backgroundColor: p.surface, borderColor: p.line }}
        className="mt-2.5 rounded border px-3 py-2.5 text-center"
      >
        <p style={{ color: p.textDim }} className="font-mono text-[0.5rem] tracking-[0.2em] uppercase">
          Deal closed
        </p>
        <p
          style={{ color: p.accent }}
          className="font-display text-2xl leading-none font-black"
        >
          $820
        </p>
        <div
          style={{ backgroundColor: p.onPaper === p.text ? p.surfaceUp : p.surfaceUp }}
          className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full"
        >
          <div style={{ backgroundColor: p.hot, width: "62%" }} className="h-full rounded-full" />
        </div>
      </div>

      {/* Buttons - the chunky Flash-era shape the art brief calls for. */}
      <div className="mt-2.5 flex gap-2">
        <span
          style={{
            backgroundColor: p.accent,
            color: p.onPaper,
            borderColor: p.line,
            boxShadow: `0 3px 0 0 ${p.line}`,
          }}
          className="rounded border-2 px-2.5 py-1 font-sans text-[0.6rem] font-semibold tracking-[0.12em] uppercase"
        >
          Say it
        </span>
        <span
          style={{ backgroundColor: p.surface, color: p.text, borderColor: p.line }}
          className="rounded border-2 px-2.5 py-1 font-sans text-[0.6rem] font-semibold tracking-[0.12em] uppercase"
        >
          Hang up
        </span>
      </div>
    </div>
  );
}

const SWATCH_KEYS: { key: keyof Palette; label: string }[] = [
  { key: "bg", label: "bg" },
  { key: "surface", label: "surface" },
  { key: "surfaceUp", label: "raised" },
  { key: "paper", label: "paper" },
  { key: "line", label: "line" },
  { key: "accent", label: "accent" },
  { key: "accentLight", label: "accent+" },
  { key: "hot", label: "hot" },
  { key: "live", label: "live" },
];

export default function PaletteBakeOff() {
  return (
    <main className="relative flex-1">
      <div className="pointer-events-none absolute inset-0 vignette" />
      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <ButtonLink href="/moodboard" variant="ghost" className="px-3 py-1.5 text-xs">
          ← Moodboard
        </ButtonLink>

        <header className="mt-6 text-center">
          <h1 className="font-display text-4xl font-black text-foil sm:text-5xl">
            Which office are we in?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-balance text-paper-dim">
            The same screen, three times. Judge the one that makes you want to play, not the
            one with the nicest squares.
          </p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PALETTES.map((p) => (
            <section key={p.id}>
              <h2 className="font-display text-xl font-bold text-paper">{p.name}</h2>
              <p className="mt-1 min-h-20 text-sm text-paper-dim">{p.pitch}</p>
              <p className="mt-1 font-mono text-[0.62rem] text-brass">COST: {p.cost}</p>

              <div className="mt-3 flex gap-1">
                {SWATCH_KEYS.map(({ key, label }) => (
                  <div key={label} className="flex-1 text-center">
                    <div
                      style={{ backgroundColor: p[key] as string }}
                      className="h-8 w-full rounded-sm border border-ink/40"
                      title={`${label} ${p[key]}`}
                    />
                    <span className="mt-0.5 block font-mono text-[0.45rem] text-paper-muted">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <CallMock p={p} />
              </div>
            </section>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center font-mono text-xs leading-relaxed text-paper-muted">
          Temporary page. It exists to settle one decision and gets deleted once it has.
        </p>
      </div>
    </main>
  );
}
