# ASu-skills → WorkBuddy 轻量安装入口（Windows / PowerShell）
# 把仓库原版 skills/ 下 6 个技能桥接到 $HOME/.workbuddy/skills/
# 优先软链；Windows 软链需开发者模式或管理员权限，失败则回退为复制。

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$src      = Join-Path $repoRoot 'skills'
$dst      = Join-Path $env:USERPROFILE '.workbuddy\skills'
$skills   = @('asu', 'contributor', 'resume', 'asu-resume', 'interview', 'offer')

New-Item -ItemType Directory -Force -Path $dst | Out-Null

foreach ($s in $skills) {
    $srcDir = Join-Path $src $s
    $dstDir = Join-Path $dst $s

    if (-not (Test-Path $srcDir)) {
        Write-Host "skip    $s  (not found in $src)"
        continue
    }

    # 清理已存在的目标（软链或目录）
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
Write-Host "Done. 重启 WorkBuddy（或刷新技能列表）后即可触发："
Write-Host "  asu / contributor / resume / asu-resume / interview / offer"
