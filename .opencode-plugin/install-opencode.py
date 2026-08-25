#!/usr/bin/env python3
"""
ASu-skills OpenCode 安装脚本
自动将 skills/ 目录复制到 OpenCode 的 skills 目录
"""
import os
import sys
import shutil
import platform
from pathlib import Path

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

    if not source.exists():
        print(f"❌ 源目录不存在: {source}")
        return False

    print(f"📦 安装 ASu-skills 到: {target}")

    # 要安装的 skills
    skill_names = ["contributor", "asu", "resume", "asu-resume", "interview", "offer"]

    for skill_name in skill_names:
        src = source / skill_name
        dst = target / skill_name

        if not src.exists():
            print(f"   ⚠️  跳过 {skill_name}（源目录不存在）")
            continue

        if dst.exists():
            # 检查是否已安装
            print(f"   ⚠️  {skill_name} 已存在，覆盖安装")

        # 复制
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        print(f"   ✅ {skill_name}")

    print()
    print("✅ 安装完成！请重启 OpenCode 或执行 /reload-plugins")
    print("   使用触发词：/asu  /resume  /interview  /offer  /contributor")
    return True

def main():
    script_dir = Path(__file__).parent
    source_dir = script_dir.parent / "skills"

    # 查找 OpenCode skills 目录
    skills_dir = find_opencode_skills_dir()

    if not skills_dir:
        print("❌ 未找到 OpenCode skills 目录")
        print("   请手动指定目录：python install-opencode.py --target /path/to/skills")
        sys.exit(1)

    # 检查是否指定了目标目录
    if len(sys.argv) > 2 and sys.argv[1] == "--target":
        skills_dir = Path(sys.argv[2])

    install_skills(skills_dir, source_dir)

if __name__ == "__main__":
    main()