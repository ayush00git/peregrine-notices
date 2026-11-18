/**
 * Peregrine stop posters: generated from the peregrine-notices repository (templates/stop-poster.tsx and the kit it imports),
 * as one file for the Hyper Elements gallery. The template is T; this file's default export draws its example.
 */
import { Column, defineTheme, Document, Heading, Layer, PageFooter, Path, Polygon, prop, Row, Svg, Text } from "@hyper-elements/react";
import { formatDate, template } from "@hyper-elements/react/template";

export const meta = {
  title: "Peregrine stop posters",
  description: "One A4 poster for every stop a closure touches, in one PDF: what it means at that stop, what to do instead, and the whole line with YOU ARE HERE.",
  root: "Document"
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

// templates/_kit/poster-fit.ts
/**
 * How many lines a sentence takes on a poster, so the template can refuse words that would run off the page instead
 * of printing a poster with its last line cut off (a PDF page doesn't flow onto the next).
 *
 * The widths are Atkinson Hyperlegible Next Regular's own advances (per 1000 units of its em), read from the font
 * file. Words wrap at spaces, greedily and without kerning, so the count is never fewer lines than the PDF sets
 * (react-pdf may fit a few more words to a line by narrowing its spaces).
 */

const CHARS = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~’‘–—·é“”";
const ADVANCES = [
  280, 286, 301, 651, 592, 919, 731, 160, 299, 299, 485, 606, 210, 362, 210, 387, 648, 407, 548, 576, 614, 588, 598, 510, 615, 595, 210, 210, 553, 628, 553,
  480, 778, 626, 613, 645, 669, 569, 552, 694, 694, 392, 512, 631, 541, 824, 693, 714, 592, 724, 614, 592, 558, 690, 593, 856, 623, 575, 607, 317, 387, 344,
  552, 372, 243, 525, 566, 485, 564, 538, 314, 558, 550, 252, 245, 492, 262, 845, 550, 548, 566, 574, 349, 471, 326, 540, 461, 684, 481, 449, 460, 344, 237,
  344, 555, 236, 236, 504, 824, 240, 538, 399, 399,
];
/** A letter it doesn't know is taken as wide as an M, and a little more. */
const WIDEST = 1000;

const advance = (letter: string) => {
  const i = CHARS.indexOf(letter);
  return i < 0 ? WIDEST : ADVANCES[i]!;
};

/** A run of text's width at a size, in px. */
const widthOf = (text: string, size: number) => ([...text].reduce((sum, letter) => sum + advance(letter), 0) * size) / 1000;

/** The lines a paragraph takes in a measure, at a size. */
function linesOf(text: string, size: number, measure: number): number {
  let lines = 1;
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && widthOf(next, size) > measure) {
      lines += 1;
      line = word;
    } else line = next;
  }
  return lines;
}

// templates/_kit/poster-line.tsx
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
const pad = (pitch: number) => Math.max(28, pitch / 2);
/** The line chip over the diagram, and the space under it. */
const CHIP = 12 * 1.3 + 8 + 8;

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

function LineDiagram({ r, stop, width, pitch }: { r: Read; stop: string; width: number; pitch: number }) {
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
const DEPARTURES = 12 * 1.3 + 8 + 42 + 8 + 12 * 1.3;

/** The evening's departures: a tick a train, every `line.every` minutes until the change, then every few, to the last. */
function Departures({ r, width }: { r: Extract<Read, { kind: "reduced" }>; width: number }) {
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

// templates/stop-poster.tsx
/**
 * Peregrine (the trams and trains of Port Ellery, a fictional harbour city) puts a poster up at every stop a change
 * touches: one A4 page each, in one PDF, worked out from the change, so no stop is forgotten.
 *
 * Public information, made to be read across a platform. The line's colour is a panel across the top, with what's
 * happening and when set huge in Atkinson Hyperlegible; under it, what the change means at this stop. Then what to
 * do instead, beside the whole line drawn from the network: solid where trains run, hollow where they don't, the
 * bus dashed beside it, and this stop flagged in ink. The line's colour is in three places (the panel, the line and
 * its chip); everything else is ink, a quiet grey and enamel white, with nothing rounded, tinted or faded, so a
 * poster still reads when it's printed in black and white. Five sizes of type, and words that don't fit are refused,
 * not cut off.
 */









/** A4 inside its margins, in px; under the headline, two columns: what to do, and the line. */
const PAGE = { width: (210 / 25.4) * 96 - 2 * POSTER.margin, height: Math.floor((297 / 25.4) * 96 - 2 * POSTER.margin) };
const GAP = 40;
const LEFT = 384;
const RIGHT = Math.floor(PAGE.width - LEFT - GAP);
const NUMBER = 32; // a step's number, before its words
const SPACE = { panel: 28, status: 24, footer: 16 };

const TEXT_LINE = POSTER.edges * 1.3; // a line of the 20px text
const LABEL = POSTER.small * 1.3;
const body = { fontSize: POSTER.edges, lineHeight: 1.3 } as const;
const mono = { fontFamily: MONO_STACK, fontSize: POSTER.edges, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", lineHeight: 1.3 } as const;
/** Atkinson Mono's letters are 0.65 em wide: so many of them, in `mono`. */
const monoWidth = (letters: number) => Math.ceil(letters * (0.65 * POSTER.edges + 1.2));

/** The page, top to bottom: the panel, the status, then the two columns, which get what's left above the footer. */
const panelHeight = (where: number, dates: number) =>
  2 * POSTER.panelPadding + LABEL + 20 + POSTER.verb * 0.95 + 4 + POSTER.where * where + 20 + POSTER.when * 1.15 * dates;
const statusHeight = (note: number) => 2 * POSTER.status * 1.05 + 8 + note * TEXT_LINE;
const FOOTER = 12 + 1 + LABEL; // its padding, its rule and its line
const room = (where: number, dates: number, note: number) =>
  PAGE.height - panelHeight(where, dates) - SPACE.panel - statusHeight(note) - SPACE.status - FOOTER - SPACE.footer;

/** The diagram's pitch, a row per stop: as roomy as the page allows, from 48 to 80px on the 8px grid. */
const pitchFor = (stops: number, room: number) => {
  let pitch = 80;
  while (pitch > 48 && CHIP + 2 * pad(pitch) + (stops - 1) * pitch > room) pitch -= 8;
  return pitch;
};

/** The left column's height, as it's laid out below: what to do, the departures, the last and first trains, why. */
const leftHeight = (n: Notice, r: Read) => {
  const words = steps(n).reduce((sum, step) => sum + 12 + (step.label ? LABEL + 4 : 0) + linesOf(step.text, POSTER.edges, LEFT - NUMBER) * TEXT_LINE, LABEL);
  const strip = r.kind === "reduced" ? 20 + DEPARTURES : 0;
  return words + strip + 20 + 2 + edges(n).length * (TEXT_LINE + 13) + 20 + LABEL + 4 + linesOf(n.reason, POSTER.edges, LEFT) * TEXT_LINE;
};

const T = template({
  id: "peregrine.StopPoster",
  version: "1.0.0",
  label: "Stop posters",
  guidance: "One notice per change. Posters go up at every stop the change touches, at least 7 days before it starts.",
  root: "Document",
  formats: { a4: { size: "A4" } },
  fields: { ...FIELDS, here: prop.choice([...ALL_STOPS], { label: "Only this stop (a reprint)" }) },
  rules: { require: { core: ["document/overflow", "layout/overflow"] } },
  example: EXAMPLE,
  render(values) {
    const n = values as unknown as Notice;
    assertNotice(n);
    const r = read(n);
    const h = headline(n);
    const dates = when(n);
    const stops = n.here ? [n.here] : affectedStops(n);
    const notes = Math.max(...stops.map((stop) => linesOf(status(n, stop).note, POSTER.edges, PAGE.width)));
    const space = room(h.where.length, dates.length, notes);
    // A PDF page doesn't flow onto the next: words that don't fit would be cut off, so they're refused.
    const over = Math.ceil((leftHeight(n, r) - space) / TEXT_LINE);
    if (over > 0) {
      const what = r.kind === "reduced" ? "the reason" : "the step-free way through or the reason";
      throw new Error(`Too long for a poster: what to do and why run ${over} line${over > 1 ? "s" : ""} past the page. Shorten ${what} by about ${over * 36} characters`);
    }
    const pitch = pitchFor(r.line.stops.length, space);
    const posted = formatDate(n.posted, "en-GB", { day: "numeric", month: "long", year: "numeric" });
    return (
      <Document size="A4" margin={POSTER.margin} title={`${n.notice}: ${h.verb} ${h.where.join(" ")}`} lang="en-GB" fonts={FONTS} theme={theme} style={{ backgroundColor: ENAMEL, color: INK, fontFamily: SANS_STACK }}>
        {stops.map((stop) => {
          const s = status(n, stop);
          return (
            <Document.Page key={stop}>
              {/* What, where and when, on the line's colour. Each line its own block. */}
              <Column style={{ backgroundColor: r.line.colour, padding: POSTER.panelPadding, gap: 20 }}>
                <Text style={label(POSTER.small, WHITE)}>{`Peregrine · ${r.line.name} line · ${n.notice}`}</Text>
                <Column style={{ gap: 4 }}>
                  <Heading level={1} style={{ ...tight(POSTER.verb), color: WHITE }}>{h.verb}</Heading>
                  <Column>
                    {h.where.map((line) => (
                      <Heading key={line} level={2} style={{ ...tight(POSTER.where), fontWeight: 800, color: WHITE }}>{line}</Heading>
                    ))}
                  </Column>
                </Column>
                <Column>
                  {dates.map((line) => (
                    <Text key={line} style={{ ...label(POSTER.when, WHITE), lineHeight: 1.15 }}>{line}</Text>
                  ))}
                </Column>
              </Column>

              {/* What it means at this stop. */}
              <Column style={{ padding: [SPACE.panel, 0, SPACE.status], gap: 8 }}>
                <Column>
                  {s.lines.map((line) => (
                    <Heading key={line} level={3} style={{ fontSize: POSTER.status, fontWeight: 700, lineHeight: 1.05, letterSpacing: 0 }}>{line}</Heading>
                  ))}
                </Column>
                <Text style={body}>{s.note}</Text>
              </Column>

              <Row style={{ gap: GAP, alignItems: "start" }}>
                <Column style={{ width: LEFT, gap: 20 }}>
                  <Column style={{ gap: 12 }}>
                    <Text style={label(POSTER.small, INK)}>What to do instead</Text>
                    {steps(n).map((step, i) => (
                      <Row key={i}>
                        <Text style={{ ...mono, width: NUMBER }}>{i + 1}</Text>
                        <Column style={{ gap: 4 }}>
                          {step.label ? <Text style={label(POSTER.small, INK)}>{step.label}</Text> : null}
                          <Text style={body}>{step.text}</Text>
                        </Column>
                      </Row>
                    ))}
                  </Column>
                  {r.kind === "reduced" ? <Departures r={r} width={LEFT} /> : null}
                  <Column style={{ border: { top: `2px solid ${INK}` } }}>
                    {edges(n).map(([what, time], _, rows) => (
                      <Row key={what} style={{ padding: [6, 0], border: { bottom: `1px solid ${RULE}` } }}>
                        <Text style={{ ...mono, width: monoWidth(Math.max(...rows.map(([w]) => w.length))) + 24 }}>{what}</Text>
                        <Text style={{ ...mono, textAlign: "right" }}>{time}</Text>
                      </Row>
                    ))}
                  </Column>
                  <Column style={{ gap: 4 }}>
                    <Text style={label(POSTER.small)}>Why</Text>
                    <Text field="reason" style={{ ...body, color: QUIET }}>{n.reason}</Text>
                  </Column>
                </Column>
                <LineDiagram r={r} stop={stop} width={RIGHT} pitch={pitch} />
              </Row>
            </Document.Page>
          );
        })}
        <PageFooter style={{ padding: [12, 0, 0], border: { top: `1px solid ${RULE}` } }}>
          <Row>
            <Text style={label(POSTER.small)}>{`${n.notice} · Posted ${posted}`}</Text>
            <Text style={{ ...label(POSTER.small), textAlign: "right" }}>peregrine.example</Text>
          </Row>
        </PageFooter>
      </Document>
    );
  },
});

/** The template's own example, drawn in its a4 format. */
export default function Example() {
  return T.design(T.example, { format: "a4" });
}
