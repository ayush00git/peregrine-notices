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
import { Column, Document, Heading, PageFooter, Row, Text, prop } from "@hyper-elements/react";
import { formatDate, template } from "@hyper-elements/react/template";
import "./_kit/pdf.ts";
import { ENAMEL, FONTS, INK, label, MONO_STACK, QUIET, RULE, SANS_STACK, theme } from "./_kit/brand.ts";
import { affectedStops, assertNotice, edges, headline, read, status, steps, when, type Notice, type Read } from "./_kit/copy.ts";
import { EXAMPLE, FIELDS } from "./_kit/fields.ts";
import { ALL_STOPS } from "./_kit/network.ts";
import { linesOf } from "./_kit/poster-fit.ts";
import { CHIP, DEPARTURES, Departures, LineDiagram, pad } from "./_kit/poster-line.tsx";
import { POSTER, tight } from "./_kit/type.ts";

const WHITE = "#FFFFFF";
/** A4 inside its margins, in px; under the headline, two columns: what to do, and the line. */
const PAGE = { width: (210 / 25.4) * 96 - 2 * POSTER.margin, height: Math.floor((297 / 25.4) * 96 - 2 * POSTER.margin) };
const GAP = 40;
const LEFT = 384;
const RIGHT = Math.floor(PAGE.width - LEFT - GAP);
const NUMBER = 32; // a step's number, before its words
const SPACE = { panel: 28, status: 24, footer: 16 };

const LINE = POSTER.edges * 1.3; // a line of the 20px text
const LABEL = POSTER.small * 1.3;
const body = { fontSize: POSTER.edges, lineHeight: 1.3 } as const;
const mono = { fontFamily: MONO_STACK, fontSize: POSTER.edges, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", lineHeight: 1.3 } as const;
/** Atkinson Mono's letters are 0.65 em wide: so many of them, in `mono`. */
const monoWidth = (letters: number) => Math.ceil(letters * (0.65 * POSTER.edges + 1.2));

/** The page, top to bottom: the panel, the status, then the two columns, which get what's left above the footer. */
const panelHeight = (where: number, dates: number) =>
  2 * POSTER.panelPadding + LABEL + 20 + POSTER.verb * 0.95 + 4 + POSTER.where * where + 20 + POSTER.when * 1.15 * dates;
const statusHeight = (note: number) => 2 * POSTER.status * 1.05 + 8 + note * LINE;
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
  const words = steps(n).reduce((sum, step) => sum + 12 + (step.label ? LABEL + 4 : 0) + linesOf(step.text, POSTER.edges, LEFT - NUMBER) * LINE, LABEL);
  const strip = r.kind === "reduced" ? 20 + DEPARTURES : 0;
  return words + strip + 20 + 2 + edges(n).length * (LINE + 13) + 20 + LABEL + 4 + linesOf(n.reason, POSTER.edges, LEFT) * LINE;
};

export default template({
  id: "peregrine.StopPoster",
  version: "1.1.0",
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
    const over = Math.ceil((leftHeight(n, r) - space) / LINE);
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
