import contextlib
import importlib.util
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, relative_path: str):
    module_path = ROOT / relative_path
    spec = importlib.util.spec_from_file_location(name, module_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


project_guide = load_module("project_guide_module", "scripts/project_guide.py")


class ProjectGuideTests(unittest.TestCase):
    def test_validate_short_name_accepts_valid_value(self):
        self.assertEqual(project_guide.validate_short_name("智能BI"), "智能BI")

    def test_validate_short_name_rejects_illegal_chars(self):
        with self.assertRaises(ValueError):
            project_guide.validate_short_name("bad/name")

    def test_validate_short_name_rejects_reserved_names(self):
        with self.assertRaises(ValueError):
            project_guide.validate_short_name("..")

    def test_analyze_short_description_requires_more_input(self):
        result = project_guide.analyze_input("太短了")

        self.assertFalse(result.ok)
        self.assertTrue(result.missing)
        self.assertTrue(any("技术栈未提供" in item for item in result.suggestions))
        self.assertTrue(any("求职方向未指定" in item for item in result.suggestions))

    def test_analyze_complete_description_has_note(self):
        result = project_guide.analyze_input(
            "负责项目导学和面经生成流程，覆盖源码阅读路径、职责拆解、难点梳理、线上结果和指标口径。",
            "Python, Markdown",
            "AI",
        )

        self.assertTrue(result.ok)
        self.assertEqual(result.missing, [])
        self.assertTrue(any("长度达标" in item for item in result.notes))

    def test_build_prompt_contains_skill_outputs_and_handoffs(self):
        prompt = project_guide.build_prompt(
            description="负责项目分析```和面试准备",
            short_name="智能BI",
            tech_stack="React, TypeScript",
            role_focus="前端",
            extra="补充说明",
        )

        self.assertIn("/project-guide", prompt)
        self.assertIn("导学-{简称}.md", prompt)
        self.assertIn("面经-{简称}.md", prompt)
        self.assertIn("/asu", prompt)
        self.assertIn("/interview", prompt)
        self.assertIn("``\u200b`", prompt)
        self.assertIn("Bullet few-shot（仅学习结构，不复制素材）", prompt)
        self.assertIn("**通用支柱名：**", prompt)
        self.assertIn("**分层容错：**", prompt)
        self.assertIn("接入缓存和重试，优化接口请求", prompt)
        self.assertIn("RunManager", prompt)
        self.assertIn("结果写可验证的架构变化或真实指标", prompt)

    def test_main_check_prints_json_output(self):
        description = (
            "这是一个项目导学和面经生成技能，负责根据仓库源码整理阅读路径、"
            "职责边界、技术难点、线上结果和指标口径。"
        )
        stdout = io.StringIO()
        stderr = io.StringIO()

        with mock.patch("sys.stdin", io.StringIO(description)):
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                exit_code = project_guide.main(["check", "--json"])

        self.assertEqual(exit_code, 0)
        self.assertEqual(stderr.getvalue(), "")
        payload = json.loads(stdout.getvalue())
        self.assertTrue(payload["ok"])
        self.assertIn("notes", payload)

    def test_main_build_prompt_reads_json_file(self):
        payload = {
            "description": "负责项目导学和面经生成流程，覆盖源码阅读路径、职责拆解、难点梳理、结果复盘。",
            "short_name": "导学",
            "tech_stack": "Python, Markdown",
            "role_focus": "AI",
            "extra": "补充说明",
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            json_file = Path(temp_dir) / "input.json"
            json_file.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

            stdout = io.StringIO()
            stderr = io.StringIO()
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                exit_code = project_guide.main(["build-prompt", "--json-file", str(json_file)])

        self.assertEqual(exit_code, 0)
        self.assertEqual(stderr.getvalue(), "")
        output = stdout.getvalue()
        self.assertIn("导学", output)
        self.assertIn("Python, Markdown", output)
        self.assertIn("/project-guide", output)


if __name__ == "__main__":
    unittest.main()
