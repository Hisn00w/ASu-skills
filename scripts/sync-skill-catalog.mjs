// @ts-check
/**
 * ASu-skills 入口目录同步器（单一事实源 = skills.registry.json）
 *
 * 用法：
 *   node scripts/sync-skill-catalog.mjs            # 生成全部派生文件/字段
 *   node scripts/sync-skill-catalog.mjs --check    # 只对账，不写盘；不一致时退出码 1
 *
 * 由 skills.registry.json 生成：
 *   - .codex-plugin/plugin.json / .trae-plugin/plugin.json
 *   - .claude-plugin/plugin.json / .claude-plugin/marketplace.json
 *   - .opencode-plugin/plugin.json（skills.entries + 描述字段）
 *   - package.json 的 keywords
 *   - .opencode-plugin/install-opencode.py 的 SKILL_NAMES 与触发词输出
 *   - .workbuddy-plugin/install.sh / install.ps1 的技能数组、数量文案与输出
 *   - .workbuddy-plugin/install.md 的目录清单区
 *   - README.md / README_en.md 的入口总览区
 *   - .github/ISSUE_TEMPLATE/*.yml 的“相关技能”选项
 *   - 输出统一以 LF 为行尾；--check 不受工作区 CRLF 检出影响
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const NL = '\n';

// ------------------------------------------------ utils
const zhNum = (n) => (n >= 1 && n <= 9 ? '零一二三四五六七八九'[n] : String(n));
const enNum = (n) => (['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'][n] ?? String(n));
const joinCn = (list) => (list.length <= 1 ? list.join('') : list.slice(0, -1).join('、') + '和' + list[list.length - 1]);
const uniq = (xs) => [...new Set(xs)];
const json = (obj) => JSON.stringify(obj, null, 2) + '\n';

function withRegion(text, id, kind, body) {
  const open = kind === 'html' ? '<!-- catalog:' + id + ':begin -->' : '# catalog:' + id + ':begin';
  const close = kind === 'html' ? '<!-- catalog:' + id + ':end -->' : '# catalog:' + id + ':end';
  const ib = text.indexOf(open);
  if (ib < 0) throw new Error('region marker not found: ' + open);
  const ie = text.indexOf(close);
  if (ie < ib) throw new Error('region end marker not found or misplaced: ' + close);
  const lineStart = text.lastIndexOf(NL, ib) + 1;
  const newlineAt = text.indexOf(NL, ie);
  const lineEnd = newlineAt === -1 ? text.length : newlineAt;
  const block = open + NL + body + NL + close;
  const tail = text.slice(lineEnd + 1);
  return text.slice(0, lineStart) + block + NL + tail;
}
function read(rel) { return readFileSync(join(ROOT, rel), 'utf8').replace(/\r\n?/g, NL); }
function readRaw(rel) { return readFileSync(join(ROOT, rel), 'utf8'); }
function write(rel, text) {
  const lf = text.replace(/\r\n?/g, NL);
  writeFileSync(join(ROOT, rel), lf.endsWith(NL) ? lf : lf + NL);
}

// ------------------------------------------------ inputs
const registry = JSON.parse(read('skills.registry.json'));
const pkg = JSON.parse(read('package.json'));
const version = pkg.version;
const entries = registry.entries;
const names = entries.map((e) => e.name);
const slashList = names.map((n) => '/' + n).join('、');
const fnList = joinCn(entries.map((e) => e.zh.menuLabel));
const prompts = entries.map((e) => e.zh.prompt);
const keywords = uniq([...registry.keywordsBase, ...names]);
const workbuddy = entries.filter((e) => !e.excludeFrom || !e.excludeFrom.workbuddy);
const wbNames = workbuddy.map((e) => e.name);

const changes = [];
function stage(label, current, next) { if (current !== next) changes.push(label); return next; }

// ------------------------------------------------ JSON manifests
const common = {
  name: registry.name,
  version,
  author: registry.author,
  homepage: registry.homepage,
  repository: registry.repository,
  license: registry.license,
  keywords,
};

const codex = {
  ...common,
  description: '中文求职工作流：' + fnList + '。',
  skills: './skills/',
  interface: {
    displayName: registry.displayName,
    shortDescription: '用 ' + slashList + ' 完成中文求职工作流',
    longDescription: 'ASu-skills 将' + fnList + '拆成' + zhNum(entries.length) + '个可单独调用的 Codex skill。',
    developerName: registry.developerName,
    category: registry.category,
    capabilities: ['Interactive', 'Write'],
    websiteURL: registry.websiteURL,
    defaultPrompt: prompts,
    brandColor: registry.brandColor,
    composerIcon: registry.composerIcon,
    logo: registry.logo,
  },
};

const trae = {
  ...common,
  description: '中文求职工作流：' + fnList + '。',
  skills: './skills/',
  interface: {
    displayName: registry.displayName,
    shortDescription: '用 ' + slashList + ' 完成中文求职工作流',
    longDescription: 'ASu-skills 将' + fnList + '拆成' + zhNum(entries.length) + '个可单独调用的 TraeWork skill，挂在同一个 asu-skills 插件下。',
    developerName: registry.developerName,
    category: registry.category,
    capabilities: ['Interactive', 'Read', 'Write'],
    websiteURL: registry.websiteURL,
    defaultPrompt: prompts,
    brandColor: registry.brandColor,
    composerIcon: registry.composerIcon,
    logo: registry.logo,
  },
};

const claude = {
  name: registry.name,
  displayName: registry.displayName,
  description: '中文求职工作流：' + fnList + '。',
  ...common,
};

const marketplace = {
  name: 'asu',
  description: 'ASu 中文求职工作流插件市场。',
  owner: { name: registry.author.name, url: registry.author.url },
  plugins: [{
    ...common,
    name: registry.name,
    source: './',
    displayName: registry.displayName,
    description: '用 ' + slashList + ' 完成中文求职工作流。',
    category: registry.category,
  }],
};

const opencodeInstall = {
  method: 'copy',
  source: 'skills',
  destination: '{opencode_skills_dir}',
  instructions: {
    zh: registry.snippets.opencodeInstructionsZh,
    en: registry.snippets.opencodeInstructionsEn,
  },
};

const opencode = {
  ...common,
  description: '中文求职工作流插件：' + fnList + '。',
  skills: {
    path: './skills',
    entries: entries.map((e) => ({ name: e.name, description: e.zh.menuLabel + '：' + e.zh.opencodeDetail })),
  },
  install: opencodeInstall,
};

const pkgKeywords = uniq(['dsh-plugin', 'deepseek-harness', 'agent-skill', ...keywords]);
const nextPkg = { ...pkg, keywords: pkgKeywords };

// ------------------------------------------------ content builders
function readmeBlock(lang) {
  const zh = lang === 'zh';
  const head = zh
    ? 'ASu-skills 现在是一个插件包。安装后会提供' + zhNum(entries.length) + '个可单独调用的入口：'
    : 'ASu-skills is now a plugin pack. Installing it provides ' + enNum(entries.length) + ' individually callable entry points:';
  const header = zh ? '| 入口 | 用途 | 主要交付 |' : '| Entry | Purpose | Primary deliverables |';
  const sep = '| --- | --- | --- |';
  const rows = entries.map((e) => {
    const cols = zh
      ? ['`/' + e.name + '`', e.zh.menuLabel, e.zh.deliverables]
      : ['`/' + e.name + '`', e.en.menu, e.en.deliverables];
    return '| ' + cols.join(' | ') + ' |';
  });
  return [head, '', header, sep].concat(rows).join(NL);
}

function wbIntro() {
  const listed = wbNames.map((n) => '`' + n + '`').join(' / ');
  const lines = ['> 适用场景：WorkBuddy 用户想直接复用本仓库已有的 ' + wbNames.length + ' 个可桥接中文求职技能（' + listed + '），而无需等待完整移植。'];
  for (const e of workbuddy.length === 0 ? [] : entries.filter((x) => x.excludeFrom && x.excludeFrom.workbuddy)) {
    lines.push('> 未纳入桥接：`' + e.name + '`（' + e.excludeFrom.workbuddy + '）。');
  }
  return lines.join(NL);
}

function wbCopy() {
  const namesArg = wbNames.map((n) => 'skills/' + n).join(' ');
  return [
    '把仓库 `skills/` 下可桥接的 ' + wbNames.length + ' 个技能目录整体复制到 `~/.workbuddy/skills/`：',
    '',
    '```bash',
    'cp -r ' + namesArg + ' "$HOME/.workbuddy/skills/"',
    '```',
  ].join(NL);
}

function wbUninstall() {
  const items = wbNames.map((n) => '"$HOME/.workbuddy/skills/' + n + '"');
  return [
    '删除 `~/.workbuddy/skills/` 下对应的软链 / 目录即可：',
    '',
    '```bash',
    'rm -rf ' + items.join(' '),
    '```',
  ].join(NL);
}

const wbEchoTail = '  ' + wbNames.join(' / ');
const pySkillTuple = ['SKILL_NAMES = ('].concat(names.map((n) => '    "' + n + '",'), [')']).join(NL);
const pyEcho = 'TRIGGER_WORDS = "' + names.map((n) => '/' + n).join('  ') + '"';

const regionTargets = [
  { rel: '.opencode-plugin/install-opencode.py', kind: 'hash', id: 'opencode.skills', body: pySkillTuple },
  { rel: '.opencode-plugin/install-opencode.py', kind: 'hash', id: 'opencode.echo', body: pyEcho },
  { rel: '.workbuddy-plugin/install.sh', kind: 'hash', id: 'wb.sh.header', body: ['# ASu-skills → WorkBuddy 轻量安装入口（macOS / Linux）', '# 把仓库原版 skills/ 下可桥接的 ' + wbNames.length + ' 个技能软链到 ~/.workbuddy/skills/'].join(NL) },
  { rel: '.workbuddy-plugin/install.sh', kind: 'hash', id: 'wb.sh.skills', body: 'SKILLS=(' + wbNames.join(' ') + ')' },
  { rel: '.workbuddy-plugin/install.sh', kind: 'hash', id: 'wb.sh.echo', body: ['echo ""', 'echo "Done. 重启 WorkBuddy（或刷新技能列表）后即可触发："', 'echo "' + wbEchoTail + '"'].join(NL) },
  { rel: '.workbuddy-plugin/install.ps1', kind: 'hash', id: 'wb.ps1.header', body: '# 把仓库原版 skills/ 下可桥接的 ' + wbNames.length + ' 个技能桥接到 $HOME/.workbuddy/skills/' },
  { rel: '.workbuddy-plugin/install.ps1', kind: 'hash', id: 'wb.ps1.skills', body: "$skills   = @('" + wbNames.join("', '") + "')" },
  { rel: '.workbuddy-plugin/install.ps1', kind: 'hash', id: 'wb.ps1.echo', body: ['Write-Host ""', 'Write-Host "Done. 重启 WorkBuddy（或刷新技能列表）后即可触发："', 'Write-Host "' + wbEchoTail + '"'].join(NL) },
  { rel: '.workbuddy-plugin/install.md', kind: 'html', id: 'wb.md.intro', body: wbIntro() },
  { rel: '.workbuddy-plugin/install.md', kind: 'html', id: 'wb.md.copy', body: wbCopy() },
  { rel: '.workbuddy-plugin/install.md', kind: 'html', id: 'wb.md.uninstall', body: wbUninstall() },
  { rel: 'README.md', kind: 'html', id: 'readme.zh.intro', body: readmeBlock('zh') },
  { rel: 'README_en.md', kind: 'html', id: 'readme.en.intro', body: readmeBlock('en') },
  { rel: '.github/ISSUE_TEMPLATE/bug_report.yml', kind: 'hash', id: 'issue.bug.options', body: entries.map((e) => '        - /' + e.name + ' ' + e.zh.menuLabel).join(NL) },
  { rel: '.github/ISSUE_TEMPLATE/feature_request.yml', kind: 'hash', id: 'issue.feature.options', body: entries.map((e) => '        - /' + e.name + ' ' + e.zh.menuLabel).join(NL) },
];

// ------------------------------------------------ cross-checks (before any write)
const skillDirs = readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
  .map((d) => d.name)
  .sort();
const sortedNames = [...names].sort();
const problems = [];
if (JSON.stringify(skillDirs) !== JSON.stringify(sortedNames)) {
  problems.push('skills/ 目录与 registry 不一致：目录多出=' + skillDirs.filter((n) => !sortedNames.includes(n)).join(',') + '；registry 多出=' + sortedNames.filter((n) => !skillDirs.includes(n)).join(','));
}
const seen = new Set();
for (const e of entries) {
  if (seen.has(e.name)) problems.push('registry 存在重复入口: ' + e.name);
  seen.add(e.name);
  for (const field of ['zh.menuLabel', 'zh.prompt', 'zh.opencodeDetail', 'zh.deliverables', 'en.menu', 'en.deliverables']) {
    const [a, b] = field.split('.');
    if (!e[a] || typeof e[a][b] !== 'string' || !e[a][b].trim()) problems.push('entry ' + e.name + ' 缺少 ' + field);
  }
  if (e.excludeFrom && !Object.keys(e.excludeFrom).every((h) => h === 'workbuddy')) problems.push('entry ' + e.name + ' 的 excludeFrom 含未知宿主');
}
for (const t of regionTargets) {
  const text = read(t.rel);
  const token = t.kind === 'html' ? '<!-- catalog:' + t.id + ':begin -->' : '# catalog:' + t.id + ':begin';
  if (!text.includes(token)) problems.push('缺少 catalog 标记: ' + t.rel + ' [' + t.id + ']（请先运行一次手动补标记或检查文件）');
}
if (problems.length) {
  console.error('skill catalog problems:');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}

// ------------------------------------------------ write or stage
const fileTargets = [
  ['.codex-plugin/plugin.json', json(codex)],
  ['.trae-plugin/plugin.json', json(trae)],
  ['.claude-plugin/plugin.json', json(claude)],
  ['.claude-plugin/marketplace.json', json(marketplace)],
  ['.opencode-plugin/plugin.json', json(opencode)],
  ['package.json', json(nextPkg)],
];
for (const [rel, next] of fileTargets) stage(rel, read(rel), next);
for (const t of regionTargets) {
  const text = read(t.rel);
  stage(t.rel, text, withRegion(text, t.id, t.kind, t.body));
}

if (CHECK) {
  if (changes.length) {
    console.error('skill catalog drift detected:');
    for (const c of changes) console.error('  - ' + c);
    console.error('请运行 node scripts/sync-skill-catalog.mjs 后重新提交。');
    process.exit(1);
  }
  console.log('skill catalog sync OK (' + entries.length + ' entries, nothing to change)');
} else {
  const synced = [];
  for (const [rel, next] of fileTargets) {
    if (readRaw(rel) !== next) { write(rel, next); synced.push(rel); }
  }
  for (const t of regionTargets) {
    const text = read(t.rel);
    const next = withRegion(text, t.id, t.kind, t.body);
    if (readRaw(t.rel) !== next) { write(t.rel, next); synced.push(t.rel); }
  }
  const uniqSynced = [...new Set(synced)];
  if (uniqSynced.length) {
    console.log('synced ' + uniqSynced.length + ' file(s):');
    for (const c of uniqSynced) console.log('  - ' + c + (changes.includes(c) ? '' : '（行尾统一为 LF）'));
  } else {
    console.log('skill catalog sync OK (' + entries.length + ' entries, nothing to change)');
  }
}
