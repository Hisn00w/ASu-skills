#!/usr/bin/env python3
"""validate_skills.py 的聚焦回归测试。"""

import tempfile
import unittest
from pathlib import Path

from scripts.validate_skills import Report, check_openai_interface, parse_simple_yaml


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


if __name__ == "__main__":
    unittest.main()