import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { linkSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { parseResumePdfArgs } from '../scripts/export-resume-pdf.mjs';

const script = fileURLToPath(new URL('../scripts/export-resume-pdf.mjs', import.meta.url));

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

test('PDF export rejects the same input and output path', () => {
  assert.throws(
    () => parseResumePdfArgs(['resume.html', '--out', 'resume.html']),
    /输出不能指向 HTML 输入文件/,
  );
});

test('PDF export rejects equivalent relative and absolute paths', () => {
  assert.throws(
    () => parseResumePdfArgs([resolve('resume.html'), '--out', 'resume.html']),
    /输出不能指向 HTML 输入文件/,
  );
});

test('PDF export rejects Windows path aliases that differ only in case', { skip: process.platform !== 'win32' }, () => {
  const input = resolve('resume.html');
  assert.throws(
    () => parseResumePdfArgs([input, '--out', input.toUpperCase()]),
    /输出不能指向 HTML 输入文件/,
  );
});

test('PDF export rejects a hard-linked output alias', () => {
  const directory = mkdtempSync(join(tmpdir(), 'resume-pdf-test-'));
  const input = join(directory, 'resume.html');
  const alias = join(directory, 'resume-alias.html');
  try {
    writeFileSync(input, '<!doctype html><title>Resume</title>');
    linkSync(input, alias);
    assert.throws(
      () => parseResumePdfArgs([input, '--out', alias]),
      /输出不能指向 HTML 输入文件/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
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
  const result = spawnSync(process.execPath, [script, '--out'], { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /导出失败：[\s\S]*--out/);
  assert.equal(result.stdout, '');
});

test('PDF export CLI preserves the source when input and output are the same file', () => {
  const directory = mkdtempSync(join(tmpdir(), 'resume-pdf-test-'));
  const input = join(directory, 'resume.html');
  const source = '<!doctype html><title>Resume</title>';
  try {
    writeFileSync(input, source);
    const result = spawnSync(process.execPath, [script, input, '--out', input], { encoding: 'utf8', timeout: 5000 });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /导出失败：[\s\S]*输出不能指向 HTML 输入文件/);
    assert.equal(result.stdout, '');
    assert.equal(readFileSync(input, 'utf8'), source);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
