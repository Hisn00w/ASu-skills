#!/usr/bin/env python3
"""Utilities for the ASu /project-guide skill.

The script intentionally uses only the Python standard library so it can run in
minimal agent environments.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterable, Optional

MIN_DESCRIPTION_CHARS = 40
ILLEGAL_SHORT_NAME_CHARS = {"/", "\\", ":", "*", "?", '"', "<", ">", "|"}
KEYWORD_HINTS = (
    "指标",
    "qps",
    "延迟",
    "用户",
    "线上",
    "数据",
    "规模",
    "难点",
    "结果",
    "职责",
    "架构",
    "源码",
)


@dataclass
class CheckResult:
    ok: bool
    missing: list[str] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)


def escape_markdown_fences(text: str) -> str:
    """Avoid breaking the generated prompt when user text contains fences."""
    return text.replace("```", "``\u200b`")


def validate_short_name(short_name: str) -> str:
    cleaned = short_name.strip()
    if not cleaned:
        return ""
    if cleaned in {".", ".."}:
        raise ValueError("short name cannot be '.' or '..'.")
    if any(ch in cleaned for ch in ILLEGAL_SHORT_NAME_CHARS):
        chars = "".join(sorted(ILLEGAL_SHORT_NAME_CHARS))
        raise ValueError(f"short name contains illegal path chars. disallowed: {chars}")
    if len(cleaned) > 24:
        raise ValueError("short name is too long (max 24 characters).")
    return cleaned


def has_any_keyword(text: str, keywords: Iterable[str]) -> bool:
    lower = text.lower()
    return any(keyword.lower() in lower for keyword in keywords)


def analyze_input(
    description: str,
    tech_stack: Optional[str] = None,
    role_focus: Optional[str] = None,
) -> CheckResult:
    missing: list[str] = []
    suggestions: list[str] = []
    notes: list[str] = []

    desc = description.strip()
    if len(desc) < MIN_DESCRIPTION_CHARS:
        missing.append(
            f"项目描述过短（当前约 {len(desc)} 字符，建议至少 {MIN_DESCRIPTION_CHARS}+ "
            "并包含职责、难点或结果线索）"
        )

    if not has_any_keyword(desc, KEYWORD_HINTS) and len(desc) < MIN_DESCRIPTION_CHARS * 2:
        suggestions.extend(
            [
                "请补充：你在项目中的具体职责和协作边界是什么？",
                "请补充：最能展开的技术难点是什么，解决前后的现象如何验证？",
            ]
        )

    if not tech_stack or not tech_stack.strip():
        suggestions.append("技术栈未提供：补充语言、框架、中间件和观测栈后，导学路径会更准。")

    if not role_focus or not role_focus.strip():
        suggestions.append("求职方向未指定：目标岗位会影响导学重点和面试题权重。")

    suggestions.extend(
        [
            "请补充：是否有指标、日志、PR、截图、上线记录或用户反馈可以作为证据？",
            "请补充：项目中最关键的取舍是什么，为什么没有选择其他方案？",
            "请补充：如果被追问失败案例、回滚或异常路径，你准备讲哪一个？",
        ]
    )

    if len(desc) >= MIN_DESCRIPTION_CHARS:
        notes.append("项目描述长度达标；建议继续补齐指标口径、源码路径和个人边界。")

    return CheckResult(ok=not missing, missing=missing, suggestions=suggestions, notes=notes)


def load_json(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("JSON root must be an object")
    return data


def read_json_text(payload: dict[str, Any], key: str, alias: Optional[str] = None) -> str:
    if key not in payload and alias is not None:
        key = alias
    value = payload.get(key)
    if value is None:
        return ""
    if not isinstance(value, str):
        raise ValueError(f"JSON field '{key}' must be a string or null")
    return value.strip()


def build_prompt(
    description: str,
    short_name: Optional[str] = None,
    tech_stack: Optional[str] = None,
    role_focus: Optional[str] = None,
    extra: Optional[str] = None,
) -> str:
    lines: list[str] = [
        "请按 `/project-guide` 执行：基于当前项目仓库或以下项目材料，",
        "在目标项目根目录写入 `导学-{简称}.md` 与 `面经-{简称}.md`，",
        "并在最终回复中整理可交接给 `/great-resume` 与 `/interview` 的证据摘要。",
        "",
        "## 已确认输入",
        "",
        "### 项目简称（用于文件名）",
        "",
        short_name.strip() if short_name and short_name.strip() else "_（未提供，请从描述提炼并在写入前说明）_",
        "",
        "### 项目描述（必须）",
        "",
        "```text",
        escape_markdown_fences(description.strip()),
        "```",
        "",
        "### 技术栈（可选）",
        "",
    ]

    if tech_stack and tech_stack.strip():
        lines.extend(["```text", escape_markdown_fences(tech_stack.strip()), "```"])
    else:
        lines.append("_（未提供，请从仓库和描述推断，并列出假设）_")

    lines.extend(["", "### 求职方向（可选）", ""])
    if role_focus and role_focus.strip():
        lines.append(role_focus.strip())
    else:
        lines.append("_（未提供，请从项目类型推断或标注为交叉方向）_")

    if extra and extra.strip():
        lines.extend(["", "### 补充说明", "", escape_markdown_fences(extra.strip())])

    lines.extend(
        [
            "",
            "## 输出要求摘要",
            "",
            "- 导学：包含重点亮点、学习顺序、推荐阅读、核心原理、设计决策和量化验证建议。",
            "- 面经：先抽取 4-6 个架构支柱，再写 1-2 句项目简介与简历 bullet；每条一级 bullet 必须以 `**通用支柱名：**` 开头。",
            "- 面经 bullet：每条先交代问题或演进和职责，再写机制、约束或边界、结果；每条只表达一个支柱，至少包含“问题或演进 + 机制 + 结果”。",
            "- 面经 bullet：对照领域中立 few-shot 的正例、反例和改写对照，只学习表达结构；禁止复制样例的项目名、数字、领域名词或指标。",
            "",
            "## Bullet few-shot（仅学习结构，不复制素材）",
            "",
            "**合格**：**分层容错：** 针对异常处理逻辑散落、改动容易波及主流程的问题，将错误处理收敛为分层容错机制：按错误类型区分有限重试、降级与快速失败，并统一输出可观测结果，降低新增场景对主链路的改动面；线上收益需通过基线对比验证。",
            "",
            "**不合格**：接入缓存和重试，优化接口请求。",
            "",
            "**改写原则**：把实现动作还原成问题/演进；说明机制如何工作及其边界；结果写可验证的架构变化或真实指标，没有证据就写测量计划，不得编造数字。",
            "",
            "- 面经 bullet 质检：删除“提升性能/提高稳定性/优化体验”等不可验证结果；私有函数、路径、内部枚举只进入源码证据索引。",
            "- 面经 bullet 质检：支柱名必须是通用架构/工程能力；`RunManager`、`Stream Bridge`、`execution id` 等项目实现名改写为通用表达或下沉到源码证据索引。",
            "- 面经：包含 15-25 个主问题和追问口播。",
            "- 口播：第一人称，主问和追问均不少于 150 个汉字，覆盖 STAR。",
            "- 证据：源码路径、函数名和内部名词集中放到「源码证据索引」，正文用通用工程语言表达。",
            "- 交接：最终回复附 `/great-resume` 项目事实摘要和 `/interview` 高风险 Claim 清单。",
            "",
        ]
    )
    return "\n".join(lines)


def add_common_input_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--description", "-d", help="Project description text.")
    parser.add_argument("--file", "-f", help="Read project description from a UTF-8 file.")
    parser.add_argument("--tech", default="", help="Technology stack string.")
    parser.add_argument("--role", default="", help="Job direction or role focus.")


def read_description(args: argparse.Namespace) -> str:
    if getattr(args, "file", None):
        return Path(args.file).read_text(encoding="utf-8").strip()
    if getattr(args, "description", None):
        return args.description.strip()
    return sys.stdin.read().strip()


def command_check(args: argparse.Namespace) -> int:
    description = read_description(args)
    if not description:
        print("Error: empty description. Use -d, --file, or pipe text.", file=sys.stderr)
        return 1

    result = analyze_input(description, args.tech or None, args.role or None)
    if args.json:
        print(json.dumps(asdict(result), ensure_ascii=False, indent=2))
        return 0

    status = "PASS" if result.ok else "NEEDS_INPUT"
    print(f"[{status}] project-guide input check\n")
    if result.missing:
        print("必须补齐：")
        for item in result.missing:
            print(f"  - {item}")
        print()
    print("建议追问：")
    for item in result.suggestions:
        print(f"  - {item}")
    if result.notes:
        print("\n备注：")
        for item in result.notes:
            print(f"  - {item}")
    return 0


def command_build_prompt(args: argparse.Namespace) -> int:
    description = (args.description or "").strip()
    short_name = args.short_name or ""
    tech = args.tech or ""
    role = args.role or ""
    extra = args.extra or ""

    if args.json_file:
        try:
            payload = load_json(Path(args.json_file))
            description = read_json_text(payload, "description")
            short_name = read_json_text(payload, "short_name", "简称")
            tech = read_json_text(payload, "tech_stack", "tech")
            role = read_json_text(payload, "role_focus", "role")
            extra = read_json_text(payload, "extra")
        except (OSError, json.JSONDecodeError, ValueError) as exc:
            print(f"Error loading JSON: {exc}", file=sys.stderr)
            return 1

    try:
        short_name = validate_short_name(short_name)
    except ValueError as exc:
        print(f"Error: invalid --short-name: {exc}", file=sys.stderr)
        return 1

    if not description:
        print(
            "Error: missing description. Use -d, or --json-file with description field.",
            file=sys.stderr,
        )
        return 1

    prompt = build_prompt(
        description=description,
        short_name=short_name or None,
        tech_stack=tech or None,
        role_focus=role or None,
        extra=extra or None,
    )
    sys.stdout.write(prompt)
    if not prompt.endswith("\n"):
        sys.stdout.write("\n")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Utilities for ASu /project-guide.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    check_parser = subparsers.add_parser("check", help="Check project description completeness.")
    add_common_input_args(check_parser)
    check_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    check_parser.set_defaults(func=command_check)

    prompt_parser = subparsers.add_parser("build-prompt", help="Build a /project-guide prompt.")
    prompt_parser.add_argument("--description", "-d", help="Project description text.")
    prompt_parser.add_argument("--short-name", "-s", default="", help="Short name for output files.")
    prompt_parser.add_argument("--tech", default="", help="Technology stack string.")
    prompt_parser.add_argument("--role", default="", help="Job direction or role focus.")
    prompt_parser.add_argument("--extra", default="", help="Additional notes.")
    prompt_parser.add_argument("--json-file", help="JSON file with description and optional fields.")
    prompt_parser.set_defaults(func=command_build_prompt)

    return parser


def main(argv: Optional[list[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
