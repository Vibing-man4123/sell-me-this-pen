import { z } from "zod";
import { CALL_CONFIG } from "../game/constants";
import { ITEMS_BY_ID } from "../game/items";
import { PERSONAS_BY_ID } from "../game/personas";
import { CALL_OUTCOMES } from "../game/transcript";
import { VerdictSchema } from "../game/rubric";

/**
 * Request/response shapes for the two route handlers, defined once and used by
 * both sides. The browser gets type safety from the same schema the server
 * validates against, so the contract cannot drift.
 */

const personaId = z.string().refine((id) => PERSONAS_BY_ID.has(id), "Unknown persona");
const itemId = z.string().refine((id) => ITEMS_BY_ID.has(id), "Unknown item");

const TurnSchema = z.object({
  role: z.enum(["broker", "client"]),
  content: z.string().min(1).max(CALL_CONFIG.maxMessageChars),
});

/** Generous cap: maxTurns broker lines plus one client reply each, plus the opener. */
const MAX_TRANSCRIPT = CALL_CONFIG.maxTurns * 2 + 2;

export const CallRequestSchema = z.object({
  personaId,
  itemId,
  /** Full history so far. Empty means "the phone is still ringing" - the client speaks first. */
  turns: z.array(TurnSchema).max(MAX_TRANSCRIPT),
});
export type CallRequest = z.infer<typeof CallRequestSchema>;

export const CallResponseSchema = z.object({
  reply: z.string(),
  outcome: z.enum(CALL_OUTCOMES),
  /** Broker messages the player has left after this exchange. */
  turnsLeft: z.number().int().min(0),
});
export type CallResponse = z.infer<typeof CallResponseSchema>;

export const JudgeRequestSchema = z.object({
  personaId,
  itemId,
  turns: z.array(TurnSchema).max(MAX_TRANSCRIPT),
  /** How the call actually ended, per the client's own tokens. */
  outcome: z.enum(["closed", "hangup", "timeout", "walkaway"]),
});
export type JudgeRequest = z.infer<typeof JudgeRequestSchema>;

/** Mirrors `PayoutBreakdown`; declared here so the browser can validate it. */
export const PayoutSchema = z.object({
  base: z.number(),
  difficulty: z.number(),
  weighted: z.number(),
  grade: z.string(),
  scoreFactor: z.number(),
  unitFactor: z.number(),
  rate: z.number(),
  exact: z.number(),
  closedDeal: z.boolean(),
  total: z.number(),
  rows: z.array(
    z.object({
      criterion: z.string(),
      label: z.string(),
      score: z.number(),
      weight: z.number(),
      contribution: z.number(),
    })
  ),
});

export const JudgeResponseSchema = z.object({
  verdict: VerdictSchema,
  payout: PayoutSchema,
});
export type JudgeResponse = z.infer<typeof JudgeResponseSchema>;
