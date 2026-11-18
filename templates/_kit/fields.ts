/**
 * The notice: what a planner (or an agent reading the works schedule) fills in. It's the same for the email, the
 * posters and the card, so one brief makes all three.
 *
 * The change is one block, and its type names the line: `harbour.closure`, `moor.skip`, `viaduct.reduced`… Each
 * type's stops are a choice of that line's own stops, so a stop on another line can't be written, and an agent
 * reading the JSON Schema can't produce one.
 */
import { prop } from "@hyper-elements/react";
import { LINES, type Line } from "./network.ts";

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
export const CHANGE_TYPES = Object.assign({}, ...LINES.map(kinds)) as Record<string, ReturnType<typeof prop.object>>;

export const FIELDS = {
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
export const EXAMPLE = {
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
