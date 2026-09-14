#!/usr/bin/env node
// 结构化简历数据 -> 可编辑 .tex 源文件。
//
// 背景：/make-resume 的默认交付是可编辑 HTML（assets/frame/ 外框内联）。本脚本提供
// 一条互不干扰的旁路，把同一份简历事实渲染成 LaTeX 源文件，供 Overleaf 等环境继续
// 编辑排版。仓库不编译 LaTeX，也不新增任何运行时依赖：产物是纯文本，和现在产出
// .html 一样，编译交给用户已有的 Overleaf 或本地环境。
//
// 用法：
//   node scripts/build-latex-resume.mjs <简历数据.json> <输出.tex>
//
// 数据结构见 assets/resume-data-template.json（字段可缺省，缺省的整节不输出）。
//
// 零依赖；渲染是确定性的。转义是本脚本存在的核心理由：简历正文里的
// C++、30%、snake_case、A&B 这类内容直接写进 .tex 会导致编译失败。
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE_PATH = path.join(repoRoot, 'assets', 'latex-resume', 'template.tex');

// LaTeX 的十个特殊字符。反斜杠必须和其余字符在同一次替换中处理，
// 否则会把后续插入的控制序列再转义一遍。
const LATEX_ESCAPES = {
  '\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  $: '\\$',
  '&': '\\&',
  '#': '\\#',
  '^': '\\textasciicircum{}',
  _: '\\_',
  '~': '\\textasciitilde{}',
  '%': '\\%',
};

export const escapeLatex = (value) =>
  String(value ?? '').replace(/[\\{}$&#^_~%]/g, (ch) => LATEX_ESCAPES[ch]);

// \url 的参数是 verbatim 读取的，只有 # % \ 需要反斜杠保护。
export const escapeUrl = (value) => String(value ?? '').replace(/([\\#%])/g, '\\$1');

// 母版中写给维护者的注释块，渲染时整块删除，不进入用户产物
// （与 inline-template.mjs 的 @@SHELL-ONLY@@ 同一思路）。
const TEMPLATE_ONLY_RE = /% @@TEMPLATE-ONLY-START@@[\s\S]*?% @@TEMPLATE-ONLY-END@@\r?\n/;

const replaceRequired = (text, marker, replacement) => {
  if (!text.includes(marker)) throw new Error(`LaTeX 母版缺少构建标记：${marker}`);
  return text.replace(marker, replacement);
};

const joinParts = (parts, separator) => parts.filter(Boolean).map(escapeLatex).join(separator);

const section = (title, body) => (body ? `\\section*{${escapeLatex(title)}}\n${body}` : '');

const itemize = (items) =>
  items.length ? `\\begin{itemize}\n${items.map((line) => `  \\item ${line}`).join('\n')}\n\\end{itemize}` : '';

// [{label, text}] 或 ["纯文本"] 都渲染成条目，label 加粗。
const renderBullets = (bullets = []) =>
  itemize(
    bullets
      .map((bullet) => {
        if (typeof bullet === 'string') return escapeLatex(bullet);
        const label = bullet.label ? `\\textbf{${escapeLatex(bullet.label)}}` : '';
        return `${label}${escapeLatex(bullet.text)}`;
      })
      .filter(Boolean),
  );

const renderEducation = (education = []) =>
  section(
    '教育经历',
    education
      .map((item) => `\\asuentry{${joinParts([item.school, item.major_degree], ' · ')}}{${escapeLatex(item.dates)}}`)
      .join('\n'),
  );

const renderExperience = (experience = []) =>
  section(
    '实习与工作经历',
    experience
      .map((item) =>
        [
          `\\asuentry{${joinParts([item.organization, item.role], ' · ')}}{${escapeLatex(item.dates)}}`,
          renderBullets(item.bullets),
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n\\vspace{3pt}\n'),
  );

const renderProjects = (projects = []) =>
  section(
    '项目经历',
    projects
      .map((item) =>
        [
          `\\textbf{${escapeLatex(item.name)}}\\par`,
          item.summary ? escapeLatex(item.summary) + '\\par' : '',
          // \url 单独成行：长链接没有空格，放进 \hfill 右栏会溢出页边距，
          // hyperref 的 \url 允许在 / 和 . 处断行，同时保持可点击。
          item.url ? `\\url{${escapeUrl(item.url)}}\\par` : '',
          renderBullets(item.bullets),
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n\\vspace{3pt}\n'),
  );

export function renderResume(data, template) {
  const profile = data.profile ?? {};
  if (!profile.name) throw new Error('简历数据缺少 profile.name');

  const contact = joinParts([profile.phone, profile.email, profile.wechat_or_portfolio], ' \\textbar{} ');
  const headline = joinParts(
    [profile.target_role, profile.birth_date, profile.political_status, profile.ethnicity, profile.language],
    ' · ',
  );

  let out = replaceRequired(
    template.replace(TEMPLATE_ONLY_RE, ''),
    '% @NAME',
    `\\asuname{${escapeLatex(profile.name)}}`,
  );
  out = replaceRequired(out, '% @CONTACT', contact ? `\\asumeta{${contact}}` : '');
  out = replaceRequired(out, '% @HEADLINE', headline ? `\\asumeta{${headline}}` : '');
  out = replaceRequired(out, '% @EDUCATION', renderEducation(data.education));
  out = replaceRequired(out, '% @EXPERIENCE', renderExperience(data.experience));
  out = replaceRequired(out, '% @PROJECTS', renderProjects(data.projects));
  out = replaceRequired(out, '% @SCHOOL', section('校园经历', renderBullets(data.school)));
  out = replaceRequired(out, '% @SKILLS', section('专业技能', renderBullets(data.skills)));
  out = replaceRequired(out, '% @SELF_EVALUATION', section('自我评价', renderBullets(data.self_evaluation)));
  return out;
}

const [input, destination] = process.argv.slice(2);

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!input || !destination) {
    console.error('用法：node scripts/build-latex-resume.mjs <简历数据.json> <输出.tex>');
    process.exit(2);
  }
  const outputPath = path.resolve(destination);
  if (outputPath === TEMPLATE_PATH) throw new Error('用户输出不能覆盖仓库母版');

  const data = JSON.parse(fs.readFileSync(input, 'utf8'));
  fs.writeFileSync(outputPath, renderResume(data, fs.readFileSync(TEMPLATE_PATH, 'utf8')));
  console.log(`已生成 ${outputPath}`);
  console.log('Overleaf：1) New Project → Blank Project → Create');
  console.log('        2) 上传本文件');
  console.log('        3) File → Settings：Main document 选本文件，Compiler 选 XeLaTeX（中文必需）→ Recompile');
}
