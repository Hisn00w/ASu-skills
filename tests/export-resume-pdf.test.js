import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { parseResumePdfArgs } from '../scripts/export-resume-pdf.mjs';

test('PDF export preserves the default input and A4 fallback dimensions', () => {
  assert.deepEqual(parseResumePdfArgs([]), {
    htmlPath: resolve('assets/resume-template-editable.html'),
    outPath: resolve('resume-template-editable.pdf'),
    paperWidth: 8.27,
    paperHeight: 11.69,
    browserOverride: '',
  });
});

test('PDF export does not treat an option value as the optional HTML input', () => {
  for (const args of [
    ['--out', 'output/resume.pdf'],
    ['--browser', '/Applications/Browser App/browser'],
    ['--paper-width', '8.5', '--paper-height', '11'],
  ]) {
    assert.equal(parseResumePdfArgs(args).htmlPath, resolve('assets/resume-template-editable.html'));
  }
});

test('PDF export accepts options before and after an HTML path containing spaces', () => {
  const input = 'user files/resume.html';
  const options = ['--out', 'output files/resume.pdf', '--browser', '/Applications/Browser App/browser', '--paper-width', '8.5', '--paper-height', '11'];
  const expected = {
    htmlPath: resolve(input),
    outPath: resolve('output files/resume.pdf'),
    paperWidth: 8.5,
    paperHeight: 11,
    browserOverride: '/Applications/Browser App/browser',
  };
  assert.deepEqual(parseResumePdfArgs([input, ...options]), expected);
  assert.deepEqual(parseResumePdfArgs([...options, input]), expected);
  assert.deepEqual(parseResumePdfArgs([...options.slice(0, 2), input, ...options.slice(2)]), expected);
});

test('PDF export derives the output basename from an explicit input', () => {
  assert.equal(parseResumePdfArgs(['user files/resume.htm']).outPath, resolve('resume.pdf'));
});

test('PDF export accepts equals syntax and an option terminator', () => {
  const parsed = parseResumePdfArgs(['--out=output.pdf', '--browser=browser path', '--paper-width=8.5', '--paper-height=11', '--', '--resume.html']);
  assert.deepEqual(parsed, {
    htmlPath: resolve('--resume.html'),
    outPath: resolve('output.pdf'),
    paperWidth: 8.5,
    paperHeight: 11,
    browserOverride: 'browser path',
  });
});

test('PDF export rejects missing option values and extra input paths', () => {
  for (const option of ['--out', '--browser', '--paper-width', '--paper-height']) {
    assert.throws(() => parseResumePdfArgs([option]), { code: 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE' });
  }
  assert.throws(() => parseResumePdfArgs(['--out', '--browser', 'browser']), { code: 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE' });
  assert.throws(() => parseResumePdfArgs(['one.html', 'two.html']), /一个 HTML/);
});

test('PDF export reports invalid CLI arguments before launching a browser', () => {
  const script = fileURLToPath(new URL('../scripts/export-resume-pdf.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [script, '--out'], { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /导出失败：[\s\S]*--out/);
  assert.equal(result.stdout, '');
});
