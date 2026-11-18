/**
 * How many lines a sentence takes on a poster, so the template can refuse words that would run off the page instead
 * of printing a poster with its last line cut off (a PDF page doesn't flow onto the next).
 *
 * The widths are Atkinson Hyperlegible Next Regular's own advances (per 1000 units of its em), read from the font
 * file. Words wrap at spaces, greedily and without kerning, so the count is never fewer lines than the PDF sets
 * (react-pdf may fit a few more words to a line by narrowing its spaces).
 */

const CHARS = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~’‘–—·é“”";
const ADVANCES = [
  280, 286, 301, 651, 592, 919, 731, 160, 299, 299, 485, 606, 210, 362, 210, 387, 648, 407, 548, 576, 614, 588, 598, 510, 615, 595, 210, 210, 553, 628, 553,
  480, 778, 626, 613, 645, 669, 569, 552, 694, 694, 392, 512, 631, 541, 824, 693, 714, 592, 724, 614, 592, 558, 690, 593, 856, 623, 575, 607, 317, 387, 344,
  552, 372, 243, 525, 566, 485, 564, 538, 314, 558, 550, 252, 245, 492, 262, 845, 550, 548, 566, 574, 349, 471, 326, 540, 461, 684, 481, 449, 460, 344, 237,
  344, 555, 236, 236, 504, 824, 240, 538, 399, 399,
];
/** A letter it doesn't know is taken as wide as an M, and a little more. */
const WIDEST = 1000;

const advance = (letter: string) => {
  const i = CHARS.indexOf(letter);
  return i < 0 ? WIDEST : ADVANCES[i]!;
};

/** A run of text's width at a size, in px. */
export const widthOf = (text: string, size: number) => ([...text].reduce((sum, letter) => sum + advance(letter), 0) * size) / 1000;

/** The lines a paragraph takes in a measure, at a size. */
export function linesOf(text: string, size: number, measure: number): number {
  let lines = 1;
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && widthOf(next, size) > measure) {
      lines += 1;
      line = word;
    } else line = next;
  }
  return lines;
}
