# WorkBuddy 安装入口（轻量桥接）

本目录提供**轻量安装脚本**，把 ASu-skills 原版 `skills/` 桥接到 WorkBuddy 的用户技能目录，**不修改原技能、不改动 LICENSE / README**。

> 适用场景：WorkBuddy 用户想直接复用本仓库已有的 7 个中文求职技能（`contributor` / `asu-recap` / `project-guide` / `asu` / `make-resume` / `interview` / `offer`），而无需等待完整移植。

## 前置条件

- 已安装 WorkBuddy，且存在用户技能目录 `~/.workbuddy/skills/`
  - Windows：`%USERPROFILE%\.workbuddy\skills`
  - macOS / Linux：`~/.workbuddy/skills`
- 已克隆本仓库到本地（本脚本依赖仓库内的 `skills/` 目录）

## 兼容性说明（重要）

原版每个 `skills/<name>/SKILL.md` 使用标准 frontmatter：

```yaml
---
name: asu
description: 中文求职经历酥化技能：……
---
```

`name` + `description` 是 WorkBuddy 技能的标准字段，**可直接被 WorkBuddy 识别并触发**（例如对用户说"帮我把经历酥化一下"会匹配 `asu`）。

以下原版特性属于 Claude Code / Codex 专属，WorkBuddy 会忽略，不影响基础触发：

- 正文中的 `/asu`、`/make-resume`、`/offer` 等 slash 调用语法
- 各技能下的 `agents/openai.yaml`
- `.claude-plugin/`、`.codex-plugin/` 插件清单

以下相对路径**正常工作**：技能内引用的 `references/*.md`（如主张—证据账本）会被 WorkBuddy 按相对路径加载。

## 安装方式

### 方式一：Bash（macOS / Linux）

```bash
bash .workbuddy-plugin/install.sh
```

### 方式二：PowerShell（Windows）

在仓库根目录打开 PowerShell：

```powershell
pwsh .workbuddy-plugin/install.ps1
# 或直接：.\.workbuddy-plugin\install.ps1
```

> Windows 软链需要「开发者模式」或管理员权限。脚本会自动尝试软链，失败则回退为复制（copy），不影响使用。

### 方式三：手动复制

把仓库 `skills/` 下的 7 个目录整体复制到 `~/.workbuddy/skills/`：

```bash
cp -r skills/contributor skills/asu-recap skills/project-guide skills/asu skills/make-resume skills/interview skills/offer "$HOME/.workbuddy/skills/"
```

## 验证

1. 重启 WorkBuddy（或刷新技能列表）。
2. 对 WorkBuddy 说：「帮我把实习经历酥化一下」「生成一份阿酥同款简历」「记录秋招投递进度」。制作简历统一由 `make-resume` 处理，默认使用 ASu 模板，也可指定其他模板。
3. 若能正确触发对应技能，即安装成功。

## 卸载

删除 `~/.workbuddy/skills/` 下对应的软链 / 目录即可：

```bash
rm -rf "$HOME/.workbuddy/skills/contributor" "$HOME/.workbuddy/skills/asu-recap" \
       "$HOME/.workbuddy/skills/project-guide" "$HOME/.workbuddy/skills/asu" \
       "$HOME/.workbuddy/skills/make-resume" \
       "$HOME/.workbuddy/skills/interview" "$HOME/.workbuddy/skills/offer"
```

## 已知限制

- 原版 `make-resume` 依赖仓库 `assets/` 下的 HTML 模板与图片资源；WorkBuddy 加载技能后，若需要这些模板，请从本仓库 `assets/` 手动取用，或参考上游文档。默认模板为 ASu 模板，也可以指定其他模板。
- 本入口仅做目录桥接，不对技能内容做 WorkBuddy 专属改写；如需深度适配，请移步独立的 WorkBuddy 移植版仓库。
- 软链方式下，WorkBuddy 技能会实时跟随本仓库 `skills/` 的更新；复制方式下需手动重新复制。

## 协议

本安装入口遵循本仓库 MIT License。原技能内容版权归原作者（Hisn00w）所有。
