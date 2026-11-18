/**
 * The Peregrine network: the trams and trains of Port Ellery, a fictional harbour city.
 *
 * This is the templates' own data, not a field: a planner names stops, and the network says which line they're on,
 * in what order, whether each is step-free, where its replacement buses stop and how far it is to walk to the next.
 * Not a transit operator? Swap this file for your ferries, shuttles, gates or lifts and keep the rest.
 */

export type LineId = "harbour" | "moor" | "viaduct" | "airport" | "coast";

export interface Line {
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

export interface Station {
  /** Lift or level access from street to platform. */
  stepFree: boolean;
  /** Where replacement buses stop, as a rider would look for it. */
  bus: string;
}

export const LINES: readonly Line[] = [
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

export const STATIONS: Readonly<Record<string, Station>> = {
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

export const lineById = (id: LineId): Line => LINES.find((line) => line.id === id)!;

/** Every stop on the network, once each, in the order the lines name them. */
export const ALL_STOPS: readonly string[] = [...new Set(LINES.flatMap((line) => line.stops))];

/** The other lines that call at a stop. */
export const interchanges = (stop: string, line: Line): Line[] =>
  LINES.filter((other) => other.id !== line.id && other.stops.includes(stop));

/** Minutes to walk between two stops of a line, along it. */
export const walkBetween = (line: Line, a: string, b: string): number => {
  const [i, j] = [line.stops.indexOf(a), line.stops.indexOf(b)].sort((x, y) => x - y);
  return line.walk.slice(i, j).reduce((sum, minutes) => sum + minutes, 0);
};
