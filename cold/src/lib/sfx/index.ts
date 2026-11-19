"use client";

/**
 * Tiny synthesized sound effects (Web Audio, no files). The AudioContext is
 * created lazily on first play, and play calls are only made from user-driven
 * flows; if the browser still has it suspended we resume() best-effort.
 */

const KEY = "cold.sfx.muted";
const VOLUME = 0.3;

export type Sfx = "ring" | "pickup" | "kaching" | "trombone" | "stamp";

let ctx: AudioContext | null = null;
// Browsers refuse to start audio before a user gesture; stay silent until then.
let unlocked = false;
let hooked = false;

function hookGesture() {
  if (hooked || typeof window === "undefined") return;
  hooked = true;
  const on = () => {
    unlocked = true;
    window.removeEventListener("pointerdown", on);
    window.removeEventListener("keydown", on);
  };
  window.addEventListener("pointerdown", on);
  window.addEventListener("keydown", on);
}
hookGesture();
let muted: boolean | null = null;
const listeners = new Set<() => void>();

function readMuted(): boolean {
  if (muted === null) {
    try {
      muted = localStorage.getItem(KEY) === "1";
    } catch {
      muted = false;
    }
  }
  return muted;
}

export function isMuted(): boolean {
  return typeof window === "undefined" ? false : readMuted();
}

export function setMuted(v: boolean) {
  muted = v;
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {}
  listeners.forEach((l) => l());
}

export function subscribeMuted(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function ac(): AudioContext | null {
  if (typeof window === "undefined" || !unlocked) return null;
  try {
    if (!ctx) {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

/** One enveloped oscillator note. */
function tone(c: AudioContext, o: { f: number; f2?: number; t: number; d: number; type?: OscillatorType; v?: number }) {
  const osc = c.createOscillator();
  const g = c.createGain();
  const t0 = c.currentTime + o.t;
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.f, t0);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.d);
  const peak = (o.v ?? 1) * VOLUME;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.d);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + o.d + 0.05);
}

const PLAYERS: Record<Sfx, (c: AudioContext) => void> = {
  // Two-tone bell burst, twice: brrring-brrring.
  ring(c) {
    for (const base of [0, 0.7]) {
      for (let i = 0; i < 8; i++) {
        tone(c, { f: i % 2 ? 1400 : 1000, t: base + i * 0.05, d: 0.05, type: "square", v: 0.35 });
      }
    }
  },
  pickup(c) {
    tone(c, { f: 1800, f2: 400, t: 0, d: 0.04, type: "square", v: 0.5 });
    tone(c, { f: 300, f2: 120, t: 0.07, d: 0.06, type: "triangle", v: 0.6 });
  },
  kaching(c) {
    tone(c, { f: 2093, t: 0, d: 0.12, type: "triangle", v: 0.7 });
    tone(c, { f: 3136, t: 0.1, d: 0.6, type: "triangle", v: 0.7 });
    tone(c, { f: 4186, t: 0.1, d: 0.4, type: "sine", v: 0.3 });
  },
  trombone(c) {
    [[233, 0], [220, 0.4], [208, 0.8]].forEach(([f, t]) =>
      tone(c, { f, t, d: 0.38, type: "sawtooth", v: 0.35 })
    );
    tone(c, { f: 196, f2: 140, t: 1.2, d: 0.9, type: "sawtooth", v: 0.4 });
  },
  stamp(c) {
    tone(c, { f: 140, f2: 45, t: 0, d: 0.18, type: "sine", v: 1 });
    tone(c, { f: 900, f2: 200, t: 0, d: 0.04, type: "square", v: 0.25 });
  },
};

export function play(name: Sfx) {
  if (isMuted()) return;
  const c = ac();
  if (!c) return;
  try {
    PLAYERS[name](c);
  } catch {}
}

/** Call from a click handler so the browser unlocks audio for later sounds. */
export function unlockAudio() {
  unlocked = true;
  ac();
}
