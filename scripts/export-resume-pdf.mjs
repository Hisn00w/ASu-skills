#!/usr/bin/env node
/**
 * 无头浏览器导出简历 PDF（preferCSSPageSize：让纸张尺寸以 CSS @page 为准）
 *
 * 用法：
 *   node scripts/export-resume-pdf.mjs [htmlPath] [--out out.pdf]
 *         [--paper-width 8.27] [--paper-height 11.69] [--browser <path>]
 *
 * 说明：
 * - 零依赖：Node 24 原生 WebSocket/fetch + 系统 Edge/Chrome 的 CDP 接口，
 *   不引入 puppeteer-core，避免给插件仓库增加 node_modules / lockfile。
 * - Page.printToPDF 的 preferCSSPageSize:true 会让 PDF 纸张尺寸跟随 HTML 里
 *   @page { size: ... } 的声明（本模板为 210mm×297mm A4）；--paper-* 仅作
 *   CSS 未声明页面尺寸时的兜底。配合 printBackground、四边 0 边距，可得到与
 *   @media print 一致的、精确 A4 的 PDF，不受浏览器默认 Letter/A4 设置影响。
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { writeFileSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename, extname, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export function parseResumePdfArgs(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      out: { type: 'string' },
      browser: { type: 'string', default: '' },
      'paper-width': { type: 'string', default: '8.27' },
      'paper-height': { type: 'string', default: '11.69' },
    },
  });
  if (positionals.length > 1) throw new Error('只能指定一个 HTML 输入文件');
  const htmlPath = resolve(positionals[0] ?? 'assets/resume-template-editable.html');
  return {
    htmlPath,
    outPath: resolve(values.out ?? basename(htmlPath).replace(extname(htmlPath), '.pdf')),
    paperWidth: Number(values['paper-width']),
    paperHeight: Number(values['paper-height']),
    browserOverride: values.browser,
  };
}

const BROWSERS = [
  process.env.EDGE_PATH,
  process.env.CHROME_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/microsoft-edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean);

/* 极简 CDP 客户端：仅需 send(method, params) */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(`${msg.error.code}: ${msg.error.message}`)) : resolve(msg.result);
      }
    });
  }
  static connect(url) {
    const ws = new WebSocket(url);
    const cdp = new CDP(ws);
    return new Promise((resolve, reject) => {
      ws.addEventListener('open', () => resolve(cdp), { once: true });
      ws.addEventListener('error', () => reject(new Error('无法连接 CDP：' + url)), { once: true });
    });
  }
  send(method, params = {}) {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { try { this.ws.close(); } catch { /* noop */ } }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((resolve) => {
  const srv = createServer();
  srv.listen(0, '127.0.0.1', () => {
    const { port } = srv.address();
    srv.close(() => resolve(port));
  });
});
const fetchJson = async (url) => (await fetch(url)).json();

async function main() {
  const { htmlPath, outPath, paperWidth, paperHeight, browserOverride } = parseResumePdfArgs(process.argv.slice(2));
  const browserPath = [browserOverride, ...BROWSERS].find((p) => p && existsSync(p));
  if (!browserPath) {
    throw new Error('未找到 Edge/Chrome。可用 --browser <path> 或环境变量 EDGE_PATH/CHROME_PATH 指定。');
  }
  const port = await freePort();
  const userDataDir = join(tmpdir(), `resume-pdf-${process.pid}-${Date.now()}`);
  const browser = spawn(browserPath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: 'ignore' });

  let pageCdp;
  try {
    // 等待调试端口与初始 about:blank 页就绪
    let version = null;
    for (let i = 0; i < 50 && !version; i++) {
      try { version = await fetchJson(`http://127.0.0.1:${port}/json/version`); }
      catch { await sleep(200); }
    }
    if (!version) throw new Error('浏览器调试端口未就绪');

    let pageWs = null;
    for (let i = 0; i < 50 && !pageWs; i++) {
      try {
        const list = await fetchJson(`http://127.0.0.1:${port}/json/list`);
        pageWs = (list.find((t) => t.type === 'page') || {}).webSocketDebuggerUrl;
      } catch { await sleep(200); }
    }
    if (!pageWs) throw new Error('未找到页面调试连接');

    pageCdp = await CDP.connect(pageWs);
    const url = pathToFileURL(htmlPath).href;
    await pageCdp.send('Page.enable');
    await pageCdp.send('Page.navigate', { url });

    // 等待 load 事件（带 15s 兜底超时）
    await new Promise((resolve) => {
      const done = () => { pageCdp.ws.removeEventListener('message', listener); resolve(); };
      const listener = (ev) => {
        try { const msg = JSON.parse(ev.data); if (msg.method === 'Page.loadEventFired') done(); } catch { /* 忽略非 JSON 帧 */ }
      };
      pageCdp.ws.addEventListener('message', listener);
      setTimeout(done, 15000);
    });

    // 等待字体就绪，避免文本量测/渲染偏差
    await pageCdp.send('Runtime.evaluate', {
      expression: 'document.fonts ? document.fonts.ready.then(() => true) : true',
      awaitPromise: true,
      returnByValue: true,
    }).catch(() => {});

    const { data } = await pageCdp.send('Page.printToPDF', {
      preferCSSPageSize: true,
      printBackground: true,
      paperWidth,
      paperHeight,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    });
    writeFileSync(outPath, Buffer.from(data, 'base64'));
    console.log(`已导出 PDF：${outPath}\n源文件：${htmlPath}`);
  } catch (err) {
    console.error('导出失败：', err.message);
    process.exitCode = 1;
  } finally {
    if (pageCdp) pageCdp.close();
    try { browser.kill(); } catch { /* noop */ }
    await new Promise((r) => setTimeout(r, 600)); // 等 Edge 释放目录句柄
    try {
      rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
    } catch (err) {
      console.warn('清理临时目录失败（可忽略）：', err.message);
    }
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('导出失败：', error.message);
    process.exitCode = 1;
  });
}
