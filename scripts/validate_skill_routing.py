#!/usr/bin/env python3
"""Deterministically validate the skill-routing regression dataset.

The repository intentionally keeps this validator dependency-free.  It parses
only the documented, deliberately small schema used by
``tests/skill-routing-cases.yaml`` and rejects YAML constructs outside that
schema rather than silently accepting them.
"""

from __future__ import annotations

import ast
import re
import sys
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parent.parent
CASES_FILE = REPO_ROOT / "tests" / "skill-routing-cases.yaml"
SKILLS_DIR = REPO_ROOT / "skills"
EXPECTED_ROOT_KEYS = {"cases"}
EXPECTED_CASE_KEYS = {"prompt", "expected", "note"}
REQUIRED_CASE_KEYS = {"prompt", "expected"}
SKILL_NAME_RE = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
KEY_RE = re.compile(r"[A-Za-z_][A-Za-z0-9_-]*\Z")


class RoutingParseError(ValueError):
    """Raised when the fixed routing-case YAML subset cannot be parsed."""


def _parse_scalar(raw: str, line_number: int) -> Any:
    """Parse one scalar in the small YAML subset used by the dataset."""
    value = raw.strip()
    if not value:
        return ""
    if value in {"|", ">"} or value.startswith(("{",)):
        raise RoutingParseError(
            f"line {line_number}: unsupported non-scalar YAML value {value!r}"
        )
    if value == "[]":
        return []
    if value.startswith("["):
        raise RoutingParseError(
            f"line {line_number}: unsupported non-scalar YAML value {value!r}"
        )

    if value[0] in {"'", '"'}:
        try:
            # ast.literal_eval handles the quoted strings used by this file,
            # including prompts containing colons.  Require the whole value to
            # be quoted so trailing YAML syntax cannot be ignored silently.
            parsed = ast.literal_eval(value)
        except (SyntaxError, ValueError) as exc:
            raise RoutingParseError(
                f"line {line_number}: invalid quoted scalar"
            ) from exc
        if not isinstance(parsed, str) or value[-1:] != value[0]:
            raise RoutingParseError(
                f"line {line_number}: quoted value must be a string"
            )
        return parsed

    # Preserve useful YAML scalar type errors for schema validation rather than
    # converting booleans/numbers/null into strings.
    if value in {"null", "Null", "NULL", "~"}:
        return None
    if value in {"true", "True", "TRUE"}:
        return True
    if value in {"false", "False", "FALSE"}:
        return False
    if re.fullmatch(r"[-+]?\d+", value):
        return int(value)
    if re.fullmatch(r"[-+]?(?:\d+\.\d*|\.\d+)", value):
        return float(value)
    return value


def _parse_key_value(text: str, line_number: int) -> tuple[str, Any]:
    if ":" not in text:
        raise RoutingParseError(f"line {line_number}: expected key: value")
    key, raw_value = text.split(":", 1)
    key = key.strip()
    if not KEY_RE.fullmatch(key):
        raise RoutingParseError(f"line {line_number}: invalid key {key!r}")
    return key, _parse_scalar(raw_value, line_number)


def _load_cases(path: Path) -> tuple[Any | None, list[str]]:
    try:
        text = path.read_text(encoding="utf-8-sig")
    except (OSError, UnicodeError) as exc:
        return None, [f"cannot read {path}: {exc}"]

    try:
        return _parse_document(text), []
    except RoutingParseError as exc:
        return None, [f"invalid routing YAML in {path}: {exc}"]


def _parse_document(text: str) -> dict[str, Any]:
    """Parse the documented root/list-of-mappings routing schema.

    Supported forms are intentionally limited to::

        cases:
          - prompt: "..."
            expected: skill-name
            note: optional explanation

    Comments and blank lines are accepted.  Nested values, block scalars, and
    other YAML constructs fail explicitly so malformed data cannot pass by
    being partially interpreted.
    """
    document: dict[str, Any] = {}
    cases: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    saw_cases_items = False

    for line_number, raw_line in enumerate(text.splitlines(), start=1):
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        if "\t" in raw_line:
            raise RoutingParseError(f"line {line_number}: tabs are not supported")

        if raw_line.startswith("cases:"):
            if raw_line != "cases:" and not raw_line.startswith("cases: "):
                raise RoutingParseError(f"line {line_number}: invalid cases declaration")
            if "cases" in document:
                raise RoutingParseError(f"line {line_number}: duplicate key 'cases'")
            raw_value = raw_line[len("cases:") :]
            document["cases"] = _parse_scalar(raw_value, line_number) if raw_value.strip() else cases
            continue

        if not raw_line.startswith("  "):
            raise RoutingParseError(
                f"line {line_number}: expected the top-level cases key"
            )
        if document.get("cases") is not cases:
            raise RoutingParseError(
                f"line {line_number}: case entries require a list-valued cases key"
            )

        if raw_line.startswith("  - "):
            key, value = _parse_key_value(raw_line[4:], line_number)
            current = {key: value}
            cases.append(current)
            saw_cases_items = True
            continue

        if raw_line.startswith("    "):
            if current is None:
                raise RoutingParseError(
                    f"line {line_number}: mapping field without a case item"
                )
            key, value = _parse_key_value(raw_line[4:], line_number)
            if key in current:
                raise RoutingParseError(
                    f"line {line_number}: duplicate key {key!r}"
                )
            current[key] = value
            continue

        raise RoutingParseError(f"line {line_number}: invalid case indentation")

    if "cases" not in document:
        raise RoutingParseError("missing top-level cases key")
    if document.get("cases") is cases and not saw_cases_items:
        # Keep [] as a valid parsed list so the schema validator can report the
        # useful, stable "at least one case" error.
        document["cases"] = []
    return document


def _format_keys(keys: set[Any]) -> str:
    return "[" + ", ".join(sorted(repr(key) for key in keys)) + "]"


def validate_routing_cases(cases_file: Path, skills_dir: Path) -> tuple[int, list[str]]:
    """Return the number of cases and all deterministic validation errors."""
    document, errors = _load_cases(cases_file)
    if errors:
        return 0, errors

    if not isinstance(document, dict):
        return 0, ["document root must be a mapping"]

    root_keys = set(document)
    missing_root_keys = EXPECTED_ROOT_KEYS - root_keys
    unexpected_root_keys = root_keys - EXPECTED_ROOT_KEYS
    if missing_root_keys:
        errors.append(f"document root is missing keys: {_format_keys(missing_root_keys)}")
    if unexpected_root_keys:
        errors.append(
            f"document root has unexpected keys: {_format_keys(unexpected_root_keys)}"
        )

    cases = document.get("cases")
    if not isinstance(cases, list):
        errors.append("cases must be a list")
        return 0, errors
    if not cases:
        errors.append("cases must contain at least one case")
        return 0, errors

    seen_prompts: dict[str, int] = {}
    for index, case in enumerate(cases, start=1):
        prefix = f"cases[{index}]"
        if not isinstance(case, dict):
            errors.append(f"{prefix} must be a mapping")
            continue

        case_keys = set(case)
        missing_keys = REQUIRED_CASE_KEYS - case_keys
        unexpected_keys = case_keys - EXPECTED_CASE_KEYS
        if missing_keys:
            errors.append(f"{prefix} is missing keys: {_format_keys(missing_keys)}")
        if unexpected_keys:
            errors.append(
                f"{prefix} has unexpected keys: {_format_keys(unexpected_keys)}"
            )

        prompt = case.get("prompt")
        if not isinstance(prompt, str):
            errors.append(f"{prefix}.prompt must be a string")
        elif not prompt.strip():
            errors.append(f"{prefix}.prompt must not be empty")
        else:
            normalized_prompt = prompt.strip()
            if normalized_prompt in seen_prompts:
                errors.append(
                    f"{prefix}.prompt duplicates cases[{seen_prompts[normalized_prompt]}].prompt"
                )
            else:
                seen_prompts[normalized_prompt] = index

        expected = case.get("expected")
        if not isinstance(expected, str):
            errors.append(f"{prefix}.expected must be a string")
        elif not expected.strip():
            errors.append(f"{prefix}.expected must not be empty")
        elif expected != expected.strip() or not SKILL_NAME_RE.fullmatch(expected):
            errors.append(
                f"{prefix}.expected must be a lowercase skill directory name"
            )
        elif not (skills_dir / expected).is_dir():
            errors.append(
                f"{prefix}.expected references missing directory skills/{expected}/"
            )

        if "note" in case:
            note = case["note"]
            if not isinstance(note, str):
                errors.append(f"{prefix}.note must be a string when present")
            elif not note.strip():
                errors.append(f"{prefix}.note must not be empty when present")

    return len(cases), errors


def main() -> int:
    case_count, errors = validate_routing_cases(CASES_FILE, SKILLS_DIR)
    if errors:
        print(f"skill routing validation: {len(errors)} error(s)", file=sys.stderr)
        for error in errors:
            print(f"  FAIL  {error}", file=sys.stderr)
        return 1

    print(f"skill routing validation: {case_count} cases passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
