#!/usr/bin/env python3
"""Validate an ASu claim-evidence ledger with deterministic local rules."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path
from typing import Any


SUPPORTED_SCHEMA_VERSION = 1
RESPONSIBILITY_LEVELS = {"参与", "负责模块", "主导方案或交付", "项目负责人"}
VERIFICATION_STATUSES = {"已确认", "待确认", "已过期", "不采用"}

REQUIRED_PROFILE_FIELDS = {"candidate_id", "target_roles", "updated_at"}
REQUIRED_CLAIM_FIELDS = {
    "id",
    "source_fact",
    "candidate_wording",
    "sources",
    "responsibility_level",
    "verification_status",
    "allowed_uses",
    "interview_details",
    "boundary",
    "risk_notes",
    "last_verified",
}
REQUIRED_SOURCE_FIELDS = {"type", "location", "public"}
REQUIRED_INTERVIEW_FIELDS = {"decisions", "difficulties", "verification", "result"}


def _format_keys(keys: set[str]) -> str:
    return "[" + ", ".join(sorted(repr(key) for key in keys)) + "]"


def _require_fields(value: dict[str, Any], required: set[str], path: str, errors: list[str]) -> None:
    missing = required - set(value)
    if missing:
        errors.append(f"{path} 缺少字段：{_format_keys(missing)}")


def _validate_nonempty_string(value: Any, path: str, errors: list[str]) -> None:
    if not isinstance(value, str) or not value.strip():
        errors.append(f"{path} 必须是非空字符串")


def _validate_string_list(value: Any, path: str, errors: list[str]) -> None:
    if not isinstance(value, list):
        errors.append(f"{path} 必须是数组")
        return
    for index, item in enumerate(value):
        _validate_nonempty_string(item, f"{path}[{index}]", errors)


def _validate_date(value: Any, path: str, errors: list[str], *, nullable: bool) -> None:
    if value is None and nullable:
        return
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        errors.append(f"{path} 必须是 YYYY-MM-DD 日期" + ("或 null" if nullable else ""))
        return
    try:
        date.fromisoformat(value)
    except ValueError:
        errors.append(f"{path} 必须是合法的 YYYY-MM-DD 日期")


def _validate_source(value: Any, path: str, errors: list[str]) -> None:
    if not isinstance(value, dict):
        errors.append(f"{path} 必须是对象")
        return
    _require_fields(value, REQUIRED_SOURCE_FIELDS, path, errors)
    for field in ("type", "location"):
        if field in value:
            _validate_nonempty_string(value[field], f"{path}.{field}", errors)
    if "public" in value and not isinstance(value["public"], bool):
        errors.append(f"{path}.public 必须是布尔值")
    if "note" in value and not isinstance(value["note"], str):
        errors.append(f"{path}.note 必须是字符串")


def _validate_interview_details(value: Any, path: str, errors: list[str]) -> None:
    if not isinstance(value, dict):
        errors.append(f"{path} 必须是对象")
        return
    _require_fields(value, REQUIRED_INTERVIEW_FIELDS, path, errors)
    for field in ("decisions", "difficulties", "verification"):
        if field in value:
            _validate_string_list(value[field], f"{path}.{field}", errors)
    if "result" in value and value["result"] is not None and not isinstance(value["result"], str):
        errors.append(f"{path}.result 必须是字符串或 null")


def _validate_claim(value: Any, index: int, seen_ids: set[str], errors: list[str]) -> None:
    path = f"claims[{index}]"
    if not isinstance(value, dict):
        errors.append(f"{path} 必须是对象")
        return

    _require_fields(value, REQUIRED_CLAIM_FIELDS, path, errors)
    for field in ("id", "source_fact", "candidate_wording", "boundary"):
        if field in value:
            _validate_nonempty_string(value[field], f"{path}.{field}", errors)

    claim_id = value.get("id")
    if isinstance(claim_id, str) and claim_id.strip():
        if claim_id in seen_ids:
            errors.append(f"{path}.id 与其他主张重复：{claim_id!r}")
        seen_ids.add(claim_id)

    responsibility = value.get("responsibility_level")
    if "responsibility_level" in value and responsibility not in RESPONSIBILITY_LEVELS:
        errors.append(
            f"{path}.responsibility_level 必须是：{_format_keys(RESPONSIBILITY_LEVELS)}"
        )

    status = value.get("verification_status")
    if "verification_status" in value and status not in VERIFICATION_STATUSES:
        errors.append(f"{path}.verification_status 必须是：{_format_keys(VERIFICATION_STATUSES)}")

    sources = value.get("sources")
    if isinstance(sources, list):
        for source_index, source in enumerate(sources):
            _validate_source(source, f"{path}.sources[{source_index}]", errors)
    elif "sources" in value:
        errors.append(f"{path}.sources 必须是数组")

    for field in ("allowed_uses", "risk_notes"):
        if field in value:
            _validate_string_list(value[field], f"{path}.{field}", errors)

    if "interview_details" in value:
        _validate_interview_details(value["interview_details"], f"{path}.interview_details", errors)
    if "last_verified" in value:
        _validate_date(value["last_verified"], f"{path}.last_verified", errors, nullable=True)

    wording = value.get("candidate_wording")
    if status == "已确认" and isinstance(wording, str) and "【待补" in wording:
        errors.append(f"{path}.candidate_wording：已确认主张不能包含【待补】占位符")


def validate_ledger(document: Any) -> tuple[int, list[str]]:
    """Return the number of claims and all deterministic validation errors."""
    errors: list[str] = []
    if not isinstance(document, dict):
        return 0, ["文档根节点必须是对象"]

    schema_version = document.get("schema_version")
    if (
        not isinstance(schema_version, int)
        or isinstance(schema_version, bool)
        or schema_version != SUPPORTED_SCHEMA_VERSION
    ):
        errors.append(f"schema_version 必须是 {SUPPORTED_SCHEMA_VERSION}")

    profile = document.get("profile")
    if not isinstance(profile, dict):
        errors.append("profile 必须是对象")
    else:
        _require_fields(profile, REQUIRED_PROFILE_FIELDS, "profile", errors)
        if "candidate_id" in profile:
            _validate_nonempty_string(profile["candidate_id"], "profile.candidate_id", errors)
        if "target_roles" in profile:
            _validate_string_list(profile["target_roles"], "profile.target_roles", errors)
        if "updated_at" in profile:
            _validate_date(profile["updated_at"], "profile.updated_at", errors, nullable=False)

    claims = document.get("claims")
    if not isinstance(claims, list):
        errors.append("claims 必须是数组")
        return 0, errors

    seen_ids: set[str] = set()
    for index, claim in enumerate(claims):
        _validate_claim(claim, index, seen_ids, errors)
    return len(claims), errors


def load_ledger(path: Path) -> tuple[Any | None, list[str]]:
    try:
        return json.loads(path.read_text(encoding="utf-8-sig")), []
    except OSError as exc:
        return None, [f"无法读取 {path}：{exc}"]
    except UnicodeError as exc:
        return None, [f"{path} 不是 UTF-8 编码：{exc}"]
    except json.JSONDecodeError as exc:
        return None, [f"{path} 不是合法 JSON：{exc}"]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="校验 ASu 主张—证据账本。")
    parser.add_argument("ledger", type=Path, help="待校验的账本 JSON 文件。")
    parser.add_argument("--json", action="store_true", help="输出机器可读 JSON。")
    args = parser.parse_args(argv)

    document, errors = load_ledger(args.ledger)
    claim_count = 0
    if not errors:
        claim_count, errors = validate_ledger(document)

    if args.json:
        print(
            json.dumps(
                {"ok": not errors, "claim_count": claim_count, "errors": errors},
                ensure_ascii=False,
                indent=2,
            )
        )
    elif errors:
        print(f"claim ledger validation: {len(errors)} error(s)", file=sys.stderr)
        for error in errors:
            print(f"  FAIL  {error}", file=sys.stderr)
    else:
        print(f"claim ledger validation: {claim_count} claims passed")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
