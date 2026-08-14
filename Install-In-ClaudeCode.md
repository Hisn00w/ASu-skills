# 将 ASu-skills 安装到 Claude Code


## 一、前置条件

- 已安装 Claude Code（`npm install -g @anthropic-ai/claude-code`，或桌面版）

## 二、安装方式（三选一）

### 方式 1：项目级安装（仅当前项目可用，推荐）

把 skills 放进你的工作项目根目录的 `.claude/skills/`：

```bash
# 设置 ASu-skills 仓库路径
asu_skills_dir=/path/to/ASu-skills

# 进入你的工作项目
cd /path/to/your-project

# 创建 skill 和共享资源目录
mkdir -p .claude/skills .claude/assets .claude/references

# 复制四个 skill 和共享资源
cp -r "$asu_skills_dir/skills/."     .claude/skills/
cp -r "$asu_skills_dir/assets/."     .claude/assets/
cp -r "$asu_skills_dir/references/." .claude/references/
```

Windows PowerShell 版：

```powershell
$sourceRoot = "D:\DevProject\ASu-skills"
$targetRoot = Join-Path (Get-Location) ".claude"
New-Item -ItemType Directory -Path (Join-Path $targetRoot "skills"),(Join-Path $targetRoot "assets"),(Join-Path $targetRoot "references") -Force | Out-Null
Copy-Item (Join-Path $sourceRoot "skills\*") (Join-Path $targetRoot "skills") -Recurse -Force
Copy-Item (Join-Path $sourceRoot "assets\*") (Join-Path $targetRoot "assets") -Recurse -Force
Copy-Item (Join-Path $sourceRoot "references\*") (Join-Path $targetRoot "references") -Recurse -Force
```

**最终目录结构（`skills/` 下的每个 skill 必须含 `SKILL.md`）：**

```text
your-project/
└── .claude/
    ├── assets/
    │   ├── application-tracker.html
    │   ├── templates-html/
    │   └── ...
    ├── references/
    │   └── email-monitoring.md
    └── skills/
        ├── asu/SKILL.md
        ├── contributor/SKILL.md
        ├── resume/SKILL.md
        └── offer/SKILL.md
```

安装后可在项目根目录运行以下检查，确认共享资源没有漏拷：

```bash
test -f .claude/assets/application-tracker.html
test -d .claude/assets/templates-html
test -f .claude/references/email-monitoring.md
```

### 方式 2：用户级安装（本机所有项目可用）

共享资源也要复制到同一个 `.claude/` 根目录，不能只复制 `skills/`：

- macOS / Linux：`~/.claude/skills/`
- Windows：`%USERPROFILE%\.claude\skills\`

例如 macOS / Linux：

```bash
# 设置 ASu-skills 仓库路径
asu_skills_dir=/path/to/ASu-skills

mkdir -p ~/.claude/skills ~/.claude/assets ~/.claude/references
cp -r "$asu_skills_dir/skills/."     ~/.claude/skills/
cp -r "$asu_skills_dir/assets/."     ~/.claude/assets/
cp -r "$asu_skills_dir/references/." ~/.claude/references/
```

Windows PowerShell 用户级安装：

```powershell
$sourceRoot = "D:\DevProject\ASu-skills"
$targetRoot = Join-Path $env:USERPROFILE ".claude"
New-Item -ItemType Directory -Path (Join-Path $targetRoot "skills"),(Join-Path $targetRoot "assets"),(Join-Path $targetRoot "references") -Force | Out-Null
Copy-Item (Join-Path $sourceRoot "skills\*") (Join-Path $targetRoot "skills") -Recurse -Force
Copy-Item (Join-Path $sourceRoot "assets\*") (Join-Path $targetRoot "assets") -Recurse -Force
Copy-Item (Join-Path $sourceRoot "references\*") (Join-Path $targetRoot "references") -Recurse -Force
```


## 三、验证安装

1. **重启 Claude Code**（必须，让新技能加载）；
2. 对话中输入：`你有哪些技能？` 或 `列出已加载的 skills`；
3. 应看到 `asu`、`contributor`、`resume`、`offer` 四个技能；
4. 也可以直接触发测试：`请用 asu 技能把我的实习经历改写成适合 AI 应用工程师岗位的版本`。
<img src="assets/claudecode-skills.png" width="360" alt="Claude Code 技能列表">

## 四、使用示例

Claude Code 根据 `description` 自动匹配技能，直接说人话即可：

```text
# 触发 /asu —— 经历酥化
请酥化我下面的实习经历：目标岗位是 AI 应用工程师，给出稳妥版和进取版定位，并生成一段发 HR 的开场白。

# 触发 /resume —— 简历制作
根据我的教育、实习和项目经历，生成一份可编辑的中文 HTML 简历，并告诉我如何导出 PDF。

# 触发 /offer —— 秋招进度
把这些招聘邮件和截图整理成秋招进度表，列出每家公司下一步要做什么。

# 触发 /contributor —— 开源贡献
请帮我找 3 个容易合并的 GitHub 小 PR（typo、README 修复），技术栈 TypeScript、React。
```

## 五、注意事项

| 事项 | 说明 |
| --- | --- |
| `agents/openai.yaml` | Codex 专属配置，Claude Code 会忽略，保留或删除均可 |
| `/contributor` 权限 | 先只读扫描并展示 diff；fork、push 和提交 PR 前逐个明确确认，使用最小 Git/GitHub 权限，不要使用 `--dangerously-skip-permissions` |
| 项目级安装与 git | `.claude/skills` 默认会进 git，适合团队共享；若只想自己用，请改用方式 2 或加入 `.gitignore` |
| 路径问题 | `resume` 和 `offer` 依赖 `.claude/assets`、`.claude/references`，必须复制共享资源，不要只拷 `SKILL.md` 或四个 skill 文件夹 |

## 六、卸载

macOS / Linux（Bash）：

```bash
# 项目级
rm -rf .claude/skills/asu .claude/skills/contributor .claude/skills/resume .claude/skills/offer

# 用户级
rm -rf ~/.claude/skills/asu ~/.claude/skills/contributor ~/.claude/skills/resume ~/.claude/skills/offer
```

Windows PowerShell：

```powershell
# 项目级
Remove-Item -Path .claude\skills\asu,.claude\skills\contributor,.claude\skills\resume,.claude\skills\offer -Recurse -Force

# 用户级
Remove-Item -Path "$env:USERPROFILE\.claude\skills\asu","$env:USERPROFILE\.claude\skills\contributor","$env:USERPROFILE\.claude\skills\resume","$env:USERPROFILE\.claude\skills\offer" -Recurse -Force
```

