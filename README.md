# ASu-skills

<div align="center">
  <img src="assets/asu-circle.png" width="180" height="180" alt="ASu-skills 图标" style="border-radius: 50%; object-fit: cover;">
  <h3>中文求职工作流插件</h3>
  <p>用八个独立入口完成开源贡献、证据复盘、项目导学面经、简历提升、简历制作、简历投递填写、面试准备和校招进度管理。</p>
</div>

<div align="left">
  <a href="README_en.md">English</a> | <a href="README.md">中文</a> | <a href="https://hisn00w.github.io/ASu-skills/">官网</a>
</div>

<br>

<div align="left">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Hisn00w/ASu-skills?logo=github" alt="License: MIT"></a>
  <img src="assets/claude-code-badge.svg" alt="Claude Code">
  <img src="assets/chatgpt-badge.svg" alt="ChatGPT">
  <img src="assets/opencode-badge.svg" alt="OpenCode">
  <img src="assets/deepseek-badge.svg" alt="DeepSeek">
  <img src="assets/traework-badge.svg" alt="TraeWork">
</div>

<div align="left">
  <a href="https://deepwiki.com/Hisn00w/ASu-skills"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
  <a href="https://www.dsh.so/artifact/asu-skills"><img src="https://www.dsh.so/badge/asu-skills.svg" alt="dsh.so security"></a>
  <a href="https://www.dsh.so/artifact/asu-skills"><img src="https://www.dsh.so/badge/install/asu-skills.svg" alt="dsh.so install"></a>
</div>

<br>

<div align="left">
  <a href="https://trendshift.io/repositories/139058?utm_source=trendshift-badge&utm_medium=badge&utm_campaign=badge-trendshift-139058" target="_blank" rel="noopener noreferrer"><img src="https://trendshift.io/api/badge/trendshift/repositories/139058/daily" alt="Hisn00w%2FASu-skills | Trendshift" width="250" height="55"></a>
</div>

<p align="center">
  <img src="assets/asu-skills-overview-landscape-v2.png" alt="ASu-skills 八个技能总览" width="1100">
</p>

## 目录

- [安装](#安装)
- [第一次使用：从哪个入口开始](#第一次使用从哪个入口开始)
- [八个 Skill](#八个入口如何配合)
  - [`/contributor`：做真实的开源贡献](#contributor做真实的开源贡献)
  - [`/project-guide`：项目导学面经](#project-guide项目导学面经)
  - [`/great-resume`：简历提升](#great-resume简历提升)
  - [`/make-resume`：制作简历](#make-resume制作简历)
  - [`/evidence-recap`：把 AI 编程对话还原成证据链](#evidence-recap把-ai-编程对话还原成证据链)
  - [`/interview`：把简历问穿](#interview把简历问穿)
  - [`/offer`：校招进度管理](#offer校招进度管理)
  - [`/job-apply`：简历投递填写](#job-apply简历投递填写)
- [八个入口如何配合](#八个入口如何配合)
- [事实边界](#事实边界)
- [文件结构](#文件结构)
- [参与贡献](#参与贡献)
- [致谢](#致谢)
- [Contributors](#contributors)
- [开源协议](#开源协议)
- [Star History](#star-history)

ASu-skills 现在是一个插件包。安装后会提供八个可单独调用的入口：

| 入口               | 用途         | 主要交付                                                          |
| ------------------ | ------------ | ----------------------------------------------------------------- |
| `/contributor`   | 开源贡献     | 寻找候选、展示 diff，经确认后提交 PR并把贡献交给`/great-resume` |
| `/evidence-recap` | 证据复盘     | 把 AI 编程对话和交付记录整理为可核验的九段证据链                  |
| `/project-guide` | 项目导学面经 | 基于项目仓库生成`导学-{简称}.md`、`面经-{简称}.md` 和交接摘要 |
| `/great-resume`  | 简历提升     | 岗位定位、项目改写、成果证据、HR 开场白                           |
| `/make-resume`   | 简历制作     | 默认使用 ASu 模板，也可指定模板；可编辑 HTML 简历和 PDF 导出       |
| `/job-apply`     | 简历投递填写 | 连接浏览器自动填写求职申请，核对后停在提交前                      |
| `/interview`     | 面试准备     | 面试预测、契约化追问、证据复盘和弱项复练                          |
| `/offer`         | 校招进度     | 投递、测评、面试、Offer、拒信和招聘邮件跟踪                       |

## 安装

ASu-skills 同时支持 Codex、Claude Code 和 TraeWork：仓库根目录的 `.codex-plugin/` 供 Codex 使用，`.claude-plugin/` 供 Claude Code 使用，`.trae-plugin/` 供 TraeWork 使用，三者共用同一套 `skills/`、`assets/` 和 `references/`。

### Codex

最简单的方式是把 GitHub 链接直接发给 Codex，并说明要安装插件

```text
请从这个 GitHub 仓库安装 ASu-skills 插件，并启用其中的 contributor、evidence-recap、project-guide、great-resume、make-resume、job-apply、interview、offer 八个 skills：
https://github.com/Hisn00w/ASu-skills
```

安装完成后建议新建一个 Codex 对话，让新 skills 被重新加载。然后在输入框中输入 `/`，从命令列表选择 `contributor`、`evidence-recap`、`project-guide`、`great-resume`、`make-resume`、`job-apply`、`interview` 或 `offer`。

如果当前 Codex 版本没有把 skill 显示在 `/` 菜单中，也可以使用官方的显式 skill 调用方式：

```text
$contributor 根据我的目标岗位寻找开源贡献候选，先展示 diff；我确认后再提 PR，并在合并后交给 /great-resume 提升。
$evidence-recap 把这段 AI 编程对话复盘为可核验的项目证据链，区分个人动作、交付阶段和效果证据。
$great-resume 请把我的实习经历提升成适合 AI 应用工程师岗位的版本。
$project-guide 基于当前项目生成导学和面经，并整理可交接给 /great-resume 与 /interview 的证据摘要。
$make-resume 根据我的经历制作一份可编辑的中文 HTML 简历；默认使用 ASu 模板，如需其他模板我会指定。
$job-apply 使用我确认的简历资料填写当前招聘网站申请表，连接浏览器并在最终提交前让我核对。
$interview 根据我的简历预测面试问题，并通过连续追问检查我是否真的掌握这些经历。
$offer 把这些招聘邮件整理成校招投递进度表。
```

### Claude Code

在 Claude Code 会话中执行：

```text
/plugin marketplace add Hisn00w/ASu-skills
/plugin install asu-skills@asu
```

也可以在终端里执行等价命令：

```bash
claude plugin marketplace add Hisn00w/ASu-skills
claude plugin install asu-skills@asu
```

安装摘要提示 `Run /reload-plugins to activate.` 时执行 `/reload-plugins`，否则重启 Claude Code。安装后可用 `claude plugin details asu-skills` 确认八个 skill 都已加载。

更新与卸载：

```text
/plugin marketplace update asu
/plugin uninstall asu-skills
```

插件方式的卸载只删除插件缓存，不会动你在项目或用户目录里编辑过的求职进度表。

### TraeWork

TraeWork 通过 `.trae-plugin/plugin.json` 清单把仓库打包成插件，八个 skill 会以 `<publisher>:asu-skills:<skill>` 的形式挂在该插件下。

1. 把本仓库整体复制到 TraeWork 插件目录：`~/.trae-cn/plugins/<publisher>/asu-skills/<version>/`，保留 `.trae-plugin/plugin.json`、`skills/`、`assets/` 和 `references/`；
2. 重启 TraeWork，让新插件被重新加载；
3. 新建对话，在输入框输入 `/`，从命令列表选择 `contributor`、`evidence-recap`、`project-guide`、`great-resume`、`make-resume`、`job-apply`、`interview` 或 `offer`。

其中 `<publisher>` 是插件目录下的命名空间，可自行指定（如 `local`），`<version>` 为 `plugin.json` 中的版本号。卸载时删除对应插件目录即可，不会影响你在项目或用户目录里编辑过的求职进度表。

开发者请参阅 [贡献指南](.github/CONTRIBUTING.md)，其中包含本地校验、测试命令和 PR 提交流程。

## 第一次使用：从哪个入口开始

先根据当前最需要解决的问题选择第一个入口：

| 当前情况                                     | 建议先使用         |
| -------------------------------------------- | ------------------ |
| 缺少可验证的项目或协作经历                   | `/contributor`   |
| 有 AI 编程对话或交付记录，需要还原事实与证据 | `/evidence-recap` |
| 已有项目仓库，需要梳理源码阅读路径和面试口播 | `/project-guide` |
| 已有经历，但不知道如何匹配目标岗位           | `/great-resume`  |
| 简历内容已确定，需要制作常规可编辑简历       | `/make-resume`   |
| 想复刻 ASu 同款高密度技术简历                | `/make-resume`（默认模板） |
| 已有职位链接，需要填写招聘网站申请表         | `/job-apply`     |
| 已约到面试，需要预测问题并查漏补缺           | `/interview`     |
| 已开始投递，需要整理招聘邮件和后续进度       | `/offer`         |

也可以组合多个入口：

- **没有实习、想补充真实经历**：先用 `/contributor` 完成与岗位相关的开源贡献，再交给 `/great-resume` 整理成可核验的简历表述；
- **有 AI 项目记录、需要梳理事实**：先用 `/evidence-recap` 区分个人动作、交付阶段与效果证据，再决定是否交给 `/great-resume` 转成求职表达；
- **已有项目、准备开始投递**：先用 `/project-guide` 梳理项目学习路径和面经，再用 `/great-resume` 对齐目标岗位，最后用 `/make-resume` 生成简历；默认使用 ASu 模板，也可以指定其他模板；
- **已经投递、需要持续跟进**：直接用 `/offer` 整理邮件和状态，简历需要更新时再回到 `/great-resume` 和 `/make-resume`。
- **准备填写招聘网站申请表**：先用 `/job-apply` 连接已登录的浏览器，填写并核对一个具体职位；完成后再用 `/offer` 记录投递状态。

## `/contributor`：做真实的开源贡献

`/contributor` 帮用户根据目标岗位、技术栈或指定方向寻找合适的 GitHub 项目与真实问题，先核对维护迹象、贡献规则、issue/PR 状态和重复风险，再准备独立分支上的最小改动与验证结果；经用户逐项确认后才 fork、push 和提交 PR，并跟踪 CI、review 和合并状态。

它适合从范围清晰、能够客观验证的文档、示例、测试或小型代码问题开始。未合并的 PR 记录为“已提交”或“协作中”，只有 GitHub 页面显示已合并且项目明确说明采用范围时，才使用更强的成果表述。

典型用法：

```text
/contributor

目标岗位：AI 应用工程师
技术栈：TypeScript、React、Python
每周可投入：4 小时
先帮我找 3 个有证据支撑、范围清晰且能够验证的候选问题；先展示仓库、issue、拟改动、验证方式和完整 diff，我确认后再逐个提交 PR。
```

## `/project-guide`：项目导学面经

`/project-guide` 面向已有项目仓库或项目材料，负责生成两份可落盘的 Markdown：`导学-{简称}.md` 和 `面经-{简称}.md`。它会把源码阅读路径、技术亮点、设计取舍、STAR 口播和源码证据索引整理成面试前可复习的材料，并在结尾给出可交给 `/great-resume` 的项目事实摘要，以及可交给 `/interview` 的高风险 Claim 清单。

典型用法：

```text
/project-guide

简称：智能BI
项目描述：这是一个基于 React、Node.js 和大模型 API 的数据问答项目，我负责查询编排、结果可视化和异常兜底。
求职方向：前端 / AI 应用
```

## `/great-resume`：简历提升

适合以下任务：

- 根据目标岗位重新定位个人经历；
- 把页面、接口、数据绑定等底层工作翻译成招聘语言；
- 改写项目要点、简历摘要和个人介绍；
- 生成 Boss 直聘或微信发给 HR 的中文开场白；
- 整理面试追问、证据补强清单和事实边界。

建议提供目标岗位、岗位描述、现有简历、项目说明、真实职责和成果数据。信息不足时，skill 会先给出可用初稿，并标记 `【待补】`，不会自行编造 title、公司、技术栈或数据。

典型用法：

```text
/great-resume

目标岗位：AI 应用工程师
请根据我下面的实习和项目经历，给出稳妥版和进取版定位，改写简历要点，并生成一段发给 HR 的开场白。
```

### HR 开场示例

<img src="assets/hr-intro-example.jpg" width="360" alt="HR 开场示例">

## `/make-resume`：制作简历

`/make-resume` 专门负责全部简历文件交付。未指定模板时默认使用 ASu 单栏高密度技术简历模板；用户可以指定仓库内其他模板、本地 HTML 或上传参考截图。它最终生成真正可编辑的 HTML，而不是把截图嵌入页面。

支持：

- 18 个中文 HTML 模板；
- A4 单页或双页排版；
- 浏览器内编辑文字、照片、字体、颜色和加粗；
- 将当前编辑内容保存为本地 HTML；
- 「本地字体」读取系统中已安装的字体（Chrome 103+，需浏览器授权），「导入字体」加载本地字体文件（TTF/OTF/WOFF/WOFF2）作为补充；
- 打印导出 PDF；
- 根据截图分析栏位、间距、字号、颜色和分页结构；
- 使用虚构示例照片作为占位，生成真实简历时由用户主动替换。

默认 ASu 模板以只读文件 `assets/asu-resume-template.html` 为母版，生成简历时只复制到用户副本，不修改模板源文件。“我想要阿酥同款简历”也统一由 `/make-resume` 处理；如果用户指定其他模板，则以用户指定内容为准。

典型用法：

```text
/make-resume

请根据我提供的教育、实习和项目经历，选择一份适合后端开发岗位的模板，生成可编辑 HTML 简历，并告诉我如何导出 PDF。
```

### 模板预览

![简历模板预览](assets/template-overview.jpg)

## `/evidence-recap`：把 AI 编程对话还原成证据链

`/evidence-recap` 用于复盘 AI 编程对话、项目交付记录和落地证据。它按问题背景、方案决策、个人动作、交付状态、落地范围、效果证据、个人边界、待补证据和面试追问九段整理材料，并默认对密钥、邮箱、客户标识和内部路径等敏感信息做泛化处理。

典型用法：

```text
/evidence-recap

请把这段 AI 编程对话整理为可核验的项目证据链，区分我的动作、AI 完成的部分、交付阶段和效果证据。
```

## `/interview`：把简历问穿

`/interview` 从简历和目标岗位中提取需要验证的 Claim 与岗位能力，先约定面试轮次、时长和反馈策略，再通过一次只问一个问题的连续追问检查用户是否讲得清个人职责、技术实现、指标口径、决策取舍和失败案例。每道核心题使用预先锁定的评分契约，会话账本记录已验证证据与缺口；复盘后可用变体题、反事实题和故障题复练薄弱 Claim。它不会替用户编造面试答案，也不会用缺乏校准依据的精确总分掩盖证据不足。

典型用法：

```text
/interview grill

这是我的简历，目标岗位是 AI 应用工程师。请从最高风险的项目开始，一次问我一个问题；如果我的回答含糊，就继续追问。
```

只复练上一轮没有讲清楚的内容：

```text
/interview retry

请根据刚才的复盘，只使用变体题复练“指标口径”和“个人贡献边界”，不要原题重问。
```

## `/offer`：校招进度管理

`/offer` 把招聘网站、邮件、聊天记录和截图中的信息整理成求职漏斗，默认记录：

- 日期；
- 公司；
- 岗位；
- 当前状态；
- 下一步；
- 必要备注和证据来源。

默认状态包括：`已投递`、`筛选中`、`测评中`、`面试`、`Offer`、`拒绝/已结束`、`待确认`。普通自动回执不能直接推断为面试或 Offer，证据不足时会标记为待确认。

如果没有指定保存位置，求职进度表默认复制到桌面，生成 `application-tracker.html`。它支持搜索、筛选、统计、CSV/JSON 备份和打印 PDF。

典型用法：

```text
/offer

请把我上传的招聘邮件和截图整理成校招进度表，合并重复投递，并列出每家公司下一步要做什么。
```

### 进度表预览

![校招进度表预览](assets/application-tracker-overview.svg)

## `/job-apply`：简历投递填写

**重要提醒：本项目禁止滥用技能批量投递、骚扰 HR，或发送千篇一律、夸大包装的开场白。请只基于真实经历，针对具体岗位进行适度、个性化沟通；堆砌 GitHub Star、过度包装经历并直接发送的文案，容易引起 HR 反感，也可能损害求职者和项目的信誉。`/job-apply` 只用于用户明确确认的单个职位申请，技能不会绕过确认、批量提交，也不会代替用户发送未经审核的消息。**

<div align="center">
  <img src="assets/hr-opening-warning.jpg" alt="HR 反感模板化求职开场白示例" width="420">
  <p><em>反面示例：模板化、夸大式开场白容易引起反感，请勿照搬。</em></p>
</div>

`/job-apply` 用已确认的简历资料填写一个具体招聘网站的申请表，支持页面读取、字段映射、文本填写、下拉选择、简历/作品附件上传和提交前核对。默认停在最终提交按钮前，不会因为“帮我填简历”就替用户投递。

<img src="assets/job-apply-form-example.png" alt="校招申请表填写示例" width="900" />

### 使用 Kimi WebBridge 连接浏览器

**使用前请先安装并启用浏览器控制扩展，并确认扩展已连接对应的浏览器控制服务。** 未完成扩展安装和连接检查前，ASu 不会读取或填写招聘页面。

如果希望操作自己已经登录的 Chrome 或 Edge，可以安装并启用官方 [Kimi WebBridge](https://www.kimi.com/products/kimi-webbridge)。它通过浏览器扩展、本机 daemon 和 Chrome DevTools Protocol 连接浏览器，登录会话和页面内容保留在本机。

如果使用 ChatGPT/Codex 的浏览器控制能力，也可以安装并启用 [ChatGPT 浏览器扩展（Microsoft Edge Add-ons）](https://microsoftedge.microsoft.com/addons/detail/chatgpt/odlomjlbamekndcpllcnffbgeohgkmjh)（Chrome 扩展商店已下架，目前使用 Edge 扩展商店），再按照宿主应用中的浏览器控制页面完成连接。两种方式任选其一即可，不需要同时安装。

### 典型用法

```text
/job-apply

请使用我确认的简历，打开这个职位申请页面，填写可确认的字段和简历附件；遇到缺失信息先问我，最后停在提交前让我核对。
```

登录、密码、短信验证码、邮箱验证码、MFA、通行密钥和 CAPTCHA 必须由用户完成。涉及个人资料输入、文件上传和最终提交时，ASu 会分别确认；不会读取 Cookie、令牌或密码，也不会绕过反爬和访问控制。

## 八个入口如何配合

推荐按照下面的顺序使用：

1. 用 `/contributor` 完成与目标岗位相关的真实开源贡献，并在 PR 合并后生成证据卡；
2. 有 AI 编程对话或交付记录时，用 `/evidence-recap` 还原项目事实、个人边界和证据缺口；
3. 用 `/project-guide` 把已有项目仓库整理成导学、面经和可追问证据；
4. 用 `/great-resume` 根据证据卡和已有经历明确目标岗位，整理简历表述和 HR 话术；
5. 用 `/make-resume` 把确认后的文字放入可编辑简历并导出 PDF；
6. 用 `/job-apply` 连接浏览器填写具体职位申请，并在提交前核对；
7. 用 `/interview` 预测问题并通过追问确认简历内容经得住面试；
8. 用 `/offer` 记录投递、测评、面试和 Offer 状态。

也可以在同一条需求里说明组合目标，例如：“先用 `/project-guide` 生成项目导学和面经，再用 `/great-resume` 提升经历，最后用 `/make-resume` 生成 HTML 简历”。

组合使用多个入口、材料存在冲突或简历包含强主张时，可以复制 [`assets/career-claim-ledger-template.json`](assets/career-claim-ledger-template.json) 建立主张—证据账本。它让开源贡献、经历提升和简历文件共享同一份事实、确认状态与个人边界；详细规则见 [`skills/great-resume/references/claim-evidence-ledger.md`](skills/great-resume/references/claim-evidence-ledger.md)。
想看同一个人的材料如何在各入口之间流转，可以阅读[端到端虚构求职案例](docs/end-to-end-fictional-case.md)。案例从课程项目和开源贡献出发，依次展示证据卡、经历改写、可编辑简历和投递进度表，并明确区分已完成、协作中与待补充状态。

## 事实边界

ASu-skills 的“简历提升”是强定位、强证据和清晰表达，不是伪造经历。使用时请遵守：

- 保留真实职位、公司、时间和教育背景；
- 区分团队成果和个人贡献；
- 只有有证据时才使用“主导”“负责人”“Owner”等强表述；
- 没有可靠数据时使用可核验的定性结果；
- 不把计划做的事情写成已经完成；
- 不把 AI 生成的代码成果冒领为未经验证的个人能力；
- 不在公开 skill 文件中写入真实姓名、电话、邮箱、密码、验证码或招聘隐私。

## 文件结构

```text
asu-skills/
├── .claude-plugin/
│   ├── plugin.json              # Claude Code 插件清单
│   └── marketplace.json         # Claude Code 插件市场清单
├── .codex-plugin/
│   └── plugin.json              # 插件清单
├── .trae-plugin/
│   └── plugin.json              # TraeWork 插件清单
├── package.json                # DSH 插件包清单（bundle patch 入口）
├── cordis.patch.yml            # 注册 DSH filesystem skill 提供方
├── lib/
│   └── index.js                # DSH 插件入口模块
├── skills/
│   ├── great-resume/
│   │   ├── SKILL.md             # /great-resume 简历提升
│   │   └── agents/openai.yaml
│   ├── contributor/
│   │   ├── SKILL.md             # /contributor 开源贡献
│   │   └── agents/openai.yaml
│   ├── evidence-recap/
│   │   ├── SKILL.md             # /evidence-recap AI 编程对话复盘
│   │   └── agents/openai.yaml
│   ├── project-guide/
│   │   ├── SKILL.md             # /project-guide 项目导学面经
│   │   └── agents/openai.yaml
│   ├── make-resume/
│   │   ├── SKILL.md             # /make-resume 简历制作
│   │   └── agents/openai.yaml
│   ├── interview/
│   │   ├── SKILL.md             # /interview 面试预测、追问与复练
│   │   ├── references/          # 面试契约、评分、场景题和复练规则
│   │   └── agents/openai.yaml
│   ├── offer/
│       ├── SKILL.md             # /offer 校招进度
│       └── agents/openai.yaml
│   └── job-apply/
│       ├── SKILL.md             # /job-apply 简历投递填写
│       ├── references/           # Kimi WebBridge 连接与安全规则
│       └── agents/openai.yaml
├── scripts/
│   └── kimi-webbridge.mjs       # Kimi WebBridge 本机 HTTP 客户端
├── assets/                      # 模板、图片、进度表和示例资源
│   ├── asu-resume-template.html # ASu 同款可编辑简历起点
│   ├── icons/                    # 个人信息与通用信息 SVG 图标
│   └── logos/                    # LobeHub Icons 静态 SVG Logo
├── references/                  # 招聘邮箱整理参考
├── .github/
│   ├── CONTRIBUTING.md          # 贡献指南
│   ├── CONTRIBUTING_en.md       # English contribution guide
│   └── PULL_REQUEST_TEMPLATE.md # PR 模板
└── README.md
```

## 参与贡献

欢迎提 Issue 和 PR，详见[贡献指南](.github/CONTRIBUTING.md)。也可以直接查看 [Pull Requests](https://github.com/Hisn00w/ASu-skills/pulls)。

## 致谢

感谢以下小红书博主的公开分享与启发：

- [**阿酥在coding**](https://xhslink.cn/m/2LHuLJZ30b2)：关于 Coding 面试经验的分享；
- [**Hi Mr Lonely**](https://xhslink.cn/m/3kVQDyUJ6of)：关于简历包装与求职表达的分享。

本插件对相关内容进行了整理、结构化和合规化改写，用于形成可复用的求职工作流。

感谢 [LobeHub/lobe-icons](https://github.com/lobehub/lobe-icons) 提供开源品牌图标资源；本插件按其技能说明优先使用 `@lobehub/icons` 及静态 SVG/CDN 资源。

感谢 [Kimi WebBridge](https://www.kimi.com/products/kimi-webbridge) 提供本机浏览器连接能力，让 `/job-apply` 可以通过 Chrome DevTools Protocol 操作用户已登录的浏览器，登录会话与页面内容始终保留在本机。

## Contributors

感谢所有为 ASu-skills 做出贡献的人。

<a href="https://github.com/Hisn00w/ASu-skills/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Hisn00w/ASu-skills" alt="Contributors" />
</a>

## 开源协议

本项目基于 [MIT License](LICENSE) 发布，可自由使用、修改与分发，欢迎 fork 与 PR。开源治理体系由社区 Owner 主导建设，已实现全链路 License 覆盖率 100%。

## Star History

<a href="https://www.star-history.com/?repos=Hisn00w%2FASu-skills&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=Hisn00w/ASu-skills&type=timeline&theme=dark&legend=top-left&sealed_token=bjbMfvRN5HhBif26VkNL7fMNZhYEU6NOxOMDWOzZvQnyJjYS5cPBNShexQ_xybTo30fuVzzhrKWq4x4IZAHEFrDesIwfK5iGJONtmrR_3Hhz3B2UFaKxs2iptYBKSxN0TbubpjnmkGaFme25ufww7AXpqptuXSHNK9KAWAP45t26kEa8NXXbLPxqH-5w" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=Hisn00w/ASu-skills&type=timeline&legend=top-left&sealed_token=bjbMfvRN5HhBif26VkNL7fMNZhYEU6NOxOMDWOzZvQnyJjYS5cPBNShexQ_xybTo30fuVzzhrKWq4x4IZAHEFrDesIwfK5iGJONtmrR_3Hhz3B2UFaKxs2iptYBKSxN0TbubpjnmkGaFme25ufww7AXpqptuXSHNK9KAWAP45t26kEa8NXXbLPxqH-5w" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=Hisn00w/ASu-skills&type=timeline&legend=top-left&sealed_token=bjbMfvRN5HhBif26VkNL7fMNZhYEU6NOxOMDWOzZvQnyJjYS5cPBNShexQ_xybTo30fuVzzhrKWq4x4IZAHEFrDesIwfK5iGJONtmrR_3Hhz3B2UFaKxs2iptYBKSxN0TbubpjnmkGaFme25ufww7AXpqptuXSHNK9KAWAP45t26kEa8NXXbLPxqH-5w" />
 </picture>
</a>
