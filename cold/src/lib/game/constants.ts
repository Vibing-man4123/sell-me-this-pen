/** Shared tuning knobs for a single call. */
export const CALL_CONFIG = {
  /** Broker messages allowed before the client ends the call. */
  maxTurns: 12,
  /** Soft warning shown to the player at this many turns remaining. */
  warnAtRemaining: 3,
  /** Hard cap on a single broker message, enforced in the UI and the proxy. */
  maxMessageChars: 600,
  /** Cap on client replies so calls stay snappy on slow hardware. */
  clientMaxTokens: 220,
} as const;

export const GAME_TITLE = "Sell Me This Pen";
/** Pre-broken for display type so the hero never wraps somewhere ugly. */
export const GAME_TITLE_LINES = ["Sell Me", "This Pen"] as const;
export const PLAYER_CHARACTER = "Jordan Beltford";
