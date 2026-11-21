import type { Turn } from "./transcript";

/**
 * "Own the lie", enforced from the transcript. Prompt wording alone did not
 * hold: a live Kai caught a titanium-pen lie, then closed two exchanges later
 * without the caller ever owning it. The client prompt tells the model to call
 * a caught lie a lie in so many words, which makes the catch cheap to see
 * here; /api/call then feeds the state back into the prompt and refuses a
 * close that comes too early.
 *
 * Pure, with type-only imports, so `node --test` can load it directly.
 */

/** The client calling it: "that's a lie", "you're lying", "you made that up", "that's not true". */
const CATCH_RE = /\b(?:lie|lies|lying|lied|liar)\b|\bmade (?:that|it|this) up\b|\b(?:that'?s|that is|it'?s|it is) not true\b/i;
/** Figures of speech that are not a catch: "not gonna lie", "I won't lie", "I'd be lying if". */
const NOT_A_CATCH_RE =
  /\b(?:not gonna|not going to|won'?t|wouldn'?t|can'?t|never|i'?d be|i would be) (?:lie|lying)\b|\blie (?:down|low)\b|\blies (?:in|with)\b/gi;

/** The caller owning it: "you're right, I made that up", "I exaggerated", "sorry, that was not true". */
const OWN_RE =
  /\byou'?re right\b|\bi (?:lied|was lying|made (?:that|it) up|exaggerated|overstated|was wrong|got carried away)\b|\b(?:that|it) (?:was|wasn'?t|is not|isn'?t) (?:a lie|true)\b|\bnot true\b|\bcaught me\b|\bmy bad\b|\bi apologi[sz]e\b|\bsorry\b|\bthe truth is\b|\bi take (?:that|it) back\b|\bscratch that\b|\bfair catch\b/i;

function normApostrophes(text: string): string {
  return text.replace(/[‘’`]/g, "'");
}

/** True if a client line calls out a lie. */
export function callsOutLie(text: string): boolean {
  return CATCH_RE.test(normApostrophes(text).replace(NOT_A_CATCH_RE, " "));
}

/** True if a broker line owns or corrects an earlier claim. */
export function ownsLie(text: string): boolean {
  return OWN_RE.test(normApostrophes(text));
}

export type LieState =
  | { kind: "none" }
  /** Caught at this exchange and not owned since: no close yet. */
  | { kind: "unowned"; exchange: number }
  /** Owned in the caller's latest line: one more honest exchange before a close. */
  | { kind: "just-owned"; exchange: number }
  /** Owned, and at least one exchange since: a close is allowed again. */
  | { kind: "owned"; exchange: number };

/**
 * Where the call stands on the latest caught lie. Exchange numbers count the
 * caller's lines, as the player sees them. The last turn is the caller's line
 * the client is about to answer.
 */
export function lieState(turns: Turn[]): LieState {
  let exchange = 0;
  let caught: number | null = null;
  let ownedAt: number | null = null;
  for (const t of turns) {
    if (t.role === "broker") {
      exchange++;
      if (caught !== null && ownedAt === null && ownsLie(t.content)) ownedAt = exchange;
    } else if (exchange > 0 && callsOutLie(t.content)) {
      // A fresh catch after the lie was owned restarts the clock. One the
      // client is still repeating before it was owned does not.
      if (caught === null || ownedAt !== null) {
        caught = exchange;
        ownedAt = null;
      }
    }
  }
  if (caught === null) return { kind: "none" };
  if (ownedAt === null) return { kind: "unowned", exchange: caught };
  return ownedAt === exchange ? { kind: "just-owned", exchange: caught } : { kind: "owned", exchange: caught };
}

/** True if the client may not close in the reply it is about to give. */
export function closeBlocked(state: LieState): boolean {
  return state.kind === "unowned" || state.kind === "just-owned";
}

/** One line for the client prompt, or "" when no lie is in play. */
export function lieNote(state: LieState): string {
  switch (state.kind) {
    case "none":
      return "";
    case "unowned":
      return `You caught the caller lying at exchange ${state.exchange}, and they have not owned it. Until they admit it or correct it, you do NOT agree to buy, whatever they offer: say why, in your voice.`;
    case "just-owned":
      return `You caught the caller lying at exchange ${state.exchange}; they seem to have just owned it (you judge whether they really did). Acknowledge it, but do NOT agree to buy in this reply: they need one more exchange of honest talk first.`;
    case "owned":
      return `You caught the caller lying at exchange ${state.exchange}, and they seem to have owned it since. If they really did and have talked straight since, trust is mending: once they meet hard rule 3, you may agree.`;
  }
}
