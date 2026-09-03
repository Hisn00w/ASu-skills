from __future__ import annotations

import tempfile
import textwrap
import unittest
from pathlib import Path

from scripts.validate_skill_routing import REPO_ROOT, validate_routing_cases


class ValidateSkillRoutingTests(unittest.TestCase):
    def validate_fixture(
        self, yaml_text: str, skill_names: tuple[str, ...] = ("great-resume",)
    ) -> tuple[int, list[str]]:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            cases_file = root / "cases.yaml"
            skills_dir = root / "skills"
            skills_dir.mkdir()
            for skill_name in skill_names:
                (skills_dir / skill_name).mkdir()
            cases_file.write_text(textwrap.dedent(yaml_text), encoding="utf-8")
            return validate_routing_cases(cases_file, skills_dir)

    def test_repository_dataset_is_valid(self):
        case_count, errors = validate_routing_cases(
            REPO_ROOT / "tests" / "skill-routing-cases.yaml",
            REPO_ROOT / "skills",
        )

        self.assertEqual(case_count, 26)
        self.assertEqual(errors, [])

    def test_accepts_bom_and_quoted_colon(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            cases_file = root / "cases.yaml"
            skills_dir = root / "skills"
            (skills_dir / "great-resume").mkdir(parents=True)
            cases_file.write_text(
                '\ufeffcases:\n  - prompt: "What: now?"\n    expected: great-resume\n',
                encoding="utf-8",
            )
            self.assertEqual(validate_routing_cases(cases_file, skills_dir), (1, []))

    def test_rejects_duplicate_yaml_keys(self):
        _, errors = self.validate_fixture(
            """
            cases:
              - prompt: first
                prompt: second
                expected: great-resume
            """
        )

        self.assertTrue(any("duplicate key 'prompt'" in error for error in errors))

    def test_rejects_schema_and_duplicate_prompt_errors(self):
        _, errors = self.validate_fixture(
            """
            cases:
              - prompt: "same prompt"
                expected: great-resume
                extra: unsupported
              - prompt: " same prompt "
                expected: GREAT-RESUME
                note: ""
            """
        )

        self.assertTrue(any("unexpected keys: ['extra']" in error for error in errors))
        self.assertTrue(any("duplicates cases[1].prompt" in error for error in errors))
        self.assertTrue(any("lowercase skill directory name" in error for error in errors))
        self.assertTrue(any("note must not be empty" in error for error in errors))

    def test_rejects_missing_skill_directory(self):
        _, errors = self.validate_fixture(
            """
            cases:
              - prompt: route me
                expected: offer
            """
        )

        self.assertEqual(
            errors,
            ["cases[1].expected references missing directory skills/offer/"],
        )

    def test_rejects_missing_file_and_invalid_collection_shapes(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            skills_dir = root / "skills"
            (skills_dir / "great-resume").mkdir(parents=True)
            missing_count, missing_errors = validate_routing_cases(
                root / "missing.yaml", skills_dir
            )
            self.assertEqual(missing_count, 0)
            self.assertTrue(any("cannot read" in error for error in missing_errors))

        _, errors = self.validate_fixture("cases: nope\n")
        self.assertEqual(errors, ["cases must be a list"])

        _, errors = self.validate_fixture("cases: []\n")
        self.assertEqual(errors, ["cases must contain at least one case"])

    def test_rejects_unsupported_block_scalar(self):
        _, errors = self.validate_fixture(
            """
            cases:
              - prompt: |
                  multi-line prompt
                expected: great-resume
            """
        )
        self.assertTrue(any("unsupported non-scalar" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
