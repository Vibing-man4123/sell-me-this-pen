"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, postCall, postJudge, type CallFailure } from "@/lib/api/client";
import type { JudgeResponse } from "@/lib/api/contracts";
import { CALL_CONFIG } from "@/lib/game/constants";
import { useHydrated, useProgress } from "@/lib/store/progress";
import { isOver, type CallOutcome, type Turn } from "@/lib/game/transcript";

/**
 * The whole call, as a state machine.
 *
 * Kept apart from the markup because the ordering rules are the fiddly part:
 * a failed exchange must never leave a half-finished turn in the transcript,
 * and the player must never be able to speak into a call that already ended.
 */

export type CallPhase =
  /** Dialling out - waiting for the client to pick up. */
  | "ringing"
  /** The player's move. */
  | "talking"
  /** Waiting for the client's reply. */
  | "listening"
  /** Call finished, not yet graded. */
  | "over"
  /** Waiting for the judge. */
  | "grading"
  /** Verdict is in. */
  | "graded";

export type CallState = {
  phase: CallPhase;
  turns: Turn[];
  outcome: CallOutcome;
  turnsLeft: number;
  failure: CallFailure | null;
  result: JudgeResponse | null;
  /** The newest client line, for the typewriter to reveal. */
  latestClientLine: string | null;
};

export function useCall(personaId: string, itemId: string) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [phase, setPhase] = useState<CallPhase>("ringing");
  const [outcome, setOutcome] = useState<CallOutcome>("open");
  const [turnsLeft, setTurnsLeft] = useState<number>(CALL_CONFIG.maxTurns);
  const [failure, setFailure] = useState<CallFailure | null>(null);
  const [result, setResult] = useState<JudgeResponse | null>(null);
  const [latestClientLine, setLatestClientLine] = useState<string | null>(null);

  /**
   * The transcript as the server last accepted it. Retries resend exactly this,
   * so a failed exchange can be repeated without duplicating a broker line.
   */
  const pending = useRef<Turn[] | null>(null);
  /** Guards against React 19 double-invoking the opening effect in dev. */
  const dialled = useRef(false);
  /** One id per call: the store ignores a second record with the same id. */
  const callId = useRef<string | null>(null);
  /** Set synchronously when the payout is banked, so a double-click cannot bank it twice. */
  const banked = useRef(false);
  const grading = useRef(false);
  // Rehydrate saved progress now, long before a payout can arrive.
  useHydrated();

  const runExchange = useCallback(
    async (next: Turn[]) => {
      pending.current = next;
      setFailure(null);
      setPhase(next.length === 0 ? "ringing" : "listening");

      try {
        const res = await postCall({ personaId, itemId, turns: next });
        const withReply = [...next, { role: "client" as const, content: res.reply }];

        setTurns(withReply);
        setLatestClientLine(res.reply);
        setTurnsLeft(res.turnsLeft);
        setOutcome(res.outcome);
        setPhase(isOver(res.outcome) ? "over" : "talking");
        pending.current = withReply;
      } catch (err) {
        // The transcript stays as it was: the broker's line is still shown and
        // still queued, so "redial" repeats the same exchange, not a new one.
        setFailure(err instanceof ApiError ? err.failure : null);
        setPhase(next.length === 0 ? "ringing" : "talking");
      }
    },
    [personaId, itemId]
  );

  useEffect(() => {
    if (dialled.current) return;
    dialled.current = true;
    void runExchange([]);
  }, [runExchange]);

  /** Sends what the player typed. */
  const say = useCallback(
    (raw: string) => {
      const content = raw.trim().slice(0, CALL_CONFIG.maxMessageChars);
      if (content === "" || phase !== "talking" || turnsLeft <= 0) return;
      void runExchange([...turns, { role: "broker", content }]);
    },
    [phase, turns, turnsLeft, runExchange]
  );

  /** Ends the call early, by choice rather than by outcome. */
  const hangUp = useCallback(() => {
    if (phase !== "talking") return;
    setOutcome("walkaway");
    setPhase("over");
    setFailure(null);
  }, [phase]);

  const grade = useCallback(async () => {
    if (phase !== "over" || outcome === "open" || grading.current) return;
    grading.current = true;
    setPhase("grading");
    setFailure(null);
    try {
      const res = await postJudge({ personaId, itemId, turns, outcome });
      if (!banked.current) {
        banked.current = true;
        callId.current ??= crypto.randomUUID();
        useProgress.getState().recordCall({
          id: callId.current,
          personaId,
          itemId,
          payout: res.payout.total,
          score: res.payout.weighted,
          grade: res.payout.grade,
          closedDeal: res.payout.closedDeal,
          timestamp: Date.now(),
        });
      }
      setResult(res);
      setPhase("graded");
    } catch (err) {
      setFailure(err instanceof ApiError ? err.failure : null);
      setPhase("over");
    } finally {
      grading.current = false;
    }
  }, [phase, outcome, personaId, itemId, turns]);

  /**
   * Retries whatever just failed. A failure while phase is "over" is a failed
   * GRADING of a finished call: re-grade the same transcript, never re-dial.
   * (banked/callId/store dedupe still guarantee a single payout.)
   */
  const retry = useCallback(() => {
    if (phase === "grading" || result !== null) return;
    if (failure === null) return;
    if (phase === "over") {
      void grade();
      return;
    }
    void runExchange(pending.current ?? turns);
  }, [phase, result, failure, turns, runExchange, grade]);

  const state: CallState = {
    phase,
    turns,
    outcome,
    turnsLeft,
    failure,
    result,
    latestClientLine,
  };

  return { ...state, say, retry, hangUp, grade };
}
