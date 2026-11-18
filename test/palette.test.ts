/**
 * Contrast, checked here because lint reads Emails and Pages, not a Document's PDF or a Canvas's image: white on
 * every line's colour, and every line's colour as text on the sign white, for all five lines.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ENAMEL, INK, QUIET } from "../templates/_kit/brand.ts";
import { LINES } from "../templates/_kit/network.ts";

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

test("white reads on every line's colour, and every line's colour reads on Enamel (4.5:1, body text)", () => {
  for (const line of LINES) {
    assert.ok(contrast("#FFFFFF", line.colour) >= 4.5, `white on the ${line.name} line's ${line.colour}: ${contrast("#FFFFFF", line.colour).toFixed(2)}:1`);
    assert.ok(contrast(line.colour, ENAMEL) >= 4.5, `${line.name} ${line.colour} on Enamel: ${contrast(line.colour, ENAMEL).toFixed(2)}:1`);
  }
});

test("ink and the quiet grey read on Enamel", () => {
  assert.ok(contrast(INK, ENAMEL) >= 7);
  assert.ok(contrast(QUIET, ENAMEL) >= 4.5, `Quiet on Enamel: ${contrast(QUIET, ENAMEL).toFixed(2)}:1`);
});
