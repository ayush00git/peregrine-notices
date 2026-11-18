/**
 * Every line the templates can write, measured. The words come from the network (fixed data), so the set of
 * headlines is finite: list them all and lay each one out in Atkinson Hyperlegible at its size, in 90% of its
 * measure. One that takes a second line fails, naming the line and the size. This is what lets the posters and the
 * email (where `fit` isn't available) promise their headlines fit, and what refuses a stop renamed too long.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { Canvas, Column, Text } from "@hyper-elements/react";
import { layoutImage } from "@hyper-elements/react/image";
import { fontFiles } from "../scripts/fonts.ts";
import { MONO, SANS } from "../templates/_kit/brand.ts";
import { LINES } from "../templates/_kit/network.ts";
import { CARD, EMAIL, HEADROOM, POSTER, tight } from "../templates/_kit/type.ts";

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);
const pad = (n: number) => String(n).padStart(2, "0");

type Line = { text: string; family: string; weight: number; size: number; measure: number; spacing?: number; caps?: boolean };

/** Everything the templates can set large, from every line of the network. */
function candidates(): Line[] {
  const out: Line[] = [];
  const sans = (text: string, size: number, measure: number, weight = 800): Line => ({ text, family: SANS, weight, size, measure, spacing: tight(size).letterSpacing });
  for (const line of LINES) {
    const v = `${line.vehicle}s`;
    const verbs = [`No ${v}`, `${cap(v)} skip`, `Fewer ${v}`];
    const where = new Set<string>();
    line.stops.forEach((stop, i) => {
      if (i < line.stops.length - 1) where.add(`between ${stop}`);
      if (i > 0) where.add(`and ${stop}`);
      where.add(stop);
    });
    for (let h = 0; h < 24; h++) where.add(`after ${pad(h)}:00,`);
    for (let m = 10; m <= 60; m++) where.add(`every ${m} minutes`);
    const status = new Set<string>([`${cap(v)} towards ${line.stops[0]}`, `${cap(v)} towards ${line.stops.at(-1)}`, "run as normal", ...verbs]);
    for (const stop of line.stops) status.add(`at ${stop}`).add(stop);
    for (let h = 0; h < 24; h++) status.add(`after ${pad(h)}:00`);

    for (const text of verbs) {
      out.push(sans(text, POSTER.verb, POSTER.measure), sans(text, EMAIL.verb, EMAIL.measure), sans(text, EMAIL.phoneVerb, EMAIL.phone.measure));
      out.push(sans(text, CARD.verb.at(-1)!, CARD.measure));
    }
    for (const text of where) {
      out.push(sans(text, POSTER.where, POSTER.measure), sans(text, EMAIL.where, EMAIL.measure), sans(text, EMAIL.phoneWhere, EMAIL.phone.measure));
      out.push(sans(text, CARD.where.at(-1)!, CARD.measure));
    }
    for (const text of status) out.push(sans(text, POSTER.status, POSTER.measure, 700));
    // A stop's name beside the email's line diagram: the measure less the line's cell and the gap.
    for (const stop of line.stops) out.push(sans(stop, EMAIL.stop, EMAIL.phone.measure - 22 - 16 - 48, 700));
  }
  // Dates in Mono capitals. Mono is monospaced, so the longest string is the widest. Within a month the longest is
  // a range like "Wed 10 – Thu 25 September"; across two months copy.when() breaks before the dash.
  const mono = (text: string, size: number, measure: number): Line => ({ text, family: MONO, weight: 700, size, measure, spacing: 1.2, caps: true });
  for (const date of ["Wed 10 – Thu 25 September", "Wed 30 September –", "Sat 3 October", "Wed 30 September"]) {
    out.push(mono(date, POSTER.when, POSTER.measure), mono(date, EMAIL.when, EMAIL.measure), mono(date, EMAIL.phoneWhen, EMAIL.phone.measure), mono(date, CARD.when, CARD.measure));
  }
  // The last and first trains: a row each, label and time.
  for (const edge of ["First train  Wed 00:00", "Last tram  00:00 each night"]) {
    out.push(mono(edge, POSTER.edges, POSTER.measure), mono(edge, EMAIL.edges, EMAIL.measure), mono(edge, EMAIL.edges, EMAIL.phone.measure));
  }
  return out;
}

test("every line the network can produce fits its measure, with 10% to spare", async () => {
  const fonts = await fontFiles();
  const lines = candidates();
  const failures: string[] = [];
  // Lay them out a few hundred at a time, each in its own box: width = 90% of its measure.
  for (let i = 0; i < lines.length; i += 400) {
    const batch = lines.slice(i, i + 400);
    const layout = await layoutImage(
      React.createElement(
        Canvas,
        { width: 2000, height: 100 * batch.length },
        React.createElement(
          Column,
          { style: { gap: 0 } },
          batch.map((l, j) =>
            React.createElement(
              Text,
              {
                key: j,
                style: {
                  width: Math.floor(l.measure * HEADROOM),
                  fontFamily: l.family,
                  fontWeight: l.weight as 700,
                  fontSize: l.size,
                  letterSpacing: l.spacing ?? 0,
                  lineHeight: 1,
                  ...(l.caps ? { textTransform: "uppercase" as const } : {}),
                },
              },
              l.text,
            ),
          ),
        ),
      ),
      { fonts },
    );
    const texts = layout.nodes.filter((node) => node.type === "Text");
    assert.equal(texts.length, batch.length);
    texts.forEach((node, j) => {
      const l = batch[j]!;
      if ((node as { lines?: number }).lines !== 1)
        failures.push(`"${l.text}" at ${l.size}px ${l.family} takes ${(node as { lines?: number }).lines} lines in ${Math.floor(l.measure * HEADROOM)}px`);
    });
  }
  assert.deepEqual(failures, [], `${failures.length} of ${lines.length} lines don't fit:\n${failures.join("\n")}`);
});

test("stop names stay short enough to set large", () => {
  for (const line of LINES) for (const stop of line.stops) assert.ok(stop.length <= 14, `${stop} is ${stop.length} characters; 14 at most`);
});
