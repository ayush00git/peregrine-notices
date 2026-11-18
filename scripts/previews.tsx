/**
 * docs/clients/*.png: PE-2701's email as classic Outlook, Gmail and Apple Mail on an iPhone draw it, from Hyper
 * Elements' email client emulator (@hyper-elements/email-clients). An emulator, not an inbox: the README says so.
 *
 *   npx tsx scripts/previews.tsx
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import type { ReactElement } from "react";
import { renderInEmailClients } from "@hyper-elements/email-clients";
import { readValuesFile } from "@hyper-elements/react/template";
import NoticeEmail from "../templates/notice-email.tsx";

const ROOT = join(import.meta.dirname, "..");
const TMP = mkdtempSync(join(tmpdir(), "peregrine-previews-"));
const file = JSON.parse(await readFile(join(ROOT, "designs", "pe-2701", "notice-email.values.json"), "utf8"));
const { values } = readValuesFile(file, NoticeEmail);
const checked = NoticeEmail.check(values);
if (!checked.valid) throw new Error(checked.diagnostics.map((d) => d.message).join("\n"));

// The checked snapshot, so what's previewed is what was checked. renderInEmailClients() takes one at run time; its
// types (email-clients 0.5.0) only name an element or HTML, hence the cast.
const snapshot = checked.snapshots.default! as unknown as ReactElement;
const { previews } = await renderInEmailClients(snapshot, { emailClients: ["outlook", "gmail", "apple-mail"], fonts: "inline" });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
await mkdir(join(ROOT, "docs", "clients"), { recursive: true });
for (const preview of previews) {
  const html = join(TMP, preview.filename);
  await writeFile(html, preview.html);
  const phone = /iphone|app/.test(preview.filename);
  const page = await browser.newPage({ viewport: { width: phone ? 430 : 900, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`file://${html}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const png = join(ROOT, "docs", "clients", preview.filename.replace(/\.html$/, ".png"));
  await page.screenshot({ path: png, fullPage: true });
  console.log(png.replace(ROOT + "/", ""));
  await page.close();
}
await browser.close();
