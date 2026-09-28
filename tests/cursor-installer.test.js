import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const installer = join(ROOT, '.cursor-skills', 'install.sh');
const registry = JSON.parse(readFileSync(join(ROOT, 'skills.registry.json'), 'utf8'));
const cursorSkills = registry.entries
  .filter((entry) => !entry.excludeFrom || !entry.excludeFrom.cursor)
  .map((entry) => entry.name);

test('Cursor Bash installer protects ordinary directories and force replaces them', {
  skip: process.platform === 'win32',
}, () => {
  const home = mkdtempSync(join(tmpdir(), 'asu-cursor-installer-'));
  const skillsDir = join(home, '.cursor', 'skills');
  const existing = join(skillsDir, cursorSkills[0]);
  const marker = join(existing, 'keep.txt');
  const env = { ...process.env, HOME: home };

  try {
    mkdirSync(existing, { recursive: true });
    writeFileSync(marker, 'keep\n');

    let error;
    try {
      execFileSync('bash', [installer, '--user'], { cwd: ROOT, env, encoding: 'utf8' });
    } catch (caught) {
      error = caught;
    }
    assert.ok(error, 'ordinary directory must block installation without --force');
    assert.match(String(error.stderr), /--force/);
    assert.ok(existsSync(marker), 'blocked installation must preserve existing contents');

    execFileSync('bash', [installer, '--user', '--force'], { cwd: ROOT, env, encoding: 'utf8' });
    for (const name of cursorSkills) {
      const installed = join(skillsDir, name);
      assert.ok(lstatSync(installed).isSymbolicLink(), name + ' should be installed as a symlink');
      assert.ok(existsSync(join(installed, 'SKILL.md')), name + ' should expose SKILL.md');
    }

    execFileSync('bash', [installer, '--user'], { cwd: ROOT, env, encoding: 'utf8' });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
