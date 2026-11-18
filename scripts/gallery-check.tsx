/**
 * Does each gallery/ file render the way the Hyper Elements site's generator renders a gallery template
 * (apps/website/scripts/generate.mjs)? The same steps: bundle the file alone with esbuild, only @hyper-elements/react,
 * @hyper-elements/email-clients and React resolvable; render <Example /> with the email client checks; for a Document
 * or a Canvas, take the fonts from Example({}).props.fonts (Google Fonts, fetched by family and weight as TTF) and
 * write the PDF or PNG.
 *
 *   npx tsx scripts/gallery.ts && npx tsx scripts/gallery-check.tsx
 */
import { build, type Plugin } from "esbuild";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

const ROOT = join(import.meta.dirname, "..");
const TMP = mkdtempSync(join(tmpdir(), "peregrine-gallery-"));
const require = createRequire(join(ROOT, "package.json"));
const ALLOWED = /^(@hyper-elements\/react(\/.*)?|@hyper-elements\/email-clients|@hyper-elements\/email-client-models|react(-dom)?(\/.*)?)$/;

/** Only what the site's generator resolves; anything else fails the bundle, as it would there. */
const onlyTheSites: Plugin = {
  name: "only-the-sites",
  setup(b) {
    b.onResolve({ filter: /^[^./]/ }, ({ path, importer }) => {
      if (importer.includes("node_modules")) return undefined;
      if (!ALLOWED.test(path)) return { errors: [{ text: `${path} isn't something the gallery's generator can resolve` }] };
      return { path: require.resolve(path), external: path.startsWith("@hyper-elements/email-client") };
    });
  },
};

async function googleFont(family: string, weight: number) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:ital,wght@0,${weight}`)).text();
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`Google Fonts has no TTF for ${family} ${weight}`);
  return Buffer.from(await (await fetch(url)).arrayBuffer());
}

let failed = false;
for (const file of (await readdir(join(ROOT, "gallery"))).filter((f) => f.endsWith(".tsx")).sort()) {
  const slug = file.replace(/\.tsx$/, "");
  const entry = join(TMP, `${slug}.entry.tsx`);
  await writeFile(
    entry,
    [
      `import Example, * as mod from ${JSON.stringify(join(ROOT, "gallery", file))};`,
      `import { outline, render } from "@hyper-elements/react";`,
      `import { emailClients } from "@hyper-elements/email-clients";`,
      `export const meta = mod.meta ?? {};`,
      `export const element = () => <Example />;`,
      `export const rootElement = () => Example({});`,
      `export async function run() {`,
      `  const { html, text, diagnostics } = await render(<Example />, { plugins: [await emailClients()] });`,
      `  return { html, text, diagnostics, outline: outline(<Example />) };`,
      `}`,
    ].join("\n"),
  );
  const bundle = join(TMP, `${slug}.cjs`);
  try {
    await build({ entryPoints: [entry], outfile: bundle, bundle: true, platform: "node", format: "cjs", jsx: "automatic", logLevel: "silent", plugins: [onlyTheSites] });
  } catch (error) {
    console.error(`✗ gallery/${file}: doesn't bundle as the site bundles it:\n${String((error as Error).message)}`);
    failed = true;
    continue;
  }
  const { run, meta, element, rootElement } = createRequire(import.meta.url)(bundle);
  const result = await run();
  const errors = result.diagnostics.filter((d: { severity: string }) => d.severity === "error");
  let binary = "";
  if (meta.root === "Document" || meta.root === "Canvas") {
    const fonts = [];
    for (const f of rootElement().props.fonts ?? []) {
      if (!String(f.src).includes("fonts.gstatic.com")) continue;
      fonts.push({ family: f.family, src: await googleFont(f.family, f.weight ?? 400), weight: f.weight ?? 400 });
    }
    const mod = meta.root === "Canvas" ? await import("@hyper-elements/react/image") : await import("@hyper-elements/react/pdf");
    const out =
      meta.root === "Canvas"
        ? await (mod as typeof import("@hyper-elements/react/image")).renderImage(element(), { fonts, images: {}, scale: 1 })
        : await (mod as typeof import("@hyper-elements/react/pdf")).renderPdf(element(), { fonts, images: {} });
    const bytes = "image" in out ? out.image : (out as { pdf: Uint8Array }).pdf;
    await mkdir(join(TMP, "out"), { recursive: true });
    const target = join(TMP, "out", `${slug}.${meta.root === "Canvas" ? "png" : "pdf"}`);
    await writeFile(target, bytes);
    binary = ` and ${target} (${Math.round(bytes.length / 1024)} KB, ${out.diagnostics.length} diagnostics)`;
    errors.push(...out.diagnostics.filter((d: { severity: string }) => d.severity === "error"));
  }
  const notes = result.diagnostics.filter((d: { severity: string }) => d.severity !== "error").map((d: { code: string }) => d.code);
  console.log(`${errors.length ? "✗" : "✓"} gallery/${file} (${meta.root}): ${result.html.length} bytes of HTML${binary}${notes.length ? `; notes: ${[...new Set(notes)].join(", ")}` : ""}`);
  for (const e of errors) console.log(`    ${e.code}: ${e.message}`);
  if (errors.length) failed = true;
}
process.exitCode = failed ? 1 : 0;
