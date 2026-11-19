/**
 * The shape of a call as it exists between the browser and the server.
 *
 * The transcript is held client-side and posted back on every exchange: the
 * game is single-player and entirely local (localStorage in Phase 2), so there
 * is no server session to keep. The server therefore trusts the transcript it
 * is handed - fine for a game where cheating only cheats yourself, and worth
 * remembering before any leaderboard ships.
 */

export type Speaker = "broker" | "client";

export type Turn = { role: Speaker; content: string };

/**
 * How a call ended. Derived from the client's own `[CLOSED]` / `[HANGUP]`
 * tokens, never guessed by a model - so the economy stays deterministic.
 */
export const CALL_OUTCOMES = ["open", "closed", "hangup", "timeout", "walkaway"] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

/** True once the player can no longer speak and the call goes to the judge. */
export function isOver(outcome: CallOutcome): boolean {
  return outcome !== "open";
}

export const OUTCOME_COPY: Record<Exclude<CallOutcome, "open">, { label: string; note: string }> = {
  closed: { label: "Deal closed", note: "They said yes. Out loud. On a line that is, legally, probably recorded." },
  hangup: { label: "Hung up on", note: "The dial tone is feedback. It is just not the constructive kind." },
  timeout: { label: "Ran out of call", note: "Twelve exchanges and no ask. The clock closed this one, and it did not take a commission." },
  walkaway: { label: "You hung up", note: "Bold move. Sometimes the smartest thing a broker can do is stop talking. Sometimes." },
};

/** Count of broker messages, which is what `maxTurns` actually limits. */
export function brokerTurnsUsed(turns: Turn[]): number {
  return turns.filter((t) => t.role === "broker").length;
}
