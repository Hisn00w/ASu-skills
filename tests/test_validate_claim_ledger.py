from __future__ import annotations

import copy
import importlib.util
import io
import json
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location(
    "validate_claim_ledger_module",
    REPO_ROOT / "scripts" / "validate_claim_ledger.py",
)
assert SPEC and SPEC.loader
validate_claim_ledger = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validate_claim_ledger)


def load_template() -> dict:
    return json.loads(
        (REPO_ROOT / "assets" / "career-claim-ledger-template.json").read_text(encoding="utf-8")
    )


class ValidateClaimLedgerTests(unittest.TestCase):
    def test_repository_template_is_valid(self):
        claim_count, errors = validate_claim_ledger.validate_ledger(load_template())

        self.assertEqual(claim_count, 2)
        self.assertEqual(errors, [])

    def test_rejects_invalid_root_and_claims_collection(self):
        self.assertEqual(
            validate_claim_ledger.validate_ledger([]),
            (0, ["文档根节点必须是对象"]),
        )

        ledger = load_template()
        ledger["claims"] = {}
        claim_count, errors = validate_claim_ledger.validate_ledger(ledger)
        self.assertEqual(claim_count, 0)
        self.assertIn("claims 必须是数组", errors)

    def test_rejects_missing_fields_and_duplicate_ids(self):
        ledger = load_template()
        duplicate = copy.deepcopy(ledger["claims"][0])
        duplicate.pop("boundary")
        ledger["claims"].append(duplicate)

        claim_count, errors = validate_claim_ledger.validate_ledger(ledger)

        self.assertEqual(claim_count, 3)
        self.assertTrue(any("缺少字段" in error and "boundary" in error for error in errors))
        self.assertTrue(any("与其他主张重复" in error for error in errors))

    def test_rejects_unknown_status_and_responsibility_level(self):
        ledger = load_template()
        claim = ledger["claims"][0]
        claim["verification_status"] = "已合并"
        claim["responsibility_level"] = "Owner"

        _, errors = validate_claim_ledger.validate_ledger(ledger)

        self.assertTrue(any("verification_status 必须是" in error for error in errors))
        self.assertTrue(any("responsibility_level 必须是" in error for error in errors))

    def test_rejects_invalid_source_and_interview_details(self):
        ledger = load_template()
        claim = ledger["claims"][0]
        claim["sources"] = [{"type": "pull_request", "location": "", "public": "yes"}]
        claim["interview_details"]["verification"] = "运行测试"
        claim["interview_details"]["result"] = 1

        _, errors = validate_claim_ledger.validate_ledger(ledger)

        self.assertTrue(any("sources[0].location 必须是非空字符串" in error for error in errors))
        self.assertTrue(any("sources[0].public 必须是布尔值" in error for error in errors))
        self.assertTrue(any("interview_details.verification 必须是数组" in error for error in errors))
        self.assertTrue(any("interview_details.result 必须是字符串或 null" in error for error in errors))

    def test_allows_user_confirmed_claim_without_material_source(self):
        ledger = load_template()
        claim = ledger["claims"][0]
        claim["sources"] = []

        _, errors = validate_claim_ledger.validate_ledger(ledger)

        self.assertEqual(errors, [])

    def test_rejects_confirmed_claim_with_placeholder(self):
        ledger = load_template()
        claim = ledger["claims"][0]
        claim["candidate_wording"] = "【待补：确认合并状态】"

        _, errors = validate_claim_ledger.validate_ledger(ledger)

        self.assertTrue(any("不能包含【待补】占位符" in error for error in errors))

    def test_rejects_invalid_dates(self):
        ledger = load_template()
        ledger["profile"]["updated_at"] = "2026-02-30"
        ledger["claims"][0]["last_verified"] = "not-a-date"

        _, errors = validate_claim_ledger.validate_ledger(ledger)

        self.assertTrue(any("profile.updated_at" in error for error in errors))
        self.assertTrue(any("last_verified" in error for error in errors))

    def test_rejects_boolean_schema_version_and_compact_date(self):
        ledger = load_template()
        ledger["schema_version"] = True
        ledger["profile"]["updated_at"] = "20260903"

        _, errors = validate_claim_ledger.validate_ledger(ledger)

        self.assertTrue(any("schema_version" in error for error in errors))
        self.assertTrue(any("profile.updated_at" in error for error in errors))

    def test_load_reports_missing_file_and_invalid_json(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            document, missing_errors = validate_claim_ledger.load_ledger(temp_path / "missing.json")
            invalid_path = temp_path / "invalid.json"
            invalid_path.write_text("{", encoding="utf-8")
            invalid_document, invalid_errors = validate_claim_ledger.load_ledger(invalid_path)

        self.assertIsNone(document)
        self.assertTrue(any("无法读取" in error for error in missing_errors))
        self.assertIsNone(invalid_document)
        self.assertTrue(any("不是合法 JSON" in error for error in invalid_errors))

    def test_json_cli_output_and_exit_code(self):
        ledger = load_template()
        ledger["claims"][0]["id"] = ""
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "ledger.json"
            path.write_text(json.dumps(ledger, ensure_ascii=False), encoding="utf-8")
            stdout = io.StringIO()
            stderr = io.StringIO()
            with redirect_stdout(stdout), redirect_stderr(stderr):
                exit_code = validate_claim_ledger.main([str(path), "--json"])

        payload = json.loads(stdout.getvalue())
        self.assertEqual(exit_code, 1)
        self.assertFalse(payload["ok"])
        self.assertEqual(payload["claim_count"], 2)
        self.assertEqual(stderr.getvalue(), "")


if __name__ == "__main__":
    unittest.main()
