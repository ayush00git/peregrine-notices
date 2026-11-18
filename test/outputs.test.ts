/**
 * What the CLI writes for the sample notices: a poster page for every affected stop, an email small enough that
 * Gmail shows all of it, and a card at twice its size.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CLI = join(ROOT, "node_modules", "@hyper-elements", "cli", "dist", "bin.js");
const OUT = mkdtempSync(join(tmpdir(), "peregrine-"));

const render = spawnSync(process.execPath, [CLI, "render", "designs/", "--out", OUT], { cwd: ROOT, encoding: "utf8" });
const out = (path: string) => join(OUT, "designs", path);
/** A PDF's pages, counted from its page objects. */
const pages = (pdf: Buffer) => (pdf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length;

test("every sample notice renders", () => {
  assert.equal(render.status, 0, render.stdout + render.stderr);
});

test("one poster page per affected stop", () => {
  assert.equal(pages(readFileSync(out("pe-2701/stop-poster.a4.pdf"))), 5);
  assert.equal(pages(readFileSync(out("pe-2702/stop-poster.a4.pdf"))), 2);
  assert.equal(pages(readFileSync(out("pe-2703/stop-poster.a4.pdf"))), 6);
});

test("each email stays under Gmail's 102 KB clip, and says its stops in plain text too", () => {
  for (const id of ["pe-2701", "pe-2702", "pe-2703"]) {
    const size = statSync(out(`${id}/notice-email.html`)).size;
    assert.ok(size < 102 * 1024, `${id}: ${Math.round(size / 1024)} KB`);
  }
  // The plain text sets headings in capitals, so compare without case.
  const text = readFileSync(out("pe-2701/notice-email.txt"), "utf8").toLowerCase();
  for (const words of ["No trains", "between Quayside", "and Millbrook", "bus 1X", "Step-free", "Last train"]) assert.ok(text.includes(words.toLowerCase()), `plain text says "${words}"`);
});

test("the card is 1200 by 675, drawn at twice the pixels", () => {
  const png = readFileSync(out("pe-2701/notice-card.landscape.png"));
  assert.equal(png.readUInt32BE(16), 2400);
  assert.equal(png.readUInt32BE(20), 1350);
});
