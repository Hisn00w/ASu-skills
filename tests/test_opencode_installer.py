import contextlib
import importlib.util
import io
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / ".opencode-plugin" / "install-opencode.py"


def load_installer():
    spec = importlib.util.spec_from_file_location("opencode_installer", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


installer = load_installer()


class OpenCodeInstallerTests(unittest.TestCase):
    def test_explicit_target_bypasses_auto_discovery_and_installs_all_skills(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            target = Path(temp_dir) / "custom" / "skills"
            stdout = io.StringIO()

            with mock.patch.object(
                installer,
                "find_opencode_skills_dir",
                side_effect=AssertionError("explicit target must bypass auto-discovery"),
            ):
                with contextlib.redirect_stdout(stdout):
                    exit_code = installer.main(["--target", str(target)])

            expected_skills = {
                path.name
                for path in (ROOT / "skills").iterdir()
                if path.is_dir() and not path.name.startswith(".")
            }
            self.assertEqual(exit_code, 0)
            self.assertEqual(set(installer.SKILL_NAMES), expected_skills)
            for skill_name in expected_skills:
                self.assertTrue((target / skill_name / "SKILL.md").is_file())
            self.assertTrue(
                (target.parent / "assets" / "asu" / "asu-resume-template.html").is_file()
            )
            self.assertTrue(
                (target.parent / "references" / "asu" / "email-monitoring.md").is_file()
            )

    @unittest.skipUnless(shutil.which("node"), "Node.js is required for resume builds")
    def test_installed_builders_generate_resumes_from_an_unrelated_directory(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            target = root / "OpenCode config" / "skills"
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(installer.main(["--target", str(target)]), 0)
            assets = target.parent / "assets" / "asu"
            user_dir = root / "user resumes"
            user_dir.mkdir()
            cases = (
                ("build-asu-resume.mjs", assets / "asu-resume" / "template.html"),
                ("inline-template.mjs", next((assets / "templates-html").glob("*.html"))),
            )
            for script, template in cases:
                with self.subTest(script=script):
                    original = template.read_bytes()
                    shell = user_dir / "content.html"
                    shutil.copyfile(template, shell)
                    output = user_dir / "resume.html"
                    installed_script = assets / "scripts" / script
                    self.assertTrue(installed_script.is_file())
                    result = subprocess.run(
                        [shutil.which("node"), str(installed_script), str(shell), str(output)],
                        cwd=user_dir, capture_output=True, text=True,
                    )
                    self.assertEqual(result.returncode, 0, result.stderr)
                    html = output.read_text(encoding="utf-8")
                    self.assertIn('data-action="save"', html)
                    self.assertIn("<script>", html)
                    self.assertNotIn('<link rel="stylesheet"', html)
                    reference = user_dir / "reference.html"
                    baseline = subprocess.run(
                        [shutil.which("node"), str(ROOT / "scripts" / script), str(shell), str(reference)],
                        cwd=user_dir, capture_output=True, text=True,
                    )
                    self.assertEqual(baseline.returncode, 0, baseline.stderr)
                    self.assertEqual(output.read_bytes(), reference.read_bytes())
                    self.assertEqual(template.read_bytes(), original)
                    self.assertEqual(shell.read_bytes(), original)

    def test_without_target_uses_auto_discovery(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            target = Path(temp_dir) / "detected" / "skills"
            with mock.patch.object(
                installer,
                "find_opencode_skills_dir",
                return_value=target,
            ) as find_target:
                with contextlib.redirect_stdout(io.StringIO()):
                    exit_code = installer.main([])

            self.assertEqual(exit_code, 0)
            find_target.assert_called_once_with()
            self.assertTrue((target / "great-resume" / "SKILL.md").is_file())

    def test_missing_auto_discovery_returns_failure(self):
        stdout = io.StringIO()
        with mock.patch.object(
            installer,
            "find_opencode_skills_dir",
            return_value=None,
        ):
            with contextlib.redirect_stdout(stdout):
                exit_code = installer.main([])

        self.assertEqual(exit_code, 1)
        self.assertIn("--target", stdout.getvalue())

    def test_console_messages_are_cp936_compatible(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            target = Path(temp_dir) / "skills"
            encoded_output = io.BytesIO()
            stdout = io.TextIOWrapper(encoded_output, encoding="cp936", errors="strict")

            with contextlib.redirect_stdout(stdout):
                exit_code = installer.main(["--target", str(target)])
            stdout.flush()

            self.assertEqual(exit_code, 0)
            self.assertIn(b"[OK]", encoded_output.getvalue())

    def test_target_requires_a_path(self):
        with contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as raised:
                installer.main(["--target"])

        self.assertEqual(raised.exception.code, 2)


if __name__ == "__main__":
    unittest.main()
