import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const syncScript = join(ROOT, 'scripts', 'sync-skill-catalog.mjs');

function loadRegistry() {
  return JSON.parse(readFileSync(join(ROOT, 'skills.registry.json'), 'utf8'));
}

test('registry entries are unique and match skills/ directories one-to-one', () => {
  const reg = loadRegistry();
  const names = reg.entries.map((e) => e.name);
  assert.equal(new Set(names).size, names.length, 'duplicate entry names in registry');
  const dirs = readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();
  assert.deepEqual([...names].sort(), dirs, 'skills/ dirs must equal registry entries');
  for (const e of reg.entries) {
    assert.ok(e.zh && e.en, 'entry ' + e.name + ' needs zh/en metadata');
    assert.ok(e.zh.menuLabel && e.zh.prompt && e.zh.opencodeDetail && e.zh.deliverables, 'entry ' + e.name + ' incomplete zh fields');
    assert.ok(e.en.menu && e.en.deliverables, 'entry ' + e.name + ' incomplete en fields');
    assert.ok(e.zh.prompt.startsWith('用 /' + e.name), 'prompt must start with 用 /name');
  }
});

test('sync --check passes: every generated artifact is in sync', () => {
  const out = execFileSync(process.execPath, [syncScript, '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(out, /sync OK/);
});

test('generated catalog files use LF line endings', () => {
  const rels = [
    '.codex-plugin/plugin.json',
    '.trae-plugin/plugin.json',
    '.claude-plugin/plugin.json',
    '.claude-plugin/marketplace.json',
    '.opencode-plugin/plugin.json',
    'package.json',
    '.opencode-plugin/install-opencode.py',
    '.workbuddy-plugin/install.sh',
    '.workbuddy-plugin/install.ps1',
    '.workbuddy-plugin/install.md',
    'README.md',
    'README_en.md',
    '.github/ISSUE_TEMPLATE/bug_report.yml',
    '.github/ISSUE_TEMPLATE/feature_request.yml',
  ];
  for (const rel of rels) {
    const text = readFileSync(join(ROOT, rel), 'utf8');
    assert.ok(!text.includes('\r'), rel + ' must use LF line endings');
  }
});
