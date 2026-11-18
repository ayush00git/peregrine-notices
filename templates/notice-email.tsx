/**
 * Peregrine notice email: the rider alert sent to everyone who follows the line.
 */
import { Button, Column, Email, Heading, LineBreak, Link, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { lint } from "@hyper-elements/lint";
import { ENAMEL, FONTS, INK, label, theme } from "./_kit/brand.ts";
import { assertNotice, headline, read, steps, when, type Notice } from "./_kit/copy.ts";
import { EXAMPLE, FIELDS } from "./_kit/fields.ts";

const SITE = "https://peregrine.example";

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
    return (
      <Email width={600} theme={theme} lang="en-GB" fonts={FONTS} previewText={`${h.verb} ${h.where.join(" ")}, ${when(n)}. ${steps(n)[0]!.text}`} style={{ backgroundColor: ENAMEL, color: INK }}>
        <Column style={{ backgroundColor: r.line.colour, padding: 32, gap: 8 }}>
          <Text style={label(12, "#FFFFFF")}>{`${r.line.name} line · ${n.notice}`}</Text>
          <Heading level={1} style={{ fontSize: 56, lineHeight: 1, color: "#FFFFFF" }}>{h.verb}</Heading>
          <Heading level={2} style={{ fontSize: 32, lineHeight: 1.05, color: "#FFFFFF" }}>
            {h.where[0]}
            {h.where[1] ? <><LineBreak />{h.where[1]}</> : null}
          </Heading>
          <Text style={label(15, "#FFFFFF")}>{when(n)}</Text>
        </Column>
        <Column style={{ padding: 32, gap: 16 }}>
          {steps(n).map((step, i) => (
            <Text key={i}>{step.label ? `${step.label.toUpperCase()}: ${step.text}` : step.text}</Text>
          ))}
          <Text field="reason">{n.reason}</Text>
          <Button href={`${SITE}/journey?notice=${n.notice}`}>Plan your journey</Button>
          <Text style={{ fontSize: 13 }}>
            You follow the {r.line.name} line. <Link href={`${SITE}/alerts/${r.line.id}/unsubscribe`}>Unsubscribe from {r.line.name} line alerts</Link>
          </Text>
        </Column>
      </Email>
    );
  },
});
