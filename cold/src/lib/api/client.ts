import {
  CallResponseSchema,
  JudgeResponseSchema,
  type CallRequest,
  type CallResponse,
  type JudgeRequest,
  type JudgeResponse,
} from "./contracts";
import { ERROR_COPY, type ApiErrorBody, type ApiErrorKind } from "./errors";

/**
 * Browser-side wrappers for the two route handlers.
 *
 * Everything that can go wrong arrives as a `CallFailure` carrying in-fiction
 * copy, so the UI never has to decide what a network error should say.
 */

export type CallFailure = {
  kind: ApiErrorKind;
  title: string;
  message: string;
  retryable: boolean;
  retryAfter?: number;
  detail?: string;
};

export class ApiError extends Error {
  readonly failure: CallFailure;
  constructor(failure: CallFailure) {
    super(failure.message);
    this.name = "ApiError";
    this.failure = failure;
  }
}

/** The fallback when the fetch itself never reached the server. */
function offlineFailure(): CallFailure {
  return {
    kind: "upstream",
    title: "No dial tone",
    message:
      "The handset is dead - no line at all. Check that this device is online, then redial.",
    retryable: true,
  };
}

async function post<T>(
  path: string,
  body: unknown,
  parse: (data: unknown) => T
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(offlineFailure());
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // The server answered, just not in JSON (a gateway timeout page, say): the line is up but broken.
    throw new ApiError({ kind: "upstream", ...ERROR_COPY.upstream, retryable: true });
  }

  if (!res.ok) {
    const envelope = data as Partial<ApiErrorBody>;
    if (envelope?.error?.kind) throw new ApiError(envelope.error);
    throw new ApiError({ kind: "upstream", ...ERROR_COPY.upstream, retryable: true });
  }

  try {
    return parse(data);
  } catch {
    // A 200 that doesn't match the contract is as broken as a 502.
    throw new ApiError({ kind: "bad_output", ...ERROR_COPY.bad_output, retryable: true });
  }
}

/** One exchange of the call. Empty `turns` asks for the client's opening line. */
export function postCall(req: CallRequest): Promise<CallResponse> {
  return post("/api/call", req, (d) => CallResponseSchema.parse(d));
}

/** Grades the finished call and returns the verdict plus the commission. */
export function postJudge(req: JudgeRequest): Promise<JudgeResponse> {
  return post("/api/judge", req, (d) => JudgeResponseSchema.parse(d));
}
