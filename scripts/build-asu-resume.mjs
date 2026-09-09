#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(repoRoot, 'assets', 'asu-resume');
const frameDir = path.join(repoRoot, 'assets', 'templates-html', 'frame', 'asu');
const outputPath = path.join(repoRoot, 'assets', 'asu-resume-template.html');

const normalizeEol = (text, eol) => text.replace(/\r\n|\r|\n/g, eol);
const stripFinalEol = (text) => text.replace(/(?:\r\n|\r|\n)+$/, '');
const replaceRequired = (text, marker, replacement) => {
  if (!text.includes(marker)) throw new Error(`ASu 模板缺少构建标记：${marker}`);
  return text.replace(marker, replacement);
};

function build() {
  const shellSource = fs.readFileSync(path.join(sourceDir, 'template.html'), 'utf8');
  const eol = shellSource.includes('\r\n') ? '\r\n' : '\n';
  const shell = normalizeEol(shellSource, eol);
  const readPart = (name) => stripFinalEol(
    normalizeEol(fs.readFileSync(path.join(frameDir, name), 'utf8'), eol),
  );

  const css = readPart('base.css');
  const toolbar = readPart('toolbar.html');
  const editor = readPart('editor.js');
  let output = replaceRequired(shell, `  <base href="../">${eol}`, '');
  output = replaceRequired(
    output,
    '  <link rel="stylesheet" href="templates-html/frame/asu/base.css">',
    `  <style>${eol}${css}${eol}  </style>`,
  );
  output = replaceRequired(output, '  <!-- @ASU_TOOLBAR -->', toolbar);
  output = replaceRequired(
    output,
    '  <!-- @ASU_EDITOR -->',
    `  <script>${eol}${editor}${eol}  </script>`,
  );
  return output;
}

const generated = build();
if (process.argv[2] === '--check') {
  const current = fs.readFileSync(outputPath, 'utf8');
  if (generated !== current) {
    console.error('assets/asu-resume-template.html 与解耦源文件不一致，请运行 npm run build:asu-resume');
    process.exit(1);
  }
  console.log('ASu 简历模板生成产物一致');
} else {
  fs.writeFileSync(outputPath, generated);
  console.log(`已生成 ${path.relative(repoRoot, outputPath)}`);
}
