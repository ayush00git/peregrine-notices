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
import { Button, Column, Email, Heading, LineBreak, Link, Row, Section, Span, Table, TableCell, TableRow, Text } from "@hyper-elements/react";
import { formatDate, template } from "@hyper-elements/react/template";
import { lint } from "@hyper-elements/lint";
import { ENAMEL, FONTS, INK, QUIET, RULE, label, theme, WHITE } from "./_kit/brand.ts";
import { assertNotice, edges, headline, read, steps, when, type Notice } from "./_kit/copy.ts";
import { Departures, LineDiagram } from "./_kit/email-diagram.tsx";
import { EXAMPLE, FIELDS } from "./_kit/fields.ts";
import { EMAIL, tight } from "./_kit/type.ts";

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

export default template({
  id: "peregrine.NoticeEmail",
  version: "1.0.0",
  label: "Notice email",
  guidance: "Sent to riders who follow the line, at least 7 days before the change starts.",
  root: "Email",
  fields: FIELDS,
  rules: {
    plugins: { lint: lint({ kind: "marketing" }) },
    require: { lint: ["unsubscribe", "preview-text", "link-text", "contrast", "lang"], core: ["layout/overflow"] },
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
