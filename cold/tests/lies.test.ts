import assert from "node:assert/strict";
import { test } from "node:test";
import { callsOutLie, closeBlocked, lieNote, lieState, ownsLie } from "../src/lib/game/lies.ts";
import type { Turn } from "../src/lib/game/transcript.ts";

const b = (content: string): Turn => ({ role: "broker", content });
const c = (content: string): Turn => ({ role: "client", content });

test("callsOutLie hears a catch, not a figure of speech", () => {
  assert.equal(callsOutLie("That's a lie, I don't believe it."), true);
  assert.equal(callsOutLie("You’re lying to me."), true);
  assert.equal(callsOutLie("You made that up."), true);
  assert.equal(callsOutLie("Not gonna lie, that's a nice click."), false);
  assert.equal(callsOutLie("I'd be lying if I said I needed one."), false);
  assert.equal(callsOutLie("The problem lies in the docks."), false);
});

test("ownsLie hears the caller owning it", () => {
  assert.equal(ownsLie("You're right, I made that up and I'm sorry."), true);
  assert.equal(ownsLie("Fair catch. It's an ordinary ballpoint."), true);
  assert.equal(ownsLie("Trust me, it's titanium."), false);
});

const caught = [c("Kai here."), b("It's solid titanium, NASA-certified."), c("That's a lie, I don't believe it.")];

test("lieState walks the call: none, unowned, just owned, owned", () => {
  assert.deepEqual(lieState([c("Kai here."), b("Hi"), c("Go on.")]), { kind: "none" });
  assert.deepEqual(lieState([...caught, b("Two pens, 38 dollars?")]), { kind: "unowned", exchange: 1 });
  assert.deepEqual(lieState([...caught, b("Two pens?"), c("You're still lying."), b("Deal?")]), { kind: "unowned", exchange: 1 });
  const owned = [...caught, b("You're right, I made that up. It's an ordinary pen.")];
  assert.deepEqual(lieState(owned), { kind: "just-owned", exchange: 1 });
  assert.deepEqual(lieState([...owned, c("Appreciate it."), b("One pen, 19 dollars?")]), { kind: "owned", exchange: 1 });
});

test("a fresh lie after owning restarts the clock", () => {
  const turns = [...caught, b("You're right, I made that up."), c("Okay."), b("It writes on the moon too."), c("Another lie."), b("Deal?")];
  assert.deepEqual(lieState(turns), { kind: "unowned", exchange: 3 });
});

test("closeBlocked and lieNote follow the state", () => {
  assert.equal(closeBlocked({ kind: "none" }), false);
  assert.equal(closeBlocked({ kind: "unowned", exchange: 2 }), true);
  assert.equal(closeBlocked({ kind: "just-owned", exchange: 2 }), true);
  assert.equal(closeBlocked({ kind: "owned", exchange: 2 }), false);
  assert.equal(lieNote({ kind: "none" }), "");
  assert.match(lieNote({ kind: "unowned", exchange: 2 }), /exchange 2.*do NOT agree/);
});
