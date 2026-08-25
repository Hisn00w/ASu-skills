# ASu-skills (WorkBuddy 适配版)

中文求职工作流技能包，适配 **WorkBuddy** 智能体环境。

> 本仓库是 [`Hisn00w/ASu-skills`](https://github.com/Hisn00w/ASu-skills)（MIT License）的 **WorkBuddy 移植版**。
> 原项目面向 Claude Code / Codex，本仓库将其 6 个核心技能改写为 WorkBuddy 原生技能格式，
> 并补充了自包含的可编辑 HTML 模板，使简历 / 同款简历 / 秋招进度表能直接产出文件。
> 原项目作者保留全部原始权利，本适配版在 MIT 协议下分发。

---

## 包含技能

| 技能目录 | 触发场景（对用户说） | 用途 |
|---|---|---|
| `asu-experience` | "帮我酥化经历" / "改写简历项目" / "写 HR 自我介绍" | 按目标岗位重组真实经历，输出岗位定位、简历要点、项目亮点、HR 开场白 |
| `asu-contributor` | "做开源贡献写进简历" | 按目标公司/岗位扫描真实开源项目，优先 typo/README/文档类小 PR，生成改动方案与 PR 文案 |
| `asu-resume` | "生成可编辑简历 HTML" / "导出 PDF 简历" | 生成自包含、可编辑、可打印为 PDF 的 A4 简历 |
| `asu-clone-resume` | "我要阿酥同款简历" | 复刻小红书「阿酥」单栏高密度技术简历模板 |
| `asu-interview` | "模拟面试" / "把简历问穿" | 基于简历提取 Claim，预测高频面试题，逐层追问发现知识缺口 |
| `asu-offer` | "记录秋招投递进度" | 管理投递 / 筛选 / 测评 / 面试 / Offer / 拒信状态，生成可搜索进度表 |

---

## 安装（WorkBuddy）

将本仓库克隆或下载后，把 6 个 `asu-*` 目录整体复制到 WorkBuddy 用户技能目录：

```bash
# Windows (Git Bash / PowerShell)
cp -r asu-experience asu-contributor asu-resume asu-clone-resume asu-interview asu-offer "$HOME/.workbuddy/skills/"

# macOS / Linux
cp -r asu-* "$HOME/.workbuddy/skills/"
```

重启 WorkBuddy（或刷新技能列表）后即可用自然语言触发，例如：
「帮我把 big-customer 实习经历酥化一下」「生成一份阿酥同款简历」。

---

## 与原版的主要差异（适配说明）

1. **格式本地化**：原版跨目录引用 `../../assets/*`、`../asu/references/*`，本版每个技能自带 `references/` 与 `assets/`，保证单技能自包含。
2. **去除 Claude/Codex 专属机制**：移除插件清单、harness 调度器；`asu-contributor` 的「每日 routine」改为对接 WorkBuddy 自动化（可设定时扫描）。
3. **补 HTML 后备模板**：原版简历/进度表为二进制模板，本版按原仓库 fallback 条款现写三个自包含可编辑 A4 HTML（打印隐藏工具栏、`contenteditable`、localStorage 存进度、可导出 PDF）。
4. **事实边界一致**：6 个技能共享「主张—证据账本」，明确「酥化 ≠ 伪造，保留真实、不冒领 AI 成果」——与拼实习「换来的理解放项目经验、勿编造实习经历」同一底线。

---

## 目录结构

```
ASu-skills-WorkBuddy/
├── README.md
├── LICENSE
├── asu-experience/   { SKILL.md, references/ }
├── asu-contributor/  { SKILL.md, references/ }
├── asu-resume/       { SKILL.md, references/, assets/ }
├── asu-clone-resume/ { SKILL.md, references/, assets/ }
├── asu-interview/    { SKILL.md, references/ }
└── asu-offer/        { SKILL.md, assets/ }
```

---

## 许可

MIT License —— 原始内容 © Hisn00w；WorkBuddy 适配 © 2026 贡献者。
详见 [LICENSE](./LICENSE)。
