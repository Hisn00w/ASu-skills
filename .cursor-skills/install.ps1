# ASu-skills → Cursor Skill bridge（Windows / PowerShell）
# catalog:cursor.ps1.header:begin
# 把仓库原版 skills/ 下可桥接的 9 个技能桥接到 Cursor Agent Skills 目录
# catalog:cursor.ps1.header:end
# 优先创建符号链接；失败时复制技能目录。

param(
    [switch]$User,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$src      = Join-Path $repoRoot 'skills'
# catalog:cursor.ps1.skills:begin
$skills   = @('contributor', 'evidence-recap', 'project-guide', 'great-resume', 'make-resume', 'job-match', 'job-apply', 'interview', 'offer')
# catalog:cursor.ps1.skills:end

if ($User) {
    $dst = Join-Path $env:USERPROFILE '.cursor\skills'
} else {
    $dst = Join-Path $repoRoot '.cursor\skills'
}

New-Item -ItemType Directory -Force -Path $dst | Out-Null

$conflicts = @()
foreach ($s in $skills) {
    $dstDir = Join-Path $dst $s
    $existing = Get-Item -LiteralPath $dstDir -Force -ErrorAction SilentlyContinue
    if ($null -ne $existing) {
        $isLink = ($existing.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0
        if (-not $isLink) {
            $conflicts += $dstDir
        }
    }
}

if ($conflicts.Count -gt 0 -and -not $Force) {
    $details = ($conflicts | ForEach-Object { "  $_" }) -join [Environment]::NewLine
    throw "Installation stopped: regular files or directories already exist and will not be overwritten by default.$([Environment]::NewLine)$details$([Environment]::NewLine)Back up their contents, then rerun with -Force."
}

foreach ($s in $skills) {
    $srcDir = Join-Path $src $s
    $dstDir = Join-Path $dst $s

    if (-not (Test-Path -LiteralPath $srcDir -PathType Container)) {
        Write-Host "skip    $s  (not found in $src)"
        continue
    }

    $existing = Get-Item -LiteralPath $dstDir -Force -ErrorAction SilentlyContinue
    if ($null -ne $existing) {
        $isLink = ($existing.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0
        if ($isLink) {
            Remove-Item -LiteralPath $dstDir -Force
        } else {
            Remove-Item -LiteralPath $dstDir -Recurse -Force
        }
    }

    try {
        New-Item -ItemType SymbolicLink -Path $dstDir -Target $srcDir | Out-Null
        Write-Host "linked  $s  ->  $dstDir"
    }
    catch {
        Copy-Item -LiteralPath $srcDir -Destination $dstDir -Recurse -Force
        Write-Host "copied  $s  ->  $dstDir  (symlink failed, used copy)"
    }
}

# catalog:cursor.ps1.echo:begin
Write-Host ""
Write-Host "Done. Start a new Cursor Agent chat to use:"
Write-Host "  /contributor  /evidence-recap  /project-guide  /great-resume  /make-resume  /job-match  /job-apply  /interview  /offer"
# catalog:cursor.ps1.echo:end
Write-Host "Target directory: $dst"

if ($User) {
    Write-Warning "Full workflows that depend on repository-root resources must still run in the ASu-skills repository workspace."
}
