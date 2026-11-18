/**
 * The card's strip, drawn from the network: the stretch of line a change touches, stop by stop. Solid where trains
 * run, hollow where they don't, dashed where the replacement bus runs beside it; a skipped stop's tick hollow; a
 * chevron where the line goes on past what's shown. For fewer trains the map doesn't change, so the strip draws time:
 * one tick per train through the evening, close together until the change and far apart after it.
 */
import type { ReactElement } from "react";
import { Column, Layer, Path, Polygon, Rect, Row, Svg, Text } from "@hyper-elements/react";
import { ENAMEL, INK, MONO_STACK, QUIET, SANS_STACK } from "./brand.ts";
import { read, type Notice } from "./copy.ts";
import { walkBetween } from "./network.ts";

/** The card's one small size: stop names, chips, labels. */
export const SMALL = 20;
const WHITE = "#FFFFFF";

const LINE = 20; // the line's thickness
const EDGE = 5; // a hollow line's two edges
const TICK = { width: 14, height: 16, edge: 4 };
const STUB = 72; // where the line goes on: a chevron and a length of line
const PITCH = 216; // the most room a stop gets
const CHIP = 28; // a chip's height: SMALL on one line, 4px above and below
const BELOW = 16; // from the line to what runs beside it

/**
 * Where a line box's baseline sits above its bottom, for Atkinson (ascent 0.984em, descent 0.316em): pad the smaller
 * of two bottom-aligned texts by the difference and they share a baseline.
 */
export const sink = (size: number, lineHeight = 1) => size * (lineHeight / 2 - 0.334);

/** Mono caps at the small size. Every Atkinson Mono glyph is 0.632em wide, so a label's width is known. */
export const mono = (color: string) =>
  ({ fontFamily: MONO_STACK, fontSize: SMALL, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", lineHeight: 1, color }) as const;
const monoWidth = (text: string) => text.length * (0.632 * SMALL + 1.2);

/** A label on the drawing: white capitals on Ink. */
const chip = (text: string) => <Text style={{ ...mono(WHITE), flex: "none", backgroundColor: INK, padding: [4, 10] }}>{text}</Text>;

/** Something laid over the drawing: its box `room` wide, from x, its top at y; its content placed in the box. */
const at = (key: string, x: number, y: number, room: number, child: ReactElement, place: "start" | "center" | "end" = "center") => (
  <Row key={key} style={{ padding: [y, 0, 0, Math.max(0, Math.round(x))] }}>
    <Row style={{ width: room, justifyContent: place }}>{child}</Row>
  </Row>
);

interface Plan {
  stops: { name: string; served: boolean }[];
  /** A closure: no trains between the first and last stop shown. */
  hollow: boolean;
  /** The line goes on before the first stop shown, and after the last. */
  before: boolean;
  after: boolean;
  bus?: string;
  walk?: { from: number; to: number; minutes: number };
}

/** A closure's stretch, ends included; or a skipped stop, the stop to use instead, and a stop either side. */
function plan(n: Notice): Plan {
  const r = read(n);
  const all = r.line.stops;
  const last = all.length - 1;
  if (r.kind === "closure") {
    const [i, j] = [all.indexOf(r.from), all.indexOf(r.to)];
    // An end of the stretch still has trains from the other side, unless it's the end of the line.
    const stops = all.slice(i, j + 1).map((name, k) => ({ name, served: (k === 0 && i > 0) || (k === j - i && j < last) }));
    return { stops, hollow: true, before: i > 0, after: j < last, bus: r.change.bus.route };
  }
  if (r.kind !== "skip") throw new Error("A line strip draws a closure or a skip");
  const [s, u] = [all.indexOf(r.change.stop), all.indexOf(r.change.useInstead)];
  const [a, b] = [Math.max(0, Math.min(s, u) - 1), Math.min(last, Math.max(s, u) + 1)];
  const stops = all.slice(a, b + 1).map((name) => ({ name, served: name !== r.change.stop }));
  const walk = { from: s - a, to: u - a, minutes: walkBetween(r.line, r.change.stop, r.change.useInstead) };
  return { stops, hollow: false, before: a > 0, after: b < last, walk };
}

/** A chevron pointing out of the strip, its tip at x. */
const chevron = (x: number, y: number, out: 1 | -1, fill: string) => {
  const [h, t] = [16, 9];
  const p = (dx: number, dy: number) => `${x - out * dx},${y + dy}`;
  return <Polygon points={[p(h, -h), p(0, 0), p(h, h), p(h + t, h), p(t, 0), p(h + t, -h)].join(" ")} style={{ fill }} />;
};

function LineStrip({ n, width }: { n: Notice; width: number }) {
  const colour = read(n).line.colour;
  const p = plan(n);
  const count = p.stops.length;
  const pitch = Math.min(PITCH, (width - (p.before ? STUB : 0) - (p.after ? STUB : 0)) / count);
  const span = pitch * count;
  // A terminus sits at its own edge of the strip; a stretch with the line going on both ways is centred.
  const x0 = p.before === p.after ? (width - span) / 2 : p.before ? width - span : 0;
  const xs = p.stops.map((_, i) => x0 + pitch * (i + 0.5));
  const [first, final] = [xs[0]!, xs[count - 1]!];
  const top = TICK.height;
  const mid = top + LINE / 2;
  const under = top + LINE + BELOW + CHIP / 2;
  const height = p.bus || p.walk ? under + CHIP / 2 : top + LINE + TICK.height;

  // Everything in the line's colour first, then the Enamel that hollows it out.
  const solid: ReactElement[] = [];
  const hollow: ReactElement[] = [];
  const rect = (into: ReactElement[], x: number, y: number, w: number, h: number, fill: string) =>
    into.push(<Rect key={into.length} x={x} y={y} width={w} height={h} style={{ fill }} />);
  const [from, to] = [p.before ? 34 : first, p.after ? width - 34 : final];
  rect(solid, from, top, to - from, LINE, colour);
  if (p.hollow) {
    const open = (served: boolean, x: number, side: 1 | -1) => (served ? x + (side * TICK.width) / 2 : x - (side * TICK.width) / 2 + side * TICK.edge);
    const [a, b] = [open(p.stops[0]!.served, first, 1), open(p.stops[count - 1]!.served, final, -1)];
    rect(hollow, a, top + EDGE, b - a, LINE - 2 * EDGE, ENAMEL);
  }
  p.stops.forEach((stop, i) => {
    const x = xs[i]!;
    // A tick above the line; the end of the line is a bar across it.
    const end = (i === 0 && !p.before) || (i === count - 1 && !p.after);
    const h = end ? LINE + 2 * TICK.height : TICK.height + LINE / 2;
    rect(solid, x - TICK.width / 2, 0, TICK.width, h, colour);
    if (stop.served) return;
    const [ix, iw] = [x - TICK.width / 2 + TICK.edge, TICK.width - 2 * TICK.edge];
    if (p.hollow) rect(hollow, ix, TICK.edge, iw, end ? h - 2 * TICK.edge : h - TICK.edge, ENAMEL);
    else {
      // A skipped stop on a line that runs through it: hollow above the line (and below it, at the end of the line).
      rect(hollow, ix, TICK.edge, iw, TICK.height - TICK.edge, ENAMEL);
      if (end) rect(hollow, ix, top + LINE, iw, TICK.height - TICK.edge, ENAMEL);
    }
  });

  const marks: ReactElement[] = [];
  const over: ReactElement[] = [];
  if (p.bus) {
    // The bus, dashed, stopping outside each station, with its route at the start like a sign on a stop.
    const dashes: string[] = [];
    for (let x = first; x < final - 4; x += 16) dashes.push(`M${x} ${under} h8`);
    marks.push(<Path key="bus" d={dashes.join(" ")} style={{ fill: "transparent", stroke: QUIET, strokeWidth: 4 }} />);
    xs.forEach((x, i) => marks.push(<Rect key={`stop${i}`} x={x - 6} y={under - 6} width={12} height={12} style={{ fill: INK }} />));
    const room = monoWidth(p.bus) + 20;
    over.push(first - 16 - room >= 0 ? at("bus", first - 16 - room, under - CHIP / 2, room, chip(p.bus), "end") : at("bus", final + 16, under - CHIP / 2, room, chip(p.bus), "start"));
  }
  if (p.walk) {
    // The walk to the stop to use instead: a bracket under the two stops, with how long it takes.
    const [a, b] = [xs[p.walk.from]!, xs[p.walk.to]!];
    marks.push(<Path key="walk" d={`M${a} ${top + LINE + 4} V${under} H${b} V${top + LINE + 4}`} style={{ fill: "transparent", stroke: INK, strokeWidth: 3 }} />);
    const text = `${p.walk.minutes} min walk`;
    const room = monoWidth(text) + 20;
    over.push(at("walk", (a + b) / 2 - room / 2, under - CHIP / 2, room, chip(text)));
  }

  return (
    <Column style={{ width, gap: 6 }}>
      <Row style={{ alignItems: "end", padding: [0, 0, 0, Math.round(x0)] }}>
        {p.stops.map((stop) => (
          <Text key={stop.name} style={{ width: Math.floor(pitch), flex: "none", textAlign: "center", fontFamily: SANS_STACK, fontWeight: 700, fontSize: SMALL, lineHeight: 1.15, color: stop.served ? INK : QUIET }}>
            {stop.name}
          </Text>
        ))}
      </Row>
      <Layer style={{ width, height }}>
        <Svg width={width} height={height} title={title(n)}>
          {solid}
          {hollow}
          {p.before ? chevron(0, mid, -1, colour) : null}
          {p.after ? chevron(width, mid, 1, colour) : null}
          {marks}
        </Svg>
        <Column>{over}</Column>
      </Layer>
    </Column>
  );
}

const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
/** Minutes from midnight as a clock: past midnight (24:10) and the evening before (-60) read as times of day. */
const clock = (t: number) => {
  const m = ((t % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** Fewer trains: the evening as a row of departures, one tick a train, from three hours before the change. */
function Departures({ n, width }: { n: Notice; width: number }) {
  const r = read(n);
  if (r.kind !== "reduced") throw new Error("The departures strip draws fewer trains");
  const colour = r.line.colour;
  const after = minutes(r.change.after);
  let last = minutes(r.change.lastTrain);
  if (last <= after) last += 24 * 60;
  const start = Math.floor(after / 60) * 60 - 180;
  const end = Math.ceil(Math.max(last + 20, after + 180) / 60) * 60;
  const x = (t: number) => ((t - start) / (end - start)) * width;
  const trains: number[] = [];
  for (let t = after - r.line.every; t >= start; t -= r.line.every) trains.unshift(t);
  for (let t = after; t <= last; t += r.change.everyMinutes) trains.push(t);
  if (trains.at(-1) !== last) trains.push(last);
  const hours: number[] = [];
  for (let t = start; t <= end; t += end - start > 9 * 60 ? 120 : 60) hours.push(t);

  const [tall, base, notch] = [44, 6, 10];
  // Above: the usual service, then the change and its last train. The change is never much past halfway along (three
  // hours in, of six or more), so its label always has room.
  const usual = `Every ${r.line.every} min`;
  const fewer = `Every ${r.change.everyMinutes} min · Last ${r.line.vehicle} ${clock(last)}`;
  // Below: the hours, and the time of the change in Ink; an hour that would touch it gives way.
  const room = monoWidth("00:00");
  const times = [after, ...hours.filter((t) => t === after || Math.abs(x(t) - x(after)) >= room + 16)];
  return (
    <Column style={{ width, gap: 8 }}>
      <Layer style={{ width, height: SMALL }}>
        <Column />
        {at("usual", 0, 0, monoWidth(usual), <Text style={{ ...mono(QUIET), flex: "none" }}>{usual}</Text>, "start")}
        {at("fewer", x(after) - 2, 0, monoWidth(fewer), <Text style={{ ...mono(INK), flex: "none" }}>{fewer}</Text>, "start")}
      </Layer>
      <Svg width={width} height={tall + base + notch} title={title(n)}>
        {trains.map((t) => (
          <Rect key={t} x={x(t) - 2} y={0} width={4} height={tall} style={{ fill: colour }} />
        ))}
        <Rect x={0} y={tall} width={x(last) + 2} height={base} style={{ fill: colour }} />
        {hours.map((t) => (
          <Rect key={t} x={Math.min(width - 2, Math.max(0, x(t) - 1))} y={tall + base} width={2} height={notch} style={{ fill: QUIET }} />
        ))}
      </Svg>
      <Layer style={{ width, height: SMALL }}>
        <Column />
        {[...new Set(times)].map((t) =>
          at(String(t), Math.min(width - room, Math.max(0, x(t) - room / 2)), 0, room, <Text style={{ ...mono(t === after ? INK : QUIET), flex: "none" }}>{clock(t)}</Text>),
        )}
      </Layer>
    </Column>
  );
}

/** What the strip shows, read out. */
function title(n: Notice): string {
  const r = read(n);
  if (r.kind === "closure") return `The ${r.line.name} line from ${r.from} to ${r.to}: no ${r.line.vehicle}s between them, and bus ${r.change.bus.route} beside it.`;
  if (r.kind === "skip") return `The ${r.line.name} line through ${r.change.stop}, where ${r.line.vehicle}s don't stop, and a walk to ${r.change.useInstead}.`;
  return `${r.line.name} line ${r.line.vehicle}s through the evening: every ${r.line.every} minutes until ${r.change.after}, then every ${r.change.everyMinutes} until the last at ${r.change.lastTrain}.`;
}

/** The strip for a notice: its stretch of line, or for fewer trains, its evening. */
export function Strip({ n, width }: { n: Notice; width: number }) {
  return read(n).kind === "reduced" ? <Departures n={n} width={width} /> : <LineStrip n={n} width={width} />;
}
