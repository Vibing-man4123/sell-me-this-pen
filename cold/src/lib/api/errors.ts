import type { GroqErrorKind } from "../server/groq";

/**
 * Failures, rewritten as things that could happen in a 1987 brokerage.
 *
 * The plan calls for rate limits to read as part of the joke rather than as a
 * broken app, so every kind gets in-fiction copy. `detail` is the real message
 * and is only shown for the config-error kind, where the player is the one who
 * has to go fix something.
 */

export type ApiErrorKind = GroqErrorKind | "bad_request";

export type ApiErrorBody = {
  error: {
    kind: ApiErrorKind;
    /** In-fiction headline. */
    title: string;
    /** In-fiction explanation. */
    message: string;
    retryable: boolean;
    retryAfter?: number;
    /** Real technical message, for config problems the player must act on. */
    detail?: string;
  };
};

export const ERROR_COPY: Record<ApiErrorKind, { title: string; message: string }> = {
  rate_limit: {
    title: "The market just crashed",
    message:
      "Every line in the building lit up at once and the switchboard gave out. Give it a minute and dial again - it always comes back.",
  },
  timeout: {
    title: "Dead air",
    message:
      "You can hear them breathing but nothing is coming through. Hang up and redial.",
  },
  upstream: {
    title: "The line went down",
    message:
      "Something chewed through the cable in the stairwell again. Maintenance has been told. Try the call again.",
  },
  bad_output: {
    title: "Crossed wires",
    message:
      "For a second you were patched into someone else's call entirely. Redial and it should clear.",
  },
  missing_key: {
    title: "Phone service suspended",
    message:
      "Accounting never paid the phone bill, so the handset is a paperweight. Somebody with access to the server has to fix this one.",
  },
  bad_request: {
    title: "Wrong number",
    message: "That call doesn't exist on tonight's sheet. Go back to the desk and pick another.",
  },
};
