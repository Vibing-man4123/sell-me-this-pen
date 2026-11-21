import assert from "node:assert/strict";
import { test } from "node:test";
import { getItem } from "../src/lib/game/items.ts";
import { getPersona } from "../src/lib/game/personas.ts";
import { dollarAmounts, numbersMentioned, priceContext, suspiciousAmounts } from "../src/lib/game/prices.ts";
import type { Turn } from "../src/lib/game/transcript.ts";

const pen = getItem("pen");
const ctx = (personaId: string, turns: Turn[] = []) => priceContext(getPersona(personaId), pen, turns);

test("dollarAmounts reads digits, words and hyphenated amounts", () => {
  assert.deepEqual(dollarAmounts("$19"), [19]);
  assert.deepEqual(dollarAmounts("19 dollars"), [19]);
  assert.deepEqual(dollarAmounts("nineteen dollars"), [19]);
  assert.deepEqual(dollarAmounts("a nine-dollar plastic stick"), [9]);
  assert.deepEqual(dollarAmounts("Nineteen bucks? Bro"), [19]);
  assert.deepEqual(dollarAmounts("forty-nine hundred dollars"), [4900]);
  assert.deepEqual(dollarAmounts("a hundred and five bucks"), [105]);
  assert.deepEqual(dollarAmounts("two grand, $1,400. and $2 million and $4.9k"), [2000, 1400, 2_000_000, 4900]);
  assert.deepEqual(dollarAmounts("seventy-three thousand dollars"), [73_000]);
});

test("dollarAmounts skips vague and ambiguous amounts", () => {
  assert.deepEqual(dollarAmounts("a few hundred dollars"), []);
  assert.deepEqual(dollarAmounts("hundreds of dollars"), []);
  assert.deepEqual(dollarAmounts("nineteen ninety-nine dollars"), [], "ambiguous, not guessed");
  assert.deepEqual(dollarAmounts("nineteen trucks"), [], "not money");
});

test("numbersMentioned counts words, digits and dozens", () => {
  assert.deepEqual(numbersMentioned("forty trucks, 1,400 cans, a dozen pens, two dozen more"), [40, 1400, 12, 24]);
});

test("flags the misquote that started this: Dale's nine-dollar pen", () => {
  assert.deepEqual(suspiciousAmounts("You want me to pay for a nine-dollar plastic stick?", ctx("dale-hochstetter")), [9]);
  assert.deepEqual(suspiciousAmounts("Twenty-nine dollars for a pen? No.", ctx("eunice-pell")), [29]);
});

test("flags the live transcript where it happened, in context", () => {
  // Saved from a real call: the caller had said "Nineteen dollars a pen" twice.
  const turns: Turn[] = [
    { role: "client", content: "Hochstetter. Make it quick." },
    { role: "broker", content: "Mr. Hochstetter, Jordan Beltford. I'll be quick. Before I pitch anything: what's costing you money this quarter that shouldn't be?" },
    { role: "client", content: "Fuel reconciliation and office supplies up eighteen percent. That’s the short version. Now, are you selling me pens again?" },
    { role: "broker", content: "Nineteen dollars a pen, I'll get to why. Where does paperwork actually break down for you, the office or out at the docks?" },
    { role: "client", content: "Docks. Pens freeze, die, or walk off. Missing signatures get deliveries rejected. We eat about three hundred dollars a pop, twice a month." },
    { role: "broker", content: "So two rejected manifests a month at three hundred each is six hundred dollars a month. Fifty pens clipped to the dock boards is 950 dollars. Stop two rejections and that pays back in under two months. Does that line survive your spreadsheet?" },
  ];
  const reply = "The math checks out. But \"reliably\" is a big word for a nine-dollar plastic stick. What's the actual failure rate in freezing temps? I've seen plenty of \"premium\" pens that quit at thirty degrees.";
  assert.deepEqual(suspiciousAmounts(reply, ctx("dale-hochstetter", turns)), [9]);
});

test("Dale's 'nine days' to quarter close does not excuse a nine-dollar pen", () => {
  assert.ok(getPersona("dale-hochstetter").situation.some((s) => /nine days/.test(s)));
  assert.deepEqual(suspiciousAmounts("Nine dollars a pen is still nine dollars.", ctx("dale-hochstetter")), [9, 9]);
});

test("does not flag Kai's own ring-light money or what it buys", () => {
  assert.deepEqual(suspiciousAmounts("I have exactly forty dollars on Venmo from my ring light sale.", ctx("kai-mercer")), []);
  assert.deepEqual(suspiciousAmounts("Two pens, 38 dollars, plain Venmo.", ctx("kai-mercer")), []);
});

test("does not flag the price, rounding, price times a count, or the caller's numbers", () => {
  assert.deepEqual(suspiciousAmounts("Nineteen bucks? For a pen?", ctx("dale-hochstetter")), []);
  assert.deepEqual(suspiciousAmounts("Twenty bucks for a pen.", ctx("dale-hochstetter")), [], "rounding");
  assert.deepEqual(suspiciousAmounts("Forty trucks at nineteen is 760 dollars.", ctx("dale-hochstetter")), []);
  const turns: Turn[] = [{ role: "broker", content: "Fifty pens is 950 dollars, and I'll knock off 25 dollars." }];
  assert.deepEqual(suspiciousAmounts("So 950 dollars, minus your 25 dollars.", ctx("dale-hochstetter", turns)), []);
});

test("does not flag sums the persona can compute from its own life", () => {
  // Dale: about 300 dollars per rejected delivery, twice a month.
  assert.deepEqual(suspiciousAmounts("That's three hundred dollars a pop, 7,200 dollars a year.", ctx("dale-hochstetter")), []);
  assert.deepEqual(suspiciousAmounts("I can sign up to two grand myself.", ctx("dale-hochstetter")), []);
});

test("does not flag comic comparisons", () => {
  assert.deepEqual(suspiciousAmounts("I can buy a gas station pen for a dollar.", ctx("kai-mercer")), []);
  assert.deepEqual(suspiciousAmounts("That costs more than a two-dollar hot dog.", ctx("eunice-pell")), []);
});
