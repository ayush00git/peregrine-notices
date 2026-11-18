/**
 * After a change to a template: make every notice again from its brief (designs/<id>/brief.json), checked by the
 * template as it is now, and point the refused notices at the templates' new hashes. A notice the changed template
 * refuses isn't written, and this exits 1 naming it.
 *
 *   npx tsx scripts/rerecord.ts
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CLI = join(ROOT, "node_modules", "@hyper-elements", "cli", "dist", "bin.js");
const TEMPLATES = ["notice-email", "stop-poster", "notice-card"];
const designs = join(ROOT, "designs");

let failed = false;
const recorded = new Map<string, { sha256: string; version: string }>();
for (const id of readdirSync(designs).filter((d) => !d.startsWith("_") && existsSync(join(designs, d, "brief.json")))) {
  for (const t of TEMPLATES) {
    const out = `designs/${id}/${t}.values.json`;
    const run = spawnSync(process.execPath, [CLI, "design", "new", `templates/${t}.tsx`, "-o", out, "--values", `designs/${id}/brief.json`], { cwd: ROOT, encoding: "utf8" });
    console.log(run.status === 0 ? `✓ ${out}` : `✗ ${out}\n${run.stdout}${run.stderr}`);
    if (run.status !== 0) failed = true;
    else {
      const file = JSON.parse(readFileSync(join(ROOT, out), "utf8"));
      recorded.set(file.template.id, { sha256: file.template.sha256, version: file.template.version });
    }
  }
}
for (const name of readdirSync(join(designs, "_refused")).filter((f) => f.endsWith(".values.json"))) {
  const path = join(designs, "_refused", name);
  const file = JSON.parse(readFileSync(path, "utf8"));
  const now = recorded.get(file.template.id);
  if (!now) continue;
  Object.assign(file.template, now);
  writeFileSync(path, JSON.stringify(file, null, 2));
}
console.log(`refused notices pointed at the templates as they are now`);
process.exitCode = failed ? 1 : 0;
