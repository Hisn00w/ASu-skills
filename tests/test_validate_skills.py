import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).parents[1] / "scripts" / "validate_skills.py"
SPEC = importlib.util.spec_from_file_location("validate_skills", SCRIPT_PATH)
validate_skills = importlib.util.module_from_spec(SPEC)
sys.modules["validate_skills"] = validate_skills
assert SPEC.loader is not None
SPEC.loader.exec_module(validate_skills)


class DocumentedResourceTests(unittest.TestCase):
    def test_extracts_inline_resource_files_but_skips_examples_and_directories(self):
        text = (
            "Use `application-tracker.html` and `scripts/inline-template.mjs`. "
            "The directory `templates-html/` and example `logos/<brand>.svg` "
            "are not individual resources."
        )

        self.assertEqual(
            validate_skills.extract_documented_resource_paths(text),
            ["application-tracker.html", "scripts/inline-template.mjs"],
        )

    def test_reports_missing_inline_resource(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            skill_dir = root / "skills" / "example"
            skill_dir.mkdir(parents=True)
            text = "The skill requires `assets/missing-template.html`."
            (skill_dir / "SKILL.md").write_text(text, encoding="utf-8")
            report = validate_skills.Report()

            with patch.object(validate_skills, "REPO_ROOT", root):
                validate_skills.check_documented_resources(skill_dir, report, text)

            self.assertFalse(report.passed)
            self.assertIn("assets/missing-template.html", report.results[0].message)

    def test_resolves_existing_shared_resource_for_bare_filename(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            skill_dir = root / "skills" / "offer"
            skill_dir.mkdir(parents=True)
            assets_dir = root / "assets"
            assets_dir.mkdir()
            (assets_dir / "application-tracker.html").write_text("<html>", encoding="utf-8")
            text = "Use `application-tracker.html` when no output path is provided."
            report = validate_skills.Report()

            with patch.object(validate_skills, "REPO_ROOT", root):
                validate_skills.check_documented_resources(skill_dir, report, text)

            self.assertTrue(report.passed)
            self.assertIn("1 个资源文件均存在", report.results[0].message)


if __name__ == "__main__":
    unittest.main()
