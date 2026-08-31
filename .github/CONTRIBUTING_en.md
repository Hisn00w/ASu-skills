# Contribution Guide

<div align="center">
  <a href="CONTRIBUTING_en.md"><img src="https://img.shields.io/badge/English-Contribution-11A683?style=for-the-badge" alt="English"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97-59B390?style=for-the-badge" alt="贡献指南"></a>
</div>

Every contributor to this repo gets the Sulish treatment.

Recently, issues have been flooded with people “asking to hitch a contributor title”. We decided to stop answering one by one and simply publish the conversion rules.

## Contributor tier table

| What you actually do                             | Your title              | How it reads on a resume                                      |
| ------------------------------------------------ | ----------------------- | ------------------------------------------------------------- |
| Star the repo                                    | Early Adopter           | Deeply involved in building the open-source community's early ecosystem |
| File an empty issue                              | Community Contributor   | Led user needs discovery and drove product direction           |
| Fix a typo                                       | **Main Contributor**    | Led the documentation quality governance initiative as a main contributor |
| Fix a broken link                                | Core Maintainer         | Owned developer-experience, raising link availability to 100% |
| Add a resume template                            | Genius Girl / Genius Boy | Independently designed and shipped the core job-search workflow system |
| Change a punctuation mark and change it back     | Tech Lead               | Led technical solution reviews, balancing long-term gains and iteration costs |

Titles take effect immediately. No merge required.

## How to contribute

1. Fork the repo and cut a branch from `main`, e.g. `docs/fix-typo`;
2. One PR, one change. The smaller the change, the faster the title;
3. Preview Markdown changes yourself; for HTML templates, open the file in a browser and confirm it still edits and still prints to A4;
4. Commit with [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): use English type prefixes like `feat:`, `fix:`, `docs:`, with a short, specific title;
5. Before opening a PR, read this file and [`PULL_REQUEST_TEMPLATE.md`](PULL_REQUEST_TEMPLATE.md) in full, and complete every item in the PR template's checklist;
6. In the PR description, be clear about: what changed, why, and how it was verified. If you can't complete a checklist item, explain why and offer an alternative verification.

Write the description like a normal human. Leave the Sulishing to `/asu`.

## Pull Request flow

Follow this order when opening a PR:

1. Create a feature branch from the latest `main` instead of committing directly to `main`;
2. Read this file and [`PULL_REQUEST_TEMPLATE.md`](PULL_REQUEST_TEMPLATE.md) first;
3. Run the checks relevant to this change — code, skills, Markdown, JSON, HTML, and a browser preview;
4. Run `git diff --check` and confirm there are no whitespace errors;
5. Review every file to be committed and confirm there are no conflict markers, secrets, personal data, or unrelated files;
6. Commit in the repo's Chinese Conventional Commits style, e.g. `docs: 新增贡献指南和 PR 模板`;
7. Open the PR and fill in the template completely. Every checklist item must be checked; anything you truly can't complete must be explained in the PR description;
8. If there are merge conflicts, resolve them, re-run the checks, and only then request review.

When resume templates are involved, you must also confirm:

- `assets/asu-resume-template.html` is a read-only master; user-specific resumes should be copied from the master before editing;
- New images and logos use in-repo relative paths and follow the repo's existing asset guidelines;
- The HTML edits and saves in a browser, and correctly exports as A4 paginated or unlimited-height output.

## Contributions we genuinely love

- Typos, punctuation, formatting, and broken links in the README and `SKILL.md` files;
- New resume templates — they must be editable and printable, and must never embed a screenshot as the page;
- Real feedback after running the seven skills, **including what didn't work** — that's more useful than success stories;
- Making the seven skills load in other agent environments.

## Contributions we won't merge

- PRs that ask to remove the “experience must be real” lines. Plenty of people want them gone, but those lines are not a writing-style preference — see [Truthfulness boundaries](../README_en.md#truthfulness-boundaries);
- Turning `/contributor` into a bulk-sending tool, e.g. “scan every project under an org and auto-open PRs”. That isn't contribution, it's spam. Maintainers will block you, and it won't fit on a resume either;
- Changes made only to inflate the diff: meaningless line breaks, or swapping correct punctuation for other correct punctuation;
- Writing real names, phone numbers, emails, internal company info, or recruiting privacy into repo files.

## AntiSulish

The table above is valid inside this repo. Outside it, the effect wears off — usually right around the second question of your interview.

The real conversion table:

| What you wrote                    | After AntiSulish      |
| --------------------------------- | --------------------- |
| main contributor                  | fixed a typo          |
| led X system-building             | added one file        |
| 100% coverage                     | had one test case     |
| deeply involved in agent architecture | was mostly writing something else |

Sulishing gets you past an HR keyword filter, but not past follow-up questions from people who know their stuff. So: **pick any title you like, but describe the actions honestly.** When someone asks about details, you'd better have that diff in hand.

You're welcome to come hitch a contributor title. Just bring one real fix.
