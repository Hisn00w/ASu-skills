#!/usr/bin/env python3
"""
ASu-skills OpenCode 安装脚本
自动将 skills/ 目录复制到 OpenCode 的 skills 目录
"""
import argparse
import os
import platform
import shutil
from pathlib import Path


SKILL_NAMES = (
    "contributor",
    "evidence-recap",
    "project-guide",
    "great-resume",
    "make-resume",
    "job-match",
    "job-apply",
    "interview",
    "offer",
)


def find_opencode_skills_dir():
    """查找 OpenCode skills 目录"""
    system = platform.system()
    if system == "Windows":
        # Windows 常见路径
        candidates = [
            Path(os.environ.get("E:", "")) / "Cache" / "skills",
            Path(os.path.expanduser("~")) / ".config" / "opencode" / "skills",
            Path(os.path.expanduser("~")) / "AppData" / "Roaming" / "opencode" / "skills",
        ]
    elif system == "Darwin":  # macOS
        candidates = [
            Path.home() / ".config" / "opencode" / "skills",
            Path.home() / ".cache" / "opencode" / "skills",
        ]
    else:  # Linux
        candidates = [
            Path.home() / ".config" / "opencode" / "skills",
            Path.home() / ".cache" / "opencode" / "skills",
        ]

    for path in candidates:
        if path.exists():
            return path

    # 尝试从 opencode.json 读取
    config_candidates = [
        Path(os.path.expanduser("~")) / ".config" / "opencode" / "opencode.json",
        Path("E:\\") / ".config" / "opencode" / "opencode.json",
    ]
    for config_path in config_candidates:
        if config_path.exists():
            try:
                import json
                with open(config_path, "r") as f:
                    config = json.load(f)
                skills_path = config.get("skills", {}).get("path", "")
                if skills_path and Path(skills_path).exists():
                    return Path(skills_path)
            except Exception:
                pass

    return None


def install_skills(skills_dir, source_dir):
    """将 skills 复制到目标目录"""
    source = Path(source_dir)
    target = Path(skills_dir)

    if not source.is_dir():
        print(f"[ERROR] 源目录不存在: {source}")
        return False

    try:
        target.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        print(f"[ERROR] 无法创建 OpenCode skills 目录: {target} ({exc})")
        return False

    print(f"[INFO] 安装 ASu-skills 到: {target}")

    for skill_name in SKILL_NAMES:
        src = source / skill_name
        dst = target / skill_name

        if not src.is_dir():
            print(f"[WARN] 跳过 {skill_name}（源目录不存在）")
            continue

        if dst.exists():
            print(f"[WARN] {skill_name} 已存在，覆盖安装")

        try:
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
        except OSError as exc:
            print(f"[ERROR] 安装 {skill_name} 失败: {exc}")
            return False
        print(f"[OK] {skill_name}")

    print()
    print("[OK] 安装完成！请重启 OpenCode 或执行 /reload-plugins")
    print("   使用触发词：/contributor  /evidence-recap  /project-guide  /great-resume  /make-resume  /job-match  /job-apply  /interview  /offer")
    return True


def build_parser():
    parser = argparse.ArgumentParser(
        description="将 ASu-skills 安装到 OpenCode skills 目录。",
    )
    parser.add_argument(
        "--target",
        type=Path,
        help="显式指定 OpenCode skills 目录；未提供时自动查找。",
    )
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    script_dir = Path(__file__).parent
    source_dir = script_dir.parent / "skills"

    if args.target is not None:
        skills_dir = args.target.expanduser()
    else:
        skills_dir = find_opencode_skills_dir()

    if not skills_dir:
        print("[ERROR] 未找到 OpenCode skills 目录")
        print("   请手动指定目录：python install-opencode.py --target /path/to/skills")
        return 1

    return 0 if install_skills(skills_dir, source_dir) else 1


if __name__ == "__main__":
    raise SystemExit(main())
