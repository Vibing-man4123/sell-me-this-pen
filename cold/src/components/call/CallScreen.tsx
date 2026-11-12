"use client";

import { useEffect, useRef, useState } from "react";
import { PersonaPortrait } from "@/components/art/PersonaPortrait";
import { ItemIcon } from "@/components/art/ItemIcon";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Panel } from "@/components/ui/Panel";
import { CALL_CONFIG } from "@/lib/game/constants";
import type { Item } from "@/lib/game/items";
import type { Persona } from "@/lib/game/personas";
import { OUTCOME_COPY } from "@/lib/game/transcript";
import { BrokerLine, ClientLine, Listening } from "./Transcript";
import { ResultsPanel } from "./ResultsPanel";
import { useTypewriter } from "./Typewriter";
import { useCall } from "./useCall";

/** The desk: one persona, one item, up to twelve exchanges. */
export function CallScreen({ persona, item }: { persona: Persona; item: Item }) {
  const call = useCall(persona.id, item.id);
  const { phase, turns, outcome, turnsLeft, failure, result } = call;

  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  // The typewriter runs on the newest client line only; everything above it is
  // already said and renders in full.
  const lastTurn = turns.at(-1);
  const typingLast = lastTurn?.role === "client";
  const typed = useTypewriter(call.latestClientLine, typingLast);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, typed.revealed, phase]);

  useEffect(() => {
    if (phase === "talking") input.current?.focus();
  }, [phase]);

  const canSpeak = phase === "talking" && turnsLeft > 0 && failure === null;
  const remaining = CALL_CONFIG.maxMessageChars - draft.length;

  function send() {
    if (!canSpeak || draft.trim() === "") return;
    call.say(draft);
    setDraft("");
  }

  if (phase === "graded" && result && outcome !== "open") {
    return (
      <ResultsPanel result={result} persona={persona} item={item} outcome={outcome} />
    );
  }

  const onTheLine = phase === "talking" || phase === "listening";

  return (
    <div className="flex flex-col gap-4">
      {/* Who you called, what you're selling, how long you have left. */}
      <Panel tone="card" className="flex flex-wrap items-center gap-4 p-4">
        <PersonaPortrait
          portrait={persona.portrait}
          size={56}
          title={persona.name}
          className="shrink-0 rounded-card border-2 border-ink/70"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight font-bold text-ink">{persona.name}</p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
            {persona.title} &middot; difficulty ×{persona.difficulty.toFixed(1)}
          </p>
        </div>

        <div className="flex items-center gap-2 border-l border-brass/30 pl-4">
          <ItemIcon icon={item.icon} size={32} />
          <div>
            <p className="font-display text-sm font-bold text-ink">{item.name}</p>
            <p className="font-mono text-[0.62rem] text-brass">
              ${item.unitPrice.toLocaleString("en-US")} / unit
            </p>
          </div>
        </div>

        <div className="text-right">
          {onTheLine ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-dialtone" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-dialtone">
                On the line
              </span>
            </span>
          ) : (
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
              {phase === "ringing" ? "Dialling" : "Call ended"}
            </span>
          )}
          <p
            className={`font-mono text-xs ${
              turnsLeft <= CALL_CONFIG.warnAtRemaining ? "text-coral" : "text-ink-faint"
            }`}
          >
            {turnsLeft} {turnsLeft === 1 ? "exchange" : "exchanges"} left
          </p>
        </div>
      </Panel>

      {/* The call itself. */}
      <Panel tone="card" className="p-0">
        <div
          ref={scroller}
          className="flex h-[52vh] min-h-80 flex-col gap-3.5 overflow-y-auto p-5"
          onClick={typed.done ? undefined : typed.skip}
        >
          {phase === "ringing" && turns.length === 0 && (
            <p className="m-auto font-mono text-sm text-ink-faint">
              Ringing{failure ? " — nobody is picking up" : "…"}
            </p>
          )}

          {turns.map((turn, i) => {
            const isLast = i === turns.length - 1;
            const text = isLast && typingLast ? typed.revealed : turn.content;
            if (turn.role === "broker") return <BrokerLine key={i}>{turn.content}</BrokerLine>;
            return (
              <ClientLine key={i} persona={persona}>
                {text}
                {isLast && typingLast && !typed.done && (
                  <span className="ml-0.5 inline-block w-1.5 animate-pulse bg-dialtone align-middle">
                    &nbsp;
                  </span>
                )}
              </ClientLine>
            );
          })}

          {phase === "listening" && <Listening persona={persona} />}
        </div>

        {/* Failures, in the voice of the building. */}
        {failure && (
          <div className="border-t border-coral-light/50 bg-coral/25 p-4">
            <p className="font-display text-sm font-bold text-ink">{failure.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{failure.message}</p>
            {failure.retryAfter !== undefined && (
              <p className="mt-1 font-mono text-xs text-ink-faint">
                Switchboard says: about {failure.retryAfter}s.
              </p>
            )}
            {failure.detail && (
              <p className="mt-2 font-mono text-[0.68rem] break-words text-ink-faint">
                {failure.detail}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {failure.retryable && (
                <Button variant="coral" onClick={call.retry}>
                  Redial
                </Button>
              )}
              <ButtonLink href="/" variant="ghost">
                Back to the desk
              </ButtonLink>
            </div>
          </div>
        )}

        {/* What the player says next, or what happens now the call is over. */}
        {phase === "over" && !failure ? (
          <div className="border-t border-brass/30 p-5 text-center">
            <Eyebrow className="text-brass">
              {outcome !== "open" ? OUTCOME_COPY[outcome].label : ""}
            </Eyebrow>
            <p className="mt-1 text-sm text-ink-soft">
              {outcome !== "open" ? OUTCOME_COPY[outcome].note : ""}
            </p>
            <Button className="mt-4" onClick={call.grade}>
              Face the scorecard
            </Button>
          </div>
        ) : phase === "grading" ? (
          <div className="border-t border-brass/30 p-5 text-center">
            <p className="font-mono text-sm text-ink-faint">
              Your manager is listening back to the tape…
            </p>
          </div>
        ) : (
          !failure && (
            <div className="border-t border-brass/30 p-4">
              <textarea
                ref={input}
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, CALL_CONFIG.maxMessageChars))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={!canSpeak}
                rows={2}
                placeholder={
                  phase === "ringing"
                    ? "Wait for them to pick up…"
                    : phase === "listening"
                      ? "They're talking. Let them."
                      : "What do you say?"
                }
                aria-label="What you say next"
                className="w-full resize-none rounded-card border border-brass/40 bg-sky px-3.5 py-2.5 text-ink placeholder:text-ink-faint/60 focus:border-gold focus:outline-none disabled:opacity-50"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span
                  className={`font-mono text-[0.68rem] ${
                    remaining < 80 ? "text-coral" : "text-ink-faint"
                  }`}
                >
                  {remaining < 120 ? `${remaining} characters left` : "Enter to send"}
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={call.hangUp} disabled={phase !== "talking"}>
                    Hang up
                  </Button>
                  <Button onClick={send} disabled={!canSpeak || draft.trim() === ""}>
                    Say it
                  </Button>
                </div>
              </div>
            </div>
          )
        )}
      </Panel>

      {/* The brief, kept visible: the player is allowed to know the catch. */}
      <Panel tone="paper" className="p-4">
        <Eyebrow>Tonight&apos;s brief</Eyebrow>
        <p className="mt-1.5 text-sm">
          <strong>{item.name}</strong> &mdash; {item.tagline}
        </p>
        <p className="mt-1 text-sm text-ink/75">
          <strong>The catch:</strong> {item.catch}
        </p>
        <p className="mt-1 text-sm text-ink/75">
          <strong>{persona.name}:</strong> {persona.hook}
        </p>
      </Panel>
    </div>
  );
}
