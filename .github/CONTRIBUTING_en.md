# Contribution Guide

<div align="center">
  <a href="CONTRIBUTING_en.md"><img src="https://img.shields.io/badge/English-Contribution-11A683?style=for-the-badge" alt="English"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97-59B390?style=for-the-badge" alt="贡献指南"></a>
</div>

Contributions via Issues and Pull Requests are welcome. To keep collaboration quality high, please read and follow these guidelines before submitting a change.

## Submitting changes

1. Fork this repository and create a dedicated branch from `main`, named after the change, e.g. `docs/fix-typo`;
2. One Pull Request per change; keep every change focused and well-scoped;
3. Run the checks relevant to your change before submitting:
   - Preview Markdown changes locally;
   - Open HTML templates in a browser and confirm they edit, save, and export to A4;
   - When touching `SKILL.md`, `agents/openai.yaml`, plugin manifests, or adding a new skill, run `python3 scripts/validate_skills.py` from the repository root and confirm frontmatter, metadata, and resource references pass validation;
4. Commit with [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): use English type prefixes such as `feat:`, `fix:`, `docs:`, with a short, specific title;
5. Before opening a Pull Request, read this file and [`PULL_REQUEST_TEMPLATE.md`](PULL_REQUEST_TEMPLATE.md) in full, and complete every item in the template's checklist;
6. The Pull Request description should state what changed, why, and how it was verified. If you cannot complete a checklist item, explain why and offer an alternative verification.

## Local validation

After modifying `SKILL.md`, `agents/openai.yaml`, plugin manifests, or adding a new skill, run the static validator from the repository root:

```bash
python3 scripts/validate_skills.py
```

The validator checks that each `SKILL.md` exists; its frontmatter parses; `name` matches the directory name; `description` is non-empty and not too long; `agents/openai.yaml` parses; local `references/assets` paths cited in `SKILL.md` exist; and the Codex, TraeWork, Claude Code, and OpenCode plugin manifests are valid JSON covering the required entries. GitHub Actions runs this validator automatically on Pull Requests that touch `skills/**` and related paths.

Routing regression cases live in `tests/skill-routing-cases.yaml`. GitHub Actions validates their YAML structure, fields, duplicate prompts, and whether `expected` maps to an actual directory under `skills/`, without calling an LLM; it does not judge the semantic routing result.

## Pull Request flow

Follow this order when opening a Pull Request:

1. Create a feature branch from the latest `main` instead of committing directly to `main`;
2. Read this file and [`PULL_REQUEST_TEMPLATE.md`](PULL_REQUEST_TEMPLATE.md) first;
3. Run the checks relevant to this change — code, skills, Markdown, JSON, HTML, and a browser preview;
4. Run `git diff --check` and confirm there are no whitespace errors;
5. Review every file to be committed and confirm there are no conflict markers, secrets, personal data, or unrelated files;
6. Commit in the repo's Chinese Conventional Commits style, e.g. `docs: 新增贡献指南和 PR 模板`;
7. Open the Pull Request and fill in the template completely. Every checklist item must be checked; anything you truly cannot complete must be explained in the description;
8. If there are merge conflicts, resolve them, re-run the checks, and only then request review.

When resume templates are involved, you must also confirm:

- `assets/asu-resume-template.html` is a read-only master; user-specific resumes should be copied from the master before editing;
- New images and logos use in-repo relative paths and follow the repo's existing asset guidelines;
- The HTML edits and saves in a browser, and correctly exports as A4 paginated or unlimited-height output.

## Welcomed contributions

- Typos, punctuation, formatting, and broken-link fixes in the README and `SKILL.md` files;
- New resume templates — they must be editable and printable, and must never embed a screenshot as the page;
- Real feedback after running each skill, **including what didn't work** — that is more valuable than success stories;
- Making the skills load in other agent environments.

## Contributions we won't merge

- Pull Requests that ask to remove the “experience must be real” lines. Such clauses are not a writing-style preference — see [Truthfulness boundaries](../README_en.md#truthfulness-boundaries);
- Turning `/contributor` into a bulk-sending tool, e.g. “scan every project under an org and auto-open Pull Requests”. That is not contribution but bulk harassment; maintainers will block you, and it will not fit on a resume either;
- Changes made only to inflate the diff: meaningless line breaks, or swapping correct punctuation for other correct punctuation;
- Writing real names, phone numbers, emails, internal company info, or recruiting privacy into repo files.
