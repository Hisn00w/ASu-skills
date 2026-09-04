#!/usr/bin/env python3
"""validate_skills.py 的聚焦回归测试。"""

import tempfile
import unittest
import importlib.util
import sys
from unittest.mock import patch
from pathlib import Path

from scripts.validate_skills import Report, check_openai_interface, parse_simple_yaml

SCRIPT_PATH = Path(__file__).parents[1] / "scripts" / "validate_skills.py"
SPEC = importlib.util.spec_from_file_location("validate_skills", SCRIPT_PATH)
validate_skills = importlib.util.module_from_spec(SPEC)
sys.modules["validate_skills"] = validate_skills
assert SPEC.loader is not None
SPEC.loader.exec_module(validate_skills)


class ParseSimpleYamlTests(unittest.TestCase):
    def test_parses_interface_mapping(self):
        parsed, error = parse_simple_yaml(
            'interface:\n'
            '  display_name: "Example"\n'
            '  short_description: "A skill"\n'
            '  default_prompt: "Run the skill"\n'
        )

        self.assertEqual(error, "")
        self.assertEqual(parsed["interface"]["display_name"], "Example")
        self.assertEqual(parsed["interface"]["default_prompt"], "Run the skill")

    def test_rejects_nested_mapping_without_parent(self):
        parsed, error = parse_simple_yaml("  display_name: Example\n")

        self.assertEqual(parsed, {})
        self.assertIn("没有顶层父键", error)


class OpenAIInterfaceTests(unittest.TestCase):
    def setUp(self):
        self.skill_dir = Path(tempfile.mkdtemp())

    def _messages(self, manifest):
        report = Report()
        check_openai_interface(self.skill_dir, "example", manifest, report)
        return report.results

    def test_requires_interface_and_display_metadata(self):
        results = self._messages({})

        self.assertFalse(all(result.ok for result in results))
        self.assertIn("缺少 interface 对象", results[0].message)

    def test_requires_all_routing_fields(self):
        results = self._messages({"interface": {"display_name": "Example"}})

        failures = [result.message for result in results if not result.ok]
        self.assertTrue(any("short_description" in message for message in failures))
        self.assertTrue(any("default_prompt" in message for message in failures))

    def test_valid_metadata_passes(self):
        results = self._messages(
            {
                "interface": {
                    "display_name": "Example",
                    "short_description": "A skill",
                    "default_prompt": "Run the skill",
                }
            }
        )

        self.assertTrue(all(result.ok for result in results))

    def test_rejects_icon_outside_repository(self):
        outside_icon = self.skill_dir / "icon.png"
        outside_icon.write_bytes(b"png")
        skill_dir = self.skill_dir / "repo" / "skills" / "example"
        skill_dir.mkdir(parents=True)
        relative_icon = "../../../icon.png"
        manifest = {
            "interface": {
                "display_name": "Example",
                "short_description": "A skill",
                "default_prompt": "Run the skill",
                "icon_small": relative_icon,
            }
        }

        report = Report()
        with patch.object(validate_skills, "REPO_ROOT", self.skill_dir / "repo"):
            validate_skills.check_openai_interface(skill_dir, "example", manifest, report)

        self.assertFalse(report.passed)
        self.assertTrue(any("位于仓库外" in result.message for result in report.results))


class DocumentedResourceTests(unittest.TestCase):
    def test_extracts_inline_resource_files_but_skips_examples_and_directories(self):
        text = ("Use `application-tracker.html` and `scripts/inline-template.mjs`. "
                "The directory `templates-html/` and example `logos/<brand>.svg` "
                "are not individual resources.")
        self.assertEqual(validate_skills.extract_documented_resource_paths(text),
                         ["application-tracker.html", "scripts/inline-template.mjs"])

    def test_reports_missing_inline_resource(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            skill_dir = root / "skills" / "example"
            skill_dir.mkdir(parents=True)
            text = "The skill requires `assets/missing-template.html`."
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

    def test_rejects_existing_resource_outside_repository(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            repo_root = root / "repo"
            skill_dir = repo_root / "skills" / "example"
            skill_dir.mkdir(parents=True)
            (root / "outside.html").write_text("<html>", encoding="utf-8")
            text = "The skill requires `../../../outside.html`."
            report = validate_skills.Report()

            with patch.object(validate_skills, "REPO_ROOT", repo_root):
                validate_skills.check_documented_resources(skill_dir, report, text)

            self.assertFalse(report.passed)
            self.assertIn("../../../outside.html", report.results[0].message)
            self.assertIn("位于仓库外", report.results[0].message)


if __name__ == "__main__":
    unittest.main()
