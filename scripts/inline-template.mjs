#!/usr/bin/env node
// 壳文件 -> 自包含 HTML。
//
// 背景：assets/templates-html/ 下 18 套模板的外框（style / 顶部工具栏 / script）已抽成共享
// frame/ 三部件，模板文件降级为纯设计稿壳文件（内容 + <link frame/base.css>）。本脚本把壳文件
// 拼回与现状逐字节等价的自包含 HTML，交付用户前必须经过它。
//
// 用法：
//   node scripts/inline-template.mjs <壳文件> [输出文件]    # 无输出文件时打印到 stdout
//   node scripts/inline-template.mjs --all <输出目录>        # 内联 assets/templates-html/ 下全部壳文件
//   node scripts/inline-template.mjs --check <基准目录>      # 内联全部壳文件并与基准目录同名文件逐字节比对
//
// 零依赖；内联是确定性的——交付统一走本脚本即得一致产物，不维护逐字节基准。
// --check 可对任意基准目录做临时逐字节比对，改动 frame/ 后用于人工自测。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const TEMPLATES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'templates-html');
const FRAME_LINK = '<link rel="stylesheet" href="frame/base.css">';

// 壳文件预览专用的 SHELL-ONLY 规则块（frame/base.css 末尾），交付时整块移除，保证逐字节等价。
const SHELL_ONLY_RE = /\r?\n\/\* @@SHELL-ONLY-START@@[\s\S]*?@@SHELL-ONLY-END@@ \*\/\r?\n/;

function inlineOne(shellPath) {
  const shellDir = path.dirname(shellPath);
  const html = fs.readFileSync(shellPath, 'utf8');

  if (!html.includes(FRAME_LINK)) {
    throw new Error(`不是壳文件（缺少 ${FRAME_LINK}）：${shellPath}`);
  }
  if (!html.includes(' design-preview')) {
    throw new Error(`不是壳文件（缺少 design-preview 类）：${shellPath}`);
  }

  const eol = html.includes('\r\n') ? '\r\n' : '\n';

  // 1) 移除 design-preview 类（壳文件无 toolbar 的观感处理，交付产物不带）
  let out = html.replace(' design-preview', '');

  // 2) 内联 CSS（剥离壳文件预览专用的 SHELL-ONLY 规则，产物与历史基准逐字节相等）
  const css = fs.readFileSync(path.join(shellDir, 'frame', 'base.css'), 'utf8')
    .replace(SHELL_ONLY_RE, '');
  out = out.replace(FRAME_LINK, `<style>${eol}${css}</style>`);

  // 3) 注入顶部工具栏（壳文件 body 顶部）
  const toolbar = fs.readFileSync(path.join(shellDir, 'frame', 'toolbar.html'), 'utf8');
  out = out.replace(/<body[^>]*>\r?\n/, (m) => m + toolbar);

  // 4) 注入编辑脚本（</body> 前）
  const editor = fs.readFileSync(path.join(shellDir, 'frame', 'editor.js'), 'utf8');
  out = out.replace('</body>', `<script>${eol}${editor}</script></body>`);

  return out;
}

function inlineAll(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith('.html')).sort();
  for (const f of files) {
    const out = inlineOne(path.join(TEMPLATES_DIR, f));
    fs.writeFileSync(path.join(outDir, f), out);
  }
  return files;
}

function checkAll(baselineDir) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-template-'));
  const files = inlineAll(outDir);
  let ok = true;
  try {
    for (const f of files) {
      const baselinePath = path.join(baselineDir, f);
      if (!fs.existsSync(baselinePath)) {
        console.error(`缺少基准文件：${f}`);
        ok = false;
        continue;
      }
      const outBytes = fs.readFileSync(path.join(outDir, f));
      const baselineBytes = fs.readFileSync(baselinePath);
      if (Buffer.compare(outBytes, baselineBytes) !== 0) {
        console.error(`逐字节不一致：${f}`);
        ok = false;
      } else {
        console.log(`逐字节一致：${f}`);
      }
    }
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  return ok;
}

const [arg1, arg2] = process.argv.slice(2);

if (arg1 === '--all') {
  if (!arg2) {
    console.error('用法：node scripts/inline-template.mjs --all <输出目录>');
    process.exit(2);
  }
  inlineAll(arg2);
  console.log(`已内联 ${TEMPLATES_DIR} 下全部壳文件到 ${arg2}`);
} else if (arg1 === '--check') {
  if (!arg2) {
    console.error('用法：node scripts/inline-template.mjs --check <基准目录>');
    process.exit(2);
  }
  process.exit(checkAll(arg2) ? 0 : 1);
} else if (arg1) {
  const out = inlineOne(arg1);
  if (arg2) fs.writeFileSync(arg2, out);
  else process.stdout.write(out);
} else {
  console.error(`用法见文件头部注释。TEMPLATES_DIR=${TEMPLATES_DIR}`);
  process.exit(2);
}
