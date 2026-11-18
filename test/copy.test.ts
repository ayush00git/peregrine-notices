/**
 * The words the templates write, and where posters go, from the three sample notices.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { affectedStops, assertNotice, edges, headline, status, steps, when, type Notice } from "../templates/_kit/copy.ts";

const brief = (id: string) => JSON.parse(readFileSync(join(import.meta.dirname, "..", "designs", id, "brief.json"), "utf8")) as Notice;
const [closure, skip, reduced] = [brief("pe-2701"), brief("pe-2702"), brief("pe-2703")];

test("every stop a change touches gets a poster, and no other", () => {
  assert.deepEqual(affectedStops(closure), ["Quayside", "Chandlers Yard", "Saltmarket", "Castle Street", "Millbrook"]);
  assert.deepEqual(affectedStops(skip), ["Saltmarket", "Kiln Row"]);
  assert.deepEqual(affectedStops(reduced), ["Ellery Central", "Wool Exchange", "Arches", "Viaduct Road", "Brickfields", "Fairhaven Park"]);
});

test("a closure's ends read in line order, whichever way round they were given", () => {
  const backwards = { ...closure, change: [{ ...closure.change[0]!, from: "Millbrook", to: "Quayside" }] } as Notice;
  assert.deepEqual(headline(backwards), { verb: "No trains", where: ["between Quayside", "and Millbrook"] });
  assert.deepEqual(affectedStops(backwards), affectedStops(closure));
});

test("the headline is written from the facts", () => {
  assert.deepEqual(headline(closure), { verb: "No trains", where: ["between Quayside", "and Millbrook"] });
  assert.deepEqual(headline(skip), { verb: "Trains skip", where: ["Saltmarket"] });
  assert.deepEqual(headline(reduced), { verb: "Fewer trams", where: ["after 21:00,", "every 20 minutes"] });
});

test("dates are real dates, written out", () => {
  assert.deepEqual(when(closure), ["Sat 9 – Mon 11 January"]);
  assert.deepEqual(when(skip), ["Sat 6 – Sun 7 February"]);
  assert.deepEqual(when({ ...closure, starts: "2027-01-30", ends: "2027-02-01" }), ["Sat 30 January –", "Mon 1 February"]);
  assert.deepEqual(when({ ...closure, ends: closure.starts }), ["Sat 9 January"]);
});

test("the last train before and the first train after are named with their days", () => {
  assert.deepEqual(edges(closure), [["Last train", "Fri 22:10"], ["First train", "Tue 05:30"]]);
  assert.deepEqual(edges(reduced), [["Last tram", "23:40 each night"]]);
});

test("the step-free way is always the last step", () => {
  for (const n of [closure, skip]) assert.equal(steps(n).at(-1)!.label, "Step-free");
  assert.match(steps(skip)[0]!.text, /^Use Kiln Row instead: 7 minutes' walk from Saltmarket\.$/);
});

test("each poster says what the change means at its stop", () => {
  assert.deepEqual(status(closure, "Quayside").lines, ["Trains towards Ellery Central", "run as normal"]);
  assert.deepEqual(status(closure, "Saltmarket"), { lines: ["No trains", "at Saltmarket"], note: "Bus 1X stops at Dock Street, outside the Mission." });
  assert.deepEqual(status(closure, "Millbrook").lines, ["Trains towards Lantern Hill", "run as normal"]);
  assert.equal(status(skip, "Kiln Row").note, "For Saltmarket, get off here: 7 minutes' walk.");
});

test("what only several fields together get wrong is refused", () => {
  assert.throws(() => assertNotice({ ...closure, here: "Bellfield" }), /Bellfield gets no poster for this change/);
  assert.throws(() => assertNotice({ ...skip, change: [{ ...skip.change[0]!, useInstead: "Saltmarket" }] } as Notice), /Use instead is Saltmarket/);
  assert.throws(() => assertNotice({ ...closure, change: [{ ...closure.change[0]!, to: "Quayside" }] } as Notice), /both Quayside/);
  for (const n of [closure, skip, reduced]) assert.doesNotThrow(() => assertNotice(n));
});
