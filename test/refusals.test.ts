/**
 * The mistakes a tired planner (or an agent) makes, each kept in designs/_refused/ as the values file it would write,
 * and each still refused: by the field that's wrong, with the words a person would need to fix it. Run through the
 * CLI, as CI and an agent would.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CLI = join(ROOT, "node_modules", "@hyper-elements", "cli", "dist", "bin.js");

/** Each refusal: the code, the field it's at, and words the message must say. */
const EXPECTED: Record<string, { code: string; path: string; says: string }> = {
  "closure-without-bus": { code: "template/required", path: "values.change[0].bus", says: "Replacement bus is required" },
  "stop-on-another-line": { code: "template/value", path: "values.change[0].from", says: 'From (a Harbour line stop): expected one of' },
  "stop-misspelt": { code: "template/value", path: "values.change[0].to", says: 'not "Mill brook"' },
  "two-changes-in-one-notice": { code: "template/count", path: "values.change", says: "this template takes exactly 1" },
  "time-not-24-hour": { code: "template/value", path: "values.change[0].lastTrainBefore", says: "24-hour, like 23:40" },
  "no-step-free-way": { code: "template/required", path: "values.change[0].stepFree", says: "Step-free way through (which stop, bus or lift) is required" },
  "date-as-words": { code: "template/value", path: "values.starts", says: 'expected a date as YYYY-MM-DD, not "this weekend"' },
  "extra-time-too-long": { code: "template/value", path: "values.extraMinutes", says: "from 0 to 60, not 90" },
  "works-end-before-they-start": { code: "template/render", path: "root", says: "The works end (2027-01-09) before they start (2027-01-11)" },
  "posted-too-late": { code: "template/render", path: "root", says: "riders need at least 7 days' notice" },
  "skip-the-end-of-the-line": { code: "template/render", path: "root", says: "High Moor is the end of the Moor line, so trains can't skip it" },
  "too-long-for-a-poster": { code: "template/render", path: "root", says: "Too long for a poster: what to do and why run 1 line past the page" },
  "fewer-that-isnt-fewer": { code: "template/render", path: "root", says: "A train every 12 minutes isn't fewer: the Airport line runs every 15 minutes" },
};

type Result = { file?: string; status?: string; diagnostics?: { code: string; severity: string; message: string; path?: string }[] };

test("every refused notice is still refused, at its field, in words a planner can act on", () => {
  const run = spawnSync(process.execPath, [CLI, "check", "designs/_refused/", "--json"], { cwd: ROOT, encoding: "utf8" });
  assert.equal(run.status, 1, `check should exit 1 on the refused notices:\n${run.stderr}`);
  const results = run.stdout.trim().split("\n").map((line) => JSON.parse(line) as Result).filter((r) => r.file);

  const files = readdirSync(join(ROOT, "designs", "_refused")).filter((f) => f.endsWith(".values.json"));
  assert.deepEqual(files.map((f) => f.replace(".values.json", "")).sort(), Object.keys(EXPECTED).sort(), "designs/_refused and this test list the same notices");

  for (const result of results) {
    const name = result.file!.split("/").pop()!.replace(".values.json", "");
    const want = EXPECTED[name]!;
    const errors = (result.diagnostics ?? []).filter((d) => d.severity === "error");
    assert.equal(result.status, "error", `${name} should be refused`);
    assert.equal(errors.length, 1, `${name}: one error, not ${errors.length}: ${errors.map((e) => e.message).join("; ")}`);
    assert.equal(errors[0]!.code, want.code, name);
    assert.equal(errors[0]!.path, want.path, name);
    assert.ok(errors[0]!.message.includes(want.says), `${name}: "${errors[0]!.message}" should say "${want.says}"`);
  }
});
