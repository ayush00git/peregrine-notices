/**
 * Peregrine's look, once. Public information, so legibility first: a cool sign white (not cream), near-black ink, one
 * colour per notice (its line's), square corners, and Atkinson Hyperlegible, the Braille Institute's typeface for
 * low-vision readers, because a closure notice is read at a stop, in the rain, by everyone.
 */
import { defineTheme } from "@hyper-elements/react";

export const ENAMEL = "#F7F7F4";
export const INK = "#111417";
export const QUIET = "#596069";
export const RULE = "#D8DBD6";
export const CONCRETE = "#E6E8E3";

export const SANS = "Atkinson Hyperlegible Next";
export const MONO = "Atkinson Hyperlegible Mono";
/** For an email or a page, where the fonts may not load: Verdana is about as wide, so nothing set for Atkinson overflows. */
export const SANS_STACK = `${SANS}, Verdana, Arial, sans-serif`;
export const MONO_STACK = `${MONO}, Menlo, Consolas, monospace`;

const NEXT = "https://fonts.gstatic.com/s/atkinsonhyperlegiblenext/v7/NaP4cYPdHfdVxJw0IfIP0lvYFqijb-UxCtm5_wdGscKFt4tOOfV4";
const MONO_URL = "https://fonts.gstatic.com/s/atkinsonhyperlegiblemono/v8/tssNAoFBci4C4gvhPXrt3wjT1MqSzhA4t7IIcncBiyihrK15gZ4k_";

/** Static TTFs from Google Fonts (SIL Open Font License): full character sets, one file per weight. */
export const FONTS = [
  { family: SANS, src: `${NEXT}ZmW37LQhtA.ttf`, weight: 400 },
  { family: SANS, src: `${NEXT}ZmW3C7MhtA.ttf`, weight: 700 },
  { family: SANS, src: `${NEXT}ZmW3bLMhtA.ttf`, weight: 800 },
  { family: MONO, src: `${MONO_URL}SaZLteiDQ.ttf`, weight: 500 },
  { family: MONO, src: `${MONO_URL}SaZ-9CiDQ.ttf`, weight: 700 },
];

export const theme = defineTheme({
  colors: { background: ENAMEL, foreground: INK, primary: INK, primaryForeground: ENAMEL, muted: QUIET, border: RULE },
  fonts: { body: SANS_STACK, heading: SANS_STACK },
  elements: {
    Heading: { fontWeight: 800, letterSpacing: -0.5 },
    Button: { borderRadius: 0, fontWeight: 700 },
  },
});

/** A label: Atkinson Mono, capitals, spaced. */
export const label = (size: number, color = QUIET) =>
  ({ fontFamily: MONO_STACK, fontSize: size, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color, lineHeight: 1.3 }) as const;
