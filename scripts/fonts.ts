/**
 * The brand's font files, fetched once from Google Fonts and kept in node_modules/.cache/peregrine-fonts, for the
 * scripts and tests that call renderImage(), layoutImage() and renderPdf() directly (the CLI fetches its own).
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { FONTS } from "../templates/_kit/brand.ts";

const DIR = join(import.meta.dirname, "..", "node_modules", ".cache", "peregrine-fonts");

export async function fontFiles() {
  await mkdir(DIR, { recursive: true });
  return Promise.all(
    FONTS.map(async (font) => {
      const file = join(DIR, createHash("sha256").update(font.src).digest("hex").slice(0, 16) + ".ttf");
      let src: Buffer;
      try {
        src = await readFile(file);
      } catch {
        const response = await fetch(font.src);
        if (!response.ok) throw new Error(`Couldn't fetch ${font.family} ${font.weight}: ${response.status}`);
        src = Buffer.from(await response.arrayBuffer());
        await writeFile(file, src);
      }
      return { family: font.family, src, weight: font.weight as 400 | 500 | 700 | 800 };
    }),
  );
}
