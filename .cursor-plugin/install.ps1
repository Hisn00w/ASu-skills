# ASu-skills → Cursor 技能桥接（Windows PowerShell）
# 默认：项目级 .cursor/skills/ ；加 -User 则写入 $env:USERPROFILE\.cursor\skills\
# 优先软链；失败则复制。

param(
    [switch]$User
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$src      = Join-Path $repoRoot 'skills'
$skills   = @(
    'contributor', 'evidence-recap', 'project-guide', 'great-resume', 'make-resume',
    'job-match', 'job-apply', 'interview', 'offer'
)

if ($User) {
    $dst = Join-Path $env:USERPROFILE '.cursor\skills'
} else {
    $dst = Join-Path $repoRoot '.cursor\skills'
}

New-Item -ItemType Directory -Force -Path $dst | Out-Null

foreach ($s in $skills) {
    $srcDir = Join-Path $src $s
    $dstDir = Join-Path $dst $s

    if (-not (Test-Path $srcDir)) {
        Write-Host "skip    $s  (not found in $src)"
        continue
    }

    if (Test-Path $dstDir) {
        Remove-Item $dstDir -Recurse -Force
    }

    try {
        New-Item -ItemType SymbolicLink -Path $dstDir -Target $srcDir | Out-Null
        Write-Host "linked  $s  ->  $dstDir"
    }
    catch {
        Copy-Item -Path $srcDir -Destination $dstDir -Recurse -Force
        Write-Host "copied  $s  ->  $dstDir  (symlink failed, used copy)"
    }
}

Write-Host ""
Write-Host "Done. 在 Cursor 中新建 Agent 对话，使用 /contributor、/great-resume 等入口。"
Write-Host "目标目录: $dst"
