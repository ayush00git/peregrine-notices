/**
 * Type sizes and measures, shared by the templates and by the test that proves every line the network can produce
 * fits its measure (test/headlines.test.ts). Change a size here and the test re-measures every headline at it.
 */

const A4_WIDTH = (210 / 25.4) * 96; // 793.7px

export const POSTER = {
  margin: 40,
  panelPadding: 32,
  /** The text measure inside the colour panel. */
  measure: A4_WIDTH - 2 * 40 - 2 * 32,
  verb: 96,
  where: 48,
  when: 28,
  status: 28,
  edges: 20,
  body: 17,
  small: 12,
} as const;

export const EMAIL = {
  width: 600,
  padding: 48,
  measure: 600 - 2 * 48,
  phone: { width: 375, padding: 24, measure: 375 - 2 * 24 },
  verb: 56,
  where: 32,
  when: 15,
  edges: 15,
  stop: 17,
  phoneVerb: 40,
  phoneWhere: 22,
  phoneWhen: 13,
} as const;

export const CARD = {
  width: 1200,
  height: 675,
  padding: 64,
  measure: 1200 - 2 * 64,
  verb: [128, 112, 96],
  where: [64, 56, 48],
  when: 28,
} as const;

/** A headline's tracking: -1.5% of its size. */
export const tight = (size: number) => ({ fontSize: size, letterSpacing: -0.015 * size, lineHeight: size >= 72 ? 0.95 : 1 }) as const;

/** The share of a measure a line may take: the rest is room for a fallback font that's a little wider. */
export const HEADROOM = 0.9;
