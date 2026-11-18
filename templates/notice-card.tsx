/**
 * Peregrine notice card: the change as a social image, 1200 by 675.
 */
import { Canvas, Column, Heading, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { ENAMEL, FONTS, INK, label, SANS } from "./_kit/brand.ts";
import { assertNotice, headline, read, when, type Notice } from "./_kit/copy.ts";
import { EXAMPLE, FIELDS } from "./_kit/fields.ts";

export default template({
  id: "peregrine.NoticeCard",
  version: "1.0.0",
  label: "Notice card",
  root: "Canvas",
  formats: { landscape: { width: 1200, height: 675, scale: 2 } },
  fields: FIELDS,
  rules: { require: { core: ["image/overflow", "image/glyph", "image/fit"] } },
  example: EXAMPLE,
  render(values) {
    const n = values as unknown as Notice;
    assertNotice(n);
    const r = read(n);
    const h = headline(n);
    return (
      <Canvas width={1200} height={675} fonts={FONTS} lang="en-GB" style={{ backgroundColor: ENAMEL, color: INK, fontFamily: SANS }}>
        <Column style={{ backgroundColor: r.line.colour, padding: 64, gap: 12, height: 420 }}>
          <Text style={label(20, "#FFFFFF")}>{`Peregrine · ${r.line.name} line`}</Text>
          <Heading level={1} fit={{ sizes: [128, 112, 96], maxLines: 1 }} style={{ color: "#FFFFFF", fontWeight: 800, lineHeight: 0.95 }}>{h.verb}</Heading>
          <Heading level={2} fit={{ sizes: [64, 56, 48], maxLines: 2 }} style={{ color: "#FFFFFF", fontWeight: 800, lineHeight: 1 }}>{h.where.join(" ")}</Heading>
        </Column>
        <Column style={{ padding: [32, 64] }}>
          <Text style={label(28, INK)}>{when(n)}</Text>
        </Column>
      </Canvas>
    );
  },
});
