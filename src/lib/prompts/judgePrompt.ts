import type { Item } from "../game/items";
import type { Persona } from "../game/personas";
import { CRITERIA, RUBRIC, VERDICT_JSON_SCHEMA } from "../game/rubric";

export type Turn = { role: "broker" | "client"; content: string };

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
- bestLine and worstLine must be verbatim quotes from the broker's messages, never paraphrased or invented.
- Scores of 9-10 are rare. Most real calls land between 3 and 7.
- coaching is written in character as a sleazy 90s sales manager: blunt, funny, and specific about what to do differently. Never cruel about the player as a person.

Return ONLY a JSON object matching this schema, with no markdown fence and no commentary:
${JSON.stringify(VERDICT_JSON_SCHEMA)}`;
}

export function buildJudgeUserPrompt(persona: Persona, item: Item, turns: Turn[]): string {
  const transcript = turns
    .map((t) => `${t.role === "broker" ? "BROKER" : "CLIENT"}: ${t.content}`)
    .join("\n");

  return `PRODUCT: "${item.name}" at ${item.unitPrice} dollars per unit. ${item.tagline}
THE CATCH THE BROKER HAD TO TALK AROUND: ${item.catch}

CLIENT: ${persona.name}, ${persona.title}. Difficulty ${persona.difficulty}/3.
HOW THIS CLIENT RESISTS: ${persona.resistance}

TRANSCRIPT
${transcript || "(the broker said nothing)"}

Grade the BROKER only. Return the JSON verdict.`;
}
