/**
 * Peregrine's web notice: the page the email's button, the card and the posters point riders to.
 *
 * The same notice as the email, with room the email doesn't have: the change on a band of the line's colour, then
 * what to do instead beside the whole line (solid where trains run, hollow where they don't, the bus dashed beside
 * it), and, for a closure, where the replacement bus stops at every station it serves, from the network's own data.
 * Enamel and Ink, the line's colour in three places only (the band, the line, its chip), Atkinson Hyperlegible for
 * low-vision readers, square corners. On a phone the two columns stack, the line under what to do.
 */
import { Button, Column, Heading, Link, Page, Row, Section, Table, TableCell, TableRow, Text } from "@hyper-elements/react";
import { formatDate, template } from "@hyper-elements/react/template";
import { lint } from "@hyper-elements/lint";
import { ENAMEL, FONTS, INK, QUIET, RULE, WHITE, label, theme } from "./_kit/brand.ts";
import { affectedStops, assertNotice, edges, headline, read, steps, when, type Notice } from "./_kit/copy.ts";
import { Departures, LineDiagram } from "./_kit/email-diagram.tsx";
import { EXAMPLE, FIELDS } from "./_kit/fields.ts";
import { STATIONS } from "./_kit/network.ts";
import { EMAIL, tight } from "./_kit/type.ts";

const SITE = "https://peregrine.example";
const WIDTH = 960;
const sides = { padding: [0, 48], mobile: { padding: [0, 24] } } as const;
/** A section's label: Mono capitals over a 2px Ink rule. */
const heading = (text: string) => (
  <Heading level={2} style={{ ...label(13, INK), padding: [12, 0, 0], border: { top: `2px solid ${INK}` } }}>
    {text}
  </Heading>
);

export default template({
  id: "peregrine.NoticePage",
  version: "1.0.0",
  label: "Notice page",
  guidance: "The page the email, the card and the posters link to. Publish it with the email, at least 7 days ahead.",
  root: "Page",
  fields: FIELDS,
  rules: {
    plugins: { lint: lint() },
    require: { lint: ["contrast", "lang", "title", "heading-order", "link-text"], core: ["layout/overflow"] },
    links: { domains: ["peregrine.example"] },
    root: { lang: true, title: true },
  },
  example: EXAMPLE,
  render(values) {
    const n = values as unknown as Notice;
    assertNotice(n);
    const r = read(n);
    const h = headline(n);
    const chip = `${r.line.name} line`;
    const posted = formatDate(n.posted, "en-GB", { day: "numeric", month: "long", year: "numeric" });
    return (
      <Page
        width={WIDTH}
        theme={theme}
        lang="en-GB"
        fonts={FONTS}
        title={`${h.verb} ${h.where.join(" ")}, ${when(n).join(" ")} · Peregrine`}
        description={`${n.notice}: ${h.verb} ${h.where.join(" ")}. ${steps(n)[0]!.text}`}
        style={{ backgroundColor: ENAMEL, color: INK, fontSize: EMAIL.stop, lineHeight: 1.5 }}
      >
        <Section style={{ ...sides, padding: [24, 48], mobile: { padding: [20, 24] } }}>
          <Row stackOnMobile={false} style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: 800, letterSpacing: 2.5 }}>
              <Link href={SITE} style={{ color: INK, textDecoration: "none" }}>PEREGRINE</Link>
            </Text>
            <Column>
              <Text style={{ ...label(13), textAlign: "right" }}>Service change</Text>
              <Text style={{ ...label(13, INK), textAlign: "right" }}>{n.notice}</Text>
            </Column>
          </Row>
        </Section>

        <Section style={{ backgroundColor: r.line.colour, color: WHITE, gap: 16, padding: [56, 48, 60], mobile: { padding: [36, 24, 40] } }}>
          <Text style={label(13, WHITE)}>{chip}</Text>
          <Column style={{ gap: 8 }}>
            <Heading level={1} style={{ ...tight(72), color: WHITE, mobile: tight(EMAIL.phoneVerb) }}>{h.verb}</Heading>
            {h.where.map((line) => (
              <Text key={line} style={{ ...tight(40), fontWeight: 800, color: WHITE, mobile: tight(EMAIL.phoneWhere) }}>{line}</Text>
            ))}
          </Column>
          <Text style={{ ...label(EMAIL.when, WHITE), padding: [4, 0, 0] }}>{when(n).join(" ")}</Text>
        </Section>

        <Section style={{ padding: [48, 48], gap: 48, mobile: { padding: [32, 24], gap: 36 } }}>
          <Row style={{ gap: 48, alignItems: "start" }}>
            <Column style={{ width: 480, gap: 4 }}>
              {heading("What to do instead")}
              {steps(n).map((step, i) => (
                <Row key={i} stackOnMobile={false} style={{ gap: 16, padding: [16, 0], border: { bottom: `1px solid ${RULE}` } }}>
                  <Column style={{ width: 26 }}>
                    <Text style={{ ...label(EMAIL.edges, ENAMEL), width: 26, lineHeight: "18px", padding: [4, 0], textAlign: "center", backgroundColor: INK }}>{String(i + 1)}</Text>
                  </Column>
                  <Column>
                    {step.label ? <Text style={label(13, INK)}>{step.label}</Text> : null}
                    <Text>{step.text}</Text>
                  </Column>
                </Row>
              ))}
              <Table style={{ ...label(EMAIL.edges, INK), cellPadding: [12, 0], rowBorder: `1px solid ${RULE}` }}>
                {edges(n).map(([name, time]) => (
                  <TableRow key={name}>
                    <TableCell style={{ width: 160, color: QUIET, fontWeight: 500 }}>{name}</TableCell>
                    <TableCell>{time}</TableCell>
                  </TableRow>
                ))}
              </Table>
              {r.kind === "reduced" ? <Column style={{ padding: [24, 0, 0] }}><Departures notice={n} /></Column> : null}
            </Column>
            <Column style={{ gap: 16 }}>
              {heading(chip)}
              <LineDiagram notice={n} />
            </Column>
          </Row>

          {r.kind === "closure" ? (
            <Column style={{ gap: 4 }}>
              {heading(`Where bus ${r.change.bus.route} stops`)}
              <Table style={{ cellPadding: [12, 0], rowBorder: `1px solid ${RULE}` }}>
                {affectedStops(n).map((stop) => (
                  <TableRow key={stop}>
                    <TableCell style={{ width: 170, fontWeight: 700 }}>{stop}</TableCell>
                    <TableCell>{`${STATIONS[stop]!.bus}${STATIONS[stop]!.stepFree ? "" : " (the station has no lift)"}`}</TableCell>
                  </TableRow>
                ))}
              </Table>
            </Column>
          ) : null}

          <Column style={{ gap: 4 }}>
            {heading("Why")}
            <Text field="reason" style={{ padding: [8, 0, 0] }}>{n.reason}</Text>
          </Column>

          <Button href={`${SITE}/journey?notice=${n.notice}`} style={{ backgroundColor: INK, color: ENAMEL, padding: [16, 28], mobile: { width: "100%" } }}>
            Plan your journey
          </Button>
        </Section>

        <Section style={{ border: { top: `1px solid ${RULE}` }, padding: [28, 48, 44], mobile: { padding: [24, 24, 36] } }}>
          <Text style={{ fontSize: 13, lineHeight: 1.6, color: QUIET }}>
            {`Peregrine, the trams and trains of Port Ellery. Notice ${n.notice}, posted ${posted}. `}
            <Link href={`${SITE}/alerts`} style={{ color: INK }}>Get alerts for the {r.line.name} line</Link>
          </Text>
        </Section>
      </Page>
    );
  },
});
