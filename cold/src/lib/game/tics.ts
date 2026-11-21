import type { Persona } from "./personas";
import type { Turn } from "./transcript";

/**
 * Keeps signature lines rare. Prompt wording alone does not stop the client
 * model from saying its catchphrase in every reply, so this is enforced in
 * code: the prompt bans a phrase that was used in either of the last two
 * client replies, and /api/call cuts it out of a reply that repeats it back
 * to back anyway.
 */

/** Lowercase, apostrophes dropped, everything else non-alphanumeric to single spaces. */
function norm(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’‘`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Case- and punctuation-insensitive: "whats the number" matches "What's the number?". */
export function saysPhrase(text: string, phrase: string): boolean {
  const p = norm(phrase);
  return p !== "" && ` ${norm(text)} `.includes(` ${p} `);
}

/** Every verbatim line this persona is prone to repeating. */
export function guardedPhrases(persona: Persona): string[] {
  return [persona.catchphrase, ...(persona.tics ?? [])].filter((p): p is string => Boolean(p));
}

function clientReplies(turns: Turn[]): string[] {
  return turns.filter((t) => t.role !== "broker").map((t) => t.content);
}

/** Guarded phrases said in either of the last two client replies: banned for this reply. */
export function recentlyUsedPhrases(persona: Persona, turns: Turn[]): string[] {
  const recent = clientReplies(turns).slice(-2);
  return guardedPhrases(persona).filter((p) => recent.some((r) => saysPhrase(r, p)));
}

/**
 * Sentence split that leaves trailing-off "Walter used to say... where was I?"
 * in one piece: a break needs end punctuation, whitespace, then a capital,
 * digit or opening quote.
 */
export function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?…]["'”’)]*)\s+(?=["'“‘(]?[A-Z0-9])/).filter((s) => s.trim() !== "");
}

/**
 * If the previous client reply already used a guarded phrase, drop any
 * sentence of the new reply that uses it again, unless that would leave
 * nothing.
 */
export function dropBackToBackPhrases(reply: string, persona: Persona, turns: Turn[]): string {
  const previous = clientReplies(turns).at(-1);
  if (!previous) return reply;
  const repeated = guardedPhrases(persona).filter((p) => saysPhrase(previous, p) && saysPhrase(reply, p));
  if (repeated.length === 0) return reply;
  const kept = splitSentences(reply).filter((s) => !repeated.some((p) => saysPhrase(s, p)));
  return kept.length ? kept.join(" ") : reply;
}

/** Hard cap on reply length, in sentences. */
export function capSentences(reply: string, max: number): string {
  const sentences = splitSentences(reply);
  return sentences.length > max ? sentences.slice(0, max).join(" ") : reply;
}
