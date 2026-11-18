/**
 * Peregrine stop posters: one A4 page for every stop a change touches, worked out from the change, so no stop is
 * forgotten. Each page says what the change means at that stop, and marks it on the line.
 */
import { Column, Document, Heading, LineBreak, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import "./_kit/pdf.ts";
import { ENAMEL, FONTS, INK, label, SANS_STACK, theme } from "./_kit/brand.ts";
import { affectedStops, assertNotice, headline, read, status, steps, when, type Notice } from "./_kit/copy.ts";
import { EXAMPLE, FIELDS } from "./_kit/fields.ts";
import { ALL_STOPS } from "./_kit/network.ts";
import { prop } from "@hyper-elements/react";

export default template({
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
    const stops = n.here ? [n.here] : affectedStops(n);
    return (
      <Document size="A4" margin={40} title={`${n.notice}: ${h.verb} ${h.where.join(" ")}`} lang="en-GB" fonts={FONTS} theme={theme} style={{ backgroundColor: ENAMEL, color: INK, fontFamily: SANS_STACK }}>
        {stops.map((stop) => {
          const s = status(n, stop);
          return (
            <Document.Page key={stop} style={{ gap: 24 }}>
              <Column style={{ backgroundColor: r.line.colour, padding: 32, gap: 12 }}>
                <Text style={label(12, "#FFFFFF")}>{`Peregrine · ${r.line.name} line · ${n.notice}`}</Text>
                <Heading level={1} style={{ fontSize: 96, lineHeight: 0.95, color: "#FFFFFF" }}>{h.verb}</Heading>
                <Heading level={2} style={{ fontSize: 48, lineHeight: 1, color: "#FFFFFF" }}>
                  {h.where[0]}
                  {h.where[1] ? <><LineBreak />{h.where[1]}</> : null}
                </Heading>
                <Text style={label(28, "#FFFFFF")}>{when(n)}</Text>
              </Column>
              <Heading level={3} style={{ fontSize: 28, fontWeight: 700 }}>
                {s.lines[0]}
                <LineBreak />
                {s.lines[1]}
              </Heading>
              <Text>{s.note}</Text>
              {steps(n).map((step, i) => (
                <Text key={i}>{step.label ? `${step.label.toUpperCase()}: ${step.text}` : step.text}</Text>
              ))}
              <Text field="reason">{n.reason}</Text>
              <Text style={label(12)}>{`You are here: ${stop}`}</Text>
            </Document.Page>
          );
        })}
      </Document>
    );
  },
});
