#!/usr/bin/env bash
# ASu-skills → WorkBuddy 轻量安装入口（macOS / Linux）
# 把仓库原版 skills/ 下 8 个技能软链到 ~/.workbuddy/skills/
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/skills"
DST="${HOME}/.workbuddy/skills"
SKILLS=(contributor asu-recap project-guide asu make-resume asu-resume interview offer)

mkdir -p "$DST"

for s in "${SKILLS[@]}"; do
  if [ -d "$SRC/$s" ]; then
    # -s 软链，-f 覆盖已存在的旧链接，-n 不跟随已存在的目录链接
    ln -sfn "$SRC/$s" "$DST/$s"
    echo "linked  $s  ->  $DST/$s"
  else
    echo "skip    $s  (not found in $SRC)"
  fi
done

echo ""
echo "Done. 重启 WorkBuddy（或刷新技能列表）后即可触发："
echo "  contributor / asu-recap / project-guide / asu / make-resume / asu-resume / interview / offer"
