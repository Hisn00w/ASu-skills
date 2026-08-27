#!/usr/bin/env python3
"""ASu-skills 静态校验器。

扫描仓库内的 skills 目录，对每个 skill 做确定性静态检查，并对
插件清单做合法性校验。不依赖任何第三方库，所有检查
都能给出确定的 Pass/Fail 结论，适合在 CI 中无条件信任。

校验范围（第一层，仅做黑盒确定的检查）：
  1. SKILL.md 是否存在；
  2. YAML frontmatter 可解析，且包含 name 与 description；
  3. frontmatter 的 name 与所在目录名一致；
  4. description 非空、长度合理（<= 500 字符，避免 description 过长导致
     命令菜单截断或路由混乱）；
  5. agents/openai.yaml 存在且可解析为合法 YAML（最小子集：key: value）；
  6. SKILL.md 中引用的本地 references / assets 路径实际存在
     （仅检查相对路径，跳过 http(s)/mailto/锚点）；
  7. .codex-plugin/.trae-plugin/.claude-plugin/.opencode-plugin 清单是合法 JSON，
     且关键字段、入口列表与本地资源引用有效；
  8. assets/templates-html/ 外框解耦结构完整：frame/ 三部件存在、
     壳文件数量 == 18。交付产物的一致性由 inline-template.mjs 的确定性
     内联保证，不做产物与历史基准的比对。

退出码：0 表示全部通过，1 表示存在失败项。
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Tuple, Union

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = REPO_ROOT / "skills"
CODEX_PLUGIN_MANIFEST = REPO_ROOT / ".codex-plugin" / "plugin.json"
TRAE_PLUGIN_MANIFEST = REPO_ROOT / ".trae-plugin" / "plugin.json"
CLAUDE_PLUGIN_MANIFEST = REPO_ROOT / ".claude-plugin" / "plugin.json"
CLAUDE_MARKETPLACE_MANIFEST = REPO_ROOT / ".claude-plugin" / "marketplace.json"
OPENCODE_PLUGIN_MANIFEST = REPO_ROOT / ".opencode-plugin" / "plugin.json"

DESCRIPTION_MAX_LEN = 500

FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
REMOTE_RE = re.compile(r"^(?:https?|mailto):", re.IGNORECASE)


@dataclass
class CheckResult:
    """单条检查结果。"""

    ok: bool
    skill: str
    message: str

    def format(self) -> str:
        mark = "PASS" if self.ok else "FAIL"
        target = f"[{self.skill}]" if self.skill else "[repo]"
        return f"  {mark}  {target} {self.message}"


@dataclass
class Report:
    results: List[CheckResult] = field(default_factory=list)

    def add(self, ok: bool, skill: str, message: str) -> None:
        self.results.append(CheckResult(ok, skill, message))

    @property
    def passed(self) -> bool:
        return all(r.ok for r in self.results)

    def summary(self) -> str:
        total = len(self.results)
        failed = sum(1 for r in self.results if not r.ok)
        passed = total - failed
        head = f"skills validation: {passed}/{total} checks passed"
        if failed:
            head += f", {failed} failed"
        lines = [head, ""] + [r.format() for r in self.results]
        return "\n".join(lines)


# --------------------------------------------------------------------------- #
# 极简 YAML frontmatter 解析
# --------------------------------------------------------------------------- #
#
# 标准 yaml 第三方库并非在所有环境都可用，且 SKILL.md 的 frontmatter 只用
# 了最朴素的 `key: value` 形式。这里实现一个只覆盖这一形式的子集解析器：
#   - 只解析顶层标量键值；
#   - 值可带双引号或不带引号；
#   - 不解析嵌套结构、列表、多行字符串。
# 如果 frontmatter 使用了这些特性，解析会失败并报错，由调用方作为
# 检查失败处理 —— 这正是我们想要的"确定性"行为。
# --------------------------------------------------------------------------- #


def _strip_quotes(value: str) -> str:
    v = value.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ('"', "'"):
        return v[1:-1]
    return v


def parse_frontmatter(text: str) -> Tuple[dict, str]:
    """解析 SKILL.md 顶部的 YAML frontmatter。

    返回 (dict, error_message)。dict 为空且 error_message 非空时表示解析失败。
    """
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, "缺少 YAML frontmatter（应以 --- 开始并以 --- 结束）"

    body = match.group(1)
    data: dict = {}
    for raw_line in body.splitlines():
        line = raw_line.rstrip()
        if not line.strip() or line.strip().startswith("#"):
            continue
        if ":" not in line:
            return {}, f"frontmatter 行无法解析为 key: value：{line!r}"
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if not key:
            return {}, f"frontmatter 行缺少 key：{line!r}"
        data[key] = _strip_quotes(value)
    return data, ""


# --------------------------------------------------------------------------- #
# 极简 agents/openai.yaml 解析
# --------------------------------------------------------------------------- #
#
# openai.yaml 同样只用了 `key: value` 形式（参见仓库内现有文件）。
# 复用 frontmatter 解析器即可覆盖；若文件使用更复杂结构，会以解析失败处理。
# --------------------------------------------------------------------------- #


def parse_simple_yaml(text: str) -> Tuple[dict, str]:
    return parse_frontmatter("---\n" + text + "\n---\n")


# --------------------------------------------------------------------------- #
# 检查项
# --------------------------------------------------------------------------- #


def is_remote_or_anchor(target: str) -> bool:
    if REMOTE_RE.match(target):
        return True
    if target.startswith("#") or target == "":
        return True
    return False


def resolve_local_link(skill_dir: Path, target: str) -> Path:
    """把 markdown 链接中的相对路径解析为仓库内的真实路径。

    链接可能带 # 锚点，先剥离；相对路径以 SKILL.md 所在目录为基准。
    """
    target = target.split("#", 1)[0]
    return (skill_dir / target).resolve()


def check_skill(skill_dir: Path, report: Report) -> None:
    skill_name = skill_dir.name
    skill_md = skill_dir / "SKILL.md"

    if not skill_md.is_file():
        report.add(False, skill_name, "缺少 SKILL.md")
        return
    report.add(True, skill_name, "SKILL.md 存在")

    try:
        text = skill_md.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        report.add(False, skill_name, f"SKILL.md 非 UTF-8 编码：{exc}")
        return

    fm, err = parse_frontmatter(text)
    if err:
        report.add(False, skill_name, f"frontmatter 解析失败：{err}")
        return
    report.add(True, skill_name, "frontmatter 可解析")

    name = fm.get("name", "")
    description = fm.get("description", "")

    if not name:
        report.add(False, skill_name, "frontmatter 缺少 name 字段")
    elif name != skill_name:
        report.add(
            False,
            skill_name,
            f"frontmatter name ({name!r}) 与目录名 ({skill_name!r}) 不一致",
        )
    else:
        report.add(True, skill_name, f"name 与目录名一致（{name}）")

    if not description:
        report.add(False, skill_name, "description 为空")
    elif len(description) > DESCRIPTION_MAX_LEN:
        report.add(
            False,
            skill_name,
            f"description 过长（{len(description)} > {DESCRIPTION_MAX_LEN}），"
            "可能导致命令菜单截断或路由混乱",
        )
    else:
        report.add(True, skill_name, f"description 非空（{len(description)} 字符）")

    agents_yaml = skill_dir / "agents" / "openai.yaml"
    if not agents_yaml.is_file():
        report.add(False, skill_name, "缺少 agents/openai.yaml")
    else:
        try:
            yaml_text = agents_yaml.read_text(encoding="utf-8")
            parsed, yaml_err = parse_simple_yaml(yaml_text)
            if yaml_err:
                report.add(False, skill_name, f"agents/openai.yaml 解析失败：{yaml_err}")
            elif not parsed:
                report.add(False, skill_name, "agents/openai.yaml 为空或无有效键")
            else:
                report.add(True, skill_name, "agents/openai.yaml 可解析")
        except UnicodeDecodeError as exc:
            report.add(False, skill_name, f"agents/openai.yaml 非 UTF-8 编码：{exc}")

    # 本地引用路径检查
    local_links: List[str] = []
    for match in MARKDOWN_LINK_RE.finditer(text):
        target = match.group(1)
        if is_remote_or_anchor(target):
            continue
        local_links.append(target)

    if not local_links:
        report.add(True, skill_name, "SKILL.md 无本地引用（跳过路径检查）")
    else:
        missing = []
        for target in local_links:
            resolved = resolve_local_link(skill_dir, target)
            if not resolved.exists():
                missing.append(target)
        if missing:
            report.add(
                False,
                skill_name,
                "SKILL.md 引用了不存在的本地路径：" + ", ".join(missing),
            )
        else:
            report.add(
                True,
                skill_name,
                f"SKILL.md 的 {len(local_links)} 个本地引用路径均存在",
            )


def read_json_manifest(
    path: Path,
    label: str,
    report: Report,
) -> Optional[Union[dict, list]]:
    if not path.is_file():
        report.add(False, "", f"缺少 {label}")
        return None
    report.add(True, "", f"{label} 存在")
    try:
        manifest = json.loads(path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as exc:
        report.add(False, "", f"{label} 非合法 JSON：{exc}")
        return None
    except UnicodeDecodeError as exc:
        report.add(False, "", f"{label} 非 UTF-8 编码：{exc}")
        return None
    report.add(True, "", f"{label} 为合法 JSON")
    return manifest


def check_manifest_description_mentions(
    manifest: dict,
    label: str,
    required_terms: List[str],
    report: Report,
) -> None:
    blob = json.dumps(manifest, ensure_ascii=False)
    missing = [term for term in required_terms if term not in blob]
    if missing:
        report.add(False, "", f"{label} 未包含必要入口或关键词：" + ", ".join(missing))
    else:
        report.add(True, "", f"{label} 包含必要入口或关键词")


def check_skill_plugin_manifest(
    path: Path,
    label: str,
    report: Report,
    required_default_prompt: Optional[str] = None,
) -> None:
    manifest = read_json_manifest(path, label, report)
    if manifest is None:
        return

    if not isinstance(manifest, dict):
        report.add(False, "", f"{label} 顶层不是对象")
        return

    name = manifest.get("name")
    if not name:
        report.add(False, "", f"{label} 缺少 name 字段")
    else:
        report.add(True, "", f"{label} name={name!r}")

    skills_field = manifest.get("skills", "")
    if isinstance(skills_field, str) and skills_field:
        skills_dir = REPO_ROOT / skills_field
        if skills_dir.is_dir():
            report.add(True, "", f"{label} skills 指向存在的目录（{skills_field}）")
        else:
            report.add(
                False,
                "",
                f"{label} skills 指向的目录不存在：{skills_field}",
            )
    else:
        report.add(False, "", f"{label} 缺少 skills 字段")

    interface = manifest.get("interface", {})
    if not isinstance(interface, dict):
        report.add(False, "", f"{label} interface 不是对象")
        return

    capabilities = interface.get("capabilities", [])
    if isinstance(capabilities, list) and capabilities:
        report.add(True, "", f"{label} interface.capabilities={capabilities}")
    else:
        report.add(False, "", f"{label} interface.capabilities 为空或非列表")

    if required_default_prompt:
        default_prompt = interface.get("defaultPrompt", [])
        if isinstance(default_prompt, list) and any(
            required_default_prompt in str(item) for item in default_prompt
        ):
            report.add(True, "", f"{label} defaultPrompt 包含 {required_default_prompt}")
        else:
            report.add(False, "", f"{label} defaultPrompt 未包含 {required_default_prompt}")

    # icon / logo 等指向的本地资源应真实存在
    for icon_field in ("composerIcon", "logo"):
        icon_path = interface.get(icon_field)
        if not icon_path:
            continue
        resolved = (REPO_ROOT / icon_path).resolve()
        if resolved.exists():
            report.add(True, "", f"{label} interface.{icon_field} 指向存在的资源（{icon_path}）")
        else:
            report.add(
                False,
                "",
                f"{label} interface.{icon_field} 指向不存在的资源：{icon_path}",
            )


def check_claude_manifest(path: Path, label: str, report: Report) -> None:
    manifest = read_json_manifest(path, label, report)
    if manifest is None:
        return
    if not isinstance(manifest, dict):
        report.add(False, "", f"{label} 顶层不是对象")
        return
    check_manifest_description_mentions(manifest, label, ["project-interview", "interview"], report)


def check_opencode_manifest(skill_dirs: List[Path], report: Report) -> None:
    label = ".opencode-plugin/plugin.json"
    manifest = read_json_manifest(OPENCODE_PLUGIN_MANIFEST, label, report)
    if manifest is None:
        return
    if not isinstance(manifest, dict):
        report.add(False, "", f"{label} 顶层不是对象")
        return

    skills = manifest.get("skills", {})
    if not isinstance(skills, dict):
        report.add(False, "", f"{label} skills 不是对象")
        return

    skills_path = skills.get("path")
    if isinstance(skills_path, str) and (REPO_ROOT / skills_path).is_dir():
        report.add(True, "", f"{label} skills.path 指向存在的目录（{skills_path}）")
    else:
        report.add(False, "", f"{label} skills.path 缺失或指向不存在的目录")

    entries = skills.get("entries", [])
    if not isinstance(entries, list):
        report.add(False, "", f"{label} skills.entries 不是列表")
        return

    entry_names = {
        entry.get("name")
        for entry in entries
        if isinstance(entry, dict) and isinstance(entry.get("name"), str)
    }
    expected_names = {skill_dir.name for skill_dir in skill_dirs}
    missing = sorted(expected_names - entry_names)
    if missing:
        report.add(False, "", f"{label} skills.entries 缺少：" + ", ".join(missing))
    else:
        report.add(True, "", f"{label} skills.entries 覆盖全部 skill")


def check_templates(report: Report) -> None:
    """校验 assets/templates-html/ 的外框解耦结构。

    - frame/ 三部件存在（base.css / toolbar.html / editor.js）；
    - 壳文件数量 == 18。

    交付产物的一致性由 scripts/inline-template.mjs 的确定性内联保证，
    不做产物与历史基准的比对。
    """
    templates_dir = REPO_ROOT / "assets" / "templates-html"
    if not templates_dir.is_dir():
        report.add(False, "templates", "缺少 assets/templates-html/")
        return

    frame_dir = templates_dir / "frame"
    for part in ("base.css", "toolbar.html", "editor.js"):
        report.add(
            (frame_dir / part).is_file(),
            "templates",
            f"frame/{part} 存在",
        )

    shells = sorted(p.name for p in templates_dir.glob("*.html"))
    report.add(
        len(shells) == 18,
        "templates",
        f"壳文件数量 == 18（当前 {len(shells)}）",
    )


def main() -> int:
    if not SKILLS_DIR.is_dir():
        print(f"skills 目录不存在：{SKILLS_DIR}", file=sys.stderr)
        return 1

    report = Report()

    skill_dirs = sorted(
        p for p in SKILLS_DIR.iterdir() if p.is_dir() and not p.name.startswith(".")
    )
    if not skill_dirs:
        report.add(False, "", "skills 目录下没有 skill 子目录")

    for skill_dir in skill_dirs:
        check_skill(skill_dir, report)

    check_skill_plugin_manifest(
        CODEX_PLUGIN_MANIFEST,
        ".codex-plugin/plugin.json",
        report,
        required_default_prompt="/project-interview",
    )
    check_skill_plugin_manifest(
        TRAE_PLUGIN_MANIFEST,
        ".trae-plugin/plugin.json",
        report,
        required_default_prompt="/project-interview",
    )
    check_claude_manifest(CLAUDE_PLUGIN_MANIFEST, ".claude-plugin/plugin.json", report)
    check_claude_manifest(
        CLAUDE_MARKETPLACE_MANIFEST,
        ".claude-plugin/marketplace.json",
        report,
    )
    check_opencode_manifest(skill_dirs, report)
    check_templates(report)

    print(report.summary())
    return 0 if report.passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
