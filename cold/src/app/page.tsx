import { ItemIcon } from "@/components/art/ItemIcon";
import { PersonaPortrait } from "@/components/art/PersonaPortrait";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Panel } from "@/components/ui/Panel";
import { GAME_TITLE_LINES, PLAYER_CHARACTER } from "@/lib/game/constants";
import { PERSONAS } from "@/lib/game/personas";
import { RANKS } from "@/lib/game/ranks";

export default function TitleScreen() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 vignette" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-6 py-14 sm:py-20">
        <header className="text-center">
          <Eyebrow className="text-brass">Est. 1987 &middot; Second floor, above the carpet showroom</Eyebrow>
          <h1 className="mt-3 font-display text-5xl leading-[0.92] font-black tracking-tight text-foil sm:text-7xl">
            {GAME_TITLE_LINES.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-paper-dim sm:text-lg">
            You are <strong className="text-paper">{PLAYER_CHARACTER}</strong>, a broker with too much
            hair gel and no discernible licence. Cold-call strangers. Sell them things that should not be
            for sale. Get graded on how you did it. Spend the commission on a lifestyle nobody asked for.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/moodboard" variant="gold">
              Style bible
            </ButtonLink>
            <ButtonLink href="/moodboard#rubric" variant="ghost">
              How you&apos;re graded
            </ButtonLink>
          </div>
          <p className="mt-4 font-mono text-xs text-paper-muted">
            Phase 0 build &middot; the phone doesn&apos;t ring yet
          </p>
        </header>

        <Panel tone="navy" className="p-6">
          <Eyebrow className="text-brass">Tonight&apos;s call sheet</Eyebrow>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {PERSONAS.map((persona) => (
              <figure key={persona.id} className="text-center">
                <PersonaPortrait
                  portrait={persona.portrait}
                  size={96}
                  title={`${persona.name}, ${persona.title}`}
                  className="mx-auto rounded-card border-2 border-ink/80"
                />
                <figcaption className="mt-2">
                  <span className="block font-display text-sm font-bold text-paper">{persona.name}</span>
                  <span className="block font-mono text-[0.6rem] uppercase tracking-widest text-paper-muted">
                    {persona.title}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 md:grid-cols-2">
          <Panel tone="paper" className="p-6">
            <Eyebrow>The loop</Eyebrow>
            <ol className="mt-3 space-y-2 text-sm">
              {[
                "Pick a call from the Rolodex",
                "Talk your way through it",
                "Get scored on four things",
                "Collect the commission",
                "Buy something indefensible",
                "Get promoted, meet worse clients",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="font-mono text-xs font-semibold text-oxblood">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel tone="paper" className="p-6">
            <Eyebrow>The ladder</Eyebrow>
            <ul className="mt-3 space-y-2.5 text-sm">
              {RANKS.map((rank) => (
                <li key={rank.id}>
                  <span className="font-display font-bold">{rank.name}</span>
                  <span className="ml-2 font-mono text-[0.68rem] text-oxblood">
                    ${rank.threshold.toLocaleString("en-US")}
                  </span>
                  <span className="block text-ink/70">{rank.flavour}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <footer className="flex items-center justify-center gap-4 opacity-70">
          <ItemIcon icon="rolodex" size={40} />
          <p className="max-w-md font-mono text-[0.66rem] leading-relaxed text-paper-muted">
            A parody. {PLAYER_CHARACTER} is a fictional caricature and is not based on, affiliated with,
            or endorsed by any real broker, convicted or otherwise.
          </p>
        </footer>
      </div>
    </main>
  );
}
