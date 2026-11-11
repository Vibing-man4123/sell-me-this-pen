import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CallScreen } from "@/components/call/CallScreen";
import { ButtonLink } from "@/components/ui/Button";
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

export default async function CallPage({ params }: PageProps<"/call/[personaId]/[itemId]">) {
  const { personaId, itemId } = await params;
  const persona = PERSONAS_BY_ID.get(personaId);
  const item = ITEMS_BY_ID.get(itemId);
  if (!persona || !item) notFound();

  return (
    <main className="relative flex-1">
      <div className="pointer-events-none absolute inset-0 vignette" />
      <div className="relative mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <ButtonLink href="/" variant="ghost" className="px-3 py-1.5 text-xs">
            ← Desk
          </ButtonLink>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-paper-muted">
            Line 1 &middot; recorded for quality assurance
          </p>
        </div>

        <CallScreen persona={persona} item={item} />
      </div>
    </main>
  );
}
