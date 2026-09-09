#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(repoRoot, 'assets', 'asu-resume');
const frameDir = path.join(repoRoot, 'assets', 'templates-html', 'frame', 'asu');
const sharedDir = path.dirname(frameDir);
const [input, destination] = process.argv.slice(2);
const custom = input && input !== '--check';
if (custom && !destination) throw new Error('用法：node scripts/build-asu-resume.mjs <用户内容壳> <输出 HTML>');
const outputPath = custom ? path.resolve(destination) : path.join(repoRoot, 'assets', 'asu-resume-template.html');
if (custom && [path.resolve(input), path.join(sourceDir, 'template.html'), path.join(repoRoot, 'assets', 'asu-resume-template.html')].includes(outputPath)) {
  throw new Error('用户输出不能覆盖内容壳或仓库母版');
}

const normalizeEol = (text, eol) => text.replace(/\r\n|\r|\n/g, eol);
const stripFinalEol = (text) => text.replace(/(?:\r\n|\r|\n)+$/, '');
const replaceRequired = (text, marker, replacement) => {
  if (!text.includes(marker)) throw new Error(`ASu 模板缺少构建标记：${marker}`);
  return text.replace(marker, replacement);
};

function build() {
  const shellSource = fs.readFileSync(custom ? input : path.join(sourceDir, 'template.html'), 'utf8');
  const eol = shellSource.includes('\r\n') ? '\r\n' : '\n';
  const shell = normalizeEol(shellSource, eol);
  const readPart = (name) => stripFinalEol(
    normalizeEol(fs.readFileSync(path.join(frameDir, name), 'utf8'), eol),
  );

  const shared = (name) => normalizeEol(fs.readFileSync(path.join(sharedDir, name), 'utf8'), eol);
  const css = readPart('base.css').replace('@import url("../toolbar.css");', shared('toolbar.css'));
  const toolbar = shared('toolbar.html').replace('</div>', readPart('toolbar.html') + '</div>');
  const editor = readPart('editor.js') + eol + shared('editor.js');
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
