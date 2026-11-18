/**
 * docs/peregrine.gif: four notices, hard cuts. The Harbour line closes (five posters, the card), the Moor line skips
 * Saltmarket (two posters), the Viaduct line runs fewer trams (six posters), and a closure with no replacement bus,
 * which gets no posters at all: check refuses it. Each frame is a Canvas drawn with Hyper Elements.
 *
 *   npx tsx scripts/gif.tsx
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Canvas, Column, Image, Row, Text } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import { CONCRETE, ENAMEL, INK, MONO, QUIET } from "../templates/_kit/brand.ts";
import { affectedStops, headline, type Notice } from "../templates/_kit/copy.ts";
import { fontFiles } from "./fonts.ts";

const ROOT = join(import.meta.dirname, "..");
const CLI = join(ROOT, "node_modules", "@hyper-elements", "cli", "dist", "bin.js");
const TMP = mkdtempSync(join(tmpdir(), "peregrine-gif-"));
const POSTER = { width: 164, height: 232 };
const CARD = { width: 400, height: 225 };

const fonts = [
  ...(await fontFiles()),
  { family: "DejaVu Sans Mono", src: readFileSync("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"), weight: 500 as const },
];
const images: Record<string, Buffer> = {};
const asset = (file: string, width: number, height: number) => {
  const src = `https://peregrine.example/gif/${file.split("/").slice(-2).join("-")}`;
  images[src] = readFileSync(file);
  return { src, width, height };
};
const caption = (text: string, color = "#3F454C") => (
  <Text style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color, lineHeight: 1.2 }}>{text}</Text>
);

/** One notice's posters and card, rendered fresh. */
function outputs(id: string) {
  const run = spawnSync(process.execPath, [CLI, "render", `designs/${id}/`, "--out", TMP], { cwd: ROOT, encoding: "utf8" });
  if (run.status !== 0) throw new Error(run.stdout + run.stderr);
  const dir = join(TMP, "designs", id);
  execFileSync("pdftoppm", ["-png", "-scale-to-x", String(POSTER.width * 2), "-scale-to-y", "-1", join(dir, "stop-poster.a4.pdf"), join(dir, "page")]);
  const pages = readdirSync(dir).filter((f) => f.startsWith("page")).sort().map((f) => join(dir, f));
  return { pages, card: join(dir, "notice-card.landscape.png") };
}

const brief = (id: string) => JSON.parse(readFileSync(join(ROOT, "designs", id, "brief.json"), "utf8")) as Notice;

/** A frame: the posters along the top, then the card and what it is. */
function frame(id: string, title: string, note: string) {
  const n = brief(id);
  const { pages, card } = outputs(id);
  const stops = affectedStops(n);
  const h = headline(n);
  return (
    <Canvas width={1200} height={675} style={{ backgroundColor: CONCRETE, padding: 48, gap: 28 }}>
      <Column style={{ gap: 12 }}>
        {caption(`${n.notice} · ${title} · ${pages.length} ${pages.length === 1 ? "poster" : "posters"}`)}
        <Row style={{ gap: 14 }}>
          {pages.map((page, i) => (
            <Column key={page} style={{ width: POSTER.width, gap: 6 }}>
              <Image src={asset(page, POSTER.width * 2, Math.round(POSTER.width * 2 * 1.4142))} alt={`The poster at ${stops[i]}`} style={{ width: POSTER.width }} />
              {caption(stops[i]!)}
            </Column>
          ))}
        </Row>
      </Column>
      <Row style={{ gap: 28, alignItems: "end" }}>
        <Image src={asset(card, 2400, 1350)} alt="The social card" style={{ width: CARD.width }} />
        <Column style={{ gap: 8, flex: 1 }}>
          {caption("The headline, written by the template")}
          <Text style={{ fontFamily: "Atkinson Hyperlegible Next", fontWeight: 800, fontSize: 30, letterSpacing: -0.45, lineHeight: 1.05, color: INK }}>{`${h.verb} ${h.where.join(" ")}`}</Text>
          <Text style={{ fontFamily: MONO, fontWeight: 500, fontSize: 13, lineHeight: 1.5, color: QUIET }}>{note}</Text>
        </Column>
      </Row>
    </Canvas>
  );
}

/** The last frame: a closure with no replacement bus. Nothing is drawn, and check says why. */
function refusal() {
  const run = spawnSync(process.execPath, [CLI, "check", "_refused/closure-without-bus.values.json"], { cwd: join(ROOT, "designs"), encoding: "utf8" });
  const said = run.stdout.split("\n").filter((line) => /^[✓✗]|^\s+error /.test(line)).map((line) => line.trim());
  const stops = affectedStops(brief("pe-2701"));
  const outline = { width: POSTER.width, height: Math.round(POSTER.width * 1.4142), border: { width: 2, style: "dashed" as const, color: QUIET }, justifyContent: "center" as const, alignItems: "center" as const };
  return (
    <Canvas width={1200} height={675} style={{ backgroundColor: CONCRETE, padding: 48, gap: 28 }}>
      <Column style={{ gap: 12 }}>
        {caption("The same closure, with no replacement bus · no posters")}
        <Row style={{ gap: 14 }}>
          {stops.map((stop) => (
            <Column key={stop} style={{ width: POSTER.width, gap: 6 }}>
              <Column style={outline}>
                <Text style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: QUIET, textAlign: "center", width: POSTER.width - 4 }}>Not written</Text>
              </Column>
              {caption(stop)}
            </Column>
          ))}
        </Row>
      </Column>
      <Row style={{ gap: 28, alignItems: "end" }}>
        <Column style={{ backgroundColor: INK, padding: 24, gap: 6, width: CARD.width, height: CARD.height, justifyContent: "center" }}>
          {said.map((line, i) => (
            <Text key={i} style={{ fontFamily: `${MONO}, DejaVu Sans Mono`, fontWeight: 500, fontSize: 13, lineHeight: 1.5, color: ENAMEL }}>{line}</Text>
          ))}
        </Column>
        <Column style={{ gap: 8, flex: 1 }}>
          {caption("npx hyper-elements check")}
          <Text style={{ fontFamily: "Atkinson Hyperlegible Next", fontWeight: 800, fontSize: 30, letterSpacing: -0.45, lineHeight: 1.05, color: INK }}>A closure that doesn't say how to get through is never drawn</Text>
          <Text style={{ fontFamily: MONO, fontWeight: 500, fontSize: 13, lineHeight: 1.5, color: QUIET }}>No email, no card, no posters: check names the field, and the planner adds the bus.</Text>
        </Column>
      </Row>
    </Canvas>
  );
}

const frames = [
  { el: frame("pe-2701", "Harbour line closed", "A poster for each of the five stations in the stretch, each with its own status and YOU ARE HERE. Bus 1X, every 10 minutes."), seconds: 2.4 },
  { el: frame("pe-2702", "Moor line skips a stop", "A poster at the stop trains skip, and at the one to use instead: 7 minutes' walk, and the step-free way."), seconds: 2.2 },
  { el: frame("pe-2703", "Viaduct line, fewer trams", "Every stop of the line gets a poster, with the evening's departures: every 8 minutes, then every 20."), seconds: 2.2 },
  { el: refusal(), seconds: 3 },
];

const list: string[] = [];
for (const [i, f] of frames.entries()) {
  const { image, diagnostics } = await renderImage(f.el, { fonts, images, scale: 1 });
  for (const d of diagnostics) console.log(`frame ${i}: ${d.severity} ${d.code}: ${d.message}`);
  const file = join(TMP, `frame-${i}.png`);
  writeFileSync(file, image);
  list.push(`file '${file}'`, `duration ${f.seconds}`);
}
list.push(list.at(-2)!); // the concat demuxer holds the last frame only if it's listed again
writeFileSync(join(TMP, "frames.txt"), list.join("\n"));
const gif = join(ROOT, "docs", "peregrine.gif");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(TMP, "frames.txt"), "-vf", "split[a][b];[a]palettegen=max_colors=128:stats_mode=full[p];[b][p]paletteuse=dither=none", "-loop", "0", gif]);
console.log(`docs/peregrine.gif (${Math.round(readFileSync(gif).length / 1024)} KB), frames in ${TMP}`);
