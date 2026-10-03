import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(repoRoot, ...parts), 'utf8');
const readJson = (...parts) => JSON.parse(read(...parts));

test('DeepSeek Harness package declares an installable bundle', () => {
  const pkg = readJson('package.json');
  assert.equal(pkg.dsh?.bundle?.patch, './cordis.patch.yml');
  assert.equal(pkg.main, './lib/index.js');
  assert.ok(statSync(join(repoRoot, 'lib', 'index.js')).isFile());
  assert.match(read('cordis.patch.yml'), /name:\s+'@deepseek-ai\/dsh-skill-filesystem'/);
  assert.match(read('cordis.patch.yml'), /providerName:\s+asu-skills/);
  assert.match(read('cordis.patch.yml'), /includeDefaultRoots:\s+false/);
});

test('DeepSeek Harness package exposes display metadata and a valid icon', () => {
  const pkg = readJson('package.json');
  assert.equal(pkg.icon, './assets/asu-circle.png');
  assert.equal(pkg.exports['./locale/*.json'], './locale/*.json');
  assert.equal(pkg.exports['./icon'], './assets/asu-circle.png');
  assert.ok(pkg.files.includes('locale/*.json'));
  assert.ok(pkg.files.includes('assets'));

  const icon = readFileSync(join(repoRoot, 'assets', 'asu-circle.png'));
  assert.ok(icon.length > 0 && icon.length <= 256 * 1024, `icon must be <= 256 KiB, got ${icon.length}`);
  assert.deepEqual([...icon.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  for (const locale of ['en', 'zh']) {
    const metadata = readJson('locale', `${locale}.json`);
    assert.match(metadata.meta.title, /\S/);
    assert.match(metadata.meta.description, /\S/);
  }
});

test('DeepSeek Harness metadata stays aligned with the skill registry', () => {
  const pkg = readJson('package.json');
  const registry = readJson('skills.registry.json');
  assert.equal(pkg.name, registry.name);
  assert.equal(pkg.license, registry.license);
  assert.equal(pkg.repository.url, `git+${registry.repository}.git`);
  assert.equal(registry.entries.length, 9);
});
