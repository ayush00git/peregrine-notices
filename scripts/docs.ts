/**
 * The README's other pictures, from fresh renders: one poster at full size (Saltmarket, inside the PE-2701 closure)
 * and the three cards (closure, skip, fewer trams) side by side.
 *
 *   npx tsx scripts/docs.ts
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CLI = join(ROOT, "node_modules", "@hyper-elements", "cli", "dist", "bin.js");
const TMP = mkdtempSync(join(tmpdir(), "peregrine-docs-"));
const run = spawnSync(process.execPath, [CLI, "render", "designs/", "--out", TMP], { cwd: ROOT, encoding: "utf8" });
if (run.status !== 0) throw new Error(run.stdout + run.stderr);
const out = (path: string) => join(TMP, "designs", path);

// Saltmarket is the third of PE-2701's five pages.
execFileSync("pdftoppm", ["-png", "-r", "110", "-f", "3", "-l", "3", "-singlefile", out("pe-2701/stop-poster.a4.pdf"), join(ROOT, "docs", "poster-saltmarket")]);
// The three cards, each at 800px, with a gap of the page's grey between.
const cards = ["pe-2701", "pe-2702", "pe-2703"].map((id) => out(`${id}/notice-card.landscape.png`));
// ImageMagick 7 is `magick`, 6 is `convert`.
const IM = ["/usr/bin/magick", "/usr/local/bin/magick"].some((p) => existsSync(p)) ? "magick" : "convert";
execFileSync(IM, [...cards.flatMap((c) => ["(", c, "-resize", "800x", ")"]), "-background", "#E6E8E3", "-splice", "24x0", "+append", "-chop", "24x0", join(ROOT, "docs", "cards.png")]);
console.log("docs/poster-saltmarket.png, docs/cards.png");
