import assert from 'node:assert/strict';
import { readdirSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(repoRoot, ...parts), 'utf8');

test('make-resume delivery HTML includes local save and photo-frame states', () => {
  const toolbar = read('assets', 'templates-html', 'frame', 'toolbar.html');
  const editor = read('assets', 'templates-html', 'frame', 'editor.js');
  const css = read('assets', 'templates-html', 'frame', 'base.css');

  assert.match(toolbar, /data-action="save"[^>]*>保存 HTML</);
  assert.match(editor, /showSaveFilePicker/);
  assert.match(editor, /link\.download = name/);
  assert.match(editor, /clone\.outerHTML/);
  assert.match(editor, /classList\.add\('has-photo'\)/);
  assert.match(css, /\.photo-frame\.has-photo\s*\{[^}]*border-color:transparent/);
  assert.match(css, /@media print\s*\{[\s\S]*?\.photo-frame\s*\{[^}]*border-color:transparent/);

  const templatesDir = join(repoRoot, 'assets', 'templates-html');
  const shells = readdirSync(templatesDir).filter((name) => name.endsWith('.html')).sort();
  assert.equal(shells.length, 18);
  shells.forEach((name) => assert.match(readFileSync(join(templatesDir, name), 'utf8'), /class="photo-frame"/));

  const result = spawnSync(
    process.execPath,
    ['scripts/inline-template.mjs', join('assets', 'templates-html', shells[0])],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stdout, /frame\/base\.css/);
  assert.match(result.stdout, /data-action="save"[^>]*>保存 HTML</);
  assert.match(result.stdout, /showSaveFilePicker/);
});

test('make-resume default ASu template saves HTML and hides the photo placeholder when appropriate', () => {
  const html = read('assets', 'asu-resume-template.html');
  const source = read('assets', 'asu-resume', 'template.html');

  const result = spawnSync(process.execPath, ['scripts/build-asu-resume.mjs', '--check'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(source, /<base href="\.\.\/">/);
  assert.match(source, /href="templates-html\/frame\/asu\/base\.css"/);
  assert.match(source, /<!-- @ASU_TOOLBAR -->/);
  assert.match(source, /<!-- @ASU_EDITOR -->/);
  assert.doesNotMatch(source, /<style>/);
  const sharedEditor = read('assets', 'templates-html', 'frame', 'editor.js').trim();
  assert.ok(html.replace(/\r\n/g, '\n').includes(sharedEditor.replace(/\r\n/g, '\n')));
  assert.doesNotMatch(read('assets', 'templates-html', 'frame', 'asu', 'editor.js'), /showSaveFilePicker|registerLocalFont|execCommand/);

  assert.match(html, /data-action="save"[^>]*>保存 HTML</);
  assert.match(html, /showSaveFilePicker/);
  assert.match(html, /link\.download = name/);
  assert.match(html, /\.profile-photo-slot\.has-photo\s*\{[^}]*border-color:\s*transparent/);
  assert.match(html, /@media print\s*\{[\s\S]*?\.profile-photo-slot\s*\{[^}]*border-color:\s*transparent/);
  assert.match(html, /\.profile-photo-slot::after, \.profile-photo-slot \.photo-placeholder\s*\{\s*display:\s*none !important/);
});

test('copied user shells build with shared functionality without modifying the mother', () => {
  const temp = mkdtempSync(join(tmpdir(), 'resume-user-shell-'));
  const mother = read('assets', 'asu-resume-template.html');
  const templates = readdirSync(join(repoRoot, 'assets', 'templates-html')).filter((name) => name.endsWith('.html'));
  try {
    for (const template of ['asu', ...templates]) {
      const source = template === 'asu' ? read('assets', 'asu-resume', 'template.html') : read('assets', 'templates-html', template);
      const shell = join(temp, 'content.html');
      const output = join(temp, 'delivery.html');
      writeFileSync(shell, source.replace(/<title>.*?<\/title>/, '<title>User content test</title>'));
      const result = spawnSync(process.execPath, [template === 'asu' ? 'scripts/build-asu-resume.mjs' : 'scripts/inline-template.mjs', shell, output], { cwd: repoRoot, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      const html = readFileSync(output, 'utf8');
      assert.match(html, /<title>User content test<\/title>/);
      assert.equal((html.match(/const registerLocalFont =/g) || []).length, 1);
      assert.equal((html.match(/data-action="save"/g) || []).length, 2); // markup and its shared event binding
      assert.doesNotMatch(html, /@import|<link rel="stylesheet"/);
      assert.ok(html.replace(/\r\n/g, '\n').includes(read('assets', 'templates-html', 'frame', 'editor.js').trim().replace(/\r\n/g, '\n')));
    }
    assert.equal(read('assets', 'asu-resume-template.html'), mother);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
