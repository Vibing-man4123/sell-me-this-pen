import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { CallGate } from "@/components/call/CallGate";
import { ButtonLink } from "@/components/ui/Button";
import { ART, personaArt } from "@/lib/art/assets";
import { GAME_TITLE } from "@/lib/game/constants";
import { ITEMS, ITEMS_BY_ID } from "@/lib/game/items";
import { PERSONAS, PERSONAS_BY_ID } from "@/lib/game/personas";

/**
 * One call. The persona and item are in the path so a call can be linked,
 * reloaded, and (in Phase 2) reached straight from the Rolodex.
 *
 * Every combination is prerendered: there are only PERSONAS x ITEMS of them,
 * they hold no per-request data, and doing it this way keeps the page a static
 * shell under Cache Components instead of rendering at request time. Anything
 * outside that set falls through to `notFound()` below.
 */

export function generateStaticParams() {
  return PERSONAS.flatMap((persona) =>
    ITEMS.map((item) => ({ personaId: persona.id, itemId: item.id }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/call/[personaId]/[itemId]">): Promise<Metadata> {
  const { personaId, itemId } = await params;
  const persona = PERSONAS_BY_ID.get(personaId);
  const item = ITEMS_BY_ID.get(itemId);
  if (!persona || !item) return { title: GAME_TITLE };

  return {
    title: `Calling ${persona.name} about ${item.name} - ${GAME_TITLE}`,
    description: `${persona.hook} ${item.tagline}`,
  };
}

export default function CallPage(props: PageProps<"/call/[personaId]/[itemId]">) {
  // `params` is URL data; Next 16 wants it read under a Suspense boundary so
  // the shell stays instant. generateStaticParams still prerenders every call.
  return (
    <main className="relative flex-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${ART.backgrounds.desk})` }}
      />
      <div className="pointer-events-none absolute inset-0 vignette" />
      <div className="relative mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-10 [@media(max-height:820px)]:sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <ButtonLink href="/rolodex" variant="ghost" className="px-3 py-1.5 text-xs">
            ← Rolodex
          </ButtonLink>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint">
            Line 1 &middot; recorded for quality assurance
          </p>
        </div>

        <Suspense
          fallback={
            <p className="py-16 text-center font-mono text-xs text-ink-faint">Connecting the line&hellip;</p>
          }
        >
          <CallBody params={props.params} />
        </Suspense>
      </div>
    </main>
  );
}

async function CallBody({ params }: { params: PageProps<"/call/[personaId]/[itemId]">["params"] }) {
  const { personaId, itemId } = await params;
  const persona = PERSONAS_BY_ID.get(personaId);
  const item = ITEMS_BY_ID.get(itemId);
  if (!persona || !item) notFound();
  // The portrait is the largest thing on this screen but only mounts after
  // hydration; hint it into the document head so it is already in flight.
  const portrait = personaArt(persona.id);
  if (portrait) preload(portrait, { as: "image", fetchPriority: "high" });
  preload(ART.jordan.grin, { as: "image" });
  return <CallGate persona={persona} item={item} />;
}
