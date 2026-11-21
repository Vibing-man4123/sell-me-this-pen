/**
 * Groq client. Server-only: this module reads GROQ_API_KEY, so it must never be
 * imported from a component that ships to the browser. Route handlers only.
 *
 * Kept as a hand-rolled fetch rather than an SDK - we use exactly one endpoint,
 * and this way the error taxonomy below is ours rather than the SDK's.
 */

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/** How long we wait on Groq before calling the line dead. */
const TIMEOUT_MS = 20_000;

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Every way this call can fail, as something the UI can map to a joke.
 * `retryable` drives whether the player is invited to try the same thing again.
 */
export type GroqErrorKind =
  | "missing_key"
  | "rate_limit"
  | "timeout"
  | "upstream"
  | "bad_output";

const RETRYABLE: Record<GroqErrorKind, boolean> = {
  missing_key: false,
  rate_limit: true,
  timeout: true,
  upstream: true,
  bad_output: true,
};

export class GroqError extends Error {
  readonly kind: GroqErrorKind;
  readonly retryable: boolean;
  /** Seconds to wait, when Groq tells us. */
  readonly retryAfter?: number;

  constructor(kind: GroqErrorKind, message: string, retryAfter?: number) {
    super(message);
    this.name = "GroqError";
    this.kind = kind;
    this.retryable = RETRYABLE[kind];
    this.retryAfter = retryAfter;
  }
}

function requireKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new GroqError(
      "missing_key",
      "GROQ_API_KEY is not set. Add it to .env.local (or the Vercel project) and restart."
    );
  }
  return key;
}

/**
 * Model ids are read per-call rather than at module load so a change in the
 * Vercel dashboard takes effect without a redeploy.
 *
 * Defaults are the models this project was verified against on 2026-11-11.
 * Note the split: the client model must be fast and must NOT be a reasoning
 * model (reasoning tokens eat the completion budget and can return an empty
 * message), while the judge model is a reasoning model given room to think.
 */
export const MODELS = {
  client: () => process.env.GROQ_CLIENT_MODEL || "qwen/qwen3.8-27b",
  judge: () => process.env.GROQ_JUDGE_MODEL || "openai/gpt-oss-120b",
};

export type ChatRequest = {
  model: string;
  messages: ChatMessage[];
  maxTokens: number;
  temperature?: number;
  /** Strict structured output. Groq enforces the schema server-side. */
  jsonSchema?: { name: string; schema: unknown };
};

export type ChatResult = {
  text: string;
  /** "length" means the model was cut off mid-answer. */
  finishReason: string | null;
};

export async function chat(req: ChatRequest): Promise<ChatResult> {
  const key = requireKey();

  const body: Record<string, unknown> = {
    model: req.model,
    messages: req.messages,
    max_tokens: req.maxTokens,
    temperature: req.temperature ?? 1,
  };
  if (req.jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: req.jsonSchema.name, strict: true, schema: req.jsonSchema.schema },
    };
  }

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    const timedOut = cause instanceof Error && cause.name === "TimeoutError";
    throw new GroqError(
      timedOut ? "timeout" : "upstream",
      timedOut ? `Groq did not answer within ${TIMEOUT_MS / 1000}s.` : "Could not reach Groq.",
      undefined
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) {
      const header = res.headers.get("retry-after");
      const retryAfter = header ? Number(header) : undefined;
      throw new GroqError(
        "rate_limit",
        "Groq free-tier rate limit reached.",
        Number.isFinite(retryAfter) ? retryAfter : undefined
      );
    }
    // 401/404 (bad key, retired model) are config problems, not weather.
    const kind: GroqErrorKind = res.status === 401 || res.status === 404 ? "missing_key" : "upstream";
    throw new GroqError(kind, `Groq returned ${res.status}: ${detail.slice(0, 300)}`);
  }

  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    throw new GroqError("bad_output", "Groq returned a response that was not JSON.");
  }

  const choice = (parsed as { choices?: { message?: { content?: unknown }; finish_reason?: unknown }[] })
    ?.choices?.[0];
  const raw = choice?.message?.content;
  // Qwen-family models can emit <think> blocks inline. The default client model
  // was checked on 2026-11-21 and does not, but a model swap in the dashboard
  // must not leak reasoning into the call. An unclosed block (cut off by the
  // token cap) is dropped whole.
  const content = typeof raw === "string" ? raw.replace(/<think>[\s\S]*?(<\/think>|$)/g, "") : raw;

  if (typeof content !== "string" || content.trim() === "") {
    // Seen for real: a reasoning model spending its whole budget on reasoning.
    throw new GroqError("bad_output", "Groq returned an empty message.");
  }

  return {
    text: content.trim(),
    finishReason: typeof choice?.finish_reason === "string" ? choice.finish_reason : null,
  };
}
