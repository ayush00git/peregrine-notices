/**
 * The line, drawn for an email in table cells: no images and no Svg (an email can't draw one, and a picture of the
 * line is gone with images off). Every stop is a row exactly 36px tall with its tick 15px down, and every row has a
 * cell its full height, so the bar runs on from row to row without a seam in classic Outlook, Gmail and the Gmail
 * app. The grammar is the posters' and the card's: solid, trains run; hollow (two 2px edges round 2px of Enamel), no
 * trains; dashed, the replacement bus, in a lane of its own beside the closed stretch, its route in a small Ink chip.
 *
 * A reduced service doesn't change the map, so it also gets its evening drawn as time: a tick for each train, close
 * together up to the change, far apart after it, and none after the last.
 */
import type { ReactNode } from "react";
import { Column, Html, Row, Text } from "@hyper-elements/react";
import { ENAMEL, INK, MONO_STACK, QUIET, label } from "./brand.ts";
import { read, status, type Notice } from "./copy.ts";
import { EMAIL } from "./type.ts";

const ROW = 36; // a stop's row
const BAND = 15; // from a row's top to its tick
const TICK = 6; // a tick's thickness, and the bar's width
const ARM = 8; // a terminus's cross-bar, left of the bar
const REACH = 12; // a stop's tick, right of the bar
const EDGE = 2; // a hollow bar's edges, and the bus's dashes
const LANE = 40; // the bus's lane, its dashes down the middle
const GAP = 12; // between the lane and the line, and the line and the names
const INSET = LANE / 2 - EDGE / 2; // from the lane's left to its dashes

type Seg = "none" | "solid" | "hollow";
interface Stop {
  name: string;
  /** The bar above the tick, and below it. */
  top: Seg;
  bottom: Seg;
  /** Trains call here: a solid tick, else a hollow one. */
  served: boolean;
  terminus: boolean;
  /** One of the stops the change is about: set in Ink. */
  affected: boolean;
  /** Said under the stop, on a row of its own. */
  note?: string;
  /** The bus's lane beside this row: its dashes above the stop and below it, and whether its route's chip is here. */
  bus?: { above: boolean; below: boolean; route: boolean };
}

/** The line, stop by stop, from the notice. */
function stops(n: Notice): Stop[] {
  const r = read(n);
  const names = r.line.stops;
  const [a, b] = r.kind === "closure" ? [names.indexOf(r.from), names.indexOf(r.to)] : [-1, -1];
  // The bar between stop i and the next.
  const link = (i: number): Seg => (i < 0 || i >= names.length - 1 ? "none" : i >= a && i < b ? "hollow" : "solid");
  // The bus's chip: on the middle stop of the stretch (its first, for a stretch of two).
  const route = Math.floor((a + b) / 2);
  return names.map((name, i) => {
    const [top, bottom] = [link(i - 1), link(i)];
    const skipped = r.kind === "skip" && name === r.change.stop;
    return {
      name,
      top,
      bottom,
      served: !skipped && (top === "solid" || bottom === "solid"),
      terminus: i === 0 || i === names.length - 1,
      affected: r.kind === "closure" ? i >= a && i <= b : r.kind === "skip" ? skipped || name === r.change.useInstead : true,
      ...(skipped ? { note: status(n, name).note } : {}),
      ...(r.kind === "closure" && i >= a && i <= b ? { bus: { above: i > a, below: i < b, route: i === route } } : {}),
    } satisfies Stop;
  });
}

const edge = (colour: string) => `${EDGE}px solid ${colour}`;
const fill = (seg: Seg, colour: string) =>
  seg === "solid"
    ? { backgroundColor: colour }
    : seg === "hollow"
      ? { backgroundColor: ENAMEL, border: { left: edge(colour), right: edge(colour) } }
      : {};

/** The bar through one row: one cell, or two where it changes at the stop. */
function bar(stop: Stop, colour: string) {
  const { top, bottom } = stop;
  if (top === bottom) return <Column style={{ width: TICK, height: ROW, ...fill(top, colour) }} />;
  // The solid part keeps the tick's band, so a stop the trains reach has a solid joint; at a line's end, the bar
  // runs to the foot of the cross-bar.
  const split = top === "solid" || bottom === "none" ? BAND + TICK : BAND;
  // A hollow end of the line is closed off at its stop by one more edge.
  const part = (seg: Seg, height: number, end: "top" | "bottom") =>
    seg === "hollow" && stop.terminus ? (
      <Column style={{ height: height - EDGE, backgroundColor: ENAMEL, border: { left: edge(colour), right: edge(colour), [end]: edge(colour) } }} />
    ) : (
      <Column style={{ height, ...fill(seg, colour) }} />
    );
  // Both parts, always: a row whose cells are all shorter than it is centred in it, a pixel or two below the last.
  return (
    <Column style={{ width: TICK }}>
      {part(top, split, "bottom")}
      {part(bottom, ROW - split, "top")}
    </Column>
  );
}

/** A tick off the bar: right of it, or (a terminus's cross-bar) left of it too. Solid where trains call, else hollow. */
function tick(stop: Stop, colour: string, side: "left" | "right") {
  const width = side === "right" ? REACH : ARM;
  if (stop.served) return <Column style={{ width, height: BAND, border: { bottom: `${TICK}px solid ${colour}` } }} />;
  return (
    <Column style={{ width }}>
      <Column style={{ height: BAND, border: { bottom: edge(colour) } }} />
      <Column style={{ height: TICK - 2 * EDGE, border: { bottom: edge(colour), [side]: edge(colour) } }} />
    </Column>
  );
}

/**
 * The bus's route in an Ink chip on its dashes: one table cell of HTML, written out, so that the plain-text version
 * (which lists the stops in order) doesn't read "1X" as one of them. A route is digits and a letter (the field's
 * pattern), so nothing in it needs escaping.
 */
function chip(route: string) {
  const width = route.length * 9 + 10;
  const style = [
    `width:${width}px`,
    `background-color:${INK}`,
    `color:${ENAMEL}`,
    `font-family:${MONO_STACK}`,
    "font-size:13px;font-weight:700;letter-spacing:1.2px",
    "line-height:16px;mso-line-height-rule:exactly;padding:3px 0;text-align:center",
  ].join(";");
  const cell = `<td width="${width}" align="center" bgcolor="${INK}" style="${style}">${route}</td>`;
  return <Html text="" html={`<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${cell}</tr></table>`} />;
}

/** The bus's lane beside one row: its dashes, from the stop it starts at to the one it ends at, and its chip. */
function lane(bus: NonNullable<Stop["bus"]>, route: string, terminus: boolean) {
  const dash = `${EDGE}px dashed ${QUIET}`;
  if (bus.route) {
    // A 22px chip, centred on the row, with a dash above it and below where the lane goes on: 34px, 2px short of
    // the row, as the names are.
    const stub = (on: boolean, height: number) => <Column style={{ width: EDGE, height, ...(on ? { backgroundColor: QUIET } : {}) }} />;
    return (
      <Column style={{ width: LANE + GAP + (terminus ? 0 : ARM) }}>
        <Column style={{ width: LANE, alignItems: "center" }}>
          {stub(bus.above, 7)}
          {chip(route)}
          {stub(bus.below, 5)}
        </Column>
      </Column>
    );
  }
  // Elsewhere the row starts at the dashes (INSET), and the cell's left edge is them.
  const width = LANE - INSET + GAP + (terminus ? 0 : ARM);
  if (bus.above) return <Column style={{ width, height: bus.below ? ROW : ROW / 2, border: { left: dash } }} />;
  return (
    <Column style={{ width }}>
      <Column style={{ height: ROW / 2 }} />
      <Column style={{ height: ROW / 2, border: { left: dash } }} />
    </Column>
  );
}

// Text in a row is placed by its padding, not its line height (classic Outlook puts all of a line's leading above
// the words), and is 4px short of the row, so a client that sets the line a little taller can't make the row
// taller than its bar.
const inRow = (left: number) => ({ lineHeight: "20px" as const, padding: [8, 0, 4, left] as [number, number, number, number] });

/** Every stop of the notice's line, in order, the ones it changes in Ink. */
export function LineDiagram({ notice }: { notice: Notice }) {
  const r = read(notice);
  const colour = r.line.colour;
  const route = r.kind === "closure" ? r.change.bus.route : "";
  const rows: ReactNode[] = [];
  for (const stop of stops(notice)) {
    // Each row starts where its first cell does: the lane's chip, the lane's dashes, the cross-bar, or the bar.
    const inset = stop.bus ? (stop.bus.route ? 0 : INSET) : (r.kind === "closure" ? LANE + GAP : 0) + (stop.terminus ? 0 : ARM);
    rows.push(
      <Row key={stop.name} stackOnMobile={false} style={{ height: ROW, padding: [0, 0, 0, inset] }}>
        {stop.bus ? lane(stop.bus, route, stop.terminus) : null}
        {stop.terminus ? tick(stop, colour, "left") : null}
        {bar(stop, colour)}
        {tick(stop, colour, "right")}
        <Text style={{ fontSize: EMAIL.stop, fontWeight: stop.affected ? 700 : 400, color: stop.affected ? INK : QUIET, ...inRow(GAP) }}>
          {stop.name}
        </Text>
      </Row>,
    );
    if (stop.note) {
      rows.push(
        <Row key={`${stop.name} note`} stackOnMobile={false} style={{ height: ROW, padding: [0, 0, 0, ARM] }}>
          <Column style={{ width: TICK, height: ROW, ...fill(stop.bottom, colour) }} />
          <Text style={{ fontSize: EMAIL.edges, color: QUIET, ...inRow(REACH + GAP) }}>{stop.note}</Text>
        </Row>,
      );
    }
  }
  return <Column>{rows}</Column>;
}

const clock = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const hhmm = (minutes: number) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/**
 * A reduced service's evening as a strip, from three hours before the change to the hour after the last train: a
 * tick for each train, at the line's usual frequency up to the change, at the new one until the last, then none.
 */
export function Departures({ notice }: { notice: Notice }) {
  const r = read(notice);
  if (r.kind !== "reduced") return null;
  const after = clock(r.change.after);
  const last = clock(r.change.lastTrain) + (clock(r.change.lastTrain) < after ? 1440 : 0);
  const start = after - 180;
  const end = Math.max(after + 180, Math.ceil((last + 30) / 60) * 60);
  // The usual trains count back from the change, so the last of them is a whole interval before it.
  const times: number[] = [];
  for (let t = after - r.line.every; t >= start; t -= r.line.every) times.unshift(t);
  for (let t = after; t < last; t += r.change.everyMinutes) times.push(t);
  times.push(last);
  // Widths in percent, not shares: an email's phone styles keep a percentage, and can turn a share into "auto".
  const share = (from: number, to: number) => ({ width: `${(((to - from) / (end - start)) * 100).toFixed(2)}%` as `${number}%` });
  const mark = { ...label(13, QUIET), lineHeight: 1.3 };
  // The last train's time ends at its tick; where it's too near the change to fit, the timetable above says it.
  const mid = (after + last) / 2;
  const roomy = (last - after) / (end - start) >= 0.3;
  return (
    <Column style={{ gap: 8 }}>
      <Row stackOnMobile={false}>
        <Text style={{ ...mark, ...share(start, after) }}>{`Every ${r.line.every} min`}</Text>
        <Text style={{ ...mark, color: INK, ...share(after, end) }}>{`Every ${r.change.everyMinutes} min`}</Text>
      </Row>
      <Row stackOnMobile={false} style={{ height: 28, border: { bottom: edge(INK) } }}>
        {times[0]! > start ? <Column style={{ height: 28, ...share(start, times[0]!) }} /> : null}
        {times.map((t, i) => (
          <Column key={t} style={{ height: 28, ...share(t, times[i + 1] ?? end), border: { left: edge(INK) } }} />
        ))}
      </Row>
      <Row stackOnMobile={false}>
        <Text style={{ ...mark, ...share(start, after) }}>{hhmm(start)}</Text>
        <Text style={{ ...mark, color: INK, ...share(after, roomy ? mid : end) }}>{hhmm(after)}</Text>
        {roomy ? <Text style={{ ...mark, color: INK, textAlign: "right", ...share(mid, last) }}>{hhmm(last)}</Text> : null}
        {roomy ? <Column style={share(last, end)} /> : null}
      </Row>
    </Column>
  );
}
