import type { CallOutcome } from "./transcript";

/**
 * Raw client-model text -> what the player sees. Pure, with type-only imports,
 * so `node --test` can load it directly; /api/call is the only caller.
 */

/** The client's end-of-call tokens. Stripped before anything reaches the UI. */
const TOKENS: { token: string; outcome: Extract<CallOutcome, "closed" | "hangup"> }[] = [
  { token: "[CLOSED]", outcome: "closed" },
  { token: "[HANGUP]", outcome: "hangup" },
];

export function readTokens(raw: string): { reply: string; outcome: CallOutcome } {
  let reply = raw;
  let outcome: CallOutcome = "open";

  for (const { token, outcome: hit } of TOKENS) {
    if (reply.includes(token)) {
      outcome = hit;
      reply = reply.split(token).join("");
    }
  }

  // Models occasionally invent bracketed stage directions despite the prompt;
  // drop any leftovers so the player never sees the machinery.
  reply = reply.replace(/\[[A-Z_]{3,}\]/g, "").trim();

  return { reply, outcome };
}

/**
 * A reply that hit the token cap ends mid-word. Cut it back to the last
 * complete sentence; if there is none, keep the fragment rather than nothing.
 */
export function trimToSentence(reply: string): string {
  const match = reply.match(/^[\s\S]*[.!?…]["'”’)]*(?=\s|$)/);
  return match ? match[0].trim() : reply;
}

/** Raw model text -> what the player sees, with the outcome read off the tokens first. */
export function readReply(result: { text: string; finishReason: string | null }) {
  const read = readTokens(result.text);
  if (result.finishReason === "length") read.reply = trimToSentence(read.reply);
  return read;
}

/**
 * School-safe in code, because the prompt alone does not hold: a live Kai said
 * "bull***t" with the vowel starred out. Swears, starred or not, become the
 * comic substitutes the prompt asks for.
 */
const SWEARS: [RegExp, string][] = [
  [/\bbull[\s-]?[s*][h*][i*!1]t(?![\w*])/gi, "baloney"],
  [/\b[s*][h*][i*!1]tty\b/gi, "crummy"],
  [/\bs[h*][i*!1]t(?![\w*])/gi, "shoot"],
  [/\bf[u*][c*]?[k*](?:ing|in'|in)?(?![\w*])/gi, "fudge"],
  [/\bgoddamn(?:ed|it)?\b/gi, "gosh darn"],
  [/\bdamn(?:ed)?\b/gi, "darn"],
  [/\bdammit\b/gi, "darn it"],
  [/\bhell\b/gi, "heck"],
  [/\bcrappy\b/gi, "cruddy"],
  [/\bcrap\b/gi, "crud"],
  [/\bbloody\b/gi, "flipping"],
  [/\bpissed\b/gi, "ticked"],
  [/\bjackass\b/gi, "donkey"],
  [/\bass\b/gi, "behind"],
  [/\bbastard\b/gi, "rascal"],
];

/** Keeps "Damn." capitalised as "Darn." */
function matchCase(found: string, swap: string): string {
  return found[0] === found[0].toUpperCase() && found[0] !== found[0].toLowerCase()
    ? swap[0].toUpperCase() + swap.slice(1)
    : swap;
}

export function cleanLanguage(reply: string): string {
  return SWEARS.reduce((text, [re, swap]) => text.replace(re, (m) => matchCase(m, swap)), reply);
}
