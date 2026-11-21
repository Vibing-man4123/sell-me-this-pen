import assert from "node:assert/strict";
import { test } from "node:test";
import { getPersona } from "../src/lib/game/personas.ts";
import {
  capSentences,
  dropBackToBackPhrases,
  recentlyUsedPhrases,
  saysPhrase,
  splitSentences,
} from "../src/lib/game/tics.ts";
import type { Turn } from "../src/lib/game/transcript.ts";

const dale = getPersona("dale-hochstetter");
const eunice = getPersona("eunice-pell");
const said = (...lines: string[]): Turn[] =>
  lines.flatMap((content) => [
    { role: "broker" as const, content: "hi" },
    { role: "client" as const, content },
  ]);

test("saysPhrase ignores case, apostrophes and punctuation", () => {
  assert.equal(saysPhrase("Fine. What’s the number?", "What's the number?"), true);
  assert.equal(saysPhrase("WHATS THE NUMBER", "What's the number?"), true);
  assert.equal(saysPhrase("whats the numbers", "What's the number?"), false, "whole words only");
  assert.equal(saysPhrase("anything", ""), false);
});

test("recentlyUsedPhrases bans what the last two client replies said", () => {
  assert.deepEqual(recentlyUsedPhrases(dale, said("Docks. What's the number?")), ["What's the number?"]);
  assert.deepEqual(recentlyUsedPhrases(dale, said("What's the number?", "Fine.", "Go on.")), [], "three replies ago is fair game");
  assert.deepEqual(recentlyUsedPhrases(dale, []), []);
});

test("splitSentences keeps a trailing-off line in one piece", () => {
  assert.deepEqual(splitSentences("Walter used to say... where was I? Oh yes, dear. \"Fine,\" he said. 3 cans."), [
    "Walter used to say... where was I?",
    "Oh yes, dear.",
    "\"Fine,\" he said.",
    "3 cans.",
  ]);
});

test("dropBackToBackPhrases cuts a repeated signature line, never the whole reply", () => {
  const turns = said("Docks. Pens die. WHATS THE NUMBER.");
  assert.equal(dropBackToBackPhrases("Nineteen bucks. Fine. What's the number?", dale, turns), "Nineteen bucks. Fine.");
  assert.equal(dropBackToBackPhrases("What's the number?", dale, turns), "What's the number?");
  assert.equal(dropBackToBackPhrases("What's the number?", dale, said("Fine.")), "What's the number?", "not back to back");
  assert.equal(
    dropBackToBackPhrases("Oh, Walter used to say... the pen is mightier, dear. Anyway.", eunice, said("Walter used to say... hello.")),
    "Anyway."
  );
});

test("capSentences caps at the limit and leaves short replies alone", () => {
  assert.equal(capSentences("A. B. C. D. E! F?", 4), "A. B. C. D.");
  assert.equal(capSentences("A. B.", 4), "A. B.");
});
