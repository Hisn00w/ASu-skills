# Cursor 安装入口

本目录提供 **Cursor** 的项目级与用户级技能安装说明。ASu-skills 的九个入口位于仓库 `skills/` 目录；安装时将其桥接到 Cursor 识别的 [Agent Skills](https://cursor.com/docs) 路径（`SKILL.md` + 可选 `references/`、`agents/` 等），在对话中通过 `/contributor`、`/great-resume` 等斜杠命令或自然语言触发。

## 前置条件

- 已安装 [Cursor](https://cursor.com/)
- 已克隆或下载本仓库到本地
- 运行安装脚本需要 **bash**（macOS / Linux / Git Bash）或 **PowerShell**（Windows）

## 安装方式

### 方式一：安装脚本（推荐）

脚本会把 `skills/` 下 **全部九个** 技能目录桥接到 Cursor 技能目录：默认写入**本仓库根目录**下的 `.cursor/skills/`（项目级，适合在本仓库内使用 `/make-resume` 等依赖 `assets/`、`scripts/` 的能力）。

**macOS / Linux / Git Bash**（在仓库根目录执行）：

```bash
bash .cursor-plugin/install.sh
```

安装到当前用户目录（全局可用，所有项目对话均可触发）：

```bash
bash .cursor-plugin/install.sh --user
```

**Windows PowerShell**（在仓库根目录执行）：

```powershell
.\.cursor-plugin\install.ps1
```

用户级安装：

```powershell
.\.cursor-plugin\install.ps1 -User
```

脚本优先创建**符号链接**；在 Windows 上若未开启开发者模式或缺少权限，会自动**回退为复制**（与 WorkBuddy 桥接脚本行为一致）。

### 方式二：手动复制

1. 在仓库根目录创建 `.cursor/skills/`（或用户目录 `~/.cursor/skills/`，Windows 为 `%USERPROFILE%\.cursor\skills\`）；
2. 将 `skills/` 下各子目录（`contributor`、`evidence-recap`、`project-guide`、`great-resume`、`make-resume`、`job-match`、`job-apply`、`interview`、`offer`）**整体复制**到上述 `skills` 目录中，保持 `skills/<name>/SKILL.md` 结构不变；
3. 重新打开 Cursor 工作区或**新建 Agent 对话**。

若希望始终使用仓库内的最新技能而不重复复制，可在支持软链的环境下对每个目录执行 `ln -s`（路径请替换为你的克隆位置）。

### 方式三：让 Cursor Agent 安装

在 Cursor 中新建对话，发送：

```text
请按 ASu-skills 仓库 .cursor-plugin/install.md 的说明，把本仓库 skills/ 下的九个技能安装到本项目的 .cursor/skills/（优先软链，Windows 失败则复制）。安装后列出已安装的 skill 名称。
```

## 验证

1. 在 Cursor 中打开已安装技能的工作区（项目级安装时打开本仓库根目录）；
2. 新建 **Agent** 对话，输入 `/`，确认出现 `contributor`、`evidence-recap`、`project-guide`、`great-resume`、`make-resume`、`job-match`、`job-apply`、`interview`、`offer` 等入口，或直接输入例如 `/contributor`；
3. 试用任一技能（例如「用 /great-resume 帮我对齐 AI 应用实习岗位」），若能按 `SKILL.md` 工作流响应，即安装成功。

## 与 WorkBuddy 桥接的差异

| 项目 | Cursor（本入口） | WorkBuddy |
| --- | --- | --- |
| 技能数量 | 9 个（含 `/job-apply`） | 8 个（不含 `job-apply`） |
| 默认目标路径 | 项目 `.cursor/skills/` 或用户 `~/.cursor/skills/` | 用户 `~/.workbuddy/skills/` |
| `/job-apply` | 技能可加载；**执行填表**仍依赖仓库内 `scripts/` 与 Kimi WebBridge 环境，请在克隆完整的 ASu-skills 仓库中使用 | 未桥接（见 `.workbuddy-plugin/install.md`） |

`/make-resume` 默认模板与 PDF 导出依赖仓库 `assets/` 与 `npm` 脚本；在**本仓库工作区**内使用最省事。若仅在其他项目中挂载技能目录，需自行保证模板与脚本路径可用。

## 卸载

**项目级**：删除仓库根目录下的 `.cursor/skills/` 中对应子目录（或整个 `.cursor/skills` 文件夹）。

**用户级**：删除 `~/.cursor/skills/`（Windows：`%USERPROFILE%\.cursor\skills\`）下由本仓库安装的技能目录。

卸载不会影响你在 `output/` 或其他路径中保存的简历或进度表。

## 常见问题

### 安装后对话里看不到斜杠命令

Cursor 会在新对话中加载技能列表。请**新建 Agent 对话**或重新加载窗口；项目级安装时请确认当前打开的工作区根目录包含 `.cursor/skills/`。

### Windows 上显示 copied 而不是 linked

未开启「开发者模式」或当前终端无创建软链权限时，脚本会复制目录。功能上等价，更新上游 `skills/` 后需重新运行安装脚本或手动同步。

### 不要提交 `.cursor/skills/` 到 Git

通过复制/脚本生成的项目级技能目录属于本地环境产物。贡献 ASu-skills 时请勿把 `.cursor/skills/` 误加入 PR；需要改技能请直接编辑仓库根目录的 `skills/`。

## 协议

本安装入口遵循本仓库 MIT License。原技能内容版权归原作者（Hisn00w）所有。
