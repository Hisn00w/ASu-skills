import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { escapeLatex, escapeUrl, renderResume } from '../scripts/build-latex-resume.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(repoRoot, ...parts), 'utf8');
const template = () => read('assets', 'latex-resume', 'template.tex');

// 仓库不编译 LaTeX（不引入 TeX Live 依赖），因此测试只做确定性静态检查：
// 转义正确、标记全部替换、环境与花括号配对。编译在 Overleaf 完成。

test('escapeLatex 覆盖全部十个 LaTeX 特殊字符', () => {
  assert.equal(escapeLatex('\\'), '\\textbackslash{}');
  assert.equal(escapeLatex('{}'), '\\{\\}');
  assert.equal(escapeLatex('$'), '\\$');
  assert.equal(escapeLatex('&'), '\\&');
  assert.equal(escapeLatex('#'), '\\#');
  assert.equal(escapeLatex('^'), '\\textasciicircum{}');
  assert.equal(escapeLatex('_'), '\\_');
  assert.equal(escapeLatex('~'), '\\textasciitilde{}');
  assert.equal(escapeLatex('%'), '\\%');
  assert.equal(escapeLatex(undefined), '');
  assert.equal(escapeLatex(null), '');
});

test('escapeLatex 处理简历中真实会出现的字符组合', () => {
  assert.equal(escapeLatex('C++ 与 C#'), 'C++ 与 C\\#');
  assert.equal(escapeLatex('效率提升 30%'), '效率提升 30\\%');
  assert.equal(escapeLatex('snake_case_name'), 'snake\\_case\\_name');
  assert.equal(escapeLatex('A&B 科技'), 'A\\&B 科技');
  assert.equal(escapeLatex('成本 $100/月'), '成本 \\$100/月');
  assert.equal(escapeLatex('延迟 ~1ms'), '延迟 \\textasciitilde{}1ms');
  // 反斜杠不能让插入的控制序列被二次转义
  assert.equal(escapeLatex('C:\\Users'), 'C:\\textbackslash{}Users');
});

test('escapeUrl 只保护 URL 中会破坏 \\url 的字符', () => {
  assert.equal(escapeUrl('https://example.com/a_b?x=1&y=2'), 'https://example.com/a_b?x=1&y=2');
  assert.equal(escapeUrl('https://example.com/a#frag'), 'https://example.com/a\\#frag');
  assert.equal(escapeUrl('https://example.com/100%25'), 'https://example.com/100\\%25');
});

test('示例数据渲染后没有残留构建标记，且结构配对', () => {
  const data = JSON.parse(read('assets', 'resume-data-template.json'));
  const tex = renderResume(data, template());

  assert.doesNotMatch(tex, /^% @[A-Z_]+$/m, '存在未被替换的 @ 标记');
  assert.match(tex, /\\documentclass\[a4paper,10pt\]\{ctexart\}/);
  assert.equal((tex.match(/\\begin\{document\}/g) || []).length, 1);
  assert.equal((tex.match(/\\end\{document\}/g) || []).length, 1);
  assert.equal(
    (tex.match(/\\begin\{itemize\}/g) || []).length,
    (tex.match(/\\end\{itemize\}/g) || []).length,
    'itemize 环境未配对',
  );

  // 去掉转义后的花括号再检查配对，可捕获转义遗漏导致的结构破坏
  const stripped = tex.replace(/\\[{}]/g, '');
  assert.equal((stripped.match(/\{/g) || []).length, (stripped.match(/\}/g) || []).length, '花括号未配对');
});

test('特殊字符内容不会破坏产物结构', () => {
  const tex = renderResume(
    {
      profile: { name: '张三 & 李四', phone: '100%', email: 'a_b@example.com', target_role: 'C# 工程师' },
      education: [{ school: 'X{Y}大学', major_degree: 'A\\B', dates: '2020~2024' }],
      skills: [{ label: '语言：', text: 'C++、C#、$SHELL、~/.bashrc' }],
    },
    template(),
  );

  assert.doesNotMatch(tex, /^% @[A-Z_]+$/m);
  const stripped = tex.replace(/\\[{}]/g, '');
  assert.equal((stripped.match(/\{/g) || []).length, (stripped.match(/\}/g) || []).length);
  // 原始特殊字符不得以未转义形式进入正文
  assert.match(tex, /张三 \\& 李四/);
  assert.match(tex, /100\\%/);
});

test('缺省字段的整节不输出，不产生空标题', () => {
  const tex = renderResume({ profile: { name: '张三' } }, template());

  assert.doesNotMatch(tex, /\\section\*/);
  assert.doesNotMatch(tex, /^% @[A-Z_]+$/m);
  assert.match(tex, /\\asuname\{张三\}/);
});

test('缺少姓名时明确报错，母版缺少标记时明确报错', () => {
  assert.throws(() => renderResume({}, template()), /缺少 profile\.name/);
  assert.throws(() => renderResume({ profile: { name: '张三' } }, '\\documentclass{ctexart}'), /缺少构建标记/);
});

test('命令行渲染成功且不修改仓库母版', () => {
  const before = template();
  const temp = mkdtempSync(join(tmpdir(), 'latex-resume-'));
  try {
    const dataPath = join(temp, 'data.json');
    const outPath = join(temp, 'resume.tex');
    writeFileSync(dataPath, read('assets', 'resume-data-template.json'));

    const result = spawnSync(process.execPath, ['scripts/build-latex-resume.mjs', dataPath, outPath], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(readFileSync(outPath, 'utf8'), /\\begin\{document\}/);
    assert.equal(template(), before, '母版被修改');
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('母版遵守可复现性约定：不指定字体、不引入非标准宏包', () => {
  // 注释里会提到这些约定本身，因此只检查真正生效的代码行
  const code = template()
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('%'))
    .join('\n');

  assert.doesNotMatch(code, /\\setCJKmainfont|\\setmainfont/, '指定字体会导致跨环境编译失败');
  assert.doesNotMatch(code, /shell-?escape|\\write18/, '不得依赖 shell-escape');

  const packages = [...code.matchAll(/\\usepackage(?:\[[^\]]*\])?\{([^}]*)\}/g)].flatMap((m) =>
    m[1].split(',').map((name) => name.trim()),
  );
  const allowed = new Set(['geometry', 'enumitem', 'xcolor', 'titlesec', 'hyperref']);
  packages.forEach((name) => assert.ok(allowed.has(name), `非基础发行版宏包：${name}`));
});

test('项目链接用 \\url 单独成行，避免长链接溢出页边距', () => {
  const tex = renderResume(
    {
      profile: { name: '张三' },
      projects: [{ name: '示例项目', url: 'https://github.com/example/a-very-long-repository-name' }],
    },
    template(),
  );

  assert.match(tex, /\\url\{https:\/\/github\.com\/example\/a-very-long-repository-name\}/);
  assert.doesNotMatch(tex, /\\asuentry\{[^}]*\}\{\\(?:href|url)/, '链接不应放进 \\hfill 右栏');
});

test('写给维护者的注释块不进入用户产物', () => {
  const tex = renderResume({ profile: { name: '李明' } }, template());

  // 母版保留约定供维护者阅读
  assert.match(template(), /@@TEMPLATE-ONLY-START@@/);
  assert.match(template(), /可复现性约定/);

  // 产物里不残留标记，也不带维护者才需要的内容
  assert.doesNotMatch(tex, /@@TEMPLATE-ONLY-(START|END)@@/);
  assert.doesNotMatch(tex, /可复现性约定/);
  assert.doesNotMatch(tex, /简历母版/);
  assert.doesNotMatch(tex, /@ 标记由构建脚本替换/);

  // 用户需要的编译说明必须保留
  assert.match(tex, /Overleaf 使用步骤/);
  assert.match(tex, /Compiler 选 XeLaTeX/);

  // 删除后第一行仍是注释，不产生前导空行
  assert.match(tex, /^% ASu-skills LaTeX 简历\n/);
});
