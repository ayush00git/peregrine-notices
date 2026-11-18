/**
 * Peregrine service change card: generated from the peregrine-notices repository (templates/notice-card.tsx and the kit it imports),
 * as one file for the Hyper Elements gallery. The template is T; this file's default export draws its example.
 */
import { Canvas, Column, defineTheme, Heading, Layer, LineBreak, Path, Polygon, prop, Rect, Row, Svg, Text } from "@hyper-elements/react";
import { formatDate, template } from "@hyper-elements/react/template";
import { Fragment, type ReactElement } from "react";

export const meta = {
  title: "Peregrine service change card",
  description: "A line closure as a social card, 1200 by 675: the headline on the line's colour, the dates, the time to allow, and the stretch drawn from the network.",
  root: "Canvas"
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

// templates/_kit/card-strip.tsx
/**
 * The card's strip, drawn from the network: the stretch of line a change touches, stop by stop. Solid where trains
 * run, hollow where they don't, dashed where the replacement bus runs beside it; a skipped stop's tick hollow; a
 * chevron where the line goes on past what's shown. For fewer trains the map doesn't change, so the strip draws time:
 * one tick per train through the evening, close together until the change and far apart after it.
 */





/** The card's one small size: stop names, chips, labels. */
const SMALL = 20;

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
const sink = (size: number, lineHeight = 1) => size * (lineHeight / 2 - 0.334);

/** Mono caps at the small size. Every Atkinson Mono glyph is 0.632em wide, so a label's width is known. */
const mono = (color: string) =>
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
function Strip({ n, width }: { n: Notice; width: number }) {
  return read(n).kind === "reduced" ? <Departures n={n} width={width} /> : <LineStrip n={n} width={width} />;
}

// templates/notice-card.tsx
/**
 * Peregrine (the trams and trains of Port Ellery, a fictional harbour city) posts a service change: its social card,
 * 1200 by 675, written as a PNG at twice the pixels by @hyper-elements/react/image.
 *
 * A sign at a stop, cut to a feed's size. The top half is the line's own colour, with the headline in white as large
 * as it will go: what happens on one line, where on two, broken where the words say. Under it, on the cool sign
 * white, the dates in Atkinson Mono capitals, the time to allow as one big figure, and a strip drawn from the network:
 * the stretch that closes, hollow, with the replacement bus dashed beside it; the stop trains skip, its tick hollow,
 * and the walk to the one to use instead; or, when there are only fewer trains, the evening's departures, close
 * together until the change and far apart after it. Atkinson Hyperlegible, made for low-vision readers, because a
 * card is read small, on a phone, in passing. Four sizes: 128 and 64 for the headline (the figure shares the 64), 28
 * for the dates, 20 for the rest. The line's colour is in three places and no more: the panel, the line, and the chip
 * by the wordmark. Square corners and no icons: every mark is drawn.
 */








const PANEL = 368;
/** The time to allow: Atkinson Mono capitals at the size of the headline's second line. */
const FIGURE = CARD.where[0];
const figure = { ...label(FIGURE, INK), letterSpacing: 0, lineHeight: 1 } as const;

/** A headline's tracking and leading at its largest size; `fit` picks the size. */
const track = (size: number) => {
  const { fontSize: _, ...rest } = tight(size);
  return rest;
};

/** Lines as copy.ts breaks them. */
const broken = (lines: string[]) =>
  lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 ? <LineBreak /> : null}
      {line}
    </Fragment>
  ));

const T = template({
  id: "peregrine.NoticeCard",
  version: "1.0.0",
  label: "Notice card",
  root: "Canvas",
  formats: { landscape: { width: CARD.width, height: CARD.height, scale: 2 } },
  fields: FIELDS,
  rules: { require: { core: ["image/overflow", "image/glyph", "image/fit"] } },
  example: EXAMPLE,
  render(values) {
    const n = values as unknown as Notice;
    assertNotice(n);
    const r = read(n);
    const h = headline(n);
    const dates = when(n);
    return (
      <Canvas
        width={CARD.width}
        height={CARD.height}
        fonts={FONTS}
        lang="en-GB"
        title={`${n.notice}: ${h.verb} ${h.where.join(" ")}, ${dates.join(" ")}`}
        style={{ backgroundColor: ENAMEL, color: INK, fontFamily: SANS_STACK }}
      >
        <Column style={{ height: PANEL, backgroundColor: r.line.colour, color: WHITE, padding: [40, CARD.padding, 32, CARD.padding], justifyContent: "space-between" }}>
          <Row style={{ justifyContent: "space-between" }}>
            <Text style={{ ...label(SMALL, WHITE), flex: "none" }}>{`Peregrine · ${r.line.name} line`}</Text>
            <Text style={{ ...label(SMALL, WHITE), flex: "none" }}>{n.notice}</Text>
          </Row>
          <Column style={{ gap: 4 }}>
            <Heading level={1} fit={{ sizes: [...CARD.verb], maxLines: 1 }} style={{ ...track(CARD.verb[0]), fontWeight: 800, color: WHITE }}>
              {h.verb}
            </Heading>
            <Heading level={2} fit={{ sizes: [...CARD.where], maxLines: 2 }} style={{ ...track(CARD.where[0]), fontWeight: 800, color: WHITE }}>
              {broken(h.where)}
            </Heading>
          </Column>
        </Column>
        <Column style={{ height: CARD.height - PANEL, padding: [32, CARD.padding], justifyContent: "space-between" }}>
          {/* The dates and the time to allow share the figure's baseline. */}
          <Row style={{ justifyContent: "space-between", alignItems: "end" }}>
            <Text style={{ ...label(CARD.when, INK), lineHeight: 1.2, flex: "none", padding: [0, 0, sink(FIGURE) - sink(CARD.when, 1.2), 0] }}>
              {broken(dates)}
            </Text>
            {n.extraMinutes > 0 ? (
              <Row style={{ gap: 16, alignItems: "end", flex: "none" }}>
                <Text style={{ ...mono(QUIET), flex: "none", padding: [0, 0, sink(FIGURE) - sink(SMALL), 0] }}>Allow</Text>
                <Text style={{ ...figure, flex: "none" }}>{`+${n.extraMinutes}`}</Text>
                <Text style={{ ...figure, flex: "none" }}>min</Text>
              </Row>
            ) : null}
          </Row>
          <Strip n={n} width={CARD.measure} />
          <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
            <Row style={{ gap: 12, alignItems: "center", flex: "none" }}>
              <Svg width={16} height={16}>
                <Rect width={16} height={16} style={{ fill: r.line.colour }} />
              </Svg>
              <Text style={{ flex: "none", fontWeight: 800, fontSize: SMALL, letterSpacing: 2, textTransform: "uppercase", lineHeight: 1 }}>Peregrine</Text>
            </Row>
            <Text style={{ ...mono(QUIET), textTransform: "none", letterSpacing: 0, flex: "none" }}>peregrine.example</Text>
          </Row>
        </Column>
      </Canvas>
    );
  },
});

/** The template's own example, drawn in its landscape format. */
export default function Example() {
  return T.design(T.example, { format: "landscape" });
}
