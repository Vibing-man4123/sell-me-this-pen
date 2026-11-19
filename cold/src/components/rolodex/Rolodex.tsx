"use client";

import Link from "next/link";
import { useState } from "react";
import { ItemIcon } from "@/components/art/ItemIcon";
import { PersonaPortrait } from "@/components/art/PersonaPortrait";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Panel } from "@/components/ui/Panel";
import { STARTER_CALL } from "@/lib/game/constants";
import { ITEMS } from "@/lib/game/items";
import { formatMoney } from "@/lib/game/payout";
import { PERSONAS } from "@/lib/game/personas";
import { RANK_ORDER, type RankId } from "@/lib/game/ranks";
import { callUnlocked, itemUnlocked, personaUnlocked, rankById } from "@/lib/game/unlocks";
import { useHydrated, useProgress, useRank, type CallRecord } from "@/lib/store/progress";

function best(history: CallRecord[], personaId: string, itemId: string): CallRecord | null {
  let top: CallRecord | null = null;
  for (const r of history) {
    if (r.personaId !== personaId || r.itemId !== itemId) continue;
    if (!top || r.score > top.score) top = r;
  }
  return top;
}

function LockLabel({ rank }: { rank: RankId }) {
  return (
    <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-ink-faint">
      Unlocks at {rankById(rank).name}
    </span>
  );
}

/** Pick a client, then the merchandise. Locked entries stay visible but inert. */
export function Rolodex() {
  const hydrated = useHydrated();
  const history = useProgress((s) => s.history);
  const rank = useRank();
  // Before hydration everything beyond the starter counts as locked, so the server and first client render agree.
  const held: RankId = hydrated ? rank.id : "intern";
  const records = hydrated ? history : [];

  const [personaId, setPersonaId] = useState<string>(STARTER_CALL.personaId);
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0];

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="pick-client">
        <Eyebrow id="pick-client" className="inline-block rounded-card bg-sand px-2.5 py-1 font-semibold text-ink opacity-100">
          1 &middot; Pick a client
        </Eyebrow>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PERSONAS.map((p) => {
            const open = personaUnlocked(p, held);
            const selected = p.id === persona.id;
            const inner = (
              <>
                <PersonaPortrait
                  personaId={p.id}
                  size={96}
                  eager
                  className={`mx-auto rounded-card border-2 border-ink/80 ${open ? "" : "grayscale opacity-60"}`}
                />
                <span className="mt-2 block font-display text-sm font-bold">{p.name}</span>
                <span className="block font-mono text-[0.6rem] uppercase tracking-widest text-ink-faint">
                  {p.title}
                </span>
                <span className="mt-1 block font-mono text-[0.65rem] text-coral">
                  Difficulty {"★".repeat(Math.round(p.difficulty))}
                  <span className="text-ink-faint"> ×{p.difficulty}</span>
                </span>
                <span className="mt-1 block text-xs text-ink-soft">{p.hook}</span>
                {p.catchphrase && (
                  <span className="mt-1 block text-xs italic text-ink-faint">&ldquo;{p.catchphrase}&rdquo;</span>
                )}
                {!open && (
                  <span className="mt-2 block">
                    <LockLabel rank={p.unlockedAt} />
                  </span>
                )}
              </>
            );
            return (
              <li key={p.id} className="flex">
                {open ? (
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPersonaId(p.id)}
                    className={`h-full w-full rounded-card border-2 bg-shell p-3 text-center shadow-desk transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light ${
                      selected ? "border-gold ring-2 ring-gold/50" : "border-brass/40 hover:border-gold"
                    }`}
                  >
                    {inner}
                  </button>
                ) : (
                  <div
                    aria-disabled="true"
                    className="h-full w-full flex-1 cursor-not-allowed rounded-card border-2 border-dashed border-ink/25 bg-sand-dim p-3 text-center text-ink-soft"
                  >
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="pick-item">
        <Eyebrow id="pick-item" className="inline-block rounded-card bg-sand px-2.5 py-1 font-semibold text-ink opacity-100">
          2 &middot; Pick what you are selling to {persona.name}
        </Eyebrow>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {ITEMS.map((item) => {
            const open = itemUnlocked(item, held) && callUnlocked(persona.id, item.id, held);
            const prior = best(records, persona.id, item.id);
            const body = (
              <div className="flex gap-3">
                <ItemIcon icon={item.icon} size={56} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-bold">{item.name}</p>
                  <p className="text-xs text-ink-soft">{item.tagline}</p>
                  <p className="mt-1 font-mono text-[0.65rem] text-ink-faint">
                    {formatMoney(item.unitPrice)} a unit &middot; base commission {formatMoney(item.baseCommission)}
                  </p>
                  <p className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-widest">
                    {!open ? (
                      <LockLabel rank={RANK_ORDER[item.unlockedAt] >= RANK_ORDER[persona.unlockedAt] ? item.unlockedAt : persona.unlockedAt} />
                    ) : prior ? (
                      <span className="text-palm">
                        {prior.closedDeal ? "Closed" : "Attempted"} &middot; best {prior.grade} &middot;{" "}
                        {formatMoney(prior.payout)}
                      </span>
                    ) : (
                      <span className="text-coral">New call</span>
                    )}
                  </p>
                </div>
              </div>
            );
            return (
              <li key={item.id} className="flex">
                {open ? (
                  <Panel tone="paper" className="h-full w-full flex-1 transition hover:border-gold">
                    <Link
                      href={`/call/${persona.id}/${item.id}`}
                      className="block h-full p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light"
                    >
                      {body}
                    </Link>
                  </Panel>
                ) : (
                  <Panel
                    tone="card"
                    aria-disabled="true"
                    className="h-full w-full flex-1 cursor-not-allowed border-dashed border-ink/30 bg-sand-dim p-4"
                  >
                    {body}
                  </Panel>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex justify-center gap-3">
        <ButtonLink href="/shop" variant="gold">
          Lifestyle Shop
        </ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Back to the desk
        </ButtonLink>
      </div>
    </div>
  );
}
