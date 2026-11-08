import type { Metadata } from "next";
import { ICON_KEYS, ItemIcon } from "@/components/art/ItemIcon";
import { PersonaPortrait } from "@/components/art/PersonaPortrait";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Panel, PanelTitle } from "@/components/ui/Panel";
import { GAME_TITLE } from "@/lib/game/constants";
import { ITEMS } from "@/lib/game/items";
import { computePayout, formatMoney } from "@/lib/game/payout";
import { PERSONAS } from "@/lib/game/personas";
import { CRITERIA, RUBRIC, SCORE_MAX, type Verdict } from "@/lib/game/rubric";

export const metadata: Metadata = {
  title: `Style bible - ${GAME_TITLE}`,
  description:
    "Palette, type, hand-drawn vector set, UI primitives and the scoring rubric for Dial Tone Dynasty.",
};

const SWATCHES: { token: string; hex: string; use: string; className: string }[] = [
  { token: "navy-900", hex: "#070f1a", use: "Page ground - the office at night", className: "bg-navy-900" },
  { token: "navy-800", hex: "#0b1a2b", use: "Panels, chat frame", className: "bg-navy-800" },
  { token: "navy-700", hex: "#122a44", use: "Raised surfaces, client bubbles", className: "bg-navy-700" },
  { token: "felt", hex: "#1b3a2d", use: "Desk pad, success states", className: "bg-felt" },
  { token: "oxblood", hex: "#6f1f2b", use: "Leather, hang-ups, warnings", className: "bg-oxblood" },
  { token: "brass", hex: "#b08d57", use: "Hairlines, hardware, borders", className: "bg-brass" },
  { token: "gold", hex: "#c9a227", use: "Primary action, money", className: "bg-gold" },
  { token: "gold-light", hex: "#e8c25a", use: "Hover, foil highlight", className: "bg-gold-light" },
  { token: "paper", hex: "#f3e8d5", use: "Body text, memo surfaces", className: "bg-paper" },
  { token: "paper-dim", hex: "#ddcdb0", use: "Secondary text", className: "bg-paper-dim" },
  { token: "paper-muted", hex: "#a89778", use: "Captions, disclaimers", className: "bg-paper-muted" },
  { token: "ink", hex: "#141210", use: "Every illustration outline", className: "bg-ink" },
  { token: "dialtone", hex: "#4ec9a8", use: "Live call indicator only", className: "bg-dialtone" },
];

/** A mid-range verdict, used to show the payout maths end to end. */
const SAMPLE_VERDICT: Verdict = {
  charisma: 7,
  confidence: 6,
  objectionHandling: 5,
  closing: 8,
  closedDeal: true,
  unitsSold: 2,
  bestLine: "You already pay more than this for coffee you don't finish.",
  worstLine: "I mean, it's up to you, obviously.",
  coaching:
    "Nice hook, rookie, then you handed her the wheel. 'Up to you' is how you end up back on the folding table. Ask for the number and then shut up.",
};

const SAMPLE_PAYOUT = computePayout("lunar-acre", "eunice-pell", SAMPLE_VERDICT);

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <Eyebrow className="text-brass">{eyebrow}</Eyebrow>
      <PanelTitle className="mt-1 text-3xl text-paper">{title}</PanelTitle>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Moodboard() {
  return (
    <main className="relative flex-1">
      <div className="pointer-events-none absolute inset-0 vignette" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-14 px-6 py-12">
        <header>
          <ButtonLink href="/" variant="ghost" className="mb-6">
            &larr; Title screen
          </ButtonLink>
          <h1 className="font-display text-4xl font-black text-foil sm:text-5xl">Style bible</h1>
          <p className="mt-3 max-w-2xl text-paper-dim">
            One palette, three typefaces, one drawing style. Everything here is defined in code -{" "}
            <code className="font-mono text-xs text-gold-light">globals.css</code> for tokens,{" "}
            <code className="font-mono text-xs text-gold-light">components/art</code> for the vector set
            - so the look stays consistent as content lands in later phases.
          </p>
        </header>

        <Section id="palette" eyebrow="01" title="Palette">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {SWATCHES.map((s) => (
              <div key={s.token} className="overflow-hidden rounded-card border border-brass/30">
                <div className={`h-14 ${s.className}`} />
                <div className="bg-navy-800 p-3">
                  <p className="font-mono text-xs font-semibold text-paper">{s.token}</p>
                  <p className="font-mono text-[0.65rem] text-paper-muted">{s.hex}</p>
                  <p className="mt-1 text-[0.7rem] leading-snug text-paper-dim">{s.use}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" eyebrow="02" title="Type">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Playfair Display",
                token: "font-display",
                role: "Headings, names, money. The brochure voice.",
                sample: "Closing Legend",
                cls: "font-display text-3xl font-black",
              },
              {
                name: "Inter",
                token: "font-sans",
                role: "Body copy, dialogue, everything readable.",
                sample: "So what's the number?",
                cls: "font-sans text-xl",
              },
              {
                name: "IBM Plex Mono",
                token: "font-mono",
                role: "Labels, timers, scores, dollar figures.",
                sample: "08:42 / $12,400",
                cls: "font-mono text-lg",
              },
            ].map((t) => (
              <Panel key={t.name} tone="navy" className="p-5">
                <Eyebrow className="text-brass">{t.token}</Eyebrow>
                <p className={`mt-3 text-paper ${t.cls}`}>{t.sample}</p>
                <p className="mt-3 text-sm font-semibold text-paper-dim">{t.name}</p>
                <p className="text-xs text-paper-muted">{t.role}</p>
              </Panel>
            ))}
          </div>
        </Section>

        <Section id="portraits" eyebrow="03" title="The cast">
          <p className="mb-5 max-w-2xl text-sm text-paper-dim">
            Flat vectors, 3px ink outline, no gradients, no shading. Each portrait reuses one head
            construction and varies only hair, garment, expression and props - that is what keeps six
            faces (and the next six) looking like one artist drew them.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PERSONAS.map((p) => (
              <Panel key={p.id} tone="navy" className="overflow-hidden">
                <PersonaPortrait
                  portrait={p.portrait}
                  size={320}
                  title={`${p.name}, ${p.title}`}
                  className="h-auto w-full border-b-2 border-ink/80"
                />
                <div className="p-4">
                  <p className="font-display text-lg font-bold text-paper">{p.name}</p>
                  <p className="font-mono text-[0.65rem] uppercase tracking-widest text-brass">
                    {p.title} &middot; difficulty {p.difficulty}
                  </p>
                  <p className="mt-2 text-sm text-paper-dim">{p.hook}</p>
                </div>
              </Panel>
            ))}
          </div>
        </Section>

        <Section id="icons" eyebrow="04" title="The merchandise">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {ITEMS.map((item) => (
              <Panel key={item.id} tone="paper" className="p-4 text-center">
                <ItemIcon icon={item.icon} size={72} className="mx-auto" title={item.name} />
                <p className="mt-2 font-display text-sm font-bold">{item.name}</p>
                <p className="font-mono text-[0.62rem] text-oxblood">
                  ${item.unitPrice.toLocaleString("en-US")} / unit
                </p>
                <p className="mt-1 text-[0.7rem] leading-snug text-ink/70">{item.tagline}</p>
              </Panel>
            ))}
          </div>
          <p className="mt-3 font-mono text-[0.65rem] text-paper-muted">
            Icon keys in the set: {ICON_KEYS.join(", ")}
          </p>
        </Section>

        <Section id="ui" eyebrow="05" title="Controls">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="gold">Make the call</Button>
            <Button variant="ghost">Back to Rolodex</Button>
            <Button variant="oxblood">Hang up</Button>
            <Button variant="gold" disabled>
              Locked - reach Shark
            </Button>
          </div>
        </Section>

        <Section id="rubric" eyebrow="06" title="How you're graded">
          <p className="mb-5 max-w-2xl text-sm text-paper-dim">
            The judge model returns one JSON object with these four integers plus a close flag. Weights
            and anchor descriptions live in a single file so the economy can be re-balanced without
            touching prompts or UI.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {CRITERIA.map((c) => {
              const spec = RUBRIC[c];
              return (
                <Panel key={c} tone="paper" className="p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <PanelTitle>{spec.label}</PanelTitle>
                    <span className="font-mono text-xs font-semibold text-oxblood">
                      {Math.round(spec.weight * 100)}% of score
                    </span>
                  </div>
                  <p className="mt-1 text-sm italic text-ink/70">{spec.blurb}</p>
                  <dl className="mt-3 space-y-1.5">
                    {spec.anchors.map((a) => (
                      <div key={a.score} className="flex gap-3 text-[0.78rem]">
                        <dt className="w-6 shrink-0 font-mono font-semibold text-oxblood">
                          {a.score}
                        </dt>
                        <dd className="text-ink/85">{a.meaning}</dd>
                      </div>
                    ))}
                  </dl>
                </Panel>
              );
            })}
          </div>
        </Section>

        <Section id="payout" eyebrow="07" title="Score to commission">
          <Panel tone="navy" className="p-6">
            <Eyebrow className="text-brass">
              Worked example &middot; One Acre of the Moon &rarr; Eunice Pell
            </Eyebrow>

            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brass/30 font-mono text-[0.62rem] uppercase tracking-widest text-paper-muted">
                  <th className="pb-2 font-normal">Criterion</th>
                  <th className="pb-2 text-right font-normal">Score</th>
                  <th className="pb-2 text-right font-normal">Weight</th>
                  <th className="pb-2 text-right font-normal">Contribution</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {SAMPLE_PAYOUT.rows.map((row) => (
                  <tr key={row.criterion} className="border-b border-brass/10">
                    <td className="py-2 font-sans text-sm text-paper">{row.label}</td>
                    <td className="py-2 text-right text-paper-dim">
                      {row.score}/{SCORE_MAX}
                    </td>
                    <td className="py-2 text-right text-paper-muted">
                      {row.weight.toFixed(2)}
                    </td>
                    <td className="py-2 text-right text-gold-light">
                      {row.contribution.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { k: "Weighted", v: `${SAMPLE_PAYOUT.weighted.toFixed(2)}/10` },
                { k: "Grade", v: SAMPLE_PAYOUT.grade },
                { k: "Difficulty", v: `x${SAMPLE_PAYOUT.difficulty}` },
                { k: "Units", v: `x${SAMPLE_PAYOUT.unitFactor.toFixed(2)}` },
              ].map((s) => (
                <div key={s.k}>
                  <Eyebrow className="text-brass">{s.k}</Eyebrow>
                  <dd className="font-mono text-lg text-paper">{s.v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-brass/30 pt-4">
              <div>
                <Eyebrow className="text-brass">Commission</Eyebrow>
                <p className="font-display text-4xl font-black text-foil">
                  {formatMoney(SAMPLE_PAYOUT.total)}
                </p>
              </div>
              <p className="max-w-sm text-right text-xs italic text-paper-dim">
                &ldquo;{SAMPLE_VERDICT.coaching}&rdquo;
              </p>
            </div>
          </Panel>
        </Section>
      </div>
    </main>
  );
}
