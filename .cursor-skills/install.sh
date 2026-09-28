#!/usr/bin/env bash
# catalog:cursor.sh.header:begin
# ASu-skills → Cursor Skill bridge（macOS / Linux / Git Bash）
# 把仓库原版 skills/ 下可桥接的 9 个技能软链到 Cursor Agent Skills 目录
# catalog:cursor.sh.header:end
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/skills"
# catalog:cursor.sh.skills:begin
SKILLS=(contributor evidence-recap project-guide great-resume make-resume job-match job-apply interview offer)
# catalog:cursor.sh.skills:end

USER_INSTALL=false
FORCE=false

usage() {
  cat <<'EOF'
Usage: bash .cursor-skills/install.sh [--user] [--force]

  --user   安装到 ~/.cursor/skills/，默认安装到仓库的 .cursor/skills/
  --force  删除目标位置已有的普通文件或目录后重新安装
EOF
}

for arg in "$@"; do
  case "$arg" in
    --user) USER_INSTALL=true ;;
    --force) FORCE=true ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知参数: $arg" >&2; usage >&2; exit 2 ;;
  esac
done

if [ "$USER_INSTALL" = true ]; then
  DST="${HOME}/.cursor/skills"
else
  DST="$REPO_ROOT/.cursor/skills"
fi

mkdir -p "$DST"

conflicts=()
for s in "${SKILLS[@]}"; do
  target="$DST/$s"
  if { [ -e "$target" ] || [ -L "$target" ]; } && [ ! -L "$target" ]; then
    conflicts+=("$target")
  fi
done

if [ "${#conflicts[@]}" -gt 0 ] && [ "$FORCE" = false ]; then
  echo "安装已停止：以下目标是普通文件或目录，默认不会覆盖：" >&2
  printf '  %s\n' "${conflicts[@]}" >&2
  echo "确认其中内容可以删除后，重新运行并添加 --force。" >&2
  exit 1
fi

for s in "${SKILLS[@]}"; do
  src_dir="$SRC/$s"
  target="$DST/$s"
  if [ ! -d "$src_dir" ]; then
    echo "skip    $s  (not found in $SRC)"
    continue
  fi

  if [ -e "$target" ] || [ -L "$target" ]; then
    rm -rf -- "$target"
  fi
  ln -s "$src_dir" "$target"
  echo "linked  $s  ->  $target"
done

# catalog:cursor.sh.echo:begin
echo ""
echo "Done. 在 Cursor 中新建 Agent 对话后可使用："
echo "  /contributor  /evidence-recap  /project-guide  /great-resume  /make-resume  /job-match  /job-apply  /interview  /offer"
# catalog:cursor.sh.echo:end
echo "目标目录: $DST"

if [ "$USER_INSTALL" = true ]; then
  echo "提示：依赖仓库根目录资源的完整工作流仍需在 ASu-skills 仓库工作区中运行。"
fi
