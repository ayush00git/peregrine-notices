/**
 * The words. The templates write every sentence a rider reads from the facts, so the email, the posters and the card
 * say the same thing the same way, and nobody types "customers are advised of disruption" at 6pm on a Thursday.
 */
import { formatDate } from "@hyper-elements/react/template";
import { lineById, STATIONS, walkBetween, type Line, type LineId } from "./network.ts";

export interface Closure {
  type: string;
  from: string;
  to: string;
  bus: { route: string; everyMinutes: number };
  stepFree: string;
  lastTrainBefore: string;
  firstTrainAfter: string;
}
export interface Skip {
  type: string;
  stop: string;
  useInstead: string;
  stepFree: string;
  lastTrainBefore: string;
  firstTrainAfter: string;
}
export interface Reduced {
  type: string;
  after: string;
  everyMinutes: number;
  lastTrain: string;
}
export interface Notice {
  notice: string;
  posted: string;
  starts: string;
  ends: string;
  change: readonly (Closure | Skip | Reduced)[];
  extraMinutes: number;
  reason: string;
  here?: string;
}

export type Read =
  | { kind: "closure"; line: Line; change: Closure; from: string; to: string }
  | { kind: "skip"; line: Line; change: Skip }
  | { kind: "reduced"; line: Line; change: Reduced };

const LOCALE = "en-GB";
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

/** The notice's one change, with its line, and a closure's ends in line order. */
export function read(n: Notice): Read {
  const change = n.change[0]!;
  const [id, kind] = change.type.split(".") as [LineId, "closure" | "skip" | "reduced"];
  const line = lineById(id);
  if (kind === "closure") {
    const c = change as Closure;
    const [from, to] = [c.from, c.to].sort((a, b) => line.stops.indexOf(a) - line.stops.indexOf(b)) as [string, string];
    return { kind, line, change: c, from, to };
  }
  return kind === "skip" ? { kind, line, change: change as Skip } : { kind, line, change: change as Reduced };
}

/** What only several fields together can say is wrong. The templates' render() throws it, in a planner's words. */
export function assertNotice(n: Notice): void {
  const r = read(n);
  if (n.ends < n.starts) throw new Error(`The works end (${n.ends}) before they start (${n.starts})`);
  const notice = (Date.parse(n.starts) - Date.parse(n.posted)) / 86_400_000;
  if (notice < 7)
    throw new Error(`Posted ${n.posted}, ${notice} days before the works start on ${n.starts}: riders need at least 7 days' notice`);
  if (r.kind === "closure" && r.from === r.to) throw new Error(`From and To are both ${r.from}: a closure runs between two stops`);
  if (r.kind === "skip" && r.change.useInstead === r.change.stop)
    throw new Error(`Use instead is ${r.change.stop}, the stop ${r.line.vehicle}s skip`);
  if (r.kind === "skip" && [r.line.stops[0], r.line.stops.at(-1)].includes(r.change.stop)) {
    const next = r.line.stops[0] === r.change.stop ? r.line.stops[1] : r.line.stops.at(-2);
    throw new Error(`${r.change.stop} is the end of the ${r.line.name} line, so ${r.line.vehicle}s can't skip it: write it as a closure from ${next} to ${r.change.stop}`);
  }
  if (r.kind === "reduced" && r.change.everyMinutes <= r.line.every)
    throw new Error(`A ${r.line.vehicle} every ${r.change.everyMinutes} minutes isn't fewer: the ${r.line.name} line runs every ${r.line.every} minutes`);
  if (n.here !== undefined && !affectedStops(n).includes(n.here))
    throw new Error(`${n.here} gets no poster for this change: posters go up at ${affectedStops(n).join(", ")}`);
}

/** The stops that get a poster: a closure's whole stretch, a skip's two stops, or every stop of a reduced line. */
export function affectedStops(n: Notice): string[] {
  const r = read(n);
  if (r.kind === "closure") return r.line.stops.slice(r.line.stops.indexOf(r.from), r.line.stops.indexOf(r.to) + 1);
  if (r.kind === "skip") return [r.change.stop, r.change.useInstead];
  return [...r.line.stops];
}

/** The headline: a verb phrase (one line) and where (one or two lines, broken where we say). */
export function headline(n: Notice): { verb: string; where: string[] } {
  const r = read(n);
  const vehicles = `${r.line.vehicle}s`;
  if (r.kind === "closure") return { verb: `No ${vehicles}`, where: [`between ${r.from}`, `and ${r.to}`] };
  if (r.kind === "skip") return { verb: `${cap(vehicles)} skip`, where: [r.change.stop] };
  return { verb: `Fewer ${vehicles}`, where: [`after ${r.change.after},`, `every ${r.change.everyMinutes} minutes`] };
}

/** ["Sat 9 – Mon 11 January"]: the dates, as a poster says them; a range across two months takes two lines. */
export function when(n: Notice): string[] {
  const day = (d: string) => formatDate(d, LOCALE, { weekday: "short", day: "numeric" });
  const month = (d: string) => formatDate(d, LOCALE, { month: "long" });
  if (n.starts === n.ends) return [`${day(n.starts)} ${month(n.starts)}`];
  if (month(n.starts) === month(n.ends)) return [`${day(n.starts)} – ${day(n.ends)} ${month(n.ends)}`];
  return [`${day(n.starts)} ${month(n.starts)} –`, `${day(n.ends)} ${month(n.ends)}`];
}

const shift = (date: string, days: number) => new Date(Date.parse(date) + days * 86_400_000).toISOString().slice(0, 10);
const weekday = (d: string) => formatDate(d, LOCALE, { weekday: "short" });

/**
 * The edges of the works, which strand people when they're left out, as rows of a little timetable:
 * [["Last train", "Fri 22:10"], ["First train", "Tue 05:30"]].
 */
export function edges(n: Notice): [string, string][] {
  const r = read(n);
  const v = r.line.vehicle;
  if (r.kind === "reduced") return [[`Last ${v}`, `${r.change.lastTrain} each night`]];
  return [
    [`Last ${v}`, `${weekday(shift(n.starts, -1))} ${r.change.lastTrainBefore}`],
    [`First ${v}`, `${weekday(shift(n.ends, 1))} ${r.change.firstTrainAfter}`],
  ];
}

/** What to do instead, in order. The step-free way is always last, and always there. */
export function steps(n: Notice): { label?: string; text: string }[] {
  const r = read(n);
  const allow = { text: `Allow ${n.extraMinutes} minutes more for your journey.` };
  if (r.kind === "closure") {
    return [
      { text: `Take bus ${r.change.bus.route} between ${r.from} and ${r.to}. It runs every ${r.change.bus.everyMinutes} minutes and stops outside each station.` },
      allow,
      { label: "Step-free", text: r.change.stepFree },
    ];
  }
  if (r.kind === "skip") {
    const walk = walkBetween(r.line, r.change.stop, r.change.useInstead);
    return [
      { text: `Use ${r.change.useInstead} instead: ${walk} minutes' walk from ${r.change.stop}.` },
      allow,
      { label: "Step-free", text: r.change.stepFree },
    ];
  }
  return [
    { text: `After ${r.change.after}, a ${r.line.vehicle} every ${r.change.everyMinutes} minutes, until the last at ${r.change.lastTrain}.` },
    allow,
  ];
}

/** What the poster at one stop says first, under the headline: what this change means here. */
export function status(n: Notice, stop: string): { lines: string[]; note: string } {
  const r = read(n);
  const vehicles = `${r.line.vehicle}s`;
  if (r.kind === "closure") {
    const [first, last] = [r.line.stops[0]!, r.line.stops[r.line.stops.length - 1]!];
    if (stop === r.from && stop !== first) return { lines: [`${cap(vehicles)} towards ${first}`, "run as normal"], note: `Bus ${r.change.bus.route} stops at ${STATIONS[stop]!.bus}.` };
    if (stop === r.to && stop !== last) return { lines: [`${cap(vehicles)} towards ${last}`, "run as normal"], note: `Bus ${r.change.bus.route} stops at ${STATIONS[stop]!.bus}.` };
    return { lines: [`No ${vehicles}`, `at ${stop}`], note: `Bus ${r.change.bus.route} stops at ${STATIONS[stop]!.bus}.` };
  }
  if (r.kind === "skip") {
    const walk = walkBetween(r.line, r.change.stop, r.change.useInstead);
    if (stop === r.change.stop) return { lines: [`No ${vehicles}`, `at ${stop}`], note: `Use ${r.change.useInstead}, ${walk} minutes' walk.` };
    return { lines: [`${cap(vehicles)} skip`, r.change.stop], note: `For ${r.change.stop}, get off here: ${walk} minutes' walk.` };
  }
  return { lines: [`Fewer ${vehicles}`, `after ${r.change.after}`], note: `Until ${r.change.after}, a ${r.line.vehicle} every ${r.line.every} minutes as usual.` };
}
