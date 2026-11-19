"use client";

import { useEffect } from "react";
import { RankBadge } from "@/components/art/RankBadge";
import { play } from "@/lib/sfx";
import { PersonaPortrait } from "@/components/art/PersonaPortrait";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Panel, PanelTitle } from "@/components/ui/Panel";
import type { JudgeResponse } from "@/lib/api/contracts";
import type { Item } from "@/lib/game/items";
import { formatMoney } from "@/lib/game/payout";
import type { Persona } from "@/lib/game/personas";
import { SCORE_MAX } from "@/lib/game/rubric";
import { OUTCOME_COPY, type CallOutcome } from "@/lib/game/transcript";
import { ART } from "@/lib/art/assets";
import { newlyUnlocked, rankById } from "@/lib/game/unlocks";
import { useHydrated, useProgress, useRank } from "@/lib/store/progress";

/**
 * The commission statement. Every number the player banks is shown with the
 * arithmetic that produced it - a payout you can follow is a payout you trust,
 * and it doubles as a hint about what to do differently.
 */

function ScoreBar({
  label,
  score,
  weight,
  contribution,
}: {
  label: string;
  score: number;
  weight: number;
  contribution: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-sm font-bold">{label}</span>
        <span className="font-mono text-xs text-coral">
          {score}/{SCORE_MAX}
          <span className="ml-2 opacity-60">
            × {weight.toFixed(2)} = {contribution.toFixed(2)}
          </span>
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink/15">
        <div
          className="h-full rounded-full bg-coral transition-[width] duration-700 ease-out"
          style={{ width: `${(score / SCORE_MAX) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Quote({ eyebrow, text }: { eyebrow: string; text: string }) {
  if (text.trim() === "") return null;
  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <blockquote className="mt-1 border-l-2 border-brass pl-3 text-sm italic">
        &ldquo;{text}&rdquo;
      </blockquote>
    </div>
  );
}

export function ResultsPanel({
  result,
  persona,
  item,
  outcome,
}: {
  result: JudgeResponse;
  persona: Persona;
  item: Item;
  outcome: Exclude<CallOutcome, "open">;
}) {
  const { verdict, payout } = result;
  const copy = OUTCOME_COPY[outcome];
  const hydrated = useHydrated();
  const balance = useProgress((s) => s.balance);
  const rank = useRank();
  // Set by recordCall only on the call that crossed a rank threshold, so it shows once.
  const promotion = useProgress((s) => s.promotion);
  const promoted = promotion ? rankById(promotion) : null;
  const unlocked = promotion ? newlyUnlocked(promotion) : null;

  useEffect(() => {
    play("stamp");
    const t = setTimeout(() => play(payout.closedDeal ? "kaching" : "trombone"), 350);
    return () => clearTimeout(t);
  }, [payout.closedDeal]);

  return (
    <div className="flex flex-col gap-5">
      {promoted && unlocked && (
        <Panel tone="card" className="relative overflow-hidden border-2 border-gold p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG */}
          <img src={ART.fx.cashBurst} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15" />
          <div className="relative mx-auto max-w-md rounded-card border border-brass/40 bg-sand p-5 shadow-desk">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG */}
            <img src={ART.jordan.rich} width={120} height={120} alt="" className="mx-auto" />
            <RankBadge rank={promoted.id} size={96} title={promoted.name} className="fx-stamp mx-auto mt-2" />
            <Eyebrow className="font-semibold text-ink opacity-100">Promotion</Eyebrow>
            <p className="mt-1 font-display text-3xl font-black text-ink">You are now a {promoted.name}</p>
            <p className="mt-2 text-sm italic text-ink-soft">{promoted.flavour}</p>
            {(unlocked.personas.length > 0 || unlocked.items.length > 0) && (
              <p className="mt-3 text-sm">
                Newly in the Rolodex:{" "}
                <strong>
                  {[...unlocked.personas.map((p) => p.name), ...unlocked.items.map((i) => i.name)].join(", ")}
                </strong>
              </p>
            )}
          </div>
        </Panel>
      )}
      {/* The headline: what happened, and what it paid. */}
      <Panel tone="card" className="relative overflow-hidden p-6 text-center">
        {payout.closedDeal && (
          // eslint-disable-next-line @next/next/no-img-element -- SVG
          <img src={ART.fx.cashBurst} alt="" aria-hidden className="fx-cash pointer-events-none absolute inset-0 h-full w-full object-cover" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG */}
        <img
          src={payout.closedDeal ? ART.fx.soldStamp : ART.fx.hungupStamp}
          alt={payout.closedDeal ? "Sold" : "No sale"}
          width={180}
          height={120}
          className="fx-stamp pointer-events-none absolute top-2 right-2 z-10 h-auto w-28 sm:w-44"
        />
        <PersonaPortrait
          personaId={persona.id}
          mood={payout.closedDeal ? "sold" : "resist"}
          size={120}
          title={`${persona.name}, ${payout.closedDeal ? "sold" : "not sold"}`}
          className="mx-auto mb-3 rounded-card border-2 border-ink/70"
        />
        <Eyebrow className="text-brass">{copy.label}</Eyebrow>
        <p className="mt-1 text-sm text-ink-soft">{copy.note}</p>
        <p className="mt-5 font-display text-5xl font-black text-foil sm:text-6xl">
          {formatMoney(payout.total)}
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
          Commission &middot; {payout.grade} &middot; {payout.weighted.toFixed(2)}/
          {SCORE_MAX} weighted
        </p>
        <p className="mt-3 font-mono text-xs text-ink-soft" aria-live="polite">
          {hydrated ? (
            <>
              Balance {formatMoney(balance)} &middot;{" "}
              <RankBadge rank={rank.id} size={20} className="inline-block align-middle" /> {rank.name}
            </>
          ) : (
            "\u00a0"
          )}
        </p>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel tone="paper" className="p-6">
          <PanelTitle>The scorecard</PanelTitle>
          <div className="mt-4 space-y-3.5">
            {payout.rows.map((row) => (
              <ScoreBar
                key={row.criterion}
                label={row.label}
                score={row.score}
                weight={row.weight}
                contribution={row.contribution}
              />
            ))}
          </div>

          <div className="mt-5 space-y-4 border-t border-brass/40 pt-4">
            <Quote eyebrow="Best thing you said" text={verdict.bestLine} />
            <Quote eyebrow="Worst thing you said" text={verdict.worstLine} />
          </div>
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel tone="paper" className="p-6">
            <Eyebrow>Your manager&apos;s notes</Eyebrow>
            <p className="mt-2 text-sm leading-relaxed">{verdict.coaching}</p>
          </Panel>

          <Panel tone="paper" className="p-6">
            <PanelTitle>How the money happened</PanelTitle>
            <dl className="mt-3 space-y-1.5 font-mono text-xs">
              {[
                [`${item.name} base commission`, formatMoney(payout.base)],
                [`${persona.name} difficulty`, `× ${payout.difficulty.toFixed(1)}`],
                [
                  payout.closedDeal
                    ? `Closed at ${payout.weighted.toFixed(2)}/${SCORE_MAX}`
                    : `No sale at ${payout.weighted.toFixed(2)}/${SCORE_MAX}`,
                  `× ${payout.rate.toFixed(3)}`,
                ],
                ["Subtotal", formatMoney(payout.exact)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="opacity-75">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-brass/40 pt-2 text-sm">
                <dt className="font-semibold uppercase tracking-wider">Paid</dt>
                <dd className="font-semibold text-coral">{formatMoney(payout.total)}</dd>
              </div>
            </dl>
            {/* The rate is a curve, not a single number, so it is spelled out. */}
            <p className="mt-3 text-xs leading-relaxed opacity-70">
              {payout.closedDeal ? (
                <>
                  A close pays 30% of commission guaranteed plus 70% scaled by your score
                  {verdict.unitsSold > 1 ? (
                    <>
                      , then × {payout.unitFactor.toFixed(2)} for selling {verdict.unitsSold}
                    </>
                  ) : null}
                  . Rounded to the nearest $10.
                </>
              ) : (
                <>
                  No close pays 6% of commission, scaled by your score. Rounded to the nearest
                  $10.
                </>
              )}
            </p>
            {!payout.closedDeal && (
              <p className="mt-2 text-xs italic opacity-70">
                A good call that doesn&apos;t close is still worth more than a bad one that does.
              </p>
            )}
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/rolodex" variant="gold">
          Back to the Rolodex
        </ButtonLink>
        <ButtonLink href={`/call/${persona.id}/${item.id}`} variant="ghost">
          Run it again
        </ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Back to the desk
        </ButtonLink>
      </div>
    </div>
  );
}
