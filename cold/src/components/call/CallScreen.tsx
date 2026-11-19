"use client";

import { useEffect, useRef, useState } from "react";
import { ART, type JordanMood } from "@/lib/art/assets";
import { PersonaPortrait } from "@/components/art/PersonaPortrait";
import { ItemIcon } from "@/components/art/ItemIcon";
import { MuteToggle } from "@/components/ui/MuteToggle";
import { play, unlockAudio } from "@/lib/sfx";
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
import type { CallFailure } from "@/lib/api/client";

/** Longest we make anyone wait on a Retry-After header before letting them try anyway. */
const MAX_COOLDOWN_S = 60;

/** Seconds left on a rate-limit cooldown; 0 when there is none (or it has run out). */
function useCooldown(failure: CallFailure | null): number {
  const wait =
    failure?.retryAfter !== undefined && failure.retryAfter > 0
      ? Math.min(Math.ceil(failure.retryAfter), MAX_COOLDOWN_S)
      : 0;
  const [left, setLeft] = useState(wait);
  const [seen, setSeen] = useState(failure);
  // New failure -> restart the clock (state adjusted during render, not in an effect).
  if (seen !== failure) {
    setSeen(failure);
    setLeft(wait);
  }
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return left;
}

const onLine = (p: string) => p === "talking" || p === "listening";

/** The desk: one persona, one item, up to twelve exchanges. */
export function CallScreen({ persona, item }: { persona: Persona; item: Item }) {
  const call = useCall(persona.id, item.id);
  const { phase, turns, outcome, turnsLeft, failure, result } = call;

  const cooldown = useCooldown(failure);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  // The typewriter runs on the newest client line only; everything above it is
  // already said and renders in full.
  const lastTurn = turns.at(-1);
  const typingLast = lastTurn?.role === "client";
  const typed = useTypewriter(call.latestClientLine, typingLast);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: calm ? "auto" : "smooth",
    });
  }, [turns.length, typed.revealed, phase]);

  useEffect(() => {
    if (phase === "talking") input.current?.focus();
  }, [phase]);

  // Sound: ring while dialling, click on pick-up. (Audio unlocks on the click
  // that brought the player here; browsers that refuse simply stay silent.)
  const prevPhase = useRef(phase);
  useEffect(() => {
    if (phase === "ringing" && !failure) {
      play("ring");
      const t = setInterval(() => play("ring"), 2600);
      return () => clearInterval(t);
    }
  }, [phase, failure]);
  useEffect(() => {
    if (prevPhase.current === "ringing" && phase === "talking") play("pickup");
    prevPhase.current = phase;
  }, [phase]);

  const canSpeak = phase === "talking" && turnsLeft > 0 && failure === null;
  const remaining = CALL_CONFIG.maxMessageChars - draft.length;

  function send() {
    unlockAudio();
    if (!canSpeak || draft.trim() === "") return;
    call.say(draft);
    setDraft("");
  }

  if (phase === "graded" && result && outcome !== "open") {
    return (
      <ResultsPanel result={result} persona={persona} item={item} outcome={outcome} />
    );
  }

  // Jordan's face follows the pressure: rich on a close, panic when the client
  // hangs up or the exchanges are nearly gone (useCall exposes no sentiment).
  const jordanMood: JordanMood =
    outcome === "closed"
      ? "rich"
      : outcome === "hangup" || (onLine(phase) && turnsLeft <= 2)
        ? "panic"
        : "grin";
  const onTheLine = phase === "talking" || phase === "listening";
  const phone = onTheLine ? "live" : phase === "ringing" ? "ringing" : "idle";
  const phoneLabel = { live: "Phone: on the line", ringing: "Phone: ringing", idle: "Phone: hung up" }[phone];

  return (
    <div className="flex flex-col gap-4">
      {/* The stage: client on the left, Jordan on the right, the line in between. */}
      <Panel tone="card" className="grid grid-cols-2 items-end gap-x-3 gap-y-3 p-4 sm:grid-cols-[auto_1fr_auto]">
        <PersonaPortrait
          personaId={persona.id}
          mood={outcome === "closed" ? "sold" : outcome === "hangup" ? "resist" : "neutral"}
          size={160}
          eager
          title={persona.name}
          className="col-start-1 row-start-1 size-32 shrink-0 rounded-card border-2 border-ink/70 sm:size-40 [@media(max-height:820px)]:sm:size-28"
        />

        <div className="col-span-2 row-start-2 flex min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1 flex-col items-center gap-2 text-center">
          <MuteToggle />
          <div>
            <p className="font-display text-lg leading-tight font-bold text-ink">{persona.name}</p>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
              {persona.title} &middot; difficulty ×{persona.difficulty.toFixed(1)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ItemIcon icon={item.icon} size={32} />
            <div className="text-left">
              <p className="font-display text-sm font-bold text-ink">{item.name}</p>
              <p className="font-mono text-[0.62rem] text-brass">
                ${item.unitPrice.toLocaleString("en-US")} / unit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG */}
            <img
              src={ART.phone[phone]}
              width={48}
              height={40}
              alt={phoneLabel}
              className={`shrink-0 ${phone === "ringing" ? "fx-ring" : ""}`}
            />
            <div className="text-left">
              {onTheLine ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 animate-pulse rounded-full bg-dialtone" />
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-dialtone">
                    On the line
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG */}
                  <img src={ART.fx.dialtone} width={48} height={12} alt="" aria-hidden className="opacity-70" />
                </span>
              ) : phase === "ringing" ? (
                <span className="inline-flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG */}
                  <img src={ART.fx.ring} width={40} height={20} alt="" aria-hidden className="fx-ring" />
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                    Dialling
                  </span>
                </span>
              ) : (
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                  Call ended
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
          </div>
        </div>

        <div className="relative col-start-2 row-start-1 justify-self-end sm:col-start-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG */}
          <img
            src={ART.jordan[jordanMood]}
            width={160}
            height={160}
            alt="Jordan Beltford"
            decoding="async"
            className="size-28 rounded-card border-2 border-ink/70 bg-sky-pale sm:size-36 [@media(max-height:820px)]:sm:size-24"
          />
          {jordanMood === "panic" && (
            // eslint-disable-next-line @next/next/no-img-element -- SVG
            <img
              src={ART.fx.sweat}
              width={56}
              height={56}
              alt=""
              aria-hidden
              className="fx-sweat pointer-events-none absolute -top-3 -left-4 size-12"
            />
          )}
        </div>
      </Panel>

      {/* The call itself. */}
      <Panel tone="card" className="p-0">
        <div
          ref={scroller}
          className="flex h-[clamp(12rem,calc(100dvh-29rem),52vh)] flex-col gap-3.5 overflow-y-auto p-5"
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
          <div role="alert" className="border-t border-coral-light/50 bg-coral/25 p-4">
            <p className="font-display text-sm font-bold text-ink">{failure.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{failure.message}</p>
            {failure.retryAfter !== undefined && (
              <p className="mt-1 font-mono text-xs text-ink-faint">
                {cooldown > 0
                  ? `Switchboard says give it ${cooldown}s.`
                  : "Switchboard says the lines are clear. Try again."}
              </p>
            )}
            {failure.detail && (
              <p className="mt-2 font-mono text-[0.68rem] break-words text-ink-faint">
                {failure.detail}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {failure.retryable && (
                <Button variant="coral" onClick={call.retry} disabled={cooldown > 0}>
                  {phase === "over" ? "Try grading again" : "Redial"}
                  {cooldown > 0 ? ` (${cooldown})` : ""}
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
        {item.facts && item.facts.length > 0 && (
          <ul className="mt-1.5 list-disc pl-5 text-sm text-ink/75">
            {item.facts.slice(0, 3).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
        <p className="mt-1 text-sm text-ink/75">
          <strong>{persona.name}:</strong> {persona.hook}
        </p>
      </Panel>
    </div>
  );
}
