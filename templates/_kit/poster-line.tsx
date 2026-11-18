/**
 * The poster's drawings, made from the network and the change.
 *
 * The line diagram: every stop of the line in order, top to bottom, a tick for each and a cross-bar at each end. The
 * drawing is one Svg; a Layer sets the names over it, each in a row of the same pitch as the ticks, so a stop's tick
 * and its name always line up. One grammar on every poster: solid, trains run; hollow, no trains; dashed, the bus.
 * This page's stop gets an ink flag pointing at its tick.
 *
 * The departures strip, for a reduced service: the evening as a bar, a tick for every train, dense until the change
 * and sparse after it, to the last.
 */
import { Column, Layer, Path, Polygon, Row, Svg, Text } from "@hyper-elements/react";
import { ENAMEL, INK, label, MONO_STACK, QUIET, RULE } from "./brand.ts";
import type { Read } from "./copy.ts";
import { interchanges } from "./network.ts";

/** The drawing's measures, in px. */
const LINE = 16; // the line
const EDGE = 4; // each edge of a hollow line
const TICK = 20; // a tick, past the line
const TICK_H = 12;
const THIN = 3; // a hollow tick's edges, an interchange square's
const SQUARE = 20; // an interchange: a hollow ink square on the line
const BUS = { width: 4, dash: 10, gap: 6, stop: 12 };
const NAME = 20; // stop names, and the bus chip
/** Above the first stop and below the last: room for the flag (56px tall), and for half a row. */
export const pad = (pitch: number) => Math.max(28, pitch / 2);
/** The line chip over the diagram, and the space under it. */
export const CHIP = 12 * 1.3 + 8 + 8;

const r1 = (n: number) => Math.round(n * 10) / 10;
/** A rectangle as path data, clockwise; `hole` draws it the other way round, to cut it out of the one around it. */
const box = (x: number, y: number, w: number, h: number, hole = false) =>
  hole ? `M${r1(x)} ${r1(y)}v${r1(h)}h${r1(w)}v${r1(-h)}z` : `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}z`;
/** A rectangle's outline, `t` thick. */
const frame = (x: number, y: number, w: number, h: number, t: number) => box(x, y, w, h) + box(x + t, y + t, w - 2 * t, h - 2 * t, true);

/** Which stops have no trains, which stretches of line are closed, and where the bus runs: from the change. */
function states(r: Read) {
  const stops = r.line.stops;
  const last = stops.length - 1;
  const none = new Set<number>();
  const hollow = new Set<number>(); // a stretch of line, by the stop it starts from
  if (r.kind === "closure") {
    const [a, b] = [stops.indexOf(r.from), stops.indexOf(r.to)];
    for (let i = a; i < b; i++) hollow.add(i);
    for (let i = a + 1; i < b; i++) none.add(i);
    // An end of the closure that is also an end of the line has no trains at all.
    if (a === 0) none.add(a);
    if (b === last) none.add(b);
  }
  if (r.kind === "skip") none.add(stops.indexOf(r.change.stop));
  return { none, hollow, bus: r.kind === "closure" ? ([stops.indexOf(r.from), stops.indexOf(r.to)] as const) : null };
}

export function LineDiagram({ r, stop, width, pitch }: { r: Read; stop: string; width: number; pitch: number }) {
  const stops = r.line.stops;
  const last = stops.length - 1;
  const here = stops.indexOf(stop);
  const { none, hollow, bus } = states(r);
  const colour = r.line.colour;
  // A closure leaves room on the left of the line for the bus.
  const x = bus ? 76 : 24;
  const busX = 36;
  const top = pad(pitch);
  const y = (i: number) => top + i * pitch;
  const height = 2 * top + last * pitch;
  const right = x + LINE / 2;
  const names = right + TICK + 12;

  // The line: solid where trains run, two edges where they don't, each run of stretches one shape, flush with the
  // cross-bars at its ends.
  let solid = "";
  let edges = "";
  for (let i = 0; i < last; ) {
    const closed = hollow.has(i);
    let j = i;
    while (j < last && hollow.has(j) === closed) j++;
    const [from, to] = [y(i) - (i === 0 ? TICK_H / 2 : 0), y(j) + (j === last ? TICK_H / 2 : 0)];
    if (closed) edges += box(x - LINE / 2, from, EDGE, to - from) + box(right - EDGE, from, EDGE, to - from);
    else solid += box(x - LINE / 2, from, LINE, to - from);
    i = j;
  }

  // A tick at each stop and a cross-bar at each end: solid where trains stop, outlined where they don't.
  let marks = "";
  let open = "";
  stops.forEach((_, i) => {
    const end = i === 0 || i === last;
    const [left, w] = end ? [x - LINE / 2 - TICK, LINE + 2 * TICK] : [right - 1, TICK + 1];
    if (none.has(i)) open += frame(left, y(i) - TICK_H / 2, w, TICK_H, THIN);
    else marks += box(left, y(i) - TICK_H / 2, w, TICK_H);
  });

  // Interchanges: a hollow ink square on the line.
  const changes = stops.flatMap((name, i) => (interchanges(name, r.line).length ? [i] : []));
  const squares = changes.map((i) => box(x - SQUARE / 2, y(i) - SQUARE / 2, SQUARE, SQUARE)).join("");
  const squareEdges = changes.map((i) => frame(x - SQUARE / 2, y(i) - SQUARE / 2, SQUARE, SQUARE, THIN)).join("");

  // The bus: a dashed line beside the closed stretch, with a square at each stop it calls at.
  let dashes = "";
  let calls = "";
  if (bus) {
    const [a, b] = bus;
    for (let at = y(a); at < y(b); at += BUS.dash + BUS.gap) dashes += box(busX - BUS.width / 2, at, BUS.width, Math.min(BUS.dash, y(b) - at));
    for (let i = a; i <= b; i++) calls += box(busX - BUS.stop / 2, y(i) - BUS.stop / 2, BUS.stop, BUS.stop);
  }
  const route = r.kind === "closure" ? r.change.bus.route : "";
  const chip = { width: 13 * route.length + 16, height: 28 };

  // You are here: an ink flag at this page's stop, pointing at its tick.
  const tip = right + TICK + 1;
  const flag = `${tip},${y(here)} ${names + 1},${y(here) - 12} ${names + 1},${y(here) + 12}`;

  return (
    <Column style={{ width, gap: 8 }}>
      <Row style={{ padding: [0, 0, 0, x - LINE / 2] }}>
        <Text style={{ ...label(12, "#FFFFFF"), flex: "none", backgroundColor: colour, padding: [4, 8] }}>{`${r.line.name} line`}</Text>
      </Row>
      <Layer style={{ width }}>
        <Svg width={width} height={height} title={`The ${r.line.name} line, ${stops[0]} to ${stops[last]}, with ${stop} marked`}>
          {dashes ? <Path d={dashes} style={{ fill: QUIET }} /> : null}
          {calls ? <Path d={calls} style={{ fill: QUIET }} /> : null}
          {solid ? <Path d={solid} style={{ fill: colour }} /> : null}
          {edges ? <Path d={edges} style={{ fill: colour }} /> : null}
          {marks ? <Path d={marks} style={{ fill: colour }} /> : null}
          {open ? <Path d={open} style={{ fill: colour }} /> : null}
          {squares ? <Path d={squares} style={{ fill: ENAMEL }} /> : null}
          {squareEdges ? <Path d={squareEdges} style={{ fill: INK }} /> : null}
          <Polygon points={flag} style={{ fill: INK }} />
        </Svg>
        <Column style={{ padding: [top - pitch / 2, 0, 0, names] }}>
          {stops.map((name, i) => (
            <Column key={name} style={{ height: pitch, justifyContent: "center" }}>
              {i === here ? (
                <Row>
                  <Column style={{ flex: "none", backgroundColor: INK, padding: [8, 12], gap: 2 }}>
                    <Text style={label(12, ENAMEL)}>You are here</Text>
                    <Text style={{ fontSize: NAME, fontWeight: 800, lineHeight: 1.1, color: ENAMEL }}>{name}</Text>
                  </Column>
                </Row>
              ) : (
                <Text style={{ fontSize: NAME, fontWeight: 700, lineHeight: 1.1, color: none.has(i) ? QUIET : INK }}>{name}</Text>
              )}
            </Column>
          ))}
        </Column>
        {bus ? (
          <Column style={{ padding: [(y(bus[0]) + y(bus[0] + 1)) / 2 - chip.height / 2, 0, 0, busX - chip.width / 2] }}>
            <Text style={{ width: chip.width, backgroundColor: INK, color: ENAMEL, fontFamily: MONO_STACK, fontSize: NAME, fontWeight: 700, lineHeight: 1.4, textAlign: "center" }}>
              {route}
            </Text>
          </Column>
        ) : null}
      </Layer>
    </Column>
  );
}

const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const clock = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** The departures strip's height: its label, the drawing and the hours under it. */
export const DEPARTURES = 12 * 1.3 + 8 + 42 + 8 + 12 * 1.3;

/** The evening's departures: a tick a train, every `line.every` minutes until the change, then every few, to the last. */
export function Departures({ r, width }: { r: Extract<Read, { kind: "reduced" }>; width: number }) {
  const after = minutes(r.change.after);
  let last = minutes(r.change.lastTrain);
  if (last <= after) last += 24 * 60; // the last one runs after midnight
  const changes = Math.floor(after / 60) * 60;
  const end = (Math.floor(last / 60) + 1) * 60;
  // Up to three hours of the usual service before the change, and at least one: seven hours in all, where it can.
  const start = changes - Math.max(60, Math.min(180, 7 * 60 - (end - changes)));
  const hours = (end - start) / 60;
  const hour = width / hours;
  // An hour's label is 43px wide: where they'd touch, every other hour is named.
  const step = hour < 52 ? 2 : 1;
  const at = (m: number) => Math.min(((m - start) / (end - start)) * width, width - 2);
  let ticks = "";
  for (let m = start; m < after; m += r.line.every) ticks += box(at(m), 8, 2, 24);
  for (let m = after; m <= last; m += r.change.everyMinutes) ticks += box(at(m), m === after ? 0 : 8, 2, m === after ? 32 : 24);
  ticks += box(at(last), 0, 2, 32);
  const hourMarks = Array.from({ length: hours + 1 }, (_, h) => box(Math.min(h * hour, width - 1.5), 36, 1.5, 6)).join("");
  const named = Array.from({ length: Math.ceil(hours / step) }, (_, k) => start + k * step * 60);
  return (
    <Column style={{ gap: 8 }}>
      <Text style={label(12, INK)}>{`${r.line.vehicle}s each evening`}</Text>
      <Svg width={width} height={42} title={`A ${r.line.vehicle} every ${r.line.every} minutes until ${r.change.after}, then every ${r.change.everyMinutes} minutes until the last at ${r.change.lastTrain}`}>
        <Path d={box(0, 32, at(last) + 2, 4)} style={{ fill: INK }} />
        <Path d={box(at(last) + 2, 32, width - at(last) - 2, 4)} style={{ fill: RULE }} />
        <Path d={ticks} style={{ fill: INK }} />
        <Path d={hourMarks} style={{ fill: QUIET }} />
      </Svg>
      <Row>
        {named.map((m, k) => (
          <Text key={m} style={{ ...label(12, m === changes ? INK : QUIET), width: k < named.length - 1 ? step * hour : width - k * step * hour }}>
            {clock(m)}
          </Text>
        ))}
      </Row>
    </Column>
  );
}
