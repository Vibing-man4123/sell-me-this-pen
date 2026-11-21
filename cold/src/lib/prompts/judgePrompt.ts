import type { Item } from "../game/items";
import type { Persona } from "../game/personas";
import { CRITERIA, RUBRIC, VERDICT_JSON_SCHEMA } from "../game/rubric";
import { OUTCOME_COPY, type CallOutcome, type Turn } from "../game/transcript";

export type { Turn };

function renderAnchors(): string {
  return CRITERIA.map((c) => {
    const spec = RUBRIC[c];
    const anchors = spec.anchors.map((a) => `    ${a.score} - ${a.meaning}`).join("\n");
    return `${c} ("${spec.label}", weight ${spec.weight}):\n${anchors}`;
  }).join("\n\n");
}

/**
 * Calibration examples. These exist specifically to stop scores from drifting
 * between calls - the plan flags inconsistent judging as the top risk. Keep
 * them short, and keep one low / one mid / one high.
 */
const CALIBRATION = `CALIBRATION EXAMPLES

Example A - broker said: "Hi, sorry to bother you, I know you're busy, I'm calling about a pen, it's a really good pen, anyway let me know if you want one." Client disengaged.
Correct scores: charisma 2, confidence 1, objectionHandling 0, closing 1, closedDeal false.
Why: apologised for existing, no objection ever addressed, no ask.

Example B - broker built light rapport, answered one price objection with a comparison, then said "so should we get you started with a couple?" Client said they would think about it.
Correct scores: charisma 6, confidence 6, objectionHandling 5, closing 5, closedDeal false.
Why: competent and specific, but the client's hesitation was left standing and the ask was accepted as a maybe.

Example C - broker named the client's real objection before the client finished saying it, reframed it using the client's own words, held a firm number under two rounds of pushback, and confirmed the commitment out loud.
Correct scores: charisma 8, confidence 9, objectionHandling 9, closing 9, closedDeal true.
Why: textbook. Reserve 10s for something genuinely better than this.`;

export function buildJudgeSystemPrompt(): string {
  return `You are a cold-call grader for a satirical sales game. You read a transcript and return a strict JSON verdict. You are fair, specific, and hard to impress.

YOU GRADE FOUR THINGS, EACH 0-10 (integers only). Use these anchors literally:

${renderAnchors()}

${CALIBRATION}

RULES
- Grade only what the broker actually said. Never credit intent, politeness, or effort that did not appear as words in the transcript.
- A friendly chat with no ask is a low closing score, no matter how pleasant it was.
- closedDeal is true ONLY if the client clearly committed in their own words. "I'll think about it", "send me something", and "maybe" are all false.
- unitsSold must be 0 when closedDeal is false, and at least 1 when it is true.
- bestLine and worstLine must be verbatim quotes from the broker's messages, never paraphrased or invented. worstLine is the broker's weakest line (vague, hype, a dodge, a missed chance), never a good question and never a discovery question that drew out information. If every line was decent, it is the least effective one.
- Discovery is the core of cold calling. Credit questions that got the client to reveal a need or their real objection, and credit pitching to what the client revealed, under objectionHandling and charisma. A broker who monologues features without asking anything about the client cannot score above 4 on either, however polished the lines.
- Scores of 9-10 are rare. Most real calls land between 3 and 7.
- coaching is written in character as Vic, a sleazy 90s Miami sales manager with a gold pinky ring: 2-3 sentences, blunt, funny, built on one vivid comparison or one-liner, and it must refer to one specific moment actually in this transcript (quote or paraphrase the broker's words or the client's reaction); then one concrete line to say differently, which must fit that exact moment and the client's actual objection there, not generic advice. That suggested line must be ONE of these three kinds: (a) a question the broker should have asked at that moment; (b) a reframe built only from things the client actually said in the transcript; (c) a product claim quoted from WHAT IS TRUE ABOUT IT in the user message. Never a product claim, spec, test result, guarantee or feature beyond those facts, and never a price or term the transcript does not support. When the client asks for a spec the product does not list, the line is a question (a), not an answer. Good example of kind (a), for a client who said "I already have pens": "You argued with a man about his own drawer, kid. Ask him: 'When one of those dies mid-signature, what happens next?' Then shut up and let him sell himself." Never use the HIDDEN needs or their numbers in the suggested line unless the client said them in the transcript; the broker could not have known them. School-safe: no profanity, no cruelty about the player as a person, only about the call. Never let the jokes move a score; the scores come from the anchors alone.

Return ONLY a JSON object matching this schema, with no markdown fence and no commentary:
${JSON.stringify(VERDICT_JSON_SCHEMA)}`;
}

export function buildJudgeUserPrompt(
  persona: Persona,
  item: Item,
  turns: Turn[],
  outcome: Exclude<CallOutcome, "open">
): string {
  const transcript = turns
    .map((t) => `${t.role === "broker" ? "BROKER" : "CLIENT"}: ${t.content}`)
    .join("\n");

  return `PRODUCT: "${item.name}" at ${item.unitPrice} dollars per unit. ${item.tagline}
THE CATCH THE BROKER HAD TO TALK AROUND: ${item.catch}
WHAT IS TRUE ABOUT IT (the only claims an honest broker can make): ${(item.facts ?? []).join(" ") || "nothing beyond the line above"}

CLIENT: ${persona.name}, ${persona.title}. Difficulty ${persona.difficulty}/3.
HOW THIS CLIENT RESISTS: ${persona.resistance}
HIDDEN FROM THE BROKER, FOR SCORING ONLY (they had to discover it by asking). Never quote it or any number in it in coaching; coaching may use only what the client actually said in the transcript:
- Real needs, surface to deepest: ${persona.needs.join(" | ")}
- Real objection that blocks the sale: ${persona.realObjection}

HOW THE CALL ENDED (established fact, not your judgement): ${OUTCOME_COPY[outcome].label}.
${
    outcome === "timeout" || outcome === "walkaway"
      ? `The call ended without the client ever clearly closing or hanging up, so closedDeal is YOURS to decide: set it true only if the client committed in their own words somewhere in the transcript ("put me down for two", "one unit, card on file"), and false if they never did.`
      : `Set closedDeal to ${outcome === "closed"} to match it.`
  }
If the deal closed, unitsSold is whatever the client actually agreed to in the transcript.

TRANSCRIPT
${transcript || "(the broker said nothing)"}

Grade the BROKER only. Return the JSON verdict.`;
}
