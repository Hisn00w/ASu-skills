# Contribution Guide

<div align="center">
  <a href="CONTRIBUTING_en.md"><img src="https://img.shields.io/badge/English-Contribution-11A683?style=for-the-badge" alt="English"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97-59B390?style=for-the-badge" alt="贡献指南"></a>
</div>

Contributions via Issues and Pull Requests are welcome. To keep collaboration quality high, please read and follow these guidelines before submitting a change.

## About Issues

For large changes, open an Issue first to discuss the plan and wait for the maintainers to confirm it before submitting a Pull Request. Opening an Issue first is recommended in these scenarios:

- New features, major overhauls, or architecture changes: first confirm the maintainers' stance, whether the change fits the project's scope, and the implementation approach;
- Fixing an uncertain bug: first confirm whether it is really a bug, whether the current behavior is intended, and whether the proposed fix is reasonable.

## Submitting changes

1. Fork this repository and create a dedicated branch from `main`, named after the change, e.g. `docs/fix-typo`;
2. One Pull Request per change; keep every change focused and well-scoped;
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): use English type prefixes such as `feat:`, `fix:`, `docs:`, with a short, specific title;
4. Before opening a Pull Request, read this file and the [Pull Request template](PULL_REQUEST_TEMPLATE.md) in full, and complete every item in the template's checklist;
5. The Pull Request description should state what changed, why, and how it was verified. If you cannot complete a checklist item, explain why and offer an alternative verification.

The following is not mandatory but is recommended:

1. When a change involves a SKILL, attach an extra conversation sample containing the user input and the Agent's reply to the Pull Request.

## Repository structure

- **Skill entries**: `skills.registry.json` is the single source of truth.
  - When adding, removing, or renaming a skill entry, first update `skills.registry.json` at the repository root, then run `npm run sync:skills` to regenerate every plugin manifest, installer, issue template, and README overview, and confirm `npm run sync:skills --check` passes;
  - The [First time: where to start](../README_en.md#first-time-where-to-start) section of the README still needs to be maintained manually (may be fixed later).
- **HTML templates**: Templates under `assets\templates-html` keep the design draft, styles, code, and top toolbar separated:
  - The design draft is an HTML file that can be opened directly, without a top toolbar;
  - Self-contained (dependency-free) HTML files must be produced by the inline script `node scripts/inline-template.mjs --all dist/templates`;
- **Static validation**: validate locally by following the checks in the CI workflow, or check the CI results when you submit.

## Welcomed contributions

- Typos, punctuation, formatting, and broken-link fixes in the README and `SKILL.md` files that affect comprehension, rendering, or link access;
- New resume templates — they must be editable and printable, and must never embed a screenshot as the page;
- Real feedback after running each skill, **including what didn't work** — such feedback is more valuable than success stories;
- Making the skills load properly in other agent environments.

## Contributions we won't merge

- Pull Requests that ask to remove the "experience must be real" clauses. Such clauses are not a writing-style preference — see [Truthfulness boundaries](../README_en.md#truthfulness-boundaries);
- Turning `/contributor` into a bulk-sending tool, e.g. "scan every project under an organization and auto-open Pull Requests". That is not contribution but bulk harassment; maintainers will block you, and it will not fit on a resume either;
- Changes made only to inflate the diff — meaningless line breaks or swapping correct punctuation for other correct punctuation, see [No-op commits](#no-op-commits);
- Writing real names, phone numbers, emails, internal company information, or recruiting privacy into repository files.

## No-op commits

This project does not accept invalid commits made only to produce a diff or to "pad your contribution history". Unless the change fixes a clear problem, satisfies rendering or format rules, or is directly related to the functional changes of the same Pull Request, the following are forbidden:

- Swapping correct punctuation only for other equally correct punctuation;
- Only deleting or adding spaces, blank lines, line breaks, or indentation;
- Only rearranging layout that does not affect content or rendering;
- Mass-producing a large number of unrelated changes through mechanical batch replacements.

If you really find a punctuation, spacing, or formatting problem, explain its reproduction location, actual impact, and how it was verified in the Pull Request; do not submit trivial changes without a clear impact on their own.
