#!/usr/bin/env bash
# ASu-skills → Cursor 技能桥接（macOS / Linux / Git Bash）
# 默认：项目级 .cursor/skills/ ；传入 --user 则写入 ~/.cursor/skills/
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/skills"
SKILLS=(contributor evidence-recap project-guide great-resume make-resume job-match job-apply interview offer)

if [[ "${1:-}" == "--user" ]]; then
  DST="${HOME}/.cursor/skills"
else
  DST="$REPO_ROOT/.cursor/skills"
fi

mkdir -p "$DST"

for s in "${SKILLS[@]}"; do
  if [ -d "$SRC/$s" ]; then
    ln -sfn "$SRC/$s" "$DST/$s"
    echo "linked  $s  ->  $DST/$s"
  else
    echo "skip    $s  (not found in $SRC)"
  fi
done

echo ""
echo "Done. 在 Cursor 中新建 Agent 对话，使用 /contributor、/great-resume 等入口。"
echo "目标目录: $DST"
