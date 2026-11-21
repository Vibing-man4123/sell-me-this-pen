import assert from "node:assert/strict";
import { test } from "node:test";
import { getItem } from "../src/lib/game/items.ts";
import { getPersona } from "../src/lib/game/personas.ts";
import { knownAmount, priceContext } from "../src/lib/game/prices.ts";
import { trimText } from "../src/lib/game/rubric.ts";
import type { Turn } from "../src/lib/game/transcript.ts";
import {
  inventedNumbers,
  inventedSpecs,
  isAnsweredQuestion,
  isDiscoveryQuestion,
  leakedNumbers,
  lineProblems,
  quotesAreReal,
  scrubLeaks,
  withCleanQuotes,
} from "../src/lib/game/verdictChecks.ts";

const dale = getPersona("dale-hochstetter");
const pen = getItem("pen");

const call: Turn[] = [
  { role: "client", content: "Hochstetter. Make it quick." },
  { role: "broker", content: "Before I pitch anything: what's costing you money this quarter that shouldn't be?" },
  { role: "client", content: "Docks. Pens freeze, die, or walk off. Missing signatures get deliveries rejected. We eat about three hundred dollars a pop, twice a month." },
  { role: "broker", content: "It's the best pen on the market, trust me. Can I put you down for ten?" },
  { role: "client", content: "That's not an answer. Adjectives don't reconcile receipts, and you still haven't told me why mine fail less with yours." },
];

test("quotesAreReal accepts broker quotes only", () => {
  assert.equal(quotesAreReal({ bestLine: "what's costing you money this quarter", worstLine: "" }, call), true);
  assert.equal(quotesAreReal({ bestLine: "Pens freeze, die, or walk off.", worstLine: "" }, call), false, "client line");
  assert.equal(quotesAreReal({ bestLine: "a line nobody said", worstLine: "" }, call), false);
});

test("quotesAreReal tolerates curly quotes, spacing and the judge's own quote marks", () => {
  assert.equal(quotesAreReal({ bestLine: "It’s the best  pen on the market", worstLine: "" }, call), true);
  const v = withCleanQuotes({ bestLine: "“It's the best pen on the market, trust me.”", worstLine: "'Can I put you down for ten?'" });
  assert.equal(v.bestLine, "It's the best pen on the market, trust me.");
  assert.equal(v.worstLine, "Can I put you down for ten?");
  assert.equal(quotesAreReal(v, call), true);
});

test("isDiscoveryQuestion: questions about the client, not asks or jabs", () => {
  assert.equal(isDiscoveryQuestion("Quick one: what's the big thing on your plate this week?"), true);
  assert.equal(isDiscoveryQuestion("How has your week been?"), true);
  assert.equal(isDiscoveryQuestion("Can I put you down for ten?"), false);
  assert.equal(isDiscoveryQuestion("What if your front desk had pens that look premium?"), false);
  assert.equal(isDiscoveryQuestion("Do you even have twenty dollars?"), false);
  assert.equal(isDiscoveryQuestion("It's the best pen on the market."), false);
});

test("isAnsweredQuestion needs a substantive reply after the question", () => {
  assert.equal(isAnsweredQuestion("what's costing you money this quarter that shouldn't be?", call), true);
  assert.equal(isAnsweredQuestion("Can I put you down for ten?", call), false);
  const brushed: Turn[] = [...call.slice(0, 2), { role: "client", content: "Not your business." }];
  assert.equal(isAnsweredQuestion("what's costing you money this quarter that shouldn't be?", brushed), false);
});

test("lineProblems: same line twice, or a worstLine that was discovery working", () => {
  const q = "Before I pitch anything: what's costing you money this quarter that shouldn't be?";
  assert.equal(lineProblems({ bestLine: q, worstLine: "It's the best pen on the market, trust me." }, call).length, 0);
  assert.match(lineProblems({ bestLine: q, worstLine: q }, call).join(), /same line/);
  assert.match(lineProblems({ bestLine: "Can I put you down for ten?", worstLine: q }, call).join(), /worstLine/);
  assert.equal(lineProblems({ bestLine: "", worstLine: "" }, call).length, 0, "empty is fine");
});

test("leakedNumbers flags hidden numbers nobody said, and scrubLeaks blanks them", () => {
  const silent = call.slice(0, 2);
  assert.deepEqual(leakedNumbers({ coaching: "Say $300 per missed signature." }, dale, pen, silent), ["300"]);
  assert.deepEqual(leakedNumbers({ coaching: "Say $300 per missed signature." }, dale, pen, [...silent, { role: "client", content: "About 300 dollars a pop." }]), []);
  assert.deepEqual(leakedNumbers({ coaching: "Offer 2 pens for $40." }, dale, pen, silent), [], "not hidden");
  assert.equal(scrubLeaks({ coaching: "Say $300, then $2,000." }, ["300", "2000"]).coaching, "Say that number, then that number.");
});

test("inventedNumbers flags specs from nowhere, not figures of speech or the call's math", () => {
  const known = knownAmount(priceContext(dale, pen, call), [], true);
  assert.deepEqual(inventedNumbers("Promise pens rated for 47 years and 4,100 signatures.", known), ["47", "4100"]);
  assert.deepEqual(inventedNumbers("Like a 90s pager, back in '89, 24/7, give it 110%, since 1987.", known), []);
  assert.deepEqual(inventedNumbers("Say: ten pens is $190, and it stops one $300 rejection.", known), []);
});

test("trimText cuts long quotes at a sentence or word, never mid-word", () => {
  const long = "So two rejected manifests a month at three hundred each is six hundred dollars a month. Fifty pens clipped to the dock boards is 950 dollars. Stop two rejections and that pays back in under two months. Does that line survive your spreadsheet?";
  assert.equal(trimText(long, 240), long.slice(0, long.indexOf(" Does")));
  assert.equal(trimText("word ".repeat(60), 240).endsWith("word"), true);
  assert.equal(trimText("short", 240), "short");
});

test("inventedSpecs flags spec talk the product and call never had", () => {
  assert.deepEqual(inventedSpecs("Say: these are engineered to write down to 30°F, zero failures.", pen, call), ["engineered", "°"]);
  assert.deepEqual(inventedSpecs("Tell him it's rated for the cold and guaranteed.", pen, call), ["rated", "guaranteed"]);
  assert.deepEqual(inventedSpecs("Ask him: 'When a pen dies at the dock, what happens next?' Give it 110%.", pen, call), []);
  const lie: Turn[] = [{ role: "broker", content: "It's NASA-certified." }];
  assert.deepEqual(inventedSpecs("You called it NASA-certified and got caught. Own it.", pen, lie), [], "quoting the call is fine");
  assert.deepEqual(inventedSpecs("Writes on paper. Reliably. Say that and stop.", pen, call), []);
});
