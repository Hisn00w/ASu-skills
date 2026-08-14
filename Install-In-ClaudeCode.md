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

# 创建 skill 和 ASu 命名空间资源目录
mkdir -p .claude/skills .claude/assets/asu .claude/references/asu

# 重装前备份可编辑的求职进度表；不会覆盖已有备份
tracker_path=.claude/assets/asu/application-tracker.html
if [ -f "$tracker_path" ]; then
  backup_path="${tracker_path}.bak"
  backup_index=1
  while [ -e "$backup_path" ]; do
    backup_path="${tracker_path}.bak.${backup_index}"
    backup_index=$((backup_index + 1))
  done
  if ! cp "$tracker_path" "$backup_path"; then
    printf '无法备份现有求职进度表，安装已停止: %s\n' "$tracker_path" >&2
    exit 1
  fi
  printf '已备份现有求职进度表: %s\n' "$backup_path"
fi

# 复制四个 skill 和共享资源
cp -r "$asu_skills_dir/skills/."     .claude/skills/
cp -r "$asu_skills_dir/assets/."     .claude/assets/asu/
cp -r "$asu_skills_dir/references/." .claude/references/asu/
```

Windows PowerShell 版：

```powershell
$sourceRoot = "D:\DevProject\ASu-skills"
$targetRoot = Join-Path (Get-Location) ".claude"
New-Item -ItemType Directory -Path (Join-Path $targetRoot "skills"),(Join-Path $targetRoot "assets\asu"),(Join-Path $targetRoot "references\asu") -Force | Out-Null
$trackerPath = Join-Path $targetRoot "assets\asu\application-tracker.html"
if (Test-Path -LiteralPath $trackerPath -PathType Leaf) {
    $backupPath = "$trackerPath.bak"
    $backupIndex = 1
    while (Test-Path -LiteralPath $backupPath) {
        $backupPath = "$trackerPath.bak.$backupIndex"
        $backupIndex++
    }
    Copy-Item -LiteralPath $trackerPath -Destination $backupPath -ErrorAction Stop
    Write-Output "已备份现有求职进度表: $backupPath"
}
Copy-Item (Join-Path $sourceRoot "skills\*") (Join-Path $targetRoot "skills") -Recurse -Force
Copy-Item (Join-Path $sourceRoot "assets\*") (Join-Path $targetRoot "assets\asu") -Recurse -Force
Copy-Item (Join-Path $sourceRoot "references\*") (Join-Path $targetRoot "references\asu") -Recurse -Force
```

重复安装会在替换 `application-tracker.html` 前创建不覆盖的 `.bak` 备份，以保留用户在进度表中的编辑；其余共享资源照常更新。

**最终目录结构（`skills/` 下的每个 skill 必须含 `SKILL.md`）：**

```text
your-project/
└── .claude/
    ├── assets/
    │   └── asu/
    │       ├── application-tracker.html
    │       ├── templates-html/
    │       └── ...
    ├── references/
    │   └── asu/
    │       └── email-monitoring.md
    └── skills/
        ├── asu/SKILL.md
        ├── contributor/SKILL.md
        ├── resume/SKILL.md
        └── offer/SKILL.md
```

安装后可在项目根目录运行以下检查，确认四个 skill 和共享资源没有漏拷。任一资源缺失都会输出路径并返回非零状态。

```bash
required_paths=(
  .claude/skills/asu/SKILL.md
  .claude/skills/contributor/SKILL.md
  .claude/skills/resume/SKILL.md
  .claude/skills/offer/SKILL.md
  .claude/assets/asu/application-tracker.html
  .claude/assets/asu/application-tracker-overview.svg
  .claude/assets/asu/templates-html
  .claude/assets/asu/resume-data-template.json
  .claude/assets/asu/resume-template-editable.html
  .claude/assets/asu/resume-template-two-page.html
  .claude/assets/asu/template-overview.jpg
  .claude/assets/asu/fictional-resume-photo.png
  .claude/references/asu/email-monitoring.md
)
# 18 个内置简历模板必须全部存在，不能只检查目录。
for template_number in {01..18}; do
  required_paths+=(".claude/assets/asu/templates-html/${template_number}-大厂极简简历模板.html")
done
missing=0
for path in "${required_paths[@]}"; do
  if [ ! -e "$path" ]; then
    printf '缺少资源: %s\n' "$path" >&2
    missing=1
  fi
done
if [ "$missing" -ne 0 ]; then
  exit 1
fi
printf 'ASu-skills 安装检查通过。\n'
```

Windows PowerShell 版：

```powershell
$requiredPaths = @(
    ".claude\skills\asu\SKILL.md",
    ".claude\skills\contributor\SKILL.md",
    ".claude\skills\resume\SKILL.md",
    ".claude\skills\offer\SKILL.md",
    ".claude\assets\asu\application-tracker.html",
    ".claude\assets\asu\application-tracker-overview.svg",
    ".claude\assets\asu\templates-html",
    ".claude\assets\asu\resume-data-template.json",
    ".claude\assets\asu\resume-template-editable.html",
    ".claude\assets\asu\resume-template-two-page.html",
    ".claude\assets\asu\template-overview.jpg",
    ".claude\assets\asu\fictional-resume-photo.png",
    ".claude\references\asu\email-monitoring.md"
)
# 18 个内置简历模板必须全部存在，不能只检查目录。
1..18 | ForEach-Object {
    $requiredPaths += (".claude\assets\asu\templates-html\{0:D2}-大厂极简简历模板.html" -f $_)
}
$missingPaths = @($requiredPaths | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missingPaths.Count -gt 0) {
    $missingPaths | ForEach-Object { Write-Error "缺少资源: $_" }
    exit 1
}
Write-Output "ASu-skills 安装检查通过。"
```

### 方式 2：用户级安装（本机所有项目可用）

共享资源也要复制到同一个 `.claude/` 根目录下的 ASu 命名空间，不能只复制 `skills/`：

- macOS / Linux：`~/.claude/skills/`
- Windows：`%USERPROFILE%\.claude\skills\`

例如 macOS / Linux：

```bash
# 设置 ASu-skills 仓库路径
asu_skills_dir=/path/to/ASu-skills

mkdir -p ~/.claude/skills ~/.claude/assets/asu ~/.claude/references/asu
tracker_path="$HOME/.claude/assets/asu/application-tracker.html"
if [ -f "$tracker_path" ]; then
  backup_path="${tracker_path}.bak"
  backup_index=1
  while [ -e "$backup_path" ]; do
    backup_path="${tracker_path}.bak.${backup_index}"
    backup_index=$((backup_index + 1))
  done
  if ! cp "$tracker_path" "$backup_path"; then
    printf '无法备份现有求职进度表，安装已停止: %s\n' "$tracker_path" >&2
    exit 1
  fi
  printf '已备份现有求职进度表: %s\n' "$backup_path"
fi
cp -r "$asu_skills_dir/skills/."     ~/.claude/skills/
cp -r "$asu_skills_dir/assets/."     ~/.claude/assets/asu/
cp -r "$asu_skills_dir/references/." ~/.claude/references/asu/
```

Windows PowerShell 用户级安装：

```powershell
$sourceRoot = "D:\DevProject\ASu-skills"
$targetRoot = Join-Path $env:USERPROFILE ".claude"
New-Item -ItemType Directory -Path (Join-Path $targetRoot "skills"),(Join-Path $targetRoot "assets\asu"),(Join-Path $targetRoot "references\asu") -Force | Out-Null
$trackerPath = Join-Path $targetRoot "assets\asu\application-tracker.html"
if (Test-Path -LiteralPath $trackerPath -PathType Leaf) {
    $backupPath = "$trackerPath.bak"
    $backupIndex = 1
    while (Test-Path -LiteralPath $backupPath) {
        $backupPath = "$trackerPath.bak.$backupIndex"
        $backupIndex++
    }
    Copy-Item -LiteralPath $trackerPath -Destination $backupPath -ErrorAction Stop
    Write-Output "已备份现有求职进度表: $backupPath"
}
Copy-Item (Join-Path $sourceRoot "skills\*") (Join-Path $targetRoot "skills") -Recurse -Force
Copy-Item (Join-Path $sourceRoot "assets\*") (Join-Path $targetRoot "assets\asu") -Recurse -Force
Copy-Item (Join-Path $sourceRoot "references\*") (Join-Path $targetRoot "references\asu") -Recurse -Force
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
| `/contributor` 权限 | 本文只说明安装，不授予或承诺 GitHub 写操作。使用 `/contributor` 前，请直接阅读已安装版本的 `skills/contributor/SKILL.md` 和目标仓库规则；在未阅读这些契约前，不执行 fork、push、PR、评论或 thread resolution，也不要使用 `--dangerously-skip-permissions` |
| 项目级安装与 git | `.claude/skills` 默认会进 git，适合团队共享；若只想自己用，请改用方式 2 或加入 `.gitignore` |
| 路径问题 | `resume` 和 `offer` 依赖 `.claude/assets/asu`、`.claude/references/asu`，必须复制共享资源，不要只拷 `SKILL.md` 或四个 skill 文件夹 |

## 六、卸载

macOS / Linux（Bash）：

```bash
# 项目级
rm -rf .claude/skills/asu .claude/skills/contributor .claude/skills/resume .claude/skills/offer

# 用户级
rm -rf ~/.claude/skills/asu ~/.claude/skills/contributor ~/.claude/skills/resume ~/.claude/skills/offer
```

上面的命令不会删除共享资源，因为 `application-tracker.html` 可能包含用户编辑内容。根据要卸载的作用域，选择下面对应的一段；每段只删除 ASu 命名空间，并要求独立输入 `DELETE` 确认。

只卸载当前项目的共享资源：

```bash
project_shared_paths=(
  .claude/assets/asu
  .claude/references/asu
)
project_existing_paths=()
for path in "${project_shared_paths[@]}"; do
  [ -e "$path" ] && project_existing_paths+=("$path")
done
if [ "${#project_existing_paths[@]}" -gt 0 ]; then
  printf '将删除项目级 ASu 共享资源:\n%s\n' "${project_existing_paths[*]}"
  read -r -p '确认删除请输入 DELETE，否则保留: ' answer
  if [ "$answer" = "DELETE" ]; then
    rm -rf -- "${project_existing_paths[@]}"
  else
    printf '已保留项目级 ASu 共享资源。\n'
  fi
fi
```

只卸载用户级共享资源（不会影响项目级资源）：

```bash
user_shared_paths=(
  "${HOME}/.claude/assets/asu"
  "${HOME}/.claude/references/asu"
)
user_existing_paths=()
for path in "${user_shared_paths[@]}"; do
  [ -e "$path" ] && user_existing_paths+=("$path")
done
if [ "${#user_existing_paths[@]}" -gt 0 ]; then
  printf '将删除用户级 ASu 共享资源:\n%s\n' "${user_existing_paths[*]}"
  read -r -p '确认删除请输入 DELETE，否则保留: ' answer
  if [ "$answer" = "DELETE" ]; then
    rm -rf -- "${user_existing_paths[@]}"
  else
    printf '已保留用户级 ASu 共享资源。\n'
  fi
fi
```

Windows PowerShell：

```powershell
# 项目级
Remove-Item -Path .claude\skills\asu,.claude\skills\contributor,.claude\skills\resume,.claude\skills\offer -Recurse -Force

# 用户级
Remove-Item -Path "$env:USERPROFILE\.claude\skills\asu","$env:USERPROFILE\.claude\skills\contributor","$env:USERPROFILE\.claude\skills\resume","$env:USERPROFILE\.claude\skills\offer" -Recurse -Force
```

上面的命令不会删除共享资源。根据要卸载的作用域，选择下面对应的 PowerShell 片段；输入 `DELETE` 以确认，其他输入都会保留资源：

只卸载当前项目的共享资源：

```powershell
$projectSharedPaths = @(
    (Join-Path (Get-Location) ".claude\assets\asu"),
    (Join-Path (Get-Location) ".claude\references\asu")
)
$projectExistingPaths = @($projectSharedPaths | Where-Object { Test-Path -LiteralPath $_ })
if ($projectExistingPaths.Count -gt 0) {
    $projectExistingPaths | ForEach-Object { Write-Output "将删除项目级资源: $_" }
    $answer = Read-Host "确认删除请输入 DELETE，否则保留"
    if ($answer -eq "DELETE") {
        Remove-Item -LiteralPath $projectExistingPaths -Recurse -Force
    } else {
        Write-Output "已保留项目级 ASu 共享资源。"
    }
}
```

只卸载用户级共享资源（不会影响项目级资源）：

```powershell
$userSharedPaths = @(
    (Join-Path $env:USERPROFILE ".claude\assets\asu"),
    (Join-Path $env:USERPROFILE ".claude\references\asu")
)
$userExistingPaths = @($userSharedPaths | Where-Object { Test-Path -LiteralPath $_ })
if ($userExistingPaths.Count -gt 0) {
    $userExistingPaths | ForEach-Object { Write-Output "将删除用户级资源: $_" }
    $answer = Read-Host "确认删除请输入 DELETE，否则保留"
    if ($answer -eq "DELETE") {
        Remove-Item -LiteralPath $userExistingPaths -Recurse -Force
    } else {
        Write-Output "已保留用户级 ASu 共享资源。"
    }
}
```
