/**
 * Peregrine service change email: generated from the peregrine-notices repository (templates/notice-email.tsx and the kit it imports),
 * as one file for the Hyper Elements gallery. The template is T; this file's default export draws its example.
 */
import { Button, Column, defineTheme, Email, Heading, Html, LineBreak, Link, prop, Row, Section, Span, Table, TableCell, TableRow, Text } from "@hyper-elements/react";
import { formatDate, template } from "@hyper-elements/react/template";
import { type ReactNode } from "react";

export const meta = {
  title: "Peregrine service change email",
  description: "A rider alert for a line closure: the change on the line's colour, what to do instead, and the line drawn in table cells, so it shows with images off.",
  root: "Email"
};

// templates/_kit/network.ts
/**
 * The Peregrine network: the trams and trains of Port Ellery, a fictional harbour city.
 *
 * This is the templates' own data, not a field: a planner names stops, and the network says which line they're on,
 * in what order, whether each is step-free, where its replacement buses stop and how far it is to walk to the next.
 * Not a transit operator? Swap this file for your ferries, shuttles, gates or lifts and keep the rest.
 */

type LineId = "harbour" | "moor" | "viaduct" | "airport" | "coast";

interface Line {
  id: LineId;
  /** As riders say it: "the Harbour line". */
  name: string;
  vehicle: "train" | "tram";
  /** The line's colour. Each notice uses one: its line's. */
  colour: string;
  /** Stops in order, from one end of the line to the other. */
  stops: readonly string[];
  /** Minutes to walk between each stop and the next (one fewer than the stops). */
  walk: readonly number[];
  /** A normal service: a train every this many minutes. */
  every: number;
}

interface Station {
  /** Lift or level access from street to platform. */
  stepFree: boolean;
  /** Where replacement buses stop, as a rider would look for it. */
  bus: string;
}

const LINES: readonly Line[] = [
  {
    id: "harbour",
    name: "Harbour",
    vehicle: "train",
    colour: "#00756B",
    stops: ["Ellery Central", "Ropewalk", "Quayside", "Chandlers Yard", "Saltmarket", "Castle Street", "Millbrook", "Bellfield", "Lantern Hill"],
    walk: [9, 8, 7, 6, 8, 12, 10, 11],
    every: 10,
  },
  {
    id: "moor",
    name: "Moor",
    vehicle: "train",
    colour: "#C53D1B",
    stops: ["Ellery Central", "Tannery Lane", "Saltmarket", "Kiln Row", "Moorside", "High Moor"],
    walk: [10, 7, 7, 9, 14],
    every: 12,
  },
  {
    id: "viaduct",
    name: "Viaduct",
    vehicle: "tram",
    colour: "#5E35A6",
    stops: ["Ellery Central", "Wool Exchange", "Arches", "Viaduct Road", "Brickfields", "Fairhaven Park"],
    walk: [6, 5, 6, 7, 9],
    every: 8,
  },
  {
    id: "airport",
    name: "Airport",
    vehicle: "train",
    colour: "#1A55C2",
    stops: ["Ellery Central", "Ropewalk", "Marsh Lane", "Ellery Airport"],
    walk: [9, 20, 25],
    every: 15,
  },
  {
    id: "coast",
    name: "Coast",
    vehicle: "tram",
    colour: "#3B7530",
    stops: ["Quayside", "Breakwater", "Seaholme", "Gull Point", "Ellery Sands"],
    walk: [9, 11, 10, 12],
    every: 12,
  },
];

const STATIONS: Readonly<Record<string, Station>> = {
  "Ellery Central": { stepFree: true, bus: "Station Square, stand C" },
  Ropewalk: { stepFree: false, bus: "Rope Lane, by the chandlery" },
  Quayside: { stepFree: true, bus: "Quay Parade, stop Q2" },
  "Chandlers Yard": { stepFree: false, bus: "Chandlers Row, outside the fire station" },
  Saltmarket: { stepFree: true, bus: "Dock Street, outside the Mission" },
  "Castle Street": { stepFree: false, bus: "Castle Street, opposite the library" },
  Millbrook: { stepFree: true, bus: "Mill Road, by the post office" },
  Bellfield: { stepFree: true, bus: "Bellfield Road, stop B1" },
  "Lantern Hill": { stepFree: false, bus: "Hill Top, at the turning circle" },
  "Tannery Lane": { stepFree: true, bus: "Tannery Lane, outside the works" },
  "Kiln Row": { stepFree: false, bus: "Kiln Row, by the chapel" },
  Moorside: { stepFree: true, bus: "Moorside Green, stop M3" },
  "High Moor": { stepFree: true, bus: "High Moor Road, at the terminus" },
  "Wool Exchange": { stepFree: true, bus: "Exchange Street, stand W" },
  Arches: { stepFree: true, bus: "Arches Lane, under the viaduct" },
  "Viaduct Road": { stepFree: false, bus: "Viaduct Road, outside the baths" },
  Brickfields: { stepFree: true, bus: "Brickfields Way, stop V5" },
  "Fairhaven Park": { stepFree: true, bus: "Park Gates, Fairhaven Road" },
  "Marsh Lane": { stepFree: true, bus: "Marsh Lane, at the level crossing" },
  "Ellery Airport": { stepFree: true, bus: "Terminal forecourt, bay 4" },
  Breakwater: { stepFree: true, bus: "Harbour Wall, stop C1" },
  Seaholme: { stepFree: false, bus: "Seaholme Parade, by the clock" },
  "Gull Point": { stepFree: true, bus: "Point Road, at the lifeboat station" },
  "Ellery Sands": { stepFree: true, bus: "Sands Promenade, stop C5" },
};

const lineById = (id: LineId): Line => LINES.find((line) => line.id === id)!;

/** Every stop on the network, once each, in the order the lines name them. */
const ALL_STOPS: readonly string[] = [...new Set(LINES.flatMap((line) => line.stops))];

/** The other lines that call at a stop. */
const interchanges = (stop: string, line: Line): Line[] =>
  LINES.filter((other) => other.id !== line.id && other.stops.includes(stop));

/** Minutes to walk between two stops of a line, along it. */
const walkBetween = (line: Line, a: string, b: string): number => {
  const [i, j] = [line.stops.indexOf(a), line.stops.indexOf(b)].sort((x, y) => x - y);
  return line.walk.slice(i, j).reduce((sum, minutes) => sum + minutes, 0);
};

// templates/_kit/brand.ts
/**
 * Peregrine's look, once. Public information, so legibility first: a cool sign white (not cream), near-black ink, one
 * colour per notice (its line's), square corners, and Atkinson Hyperlegible, the Braille Institute's typeface for
 * low-vision readers, because a closure notice is read at a stop, in the rain, by everyone.
 */

const ENAMEL = "#F7F7F4";
const INK = "#111417";
const QUIET = "#596069";
const RULE = "#D8DBD6";
const CONCRETE = "#E6E8E3";
/** Words on a line's colour. */
const WHITE = "#FFFFFF";

const SANS = "Atkinson Hyperlegible Next";
const MONO = "Atkinson Hyperlegible Mono";
/** For an email or a page, where the fonts may not load: Verdana is about as wide, so nothing set for Atkinson overflows. */
const SANS_STACK = `${SANS}, Verdana, Arial, sans-serif`;
const MONO_STACK = `${MONO}, Menlo, Consolas, monospace`;

const NEXT = "https://fonts.gstatic.com/s/atkinsonhyperlegiblenext/v7/NaP4cYPdHfdVxJw0IfIP0lvYFqijb-UxCtm5_wdGscKFt4tOOfV4";
const MONO_URL = "https://fonts.gstatic.com/s/atkinsonhyperlegiblemono/v8/tssNAoFBci4C4gvhPXrt3wjT1MqSzhA4t7IIcncBiyihrK15gZ4k_";

/** Static TTFs from Google Fonts (SIL Open Font License): full character sets, one file per weight. */
const FONTS = [
  { family: SANS, src: `${NEXT}ZmW37LQhtA.ttf`, weight: 400 },
  { family: SANS, src: `${NEXT}ZmW3C7MhtA.ttf`, weight: 700 },
  { family: SANS, src: `${NEXT}ZmW3bLMhtA.ttf`, weight: 800 },
  { family: MONO, src: `${MONO_URL}SaZLteiDQ.ttf`, weight: 500 },
  { family: MONO, src: `${MONO_URL}SaZ-9CiDQ.ttf`, weight: 700 },
];

const theme = defineTheme({
  colors: { background: ENAMEL, foreground: INK, primary: INK, primaryForeground: ENAMEL, muted: QUIET, border: RULE },
  fonts: { body: SANS_STACK, heading: SANS_STACK },
  elements: {
    Heading: { fontWeight: 800, letterSpacing: -0.5 },
    Button: { borderRadius: 0, fontWeight: 700 },
  },
});

/** A label: Atkinson Mono, capitals, spaced. */
const label = (size: number, color = QUIET) =>
  ({ fontFamily: MONO_STACK, fontSize: size, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color, lineHeight: 1.3 }) as const;

// templates/_kit/type.ts
/**
 * Type sizes and measures, shared by the templates and by the test that proves every line the network can produce
 * fits its measure (test/headlines.test.ts). Change a size here and the test re-measures every headline at it.
 */

const A4_WIDTH = (210 / 25.4) * 96; // 793.7px

const POSTER = {
  margin: 40,
  panelPadding: 32,
  /** The text measure inside the colour panel. */
  measure: A4_WIDTH - 2 * 40 - 2 * 32,
  verb: 96,
  where: 48,
  when: 28,
  status: 28,
  edges: 20,
  body: 17,
  small: 12,
} as const;

const EMAIL = {
  width: 600,
  padding: 48,
  measure: 600 - 2 * 48,
  phone: { width: 375, padding: 24, measure: 375 - 2 * 24 },
  verb: 56,
  where: 32,
  when: 15,
  edges: 15,
  stop: 17,
  phoneVerb: 40,
  phoneWhere: 22,
  phoneWhen: 13,
} as const;

const CARD = {
  width: 1200,
  height: 675,
  padding: 64,
  measure: 1200 - 2 * 64,
  verb: [128, 112, 96],
  where: [64, 56, 48],
  when: 28,
} as const;

/** A headline's tracking: -1.5% of its size. */
const tight = (size: number) => ({ fontSize: size, letterSpacing: -0.015 * size, lineHeight: size >= 72 ? 0.95 : 1 }) as const;

/** The share of a measure a line may take: the rest is room for a fallback font that's a little wider. */
const HEADROOM = 0.9;

// templates/_kit/fields.ts
/**
 * The notice: what a planner (or an agent reading the works schedule) fills in. It's the same for the email, the
 * posters and the card, so one brief makes all three.
 *
 * The change is one block, and its type names the line: `harbour.closure`, `moor.skip`, `viaduct.reduced`… Each
 * type's stops are a choice of that line's own stops, so a stop on another line can't be written, and an agent
 * reading the JSON Schema can't produce one.
 */


const TIME = "^([01]\\d|2[0-3]):[0-5]\\d$";
const time = (label: string) => prop.text({ label: `${label} (24-hour, like 23:40)`, required: true, pattern: TIME });
const stopOf = (line: Line, label: string) =>
  prop.choice([...line.stops], { label: `${label} (a ${line.name} line stop)`, required: true });
// No `guidance` here: check() lists a field's guidance once per block type, used or not (15 types), so the hint is
// in the label, which is also what a refusal names.
const stepFree = (label: string) =>
  prop.text({ label: `${label} (which stop, bus or lift)`, required: true, maxLength: 120 });

const kinds = (line: Line) => {
  const vehicles = `${line.vehicle}s`;
  return {
    [`${line.id}.closure`]: prop.object(
      {
        from: stopOf(line, "From"),
        to: stopOf(line, "To"),
        bus: prop.object(
          {
            route: prop.text({ label: "Bus route (like 1X)", required: true, pattern: "^\\d{1,2}[A-Z]?$" }),
            everyMinutes: prop.number({ label: "Bus every (minutes)", required: true, min: 5, max: 30, integer: true }),
          },
          { label: "Replacement bus", required: true },
        ),
        stepFree: stepFree("Step-free way through"),
        lastTrainBefore: time(`Last ${line.vehicle} before`),
        firstTrainAfter: time(`First ${line.vehicle} after`),
      },
      { label: `${line.name} line: no ${vehicles} between two stops` },
    ),
    [`${line.id}.skip`]: prop.object(
      {
        stop: stopOf(line, "Skipped stop"),
        useInstead: stopOf(line, "Use instead"),
        stepFree: stepFree("Step-free alternative"),
        lastTrainBefore: time(`Last ${line.vehicle} calling before`),
        firstTrainAfter: time(`First ${line.vehicle} calling after`),
      },
      { label: `${line.name} line: ${vehicles} skip a stop` },
    ),
    [`${line.id}.reduced`]: prop.object(
      {
        after: time("From"),
        everyMinutes: prop.number({ label: `A ${line.vehicle} every (minutes)`, required: true, min: 10, max: 60, integer: true }),
        lastTrain: time(`Last ${line.vehicle}`),
      },
      { label: `${line.name} line: fewer ${vehicles} after a time` },
    ),
  };
};

/** Every change a notice can describe: one closure, skip and reduced service per line. */
const CHANGE_TYPES = Object.assign({}, ...LINES.map(kinds)) as Record<string, ReturnType<typeof prop.object>>;

const FIELDS = {
  notice: prop.text({ label: "Notice number (like PE-2701)", required: true, pattern: "^PE-\\d{4}$" }),
  posted: prop.date({ label: "Posted on", required: true }),
  starts: prop.date({ label: "First day of the works", required: true }),
  ends: prop.date({ label: "Last day of the works", required: true }),
  change: prop.blocks(CHANGE_TYPES, { label: "Change", required: true, min: 1, max: 1 }),
  extraMinutes: prop.number({ label: "Extra minutes to allow", required: true, min: 0, max: 60, integer: true }),
  reason: prop.text({
    label: "Why (one sentence)",
    required: true,
    maxLength: 140,
    guidance:
      "One plain sentence: what the work is and what riders get from it. No 'essential engineering works', no blame, no promises about dates we don't control.",
  }),
};

/** PE-2701: the Harbour line closes between Quayside and Millbrook for a weekend in January. */
const EXAMPLE = {
  notice: "PE-2701",
  posted: "2026-12-14",
  starts: "2027-01-09",
  ends: "2027-01-11",
  change: [
    {
      type: "harbour.closure",
      from: "Quayside",
      to: "Millbrook",
      bus: { route: "1X", everyMinutes: 10 },
      stepFree: "Bus 1X is step-free, and so are Quayside, Saltmarket and Millbrook stations.",
      lastTrainBefore: "22:10",
      firstTrainAfter: "05:30",
    },
  ],
  extraMinutes: 20,
  reason: "We're renewing the track and signals under Castle Street, so trains can run every six minutes from March.",
};

// templates/_kit/copy.ts
/**
 * The words. The templates write every sentence a rider reads from the facts, so the email, the posters and the card
 * say the same thing the same way, and nobody types "customers are advised of disruption" at 6pm on a Thursday.
 */


interface Closure {
  type: string;
  from: string;
  to: string;
  bus: { route: string; everyMinutes: number };
  stepFree: string;
  lastTrainBefore: string;
  firstTrainAfter: string;
}
interface Skip {
  type: string;
  stop: string;
  useInstead: string;
  stepFree: string;
  lastTrainBefore: string;
  firstTrainAfter: string;
}
interface Reduced {
  type: string;
  after: string;
  everyMinutes: number;
  lastTrain: string;
}
interface Notice {
  notice: string;
  posted: string;
  starts: string;
  ends: string;
  change: readonly (Closure | Skip | Reduced)[];
  extraMinutes: number;
  reason: string;
  here?: string;
}

type Read =
  | { kind: "closure"; line: Line; change: Closure; from: string; to: string }
  | { kind: "skip"; line: Line; change: Skip }
  | { kind: "reduced"; line: Line; change: Reduced };

const LOCALE = "en-GB";
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

/** The notice's one change, with its line, and a closure's ends in line order. */
function read(n: Notice): Read {
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
function assertNotice(n: Notice): void {
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
function affectedStops(n: Notice): string[] {
  const r = read(n);
  if (r.kind === "closure") return r.line.stops.slice(r.line.stops.indexOf(r.from), r.line.stops.indexOf(r.to) + 1);
  if (r.kind === "skip") return [r.change.stop, r.change.useInstead];
  return [...r.line.stops];
}

/** The headline: a verb phrase (one line) and where (one or two lines, broken where we say). */
function headline(n: Notice): { verb: string; where: string[] } {
  const r = read(n);
  const vehicles = `${r.line.vehicle}s`;
  if (r.kind === "closure") return { verb: `No ${vehicles}`, where: [`between ${r.from}`, `and ${r.to}`] };
  if (r.kind === "skip") return { verb: `${cap(vehicles)} skip`, where: [r.change.stop] };
  return { verb: `Fewer ${vehicles}`, where: [`after ${r.change.after},`, `every ${r.change.everyMinutes} minutes`] };
}

/** ["Sat 9 – Mon 11 January"]: the dates, as a poster says them; a range across two months takes two lines. */
function when(n: Notice): string[] {
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
function edges(n: Notice): [string, string][] {
  const r = read(n);
  const v = r.line.vehicle;
  if (r.kind === "reduced") return [[`Last ${v}`, `${r.change.lastTrain} each night`]];
  return [
    [`Last ${v}`, `${weekday(shift(n.starts, -1))} ${r.change.lastTrainBefore}`],
    [`First ${v}`, `${weekday(shift(n.ends, 1))} ${r.change.firstTrainAfter}`],
  ];
}

/** What to do instead, in order. The step-free way is always last, and always there. */
function steps(n: Notice): { label?: string; text: string }[] {
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
function status(n: Notice, stop: string): { lines: string[]; note: string } {
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

// templates/_kit/email-diagram.tsx
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
function LineDiagram({ notice }: { notice: Notice }) {
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
function Departures({ notice }: { notice: Notice }) {
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

// templates/notice-email.tsx
/**
 * Peregrine's rider alert: the email everyone who follows a line gets at least a week before its service changes.
 *
 * It's read on a phone on the way out of the door, so it says the change first and large, on a band of the line's
 * own colour, then what to do instead (numbered, the step-free way always last, then the last train before and the
 * first after), then the line itself, then why. Enamel, the cool white of a station sign, and Ink, with the line's
 * colour in three places only (the band, the line, the line's chip), so the eye goes where the change is; the
 * button and the links are Ink. Atkinson Hyperlegible, made by the Braille Institute for readers with low vision,
 * for the words, and its Mono for times, dates and labels. Square corners, like the signs.
 *
 * The motif is the line diagram the posters and the card draw too, here in table cells so it's there with images
 * off and in classic Outlook: every stop in order, solid where trains run, hollow where they don't, the bus dashed
 * beside the gap. A reduced service draws its evening as well, a tick for each train.
 */








const SITE = "https://peregrine.example";
/** A section's padding: 48px either side, 24px on phones, where its gap can be smaller too. */
type Insets = [number, number, number, number];
const sides = (top: number, bottom: number, phoneTop: number, phoneBottom: number, phoneGap?: number) => ({
  padding: [top, EMAIL.padding, bottom, EMAIL.padding] as Insets,
  mobile: { padding: [phoneTop, EMAIL.phone.padding, phoneBottom, EMAIL.phone.padding] as Insets, ...(phoneGap ? { gap: phoneGap } : {}) },
});
/** A section's label: Mono capitals over a 2px Ink rule. */
const heading = (text: string) => (
  <Heading level={2} style={{ ...label(13, INK), padding: [12, 0, 0], border: { top: `2px solid ${INK}` } }}>
    {text}
  </Heading>
);
/** A step's number, on a 26px Ink square: centred by padding, as Outlook would put a line height's leading above it. */
const tile = { width: 26, padding: [4, 0] as [number, number], textAlign: "center" as const, backgroundColor: INK };
const lines = (texts: string[]) => texts.flatMap((text, i) => (i ? [<LineBreak key={i} />, text] : [text]));

const T = template({
  id: "peregrine.NoticeEmail",
  version: "1.0.0",
  label: "Notice email",
  guidance: "Sent to riders who follow the line, at least 7 days before the change starts.",
  root: "Email",
  fields: FIELDS,
  rules: {
    require: { core: ["layout/overflow"] },
    links: { domains: ["peregrine.example"] },
    root: { lang: true, previewText: true },
  },
  example: EXAMPLE,
  render(values) {
    const n = values as unknown as Notice;
    assertNotice(n);
    const r = read(n);
    const h = headline(n);
    const vehicles = `${r.line.vehicle}s`;
    const line = `${r.line.name} line`;
    return (
      <Email
        width={EMAIL.width}
        theme={theme}
        lang="en-GB"
        fonts={FONTS}
        title={`${h.verb} ${h.where.join(" ")}`}
        previewText={`${h.verb} ${h.where.join(" ")}, ${when(n).join(" ")}. ${steps(n)[0]!.text}`}
        style={{ backgroundColor: ENAMEL, color: INK, fontSize: EMAIL.stop, lineHeight: 1.5 }}
      >
        <Section style={sides(28, 24, 20, 18)}>
          <Row stackOnMobile={false} style={{ alignItems: "end" }}>
            <Column style={{ width: 168 }}>
              <Text style={{ fontSize: EMAIL.stop, fontWeight: 800, letterSpacing: 2.5, lineHeight: "20px" }}>
                <Link href={SITE} style={{ color: INK, textDecoration: "none" }}>
                  PEREGRINE
                </Link>
              </Text>
            </Column>
            <Column>
              <Text style={{ ...label(13), lineHeight: "18px", textAlign: "right" }}>
                Service change
                <LineBreak />
                <Span style={{ color: INK }}>{n.notice}</Span>
              </Text>
            </Column>
          </Row>
        </Section>

        <Section style={{ backgroundColor: r.line.colour, color: WHITE, gap: 16, ...sides(40, 44, 32, 36) }}>
          <Text style={label(13, WHITE)}>{line}</Text>
          <Column style={{ gap: 8 }}>
            <Heading level={1} style={{ ...tight(EMAIL.verb), color: WHITE, mobile: tight(EMAIL.phoneVerb) }}>
              {h.verb}
            </Heading>
            <Heading level={2} style={{ ...tight(EMAIL.where), color: WHITE, mobile: tight(EMAIL.phoneWhere) }}>
              {lines(h.where)}
            </Heading>
          </Column>
          <Text style={{ ...label(EMAIL.when, WHITE), padding: [4, 0, 0], mobile: { fontSize: EMAIL.phoneWhen } }}>{lines(when(n))}</Text>
        </Section>

        <Section style={{ gap: 44, ...sides(44, 48, 32, 40, 36) }}>
          <Column style={{ gap: 4 }}>
            {heading("What to do instead")}
            <Column>
              {steps(n).map((step, i) => (
                <Row key={i} stackOnMobile={false} style={{ gap: 16, padding: [16, 0], border: { bottom: `1px solid ${RULE}` } }}>
                  <Column style={{ width: 26 }}>
                    <Text style={{ ...tile, ...label(EMAIL.edges, ENAMEL), letterSpacing: 0, lineHeight: "18px" }}>{String(i + 1)}</Text>
                  </Column>
                  <Column>
                    {step.label ? <Text style={{ ...label(13, INK), lineHeight: "26px" }}>{step.label}</Text> : null}
                    <Text style={{ lineHeight: "26px" }}>{step.text}</Text>
                  </Column>
                </Row>
              ))}
            </Column>
            <Table style={{ ...label(EMAIL.edges, INK), lineHeight: "22px", cellPadding: [12, 0], rowBorder: `1px solid ${RULE}` }}>
              {edges(n).map(([name, time]) => (
                <TableRow key={name}>
                  <TableCell style={{ width: 140, color: QUIET, fontWeight: 500 }}>{name}</TableCell>
                  <TableCell>{time}</TableCell>
                </TableRow>
              ))}
            </Table>
          </Column>

          {r.kind === "reduced" ? (
            <Column style={{ gap: 16 }}>
              {heading(`When ${vehicles} run`)}
              <Departures notice={n} />
            </Column>
          ) : null}

          <Column style={{ gap: 16 }}>
            <Row stackOnMobile={false}>
              {/* The line's chip, as wide as its name in Mono (9.3px a letter at 13px) and a little more. */}
              <Column style={{ width: Math.ceil(line.length * 9.3 + 20), backgroundColor: r.line.colour }}>
                <Heading level={2} style={{ ...label(13, WHITE), lineHeight: "16px", padding: [5, 0], textAlign: "center" }}>
                  {line}
                </Heading>
              </Column>
              <Column />
            </Row>
            <LineDiagram notice={n} />
          </Column>

          <Column style={{ gap: 4 }}>
            {heading("Why")}
            <Text field="reason" style={{ padding: [8, 0, 0] }}>
              {n.reason}
            </Text>
          </Column>

          <Button
            href={`${SITE}/journey?notice=${n.notice}`}
            style={{ backgroundColor: INK, color: ENAMEL, fontSize: EMAIL.stop, padding: [16, 28], mobile: { width: "100%" } }}
          >
            Plan your journey
          </Button>
        </Section>

        <Section style={{ border: { top: `1px solid ${RULE}` }, gap: 8, ...sides(28, 44, 24, 36) }}>
          <Text style={{ fontSize: 13, lineHeight: 1.6, color: QUIET }}>
            You follow the {r.line.name} line, so we tell you before its {vehicles} change.{" "}
            <Link href={`${SITE}/alerts`} style={{ color: INK }}>
              Change your alerts
            </Link>{" "}
            or{" "}
            <Link href={`${SITE}/alerts/${r.line.id}/unsubscribe`} style={{ color: INK }}>
              unsubscribe from {r.line.name} line alerts
            </Link>
            .
          </Text>
          <Text style={{ fontSize: 13, lineHeight: 1.6, color: QUIET }}>
            Peregrine, the trams and trains of Port Ellery.
            <LineBreak />
            Notice {n.notice}, posted {formatDate(n.posted, "en-GB", { day: "numeric", month: "long", year: "numeric" })}.
          </Text>
        </Section>
      </Email>
    );
  },
});

/** The template's own example, drawn. */
export default function Example() {
  return T.design(T.example);
}
