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

export const GAME_TITLE = "Dial Tone Dynasty";
export const PLAYER_CHARACTER = "Jordan Beltford";
