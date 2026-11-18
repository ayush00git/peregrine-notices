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
import { Fragment } from "react";
import { Canvas, Column, Heading, LineBreak, Rect, Row, Svg, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { ENAMEL, FONTS, INK, label, QUIET, SANS_STACK, WHITE } from "./_kit/brand.ts";
import { mono, sink, SMALL, Strip } from "./_kit/card-strip.tsx";
import { assertNotice, headline, read, when, type Notice } from "./_kit/copy.ts";
import { EXAMPLE, FIELDS } from "./_kit/fields.ts";
import { CARD, tight } from "./_kit/type.ts";

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

export default template({
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
