import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "bin", "asu-skills.js");

function tempHome(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "asu-skills-cli-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function cli(args, home, cwd = ROOT) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    env: { ...process.env, HOME: home, USERPROFILE: home, NO_COLOR: "1" },
    encoding: "utf8",
  });
}

test("installs skills and shared resources into a Codex home", (t) => {
  const home = tempHome(t);
  const result = cli(["install", "--codex"], home);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /9 个技能已安装/);
  assert.ok(fs.existsSync(path.join(home, ".codex", "skills", "make-resume", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(home, ".codex", "assets", "asu-resume", "template.html")));
  assert.ok(fs.existsSync(path.join(home, ".codex", "references")));
  assert.ok(fs.existsSync(path.join(home, ".codex", "scripts", "inline-template.mjs")));
});

test("dry-run does not create the target directory", (t) => {
  const home = tempHome(t);
  const result = cli(["install", "--cursor", "--dry-run"], home);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\[dry-run\] cursor/);
  assert.equal(fs.existsSync(path.join(home, ".cursor")), false);
});

test("refuses to overwrite an unmanaged skill without --force", (t) => {
  const home = tempHome(t);
  const skill = path.join(home, ".agents", "skills", "contributor");
  fs.mkdirSync(skill, { recursive: true });
  fs.writeFileSync(path.join(skill, "SKILL.md"), "custom\n", "utf8");

  const result = cli(["install"], home);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /非 ASu-skills 管理/);
  assert.equal(fs.readFileSync(path.join(skill, "SKILL.md"), "utf8"), "custom\n");
});

test("checks shared-file conflicts before changing the target", (t) => {
  const home = tempHome(t);
  const script = path.join(home, ".codex", "scripts", "inline-template.mjs");
  fs.mkdirSync(path.dirname(script), { recursive: true });
  fs.writeFileSync(script, "custom\n", "utf8");

  const result = cli(["install", "--codex"], home);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /scripts.inline-template\.mjs/);
  assert.equal(fs.readFileSync(script, "utf8"), "custom\n");
  assert.equal(fs.existsSync(path.join(home, ".codex", "skills", "contributor")), false);
});

test("doctor reports the installed skill count", (t) => {
  const home = tempHome(t);
  execFileSync(process.execPath, [CLI, "install", "--codex"], {
    env: { ...process.env, HOME: home, USERPROFILE: home, NO_COLOR: "1" },
  });

  const result = cli(["doctor", "--codex"], home);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /codex: 9\/9 个技能可用/);
});
