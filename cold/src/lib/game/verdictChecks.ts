import type { Item } from "./items";
import type { Persona } from "./personas";
import type { Verdict } from "./rubric";
import type { Turn } from "./transcript";

/**
 * Deterministic checks on the judge's verdict, run by /api/judge before it
 * accepts one. Pure, with type-only imports, so `node --test` can load it
 * directly.
 */

/** Verbatim-quote fields the judge sometimes paraphrases or pads. */
const QUOTE_FIELDS = ["bestLine", "worstLine"] as const;

/**
 * Lowercase, curly quotes straightened, whitespace collapsed. A phone keyboard
 * types "it’s" and the judge copies it back as "it's"; that is still a quote.
 */
function normQuote(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** The judge sometimes wraps the quote in quote marks of its own. */
function unwrap(quote: string): string {
  return quote.trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
}

/** bestLine/worstLine without the judge's own wrapping quote marks, for display and checks. */
export function withCleanQuotes<V extends Pick<Verdict, "bestLine" | "worstLine">>(verdict: V): V {
  return { ...verdict, bestLine: unwrap(verdict.bestLine), worstLine: unwrap(verdict.worstLine) };
}

/** True if the quote fields are really quotes from the broker (curly vs straight quotes and spacing ignored). */
export function quotesAreReal(verdict: Pick<Verdict, "bestLine" | "worstLine">, turns: Turn[]): boolean {
  const brokerLines = turns.filter((t) => t.role === "broker").map((t) => normQuote(t.content));

  return QUOTE_FIELDS.every((field) => {
    const quote = normQuote(unwrap(verdict[field]));
    // An empty quote is legitimate when the broker barely spoke.
    if (quote === "") return true;
    return brokerLines.some((line) => line.includes(quote));
  });
}

/** Index of the broker turn a quote was taken from, or -1. */
function sourceTurn(quote: string, turns: Turn[]): number {
  const q = normQuote(unwrap(quote));
  if (q === "") return -1;
  return turns.findIndex((t) => t.role === "broker" && normQuote(t.content).includes(q));
}

const STOPWORDS = new Set(
  "about after again being could doesn every first going gonna great their there these thing things think those would which while where whats yeah right really maybe never always still"
    .split(" ")
);

function contentWords(text: string): string[] {
  return (normQuote(text).replace(/'/g, "").match(/[a-z]{5,}/g) ?? []).filter((w) => !STOPWORDS.has(w));
}

/**
 * A discovery question: the last sentence of the quote asks the client about
 * themselves ("what's costing you money this quarter?"), after any lead-in
 * ("Quick one: ..."). Closing asks ("Can I put you down?"), pitches dressed as
 * questions ("What if your desk had...?") and jabs ("Do you even have twenty
 * dollars?") are not.
 */
export function isDiscoveryQuestion(quote: string): boolean {
  const text = unwrap(quote);
  if (!text.endsWith("?")) return false;
  const last = text.split(/(?<=[.!?])\s+/).at(-1) ?? "";
  const asked = normQuote(last.slice(last.lastIndexOf(":") + 1));
  if (/^(?:what if|why not|what about)\b/.test(asked)) return false;
  return /^(?:what|what's|whats|how|where|when|who|which|why)\b/.test(asked) && /\byou(?:r|rs|'re|'ve)?\b/.test(asked);
}

/**
 * True if the quote is a discovery question and the client's next reply
 * answered it with something new: at least 8 words, and a number or three
 * content words nobody had used yet. Cheap, and good enough to stop worstLine
 * landing on a discovery question that worked.
 */
export function isAnsweredQuestion(quote: string, turns: Turn[]): boolean {
  if (!isDiscoveryQuestion(quote)) return false;
  const at = sourceTurn(quote, turns);
  const next = turns[at + 1];
  if (at < 0 || !next || next.role === "broker") return false;
  if (next.content.trim().split(/\s+/).length < 8) return false;
  if (/\d/.test(next.content)) return true;
  const before = new Set(turns.slice(0, at + 1).flatMap((t) => contentWords(t.content)));
  return new Set(contentWords(next.content).filter((w) => !before.has(w))).size >= 3;
}

/**
 * Soft problems with bestLine/worstLine, as a complaint for the retry. Empty
 * when the lines look right. Not fatal: after one retry the verdict stands.
 */
export function lineProblems(verdict: Pick<Verdict, "bestLine" | "worstLine">, turns: Turn[]): string[] {
  const problems: string[] = [];
  const best = normQuote(unwrap(verdict.bestLine));
  const worst = normQuote(unwrap(verdict.worstLine));
  if (best !== "" && best === worst) {
    problems.push("bestLine and worstLine are the same line; they must be two different broker lines");
  }
  if (isAnsweredQuestion(verdict.worstLine, turns)) {
    problems.push(
      `worstLine ("${verdict.worstLine.trim()}") is a question the client answered with real information, which is discovery working; pick the broker's actual weakest line (hype, a dodge, a missed chance)`
    );
  }
  return problems;
}

/** "$2,000" or "19.5", without the comma or period that ends a clause. */
const NUMBER_RE = /\$?\d+(?:,\d{3})*(?:\.\d+)?/g;

/** Numeric value as a comparable string ("$2,000" -> "2000"), or null for small counts (1-3). */
function numberKey(token: string): string | null {
  const key = token.replace(/[$,]/g, "");
  return Number(key) <= 3 ? null : key;
}

function numbersIn(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.match(NUMBER_RE) ?? []) {
    const key = numberKey(m);
    if (key !== null) out.add(key);
  }
  return out;
}

/**
 * Numbers in the coaching that come from the client's hidden needs, objection
 * or budget but that nobody said in the call and the item does not show. The
 * broker could not have known them, so Vic must not suggest them.
 */
export function leakedNumbers(
  verdict: Pick<Verdict, "coaching">,
  persona: Pick<Persona, "needs" | "realObjection" | "budget">,
  item: Pick<Item, "name" | "tagline" | "catch" | "unitPrice" | "facts" | "defects">,
  turns: Turn[]
): string[] {
  const hidden = numbersIn([...persona.needs, persona.realObjection, persona.budget].join("\n"));
  const visible = numbersIn(
    [
      ...turns.map((t) => t.content),
      item.name,
      item.tagline,
      item.catch,
      String(item.unitPrice),
      ...(item.facts ?? []),
      ...(item.defects ?? []),
    ].join("\n")
  );
  return [...numbersIn(verdict.coaching)].filter((n) => hidden.has(n) && !visible.has(n));
}

/** Last resort when the retry leaks too: blank the leaked numbers rather than fail the verdict. */
export function scrubLeaks<V extends Pick<Verdict, "coaching">>(verdict: V, leaks: string[]): V {
  const coaching = verdict.coaching.replace(NUMBER_RE, (m) =>
    leaks.includes(numberKey(m) ?? "") ? "that number" : m
  );
  return { ...verdict, coaching };
}

/**
 * Figures in the coaching that come from nowhere: Vic once told a player to
 * promise pens "tested down to -10°C" that the item never claimed. Numbers
 * above 10 only, minus figures of speech (90s, '08, 24/7, 110%, years).
 * `known` is prices.ts's knownAmount for this call. Soft: one retry, then the
 * verdict stands.
 */
export function inventedNumbers(coaching: string, known: (n: number) => boolean): string[] {
  const out = new Set<string>();
  for (const m of coaching.matchAll(NUMBER_RE)) {
    const at = m.index ?? 0;
    const before = coaching.slice(Math.max(0, at - 1), at);
    const after = coaching.slice(at + m[0].length, at + m[0].length + 2);
    const raw = m[0];
    const n = Number(raw.replace(/[$,]/g, ""));
    if (!Number.isFinite(n) || n <= 10) continue;
    if (/^'?s\b/i.test(after) || /^%/.test(after) || /^\//.test(after) || before === "'" || before === "/") continue;
    if (!raw.includes(",") && n >= 1900 && n <= 2099 && Number.isInteger(n)) continue;
    if (!known(n)) out.add(raw.replace(/[$,]/g, ""));
  }
  return [...out];
}

/** Words that turn a coaching line into a product spec nobody gave Vic. */
const SPEC_RE =
  /\b(?:engineered|rated|guarantee[ds]?|certified|tested|warrant(?:y|ied)|lab-tested|proven|waterproof|military-grade)\b|°|(?<!\b1[01]0)%/gi;

/**
 * Spec-like phrases in the coaching ("engineered to write at 30°F") that appear
 * nowhere in the item text or the transcript. Soft: one retry, then the
 * verdict stands. Vic's "give it 110%" is not a spec.
 */
export function inventedSpecs(
  coaching: string,
  item: Pick<Item, "name" | "tagline" | "catch" | "facts" | "defects">,
  turns: Turn[]
): string[] {
  const source = [item.name, item.tagline, item.catch, ...(item.facts ?? []), ...(item.defects ?? []), ...turns.map((t) => t.content)]
    .join("\n")
    .toLowerCase();
  const found = new Set((coaching.match(SPEC_RE) ?? []).map((m) => m.toLowerCase()));
  return [...found].filter((term) => !source.includes(term));
}
