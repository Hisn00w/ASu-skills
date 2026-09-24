# Cursor Skill bridge 安装入口

本目录提供 Cursor Agent Skills 的项目级与用户级桥接脚本，**不是 Cursor Plugin，也不包含 Plugin manifest**。脚本只负责把本仓库的 Skill 安装到 Cursor 识别的 `.cursor/skills/` 或 `~/.cursor/skills/`。

<!-- catalog:cursor.md.intro:begin -->
ASu-skills 当前向 Cursor 桥接 9 个入口：`contributor` / `evidence-recap` / `project-guide` / `great-resume` / `make-resume` / `job-match` / `job-apply` / `interview` / `offer`。
<!-- catalog:cursor.md.intro:end -->

## 前置条件

- 已安装 [Cursor](https://cursor.com/)
- 已克隆或下载本仓库到本地
- 运行安装脚本需要 bash（macOS / Linux / Git Bash）或 PowerShell（Windows）

## 安装方式

### 方式一：安装脚本（推荐）

默认安装到本仓库的 `.cursor/skills/`。项目级安装能让 Agent 在完整仓库工作区中访问 `assets/`、`references/` 和 `scripts/`，是使用全部工作流的推荐方式。

macOS / Linux / Git Bash：

```bash
bash .cursor-skills/install.sh
```

Windows PowerShell：

```powershell
.\.cursor-skills\install.ps1
```

安装到当前用户目录：

```bash
bash .cursor-skills/install.sh --user
```

```powershell
.\.cursor-skills\install.ps1 -User
```

脚本会直接替换已有软链。目标位置如果已经是普通文件或目录，脚本默认停止，避免删除其中的本地修改；确认可以删除后才能强制覆盖：

```bash
bash .cursor-skills/install.sh --force
bash .cursor-skills/install.sh --user --force
```

```powershell
.\.cursor-skills\install.ps1 -Force
.\.cursor-skills\install.ps1 -User -Force
```

PowerShell 会优先创建符号链接；Windows 未开启开发者模式或缺少权限时，自动回退为复制技能目录。项目级复制仍位于完整仓库内，三个重资源 Skill 可以向上定位仓库根目录；用户级复制则存在下述限制。

### 方式二：手动复制

1. 在仓库根目录创建 `.cursor/skills/`，或者在用户目录创建 `~/.cursor/skills/`（Windows 为 `%USERPROFILE%\.cursor\skills\`）。
<!-- catalog:cursor.md.copy:begin -->
2. 将 `skills/` 下的`contributor`、`evidence-recap`、`project-guide`、`great-resume`、`make-resume`、`job-match`、`job-apply`、`interview`和`offer`目录整体复制到目标 `skills/` 目录。
<!-- catalog:cursor.md.copy:end -->
3. 保持 `skills/<name>/SKILL.md` 结构不变，重新打开 Cursor 工作区或新建 Agent 对话。

### 方式三：让 Cursor Agent 安装

在 Cursor 中新建对话，发送：

```text
请按 ASu-skills 仓库 .cursor-skills/install.md 的说明，将本仓库的 Skill 安装到项目 .cursor/skills/。已有普通目录时不要覆盖；安装后列出已安装的 Skill。
```

## 用户级安装与 Windows 复制回退的限制

用户级目录只包含各 Skill 自身。无论使用软链还是 Windows 复制回退，都不会把仓库根目录的 `assets/`、`references/`、`scripts/` 一并安装到当前业务项目。因此，用户级安装可以让入口出现在所有项目中，但不能保证以下完整工作流在其他项目中运行：

- `/make-resume`：缺少完整资源时只能使用 Skill 中约定的简洁 A4 后备方案，无法保证 ASu 模板、18 套模板、构建脚本和 PDF 导出。
- `/offer`：无法复用仓库根目录的求职进度表、预览图及邮件监控参考资料。
- `/job-apply`：无法运行仓库根目录的 `scripts/kimi-webbridge.mjs`，因而不能执行依赖该桥接的浏览器填写流程。

需要这些能力时，请保留完整仓库，使用默认的项目级安装，并在 ASu-skills 仓库根目录工作。用户级安装不应被描述为完整功能安装。

## 验证

1. 在 Cursor 中打开安装目标所在的工作区；使用完整工作流时应打开 ASu-skills 仓库根目录。
<!-- catalog:cursor.md.verify:begin -->
2. 新建 Agent 对话，输入 `/`，确认出现`contributor`、`evidence-recap`、`project-guide`、`great-resume`、`make-resume`、`job-match`、`job-apply`、`interview`和`offer`。
<!-- catalog:cursor.md.verify:end -->
3. 触发一个不依赖根目录资源的入口，例如 `/great-resume`，确认 Agent 能读取对应 `SKILL.md`。
4. 验证完整能力时，分别检查 `/make-resume` 能读取模板并运行构建脚本、`/offer` 能定位进度表资源、`/job-apply` 能定位 Kimi WebBridge 脚本。

## 与 WorkBuddy bridge 的差异

Cursor bridge 包含 `/job-apply`，但其浏览器填写能力仍要求完整仓库和 Kimi WebBridge 环境。WorkBuddy bridge 不安装该入口。

## 卸载

- 项目级：删除仓库 `.cursor/skills/` 中由本脚本创建的对应软链或目录。
- 用户级：删除 `~/.cursor/skills/`（Windows 为 `%USERPROFILE%\.cursor\skills\`）中的对应软链或目录。

卸载不会影响保存在 `output/` 或其他位置的用户文件。

## 常见问题

### 安装后看不到入口

请新建 Agent 对话或重新加载窗口；项目级安装时确认当前工作区根目录包含 `.cursor/skills/`。

### Windows 上显示 copied 而不是 linked

这表示系统拒绝创建符号链接，脚本已改为复制 Skill 目录。入口仍可加载，但用户级复制不包含仓库根目录资源，不能视为完整功能安装。更新仓库后还需重新运行脚本同步副本。

### 为什么安装器拒绝覆盖目录

目录可能包含手工修改。请先检查并备份；确认可以删除后，使用 `--force` 或 `-Force`。强制模式会递归删除同名目标。

### 不要提交 `.cursor/skills/`

该目录是本地生成的桥接产物。需要修改 Skill 时，请编辑仓库根目录的 `skills/`。

## 协议

本安装入口遵循仓库 MIT License。原 Skill 内容版权归原作者（Hisn0w）所有。
