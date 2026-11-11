import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Panel, PanelTitle } from "@/components/ui/Panel";
import type { JudgeResponse } from "@/lib/api/contracts";
import type { Item } from "@/lib/game/items";
import { formatMoney } from "@/lib/game/payout";
import type { Persona } from "@/lib/game/personas";
import { SCORE_MAX } from "@/lib/game/rubric";
import { OUTCOME_COPY, type CallOutcome } from "@/lib/game/transcript";

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
        <span className="font-mono text-xs text-oxblood">
          {score}/{SCORE_MAX}
          <span className="ml-2 opacity-60">
            × {weight.toFixed(2)} = {contribution.toFixed(2)}
          </span>
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink/15">
        <div
          className="h-full rounded-full bg-oxblood transition-[width] duration-700 ease-out"
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

  return (
    <div className="flex flex-col gap-5">
      {/* The headline: what happened, and what it paid. */}
      <Panel tone="navy" className="p-6 text-center">
        <Eyebrow className="text-brass">{copy.label}</Eyebrow>
        <p className="mt-1 text-sm text-paper-dim">{copy.note}</p>
        <p className="mt-5 font-display text-5xl font-black text-foil sm:text-6xl">
          {formatMoney(payout.total)}
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-paper-muted">
          Commission &middot; {payout.grade} &middot; {payout.weighted.toFixed(2)}/
          {SCORE_MAX} weighted
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
                <dd className="font-semibold text-oxblood">{formatMoney(payout.total)}</dd>
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
        <ButtonLink href={`/call/${persona.id}/${item.id}`} variant="gold">
          Run it again
        </ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Back to the desk
        </ButtonLink>
      </div>
    </div>
  );
}
