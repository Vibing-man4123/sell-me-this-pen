import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanLanguage, readReply, readTokens, trimToSentence } from "../src/lib/game/reply.ts";

test("readTokens reads and strips [CLOSED] and [HANGUP]", () => {
  assert.deepEqual(readTokens("Fine, two pens. [CLOSED]"), { reply: "Fine, two pens.", outcome: "closed" });
  assert.deepEqual(readTokens("I'm hanging up. [HANGUP]"), { reply: "I'm hanging up.", outcome: "hangup" });
  assert.deepEqual(readTokens("Go on."), { reply: "Go on.", outcome: "open" });
});

test("readTokens drops invented stage directions", () => {
  assert.deepEqual(readTokens("[SIGHS] Fine. [PAUSE]"), { reply: "Fine.", outcome: "open" });
  assert.equal(readTokens("[ok] stays").reply, "[ok] stays", "only bracketed CAPS are machinery");
});

test("trimToSentence cuts a capped reply back to the last full sentence", () => {
  assert.equal(trimToSentence("Docks. Pens die. And the other thi"), "Docks. Pens die.");
  assert.equal(trimToSentence("He said \"no.\" Then he"), "He said \"no.\"");
  assert.equal(trimToSentence("no sentence end at all"), "no sentence end at all");
});

test("readReply trims only when the model hit the token cap", () => {
  assert.equal(readReply({ text: "One. Two thr", finishReason: "length" }).reply, "One.");
  assert.equal(readReply({ text: "One. Two thr", finishReason: "stop" }).reply, "One. Two thr");
  assert.deepEqual(readReply({ text: "Deal. Two. [CLOSED] And th", finishReason: "length" }), { reply: "Deal. Two.", outcome: "closed" });
});

test("cleanLanguage swaps swears, starred or not, and leaves lookalikes", () => {
  assert.equal(cleanLanguage("That is bullsh*t, bro."), "That is baloney, bro.");
  assert.equal(cleanLanguage("bull***t"), "baloney");
  assert.equal(cleanLanguage("Damn. What the hell?"), "Darn. What the heck?");
  assert.equal(cleanLanguage("F*** this crappy pen"), "Fudge this cruddy pen");
  assert.equal(cleanLanguage("Hello, shell, class, assume, shot, fork."), "Hello, shell, class, assume, shot, fork.");
});
