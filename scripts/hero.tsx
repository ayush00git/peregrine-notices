/**
 * docs/hero.png: the README's first image, drawn with Hyper Elements too (a Canvas). Row one is the punchline: one
 * notice, a poster for every stop it touches, YOU ARE HERE stepping down the line. Row two: the rider email on a
 * phone, the social card, and what `check` says, word for word: the notice written, and one refused.
 *
 *   npx tsx scripts/hero.tsx
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { Canvas, Column, Image, Row, Text } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import { CONCRETE, ENAMEL, INK, MONO } from "../templates/_kit/brand.ts";
import { affectedStops, type Notice } from "../templates/_kit/copy.ts";
import { fontFiles } from "./fonts.ts";

const ROOT = join(import.meta.dirname, "..");
const CLI = join(ROOT, "node_modules", "@hyper-elements", "cli", "dist", "bin.js");
const TMP = mkdtempSync(join(tmpdir(), "peregrine-hero-"));
const cli = (...args: string[]) => spawnSync(process.execPath, [CLI, ...args], { cwd: ROOT, encoding: "utf8" });
/** check run from designs/, as a planner would: its paths are the notices' own. */
const checkIn = (...args: string[]) => spawnSync(process.execPath, [CLI, "check", ...args], { cwd: join(ROOT, "designs"), encoding: "utf8" });

// 1. The real outputs, rendered fresh.
const rendered = cli("render", "designs/pe-2701/", "--out", TMP);
if (rendered.status !== 0) throw new Error(rendered.stdout + rendered.stderr);
const out = join(TMP, "designs", "pe-2701");
const notice = JSON.parse(readFileSync(join(ROOT, "designs", "pe-2701", "brief.json"), "utf8")) as Notice;
const stops = affectedStops(notice);

// 2. Each poster page as a PNG, at twice the size it's shown.
const W: Record<string, number> = { poster: 208, card: 480, row: 1104 };
const H = { poster: 294, row: 270 };
execFileSync("pdftoppm", ["-png", "-scale-to-x", String(W.poster * 2), "-scale-to-y", "-1", join(out, "stop-poster.a4.pdf"), join(TMP, "poster")]);
const posterFiles = readdirSync(TMP).filter((f) => f.startsWith("poster")).sort();

// 3. The email at a phone's width, from the top to the end of its first step: the band and what to do first.
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 375, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`file://${join(out, "notice-email.html")}`, { waitUntil: "networkidle" });
const second = await page.getByText(/^Allow \d+ minutes more/).first().boundingBox();
const crop = Math.round(second!.y - 17); // the rule under the first step
const emailShot = join(TMP, "email.png");
await page.screenshot({ path: emailShot, clip: { x: 0, y: 0, width: 375, height: crop } });
await browser.close();
W.email = Math.round((H.row * 375) / crop);
W.tile = W.row - W.email - W.card - 2 * 24;

// 4. What check says: the notice written, and one refused. Its own lines, trimmed to the ones that matter.
const said = (run: ReturnType<typeof cli>) =>
  run.stdout.split("\n").filter((line) => /^[✓✗]|^\s+error /.test(line)).map((line) => line.trim().replace(/^error /, "error "));
const written = said(checkIn("pe-2701/", "--require-template"));
const refused = said(checkIn("_refused/closure-without-bus.values.json"));

// 5. The board.
const images: Record<string, Buffer> = {};
const asset = (name: string, file: string, width: number, height: number) => {
  const src = `https://peregrine.example/hero/${name}`;
  images[src] = readFileSync(file);
  return { src, width, height };
};
/** On Ink: the notices that passed, dimmed (about 7:1), so the refusal is what's read. */
const DIM = "#A3A9AF";
const caption = (text: string) => (
  <Text style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#3F454C", lineHeight: 1.2 }}>{text}</Text>
);
const mono = (text: string, color: string) => (
  <Text style={{ fontFamily: `${MONO}, DejaVu Sans Mono`, fontWeight: 500, fontSize: 9.5, color, lineHeight: 1.5 }}>{text}</Text>
);

const board = (
  <Canvas width={1200} height={760} style={{ backgroundColor: CONCRETE, padding: 48, gap: 28 }}>
    <Column style={{ gap: 12 }}>
      {caption(`${notice.notice} · one notice · a poster for every stop it touches`)}
      <Row style={{ gap: 16 }}>
        {posterFiles.map((file, i) => (
          <Column key={file} style={{ width: W.poster, gap: 8 }}>
            <Image src={asset(file, join(TMP, file), W.poster * 2, Math.round(W.poster * 2 * 1.4142))} alt={`The poster at ${stops[i]}`} style={{ width: W.poster }} />
            {caption(stops[i]!)}
          </Column>
        ))}
      </Row>
    </Column>
    <Row style={{ gap: 24 }}>
      <Column style={{ width: W.email, gap: 8 }}>
        {caption("Rider email · no images")}
        <Image src={asset("email.png", emailShot, 750, crop * 2)} alt="The rider email on a phone" style={{ width: W.email }} />
      </Column>
      <Column style={{ width: W.card, gap: 8 }}>
        {caption("Social card · 1200 × 675")}
        <Image src={asset("card.png", join(out, "notice-card.landscape.png"), 2400, 1350)} alt="The social card" style={{ width: W.card }} />
      </Column>
      <Column style={{ width: W.tile, gap: 8 }}>
        {caption("npx hyper-elements check")}
        <Column style={{ backgroundColor: INK, padding: 16, gap: 10, height: H.row }}>
          <Column>{written.map((line, i) => <Row key={i}>{mono(line, DIM)}</Row>)}</Column>
          <Column>{refused.map((line, i) => <Row key={i}>{mono(line, ENAMEL)}</Row>)}</Column>
        </Column>
      </Column>
    </Row>
  </Canvas>
);

const dejavu = { family: "DejaVu Sans Mono", src: readFileSync("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"), weight: 500 as const };
const { image, diagnostics } = await renderImage(board, { fonts: [...(await fontFiles()), dejavu], images, scale: 2 });
for (const d of diagnostics) console.log(`${d.severity} ${d.code}: ${d.message}`);
writeFileSync(join(ROOT, "docs", "hero.png"), image);
console.log("docs/hero.png", { written, refused });
