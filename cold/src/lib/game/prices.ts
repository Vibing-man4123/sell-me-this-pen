import type { Item } from "./items";
import type { Persona } from "./personas";
import type { Turn } from "./transcript";

/**
 * Catches the client misquoting money: the model once called a 19-dollar pen a
 * "nine-dollar plastic stick". /api/call checks every reply and retries once
 * with the real price when a dollar amount comes from nowhere.
 *
 * Deliberately conservative. An amount passes if it is (about) the unit price,
 * the price times any count anyone mentioned, any number the caller said, any
 * dollar figure in the persona or item, or a product of two known numbers
 * (Dale's "300 a pop" times 2 a month, times 12 for a year). Comparisons ("than
 * a two-dollar gas-station pen") are skipped. When in doubt, don't flag.
 *
 * Pure, with type-only imports, so `node --test` can load it directly.
 */

const UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
};
const TEENS: Record<string, number> = {
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
const SCALES: Record<string, number> = { thousand: 1_000, million: 1_000_000 };

/** Words after a number that make it money. "grand" also multiplies by 1000. */
const CURRENCY = new Set(["dollar", "dollars", "buck", "bucks", "grand"]);
/** "a few hundred dollars" is a vague amount, not a quote. */
const VAGUE = new Set(["few", "couple", "several", "many", "some", "hundreds", "thousands"]);
/** A sentence with one of these is a comparison ("cheaper than a two-dollar pen"), not a quote. */
const COMPARISON = /\bthan\b|\blike an? \b|\bcheaper\b|\bgas[ -]station\b|\bdollar store\b/i;

const TOKEN_RE = /\$?\d[\d,]*(?:\.\d+)?k?|[a-z]+/g;

type Phrase = { value: number; start: number; end: number; dollar: boolean; vague: boolean };

function isNumberWord(w: string): boolean {
  return w in UNITS || w in TEENS || w in TENS || w === "hundred" || w in SCALES;
}

/**
 * Value of a run of number words ("forty-nine hundred" -> 4900), or null if
 * the run is not a well-formed number ("nineteen ninety-nine" as a price is
 * ambiguous, so it is skipped rather than guessed).
 */
function wordsValue(words: string[]): number | null {
  let total = 0;
  let cur = 0;
  let last: "none" | "unit" | "teen" | "tens" | "hundred" | "scale" = "none";
  for (const w of words) {
    if (w === "and") {
      if (last !== "hundred" && last !== "scale") return null;
      continue;
    }
    if (w in UNITS) {
      if (last === "unit" || last === "teen") return null;
      cur += UNITS[w];
      last = "unit";
    } else if (w in TEENS || w in TENS) {
      if (last === "unit" || last === "teen" || last === "tens") return null;
      cur += TEENS[w] ?? TENS[w];
      last = w in TEENS ? "teen" : "tens";
    } else if (w === "hundred") {
      if (last === "hundred" || cur >= 100) return null;
      cur = (cur || 1) * 100;
      last = "hundred";
    } else if (w in SCALES) {
      total += (cur || 1) * SCALES[w];
      cur = 0;
      last = "scale";
    } else {
      return null;
    }
  }
  return total + cur;
}

function digitsValue(token: string): number {
  const k = token.endsWith("k");
  const n = Number(token.replace(/[$,k]/g, ""));
  return k ? n * 1_000 : n;
}

/** Every number in the text, in words or digits, with whether it is money. */
function phrases(text: string): Phrase[] {
  const tokens = text.toLowerCase().match(TOKEN_RE) ?? [];
  const out: Phrase[] = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    const start = i;
    let value: number | null = null;
    let dollar = false;

    if (/^\$?\d/.test(t)) {
      dollar = t.startsWith("$");
      value = digitsValue(t);
      i++;
      // "$2 million", "4 thousand dollars"
      if (tokens[i] === "hundred" || tokens[i] in SCALES) {
        value *= tokens[i] === "hundred" ? 100 : SCALES[tokens[i]];
        i++;
      }
    } else if (isNumberWord(t) || (t === "a" && (tokens[i + 1] === "hundred" || tokens[i + 1] in SCALES || tokens[i + 1] === "dozen"))) {
      const run: string[] = [];
      if (t === "a") i++;
      while (i < tokens.length && (isNumberWord(tokens[i]) || (tokens[i] === "and" && run.length > 0 && isNumberWord(tokens[i + 1] ?? "")))) {
        run.push(tokens[i]);
        i++;
      }
      if (run.length === 0 && tokens[i] === "dozen") {
        value = 1;
      } else {
        value = wordsValue(run);
      }
    } else {
      i++;
      continue;
    }

    if (tokens[i] === "dozen") {
      if (value !== null) value *= 12;
      i++;
    }
    if (CURRENCY.has(tokens[i] ?? "")) {
      dollar = true;
      if (tokens[i] === "grand" && value !== null) value *= 1_000;
      i++;
    }
    if (value !== null && Number.isFinite(value)) {
      out.push({ value, start, end: i, dollar, vague: VAGUE.has(tokens[start - 1] ?? "") });
    }
  }
  return out;
}

/** All numbers mentioned in the text, words or digits ("nineteen", "$1,400", "a dozen"). */
export function numbersMentioned(text: string): number[] {
  return phrases(text).map((p) => p.value);
}

/** Dollar amounts quoted in the text: "$19", "19 dollars", "nineteen bucks", "nine-dollar", "two grand". */
export function dollarAmounts(text: string): number[] {
  return phrases(text)
    .filter((p) => p.dollar && !p.vague)
    .map((p) => p.value);
}

/** Sentences of a reply, loosely: enough to tell a comparison from a quote. */
function sentences(text: string): string[] {
  return text.split(/(?<=[.!?…])\s+/).filter((s) => s.trim() !== "");
}

/**
 * Where a client may legitimately get a number from. The caller's words count
 * in full. The persona and item count as money only where they talk money
 * (Kai's "about 40 dollars" from the ring light); their other numbers are only
 * counts, or Dale's "nine days" to quarter close would excuse a "nine-dollar"
 * pen.
 */
export type PriceContext = {
  unitPrice: number;
  /** Every number in the transcript. */
  said: number[];
  /** Dollar amounts in the persona and item text, vague ones included. */
  money: number[];
  /** Every number in the persona and item text, usable as a count. */
  counts: number[];
};

export function priceContext(persona: Persona, item: Item, turns: Turn[]): PriceContext {
  const text = [
    ...persona.situation,
    ...persona.needs,
    persona.budget,
    persona.personality,
    persona.realObjection,
    item.name,
    item.tagline,
    item.catch,
    ...(item.facts ?? []),
    ...(item.defects ?? []),
  ].join("\n");
  const own = phrases(text);
  return {
    unitPrice: item.unitPrice,
    said: numbersMentioned(turns.map((t) => t.content).join("\n")),
    money: own.filter((p) => p.dollar).map((p) => p.value),
    counts: own.map((p) => p.value),
  };
}

/** About equal: "twenty bucks" for 19 and "five grand" for 4,900 are rounding, not misquotes. */
function near(a: number, b: number): boolean {
  return Math.abs(a - b) <= Math.max(0.5, b * 0.06);
}

/**
 * Dollar amounts in the reply that match nothing the client could have got
 * them from. Empty means the reply is fine.
 */
export function suspiciousAmounts(reply: string, ctx: PriceContext): number[] {
  // Counts in the reply itself: "forty trucks at nineteen" makes 760 fair.
  const own = phrases(reply).filter((p) => !p.dollar).map((p) => p.value);
  const ok = knownAmount(ctx, own);
  return sentences(reply)
    .filter((s) => !COMPARISON.test(s))
    .flatMap((s) => dollarAmounts(s))
    .filter((amount) => !ok(amount));
}

/**
 * Test for "could have come from somewhere": the unit price, anything the
 * caller said, a dollar figure in the persona or item, the price times any
 * count, or a product of two known numbers. `extraCounts` are counts in the
 * text being checked; `exact` turns off the rounding allowance.
 */
export function knownAmount(
  ctx: PriceContext,
  extraCounts: number[] = [],
  exact = false
): (amount: number) => boolean {
  const counts = [...ctx.said, ...ctx.counts, ...extraCounts];
  const factors = [...new Set([...counts, ...ctx.money, 12])].filter((n) => n >= 2);
  const legit = new Set<number>([ctx.unitPrice, ...ctx.said, ...ctx.money]);
  for (const n of counts) legit.add(ctx.unitPrice * n);
  // Small times small ("three times three") is not how anyone computes money.
  // Times 12 as well: "300 a pop, twice a month" is 7,200 a year.
  for (const a of factors) {
    for (const b of factors) {
      if (Math.max(a, b) >= 10) legit.add(a * b).add(a * b * 12);
    }
  }
  if (exact) return (amount) => legit.has(amount);
  const list = [...legit];
  return (amount) => list.some((l) => near(amount, l));
}

/** The Director's note for a retry, with the real figure. */
export function priceNote(unitPrice: number, bad: number[]): string {
  return `(Director's note: you just said ${bad.map((n) => `${n} dollars`).join(", ")}, but nobody in this call said that. The caller's price is exactly ${unitPrice} dollars per unit. Write that reply again, same meaning, with correct numbers or none. Only the corrected reply, in character.)`;
}
