import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { escapeLatex, escapeUrl, renderResume, resolvePhotoName } from '../scripts/build-latex-resume.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(repoRoot, ...parts), 'utf8');
const template = () => read('assets', 'latex-resume', 'template.tex');
const templateDir = join(repoRoot, 'assets', 'latex-resume');
// 所有母版共享同一套渲染契约，遍历检查可让新增版式自动纳入覆盖
const allTemplates = () => readdirSync(templateDir).filter((f) => f.endsWith('.tex')).sort();

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

test('每套母版都遵守可复现性约定：不指定字体、不引入非标准宏包', () => {
  const allowed = new Set(['geometry', 'enumitem', 'xcolor', 'titlesec', 'hyperref', 'graphicx']);

  for (const name of allTemplates()) {
    // 注释里会提到这些约定本身，因此只检查真正生效的代码行
    const code = readFileSync(join(templateDir, name), 'utf8')
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('%'))
      .join('\n');

    assert.doesNotMatch(code, /\\setCJKmainfont|\\setmainfont/, `${name}：指定字体会导致跨环境编译失败`);
    assert.doesNotMatch(code, /shell-?escape|\\write18/, `${name}：不得依赖 shell-escape`);

    const packages = [...code.matchAll(/\\usepackage(?:\[[^\]]*\])?\{([^}]*)\}/g)].flatMap((m) =>
      m[1].split(',').map((pkg) => pkg.trim()),
    );
    packages.forEach((pkg) => assert.ok(allowed.has(pkg), `${name}：非基础发行版宏包 ${pkg}`));
  }
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

test('resolvePhotoName 只取文件名并拒绝不安全字符', () => {
  assert.equal(resolvePhotoName('cat-photo.png'), 'cat-photo.png');
  assert.equal(resolvePhotoName('/home/user/photos/id_photo.jpg'), 'id_photo.jpg');
  assert.equal(resolvePhotoName('C:\\Users\\me\\photo.PNG'), 'photo.PNG');
  assert.equal(resolvePhotoName(undefined), '');
  assert.equal(resolvePhotoName(''), '');
  // \includegraphics 的文件名参数不转义，含特殊字符会破坏编译
  assert.throws(() => resolvePhotoName('我的 照片.png'), /只允许字母/);
  assert.throws(() => resolvePhotoName('photo$.png'), /只允许字母/);
  assert.throws(() => resolvePhotoName('..'), /只允许字母/);
});

test('有照片时头部分栏并引用图片，无照片时退化为纯文字单栏', () => {
  const withPhoto = renderResume(
    { profile: { name: '李明', photo: 'cat-photo.png' } },
    template(),
  );
  assert.match(withPhoto, /\\setlength\{\\asuphotowidth\}\{30mm\}/);
  assert.match(withPhoto, /\\asuphoto\{cat-photo\.png\}/);
  assert.match(withPhoto, /\\begin\{minipage\}\[c\]\{\\asuphotowidth\}/);

  const noPhoto = renderResume({ profile: { name: '李明' } }, template());
  assert.match(noPhoto, /\\setlength\{\\asuphotowidth\}\{0pt\}/);
  assert.doesNotMatch(noPhoto, /\\asuphoto\{/);
  assert.doesNotMatch(noPhoto, /^% @PHOTO$/m);

  // 两种情况下 minipage 环境都必须配对
  for (const tex of [withPhoto, noPhoto]) {
    assert.equal(
      (tex.match(/\\begin\{minipage\}/g) || []).length,
      (tex.match(/\\end\{minipage\}/g) || []).length,
      'minipage 环境未配对',
    );
  }
});

test('图片缺失时产物仍可编译：容错逻辑随公共部件内联', () => {
  const tex = renderResume({ profile: { name: '李明', photo: 'cat-photo.png' } }, template());
  assert.match(tex, /\\IfFileExists/, '产物缺少图片容错');
  // 公共部件只维护一份，母版不再各自定义
  assert.doesNotMatch(template(), /\\IfFileExists/, '容错逻辑应由公共部件提供');
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
  assert.match(tex, /把图片一并上传到同一项目/);

  // 首行是编译器 magic comment，供 VS Code LaTeX Workshop 等识别
  assert.match(tex, /^% !TEX program = xelatex\n/);
  assert.match(tex, /^% ASu-skills LaTeX 简历$/m);
});

test('母版由调用方指定，省略时使用默认的 ASu 版式', () => {
  const temp = mkdtempSync(join(tmpdir(), 'latex-template-'));
  try {
    const dataPath = join(temp, 'data.json');
    writeFileSync(dataPath, JSON.stringify({ profile: { name: '李明' } }));

    // 自定义母版：版式不同（article + 不同字号），但保留全部 @ 标记
    const customTemplate = join(temp, 'compact.tex');
    writeFileSync(
      customTemplate,
      template().replace('\\documentclass[a4paper,10pt]{ctexart}', '\\documentclass[a4paper,9pt]{ctexart}'),
    );

    const run = (out, tpl) =>
      spawnSync(
        process.execPath,
        ['scripts/build-latex-resume.mjs', dataPath, out, ...(tpl ? [tpl] : [])],
        { cwd: repoRoot, encoding: 'utf8' },
      );

    const withCustom = join(temp, 'custom.tex');
    assert.equal(run(withCustom, customTemplate).status, 0);
    assert.match(readFileSync(withCustom, 'utf8'), /\\documentclass\[a4paper,9pt\]/);

    const withDefault = join(temp, 'default.tex');
    assert.equal(run(withDefault, undefined).status, 0);
    assert.match(readFileSync(withDefault, 'utf8'), /\\documentclass\[a4paper,10pt\]/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('输出路径不能覆盖默认母版或指定的母版', () => {
  const temp = mkdtempSync(join(tmpdir(), 'latex-guard-'));
  try {
    const dataPath = join(temp, 'data.json');
    writeFileSync(dataPath, JSON.stringify({ profile: { name: '李明' } }));
    const customTemplate = join(temp, 'custom.tex');
    writeFileSync(customTemplate, template());

    const run = (out, tpl) =>
      spawnSync(
        process.execPath,
        ['scripts/build-latex-resume.mjs', dataPath, out, ...(tpl ? [tpl] : [])],
        { cwd: repoRoot, encoding: 'utf8' },
      );

    const defaultTemplate = join(repoRoot, 'assets', 'latex-resume', 'template.tex');
    const before = template();

    // 输出指向默认母版
    assert.notEqual(run(defaultTemplate, undefined).status, 0);
    // 指定了自定义母版，输出仍不得指向默认母版
    assert.notEqual(run(defaultTemplate, customTemplate).status, 0);
    // 输出指向调用方自己传入的母版
    assert.notEqual(run(customTemplate, customTemplate).status, 0);

    assert.equal(template(), before, '默认母版被覆盖');
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('每套母版都满足渲染契约：标记完整、必需宏齐备、能渲染出结构正确的产物', () => {
  const names = allTemplates();
  assert.ok(names.length >= 2, '应至少提供默认版式与一套备选版式');

  const markers = [
    '% @PREAMBLE', '% @PHOTOWIDTH', '% @PHOTO', '% @NAME', '% @CONTACT', '% @HEADLINE',
    '% @EDUCATION', '% @EXPERIENCE', '% @PROJECTS', '% @SCHOOL',
    '% @SKILLS', '% @SELF_EVALUATION',
  ];
  const required = [
    '\\newlength{\\asuphotowidth}', '\\newlength{\\asuheadtextwidth}',
    '\\newcommand{\\asuphoto}', '\\newcommand{\\asuname}',
    '\\newcommand{\\asumeta}', '\\newcommand{\\asuentry}',
  ];
  const data = JSON.parse(read('assets', 'resume-data-template.json'));

  for (const name of names) {
    const raw = readFileSync(join(templateDir, name), 'utf8');
    markers.forEach((m) => assert.ok(raw.includes(m), `${name}：缺少标记 ${m}`));
    assert.match(raw, /^% !TEX program = xelatex\n/, `${name}：缺少编译器 magic comment`);

    const tex = renderResume(data, raw);
    // 渲染契约所需的宏由公共部件提供，内联后必须齐备
    required.forEach((r) => assert.ok(tex.includes(r), `${name}：产物缺少渲染契约要求的 ${r}`));
    assert.match(tex, /\\IfFileExists/, `${name}：产物缺少图片容错`);
    assert.doesNotMatch(tex, /^% @[A-Z_]+$/m, `${name}：存在未替换的标记`);
    assert.doesNotMatch(tex, /@@TEMPLATE-ONLY-(START|END)@@/, `${name}：维护者块未剥离`);
    assert.equal((tex.match(/\\begin\{document\}/g) || []).length, 1, `${name}：document 环境异常`);

    for (const env of ['itemize', 'minipage']) {
      assert.equal(
        (tex.match(new RegExp(`\\\\begin\\{${env}\\}`, 'g')) || []).length,
        (tex.match(new RegExp(`\\\\end\\{${env}\\}`, 'g')) || []).length,
        `${name}：${env} 环境未配对`,
      );
    }

    const stripped = tex.replace(/\\[{}]/g, '');
    assert.equal(
      (stripped.match(/\{/g) || []).length,
      (stripped.match(/\}/g) || []).length,
      `${name}：花括号未配对`,
    );
  }
});

// 以下两条来自 Overleaf 实测中发现的真实问题。仓库不编译 LaTeX，这类错误
// 无法由渲染测试捕获，因此固化为静态检查，避免新增版式时重复踩坑。
test('母版避开在中文环境下失效的 LaTeX 用法', () => {
  for (const name of allTemplates()) {
    const code = readFileSync(join(templateDir, name), 'utf8')
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('%'))
      .join('\n');

    // 小型大写是拉丁字母的字形变体，中文字体没有 sc 变体：
    // 对中文标题无效，且触发 Font shape ... undefined 警告
    assert.doesNotMatch(code, /\\scshape/, `${name}：中文字体没有小型大写变体`);

    // titlesec 的 before-code 中用 #1 引用标题文本，需要 explicit 选项，
    // 否则 #1 不被解析，标题会渲染成字面的 "1"。只看 \titleformat 到
    // \titlespacing 之间的块，避免误匹配 \newcommand 定义里的 #1。
    const titleFormatBlock = (code.match(/\\titleformat\{[\s\S]*?\\titlespacing/) || [''])[0];
    if (titleFormatBlock.includes('#1')) {
      assert.match(
        code,
        /\\usepackage\[[^\]]*explicit[^\]]*\]\{titlesec\}/,
        `${name}：\\titleformat 使用 #1 时必须加载 titlesec 的 explicit 选项`,
      );
    }
  }
});
