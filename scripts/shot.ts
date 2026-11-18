/**
 * Screenshot an HTML file (an email or a page) in Chromium, at a width: `npx tsx scripts/shot.ts in.html out.png 600`.
 * Uses Playwright's Chromium: set CHROMIUM_PATH if yours isn't where Playwright looks.
 */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [input, output, width = "600", scale = "1"] = process.argv.slice(2);
if (!input || !output) throw new Error("usage: tsx scripts/shot.ts in.html out.png [width] [scale]");
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: Number(width), height: 800 }, deviceScaleFactor: Number(scale) });
await page.goto(pathToFileURL(resolve(input)).href, { waitUntil: "networkidle" });
await mkdir(dirname(resolve(output)), { recursive: true });
await page.screenshot({ path: output, fullPage: true });
await browser.close();
console.log(`${output} (${width}px wide)`);
