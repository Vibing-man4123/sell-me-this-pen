import type { z } from "zod";
import { GroqError } from "../server/groq";
import { ERROR_COPY, type ApiErrorBody } from "./errors";

/**
 * Turning failures into responses. Shared by both route handlers so the error
 * envelope is identical whichever one broke.
 */

export function errorResponse(body: ApiErrorBody, status: number): Response {
  return Response.json(body, { status });
}

/** A Groq failure, as an in-fiction error the UI can render. */
export function groqErrorResponse(err: GroqError): Response {
  // Server-side only: the player sees a joke, the operator sees the cause.
  console.error(`[groq] ${err.kind}: ${err.message}`);
  const status = err.kind === "rate_limit" ? 429 : err.kind === "missing_key" ? 500 : 502;
  return errorResponse(
    {
      error: {
        kind: err.kind,
        ...ERROR_COPY[err.kind],
        retryable: err.retryable,
        retryAfter: err.retryAfter,
        // Only a config problem needs the real message surfaced - everything
        // else is weather, and the player can only redial.
        detail: err.kind === "missing_key" ? err.message : undefined,
      },
    },
    status
  );
}

/** A request that failed schema validation. */
export function badRequestResponse(error: z.ZodError): Response {
  return errorResponse(
    {
      error: {
        kind: "bad_request",
        ...ERROR_COPY.bad_request,
        retryable: false,
        detail: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      },
    },
    400
  );
}

/** Any other failure, rethrown as an in-fiction 502. */
export function unknownErrorResponse(): Response {
  return errorResponse(
    { error: { kind: "upstream", ...ERROR_COPY.upstream, retryable: true } },
    502
  );
}

/** Reads a JSON body without throwing on malformed input. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
