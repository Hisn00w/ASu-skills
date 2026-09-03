# ASu-skills



<div align="center">
  <img src="assets/asu-circle.png" width="180" height="180" alt="ASu-skills logo">
  <h3>A job-search workflow plugin for Chinese job seekers</h3>
  <p>Eight standalone entry points for open-source contributions, AI coding conversation review, project interview prep, resume improvement, resume building, job-application autofill, interview preparation, and campus recruitment tracking.</p>
</div>


<div align="left">
  <a href="README_en.md">English</a> | <a href="README.md">中文</a> | <a href="https://hisn00w.github.io/ASu-skills/">Website</a>
</div>

<br>

<div align="left">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Hisn00w/ASu-skills?logo=github" alt="License: MIT"></a>
  <img src="assets/claude-code-badge.svg" alt="Claude Code">
  <img src="assets/chatgpt-badge.svg" alt="ChatGPT">
  <img src="assets/opencode-badge.svg" alt="OpenCode">
  <img src="assets/deepseek-badge.svg" alt="DeepSeek">
  <img src="assets/traework-badge.svg" alt="TraeWork">
</div>

<div align="left">
  <a href="https://deepwiki.com/Hisn00w/ASu-skills"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
  <a href="https://www.dsh.so/artifact/asu-skills"><img src="https://www.dsh.so/badge/asu-skills.svg" alt="dsh.so security"></a>
  <a href="https://www.dsh.so/artifact/asu-skills"><img src="https://www.dsh.so/badge/install/asu-skills.svg" alt="dsh.so install"></a>
</div>

<br>

<div align="left">
  <a href="https://trendshift.io/repositories/139058?utm_source=trendshift-badge&amp;utm_medium=badge&amp;utm_campaign=badge-trendshift-139058" target="_blank" rel="noopener noreferrer"><img src="https://trendshift.io/api/badge/trendshift/repositories/139058/daily" alt="Hisn00w%2FASu-skills | Trendshift" width="250" height="55"></a>
</div>

<p align="center">
  <img src="assets/asu-skills-overview-landscape-v2.png" alt="ASu-skills overview of eight skills" width="1100">
</p>

## Contents

- [Harness Project Update](#a-harness-project-update)
- [Installation](#installation)
- [First time: where to start](#first-time-where-to-start)
- [Eight skills](#how-the-eight-entries-work-together)
  - [`/contributor`: Make real open-source contributions](#contributor-make-real-open-source-contributions)
  - [`/project-guide`: Project Study Notes And Interview Answers](#project-guide-project-study-notes-and-interview-answers)
  - [`/great-resume`: Improve your experience](#great-resume-improve-your-experience)
  - [`/make-resume`: Build a resume](#make-resume-build-a-resume)
  - [`/evidence-recap`: Turn AI coding conversations into evidence chains](#evidence-recap-turn-ai-coding-conversations-into-evidence-chains)
  - [`/interview`: Stress-test your resume](#interview-stress-test-your-resume)
  - [`/offer`: Campus recruitment progress management](#offer-campus-recruitment-progress-management)
  - [`/job-apply`: Job-application autofill](#job-apply-job-application-autofill)
- [How the eight entries work together](#how-the-eight-entries-work-together)
- [Truthfulness boundaries](#truthfulness-boundaries)
- [File structure](#file-structure)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)
- [Contributors](#contributors)
- [License](#license)
- [Star History](#star-history)

## A Harness Project Update

ASu is building a Harness project tailored to the job-search journey. We welcome real application cases, skills, and terminal experiences via Issues and PRs.

<img src="assets/harness-update.png" alt="ASu Harness project update" width="560" />

[Check out the ASu Harness project on GitHub](https://github.com/Hisn00w/ASu-skills)

ASu-skills is now a plugin pack. Installing it provides eight individually callable entry points:

| Entry          | Purpose                   | Primary deliverables                                              |
| -------------- | ------------------------ | ----------------------------------------------------------------- |
| `/contributor` | Open-source contributions | Finds candidates, shows diffs, submits a PR after your confirmation, and hands the contribution to `/great-resume` |
| `/evidence-recap` | Conversation review      | Turns AI coding conversations and delivery records into a verifiable nine-part evidence chain |
| `/project-guide` | Project interview prep | Generates `导学-{short-name}.md`, `面经-{short-name}.md`, and handoff evidence from a project repository |
| `/great-resume` | Resume improvement       | Role targeting, project bullet rewrites, evidence of results, HR opener |
| `/make-resume`      | Resume building          | Defaults to the ASu template, supports custom templates, editable HTML resume and PDF export |
| `/job-apply`   | Job-application autofill | Connects to a browser, fills an application, and stops for review before submission |
| `/interview`   | Interview preparation    | Interview prediction, contract-driven drilling, evidence review, and targeted retry |
| `/offer`       | Campus recruitment tracking | Tracks applications, assessments, interviews, offers, rejections, and recruiting emails |

## Installation

ASu-skills works with Codex, Claude Code, and TraeWork: the repo root has `.codex-plugin/` for Codex, `.claude-plugin/` for Claude Code, and `.trae-plugin/` for TraeWork, all sharing the same `skills/`, `assets/`, and `references/`.

### Codex

The easiest way is to send the GitHub link directly to Codex and ask it to install the plugin:

```text
Install the ASu-skills plugin from this GitHub repository and enable the eight skills: contributor, evidence-recap, project-guide, great-resume, make-resume, job-apply, interview, offer:
https://github.com/Hisn00w/ASu-skills
```

After installation, start a new Codex conversation so the new skills get reloaded. Then type `/` in the input box and pick `contributor`, `evidence-recap`, `project-guide`, `great-resume`, `make-resume`, `job-apply`, `interview`, or `offer` from the command list.

If your Codex version does not surface skills in the `/` menu, you can also use the official explicit invocation syntax:

```text
$contributor Find open-source contribution candidates for my target role; show me the diffs first. I'll confirm before you open the PR, and hand the merged contribution to /great-resume for resume improvement.
$evidence-recap Turn this AI coding conversation into a verifiable project evidence chain, separating my actions, the delivery stage, and evidence of impact.
$great-resume Rewrite my internship experience for an AI application engineer role.
$project-guide Generate project study notes and interview answers from the current repository, with handoff evidence for /great-resume and /interview.
$make-resume Turn my experience into an editable Chinese HTML resume. Use the ASu template by default, or use another template if I specify one.
$job-apply Use my confirmed resume data to fill the current job application in a connected browser, then stop for my review before submission.
$interview Predict likely interview questions from my resume and drill me with one follow-up question at a time to check whether I really master these experiences.
$offer Turn these recruiting emails into a campus recruitment application tracker.
```

### Claude Code

In a Claude Code session, run:

```text
/plugin marketplace add Hisn00w/ASu-skills
/plugin install asu-skills@asu
```

You can also run the equivalent commands in a terminal:

```bash
claude plugin marketplace add Hisn00w/ASu-skills
claude plugin install asu-skills@asu
```

If the install summary says `Run /reload-plugins to activate.`, run `/reload-plugins`; otherwise restart Claude Code. After installation, run `claude plugin details asu-skills` to confirm all eight skills are loaded.

Update and uninstall:

```text
/plugin marketplace update asu
/plugin uninstall asu-skills
```

Uninstalling the plugin only removes the plugin cache; it never touches the application tracker you have edited in your project or user directory.

### TraeWork

TraeWork packages this repository as a plugin via the `.trae-plugin/plugin.json` manifest, and the eight skills become available under the plugin as `<publisher>:asu-skills:<skill>`.

1. Copy this repository into the TraeWork plugin directory: `~/.trae-cn/plugins/<publisher>/asu-skills/<version>/`, keeping `.trae-plugin/plugin.json`, `skills/`, `assets/`, and `references/`;
2. Restart TraeWork so the new plugin is reloaded;
3. Start a new conversation, type `/` in the input box, and pick `contributor`, `evidence-recap`, `project-guide`, `great-resume`, `make-resume`, `job-apply`, `interview`, or `offer` from the command list.

`<publisher>` is a namespace you choose under the plugin directory (for example `local`), and `<version>` is the version in `plugin.json`. To uninstall, delete the plugin directory; it never touches the application tracker you have edited in your project or user directory.

For contributor checks, tests, and the PR workflow, see the [contributing guide](.github/CONTRIBUTING_en.md).

## First time: where to start

Pick your first entry based on the problem you most need to solve right now:

| Situation | Start with |
| --------- | ---------- |
| No verifiable projects or collaboration experience yet | `/contributor` |
| Have AI coding conversations or delivery records that need evidence review | `/evidence-recap` |
| Have a project repository and need a code-reading path plus interview talking points | `/project-guide` |
| Have experience, but unsure how to match it to a target role | `/great-resume` |
| Resume content is settled; need a regular editable resume | `/make-resume` |
| Want to recreate the ASu-style high-density technical resume | `/make-resume` (default template) |
| Have a job URL and need to fill its application form | `/job-apply` |
| Interviews coming up; want to predict questions and drill the weak spots | `/interview` |
| Already applying; need to organize recruiting emails and follow-ups | `/offer` |

You can also combine entries:

- **No internships, want real experience**: use `/contributor` to make role-relevant open-source contributions first, then hand them to `/great-resume` to turn into verifiable resume statements;
- **Have AI project records, need to establish the facts**: use `/evidence-recap` to separate personal actions, delivery stage, and evidence of impact before deciding whether to hand the result to `/great-resume`;
- **Have projects, ready to apply**: use `/project-guide` to turn the repository into study notes and interview answers, then use `/great-resume` to align with the target role and `/make-resume` to generate the resume; it defaults to the ASu template but accepts a specified template;
- **Already applying, tracking ongoing progress**: use `/offer` directly to organize emails and statuses; come back to `/great-resume` and `/make-resume` whenever the resume needs an update.
- **Ready to fill an application form**: use `/job-apply` with a connected browser for one specific role, then use `/offer` to record the application status.

## `/contributor`: Make real open-source contributions

You don't need to start by refactoring Kubernetes. `/contributor` finds active projects that match your target company and role, prioritizing typos, punctuation, Markdown, formatting, broken links, and small README fixes. It shows candidates, proposed changes, and verification results first; it only forks, pushes, and opens a PR after you explicitly confirm.

Small changes can still tell a big story: a typo fix is documentation quality governance, a broken-link fix is developer-experience optimization, and touching multiple repositories is a cross-project collaboration loop. Keep the PR itself normal; once merged, hand the real links and data to `/great-resume` for resume improvement. Anything unmerged simply goes down as “collaborating”.

Typical usage:

```text
/contributor

Target role: AI Application Engineer
Tech stack: TypeScript, React, Python
Weekly availability: 4 hours
Start with 3 small PRs that are easy to merge, then add 1 technical contribution I can expand on in an interview.
```

## `/project-guide`: Project Study Notes And Interview Answers

`/project-guide` works from an existing project repository or project materials and generates two Markdown files: `导学-{short-name}.md` and `面经-{short-name}.md`. It turns code-reading paths, technical highlights, design trade-offs, STAR answers, and source evidence into interview preparation material, then summarizes handoff evidence for `/great-resume` and high-risk claims for `/interview`.

Typical usage:

```text
/project-guide

Short name: BI
Project description: This is a React, Node.js, and LLM API based data Q&A project. I owned query orchestration, result visualization, and graceful fallback.
Target role: Front-end / AI application
```

## `/great-resume`: Improve your experience

> **Great-resume** — improving your real experience so it reads sharp, confident, and aligned with your target role through strong positioning, strong evidence, and clear expression. Never fabrication.

Suitable for:

- Re-positioning your experience against a target role;
- Translating low-level work like pages, APIs, and data binding into hiring language;
- Rewriting project bullets, resume summaries, and personal introductions;
- Generating HR openers for LinkedIn or Line;
- Preparing interview follow-up questions, evidence checklists, and the boundary between fact and framing.

For best results, provide the target role, job description, current resume, project descriptions, real responsibilities, and measurable outcomes. When information is missing, the skill drafts what it can and marks the gaps with a `【待补】` (“to be filled in”) placeholder — it never invents titles, companies, tech stacks, or numbers.

Typical usage:

```text
/great-resume

Target role: AI Application Engineer
Based on my internship and project experience below, give me a steady framing and a bold framing, rewrite the resume bullets, and draft an opener to send to HR.
```

### Example HR opener

<img src="assets/hr-intro-example.jpg" width="360" alt="Example HR opener">

## `/make-resume`: Build a resume

`/make-resume` handles all resume-file deliverables. Unless you specify another template, it uses the ASu single-column high-density technical resume as a read-only master. You can specify a repository template, local HTML, or reference screenshot; it always produces a genuinely editable HTML, never an image of the original embedded in a page.

Supported:

- 18 Chinese HTML templates;(ask ur agent for a English ver if u like :)
- A4 single- or two-page layout;
- In-browser editing of text, photo, fonts, colors, and bold;
- Save the current edits as a local HTML file;
- “Local fonts” reads fonts installed on your system (Chrome 103+, requires browser permission); “Import fonts” loads local font files (TTF/OTF/WOFF/WOFF2) as a supplement;
- Print-to-PDF export;
- Layout analysis from screenshots: columns, spacing, font size, colors, and pagination;
- Fictional placeholder photos by default; swap in your own for the real resume.

The default ASu template is copied from `assets/asu-resume-template.html` into a user-specific file and is never modified. “I want an ASu-style resume” is handled by `/make-resume`; if you name another template, that template takes precedence.

Typical usage:

```text
/make-resume

Using the education, internship, and project experience I provide, pick a template suited to a back-end developer role, generate an editable HTML resume, and tell me how to export it as PDF.
```

### Template preview

![Resume template preview](assets/template-overview.jpg)

## `/evidence-recap`: Turn AI coding conversations into evidence chains

`/evidence-recap` reviews AI coding conversations, project delivery records, and implementation evidence. It organizes the material into nine parts: problem context, solution decisions, personal actions, delivery status, rollout scope, evidence of impact, ownership boundaries, missing evidence, and interview follow-ups. Sensitive details such as secrets, email addresses, customer identifiers, and internal paths are generalized by default.

Typical usage:

```text
/evidence-recap

Turn this AI coding conversation into a verifiable project evidence chain. Separate my actions, the AI's work, the delivery stage, and evidence of impact.
```

## `/interview`: Stress-test your resume

`/interview` extracts claims and role competencies from your resume and target role, then establishes the interview round, time budget, and feedback policy before asking exactly one question at a time. Each core question uses a locked scoring contract, while a session ledger records verified evidence and remaining gaps. The review flags high-risk wording and knowledge gaps; targeted retry uses variant, counterfactual, and failure questions instead of repeating the same prompt. It never fabricates interview answers or hides weak evidence behind an uncalibrated precise score.

Typical usage:

```text
/interview grill

Here is my resume; my target role is AI Application Engineer. Start from the highest-risk project and ask me one question at a time; if my answer is vague, keep drilling.
```

Retry only the weak claims from the previous review:

```text
/interview retry

Use variant questions to retry only metric definitions and personal ownership. Do not repeat the original questions verbatim.
```

## `/offer`: Campus recruitment progress management

`/offer` turns information from job boards, emails, chat records, and screenshots into an application funnel, logging by default:

- Date;
- Company;
- Role;
- Current status;
- Next step;
- Necessary notes and sources of evidence.

Default statuses are: `Applied`, `Under review`, `In assessment`, `Interview`, `Offer`, `Rejected/Closed`, `Needs confirmation`. A plain automatic reply receipt is never treated as evidence of an interview or offer; anything without sufficient evidence is marked `Needs confirmation`.

Unless you specify a location, the tracker is copied to your desktop as `application-tracker.html`. It supports search, filtering, statistics, CSV/JSON backups, and print-to-PDF.

Typical usage:

```text
/offer

Organize the recruiting emails and screenshots I uploaded into a campus recruitment tracker, merge duplicate applications, and list the next step for each company.
```

### Tracker preview

![Campus recruitment tracker preview](assets/application-tracker-overview.svg)

## `/job-apply`: Job-application autofill

**Important: this project forbids abusing the skills for mass applications, harassing HR, or sending generic, exaggerated opening messages. Use only real experience and tailor communication moderately to the specific role; piling up GitHub stars, over-packaging experience, and sending the result without review can alienate HR and damage the reputation of both the candidate and the project. `/job-apply` is only for one specific application explicitly confirmed by the user; it never bypasses confirmation, submits applications in bulk, or sends unreviewed messages on the user's behalf.**

<div align="center">
  <img src="assets/hr-opening-warning.jpg" alt="Example of an HR-rejected templated job-application opener" width="560">
  <p><em>Negative example: templated and exaggerated opening messages can cause a negative reaction. Do not copy this style.</em></p>
</div>

`/job-apply` uses confirmed resume data to fill one specific recruitment or application form. It supports page inspection, field mapping, text input, dropdowns, resume/portfolio uploads, and a final pre-submission review. It stops before the final submit button by default; asking to “fill my resume” does not imply permission to submit an application.

<img src="assets/job-apply-form-example.png" alt="Campus recruitment application form example" width="900" />

### Connect a browser with Kimi WebBridge

**Before using `/job-apply`, install and enable a browser-control extension and confirm that it is connected to the corresponding browser-control service.** ASu does not read or fill a recruitment page until the extension and connection have been checked.

To operate a Chrome or Edge browser where you are already signed in, install and enable the official [Kimi WebBridge](https://www.kimi.com/products/kimi-webbridge). It connects a browser extension, a local daemon, and the Chrome DevTools Protocol; login sessions and page content stay on the local machine.

If you use ChatGPT/Codex browser control, you can instead install and enable the [ChatGPT browser extension (Microsoft Edge Add-ons)](https://microsoftedge.microsoft.com/addons/detail/chatgpt/odlomjlbamekndcpllcnffbgeohgkmjh) (the Chrome Web Store listing has been removed; use Edge Add-ons), then follow the browser-control setup shown in the host application. Choose either connection method; installing both is unnecessary.

### Typical usage

```text
/job-apply

Use my confirmed resume to open this job application, fill the fields and resume attachment that can be verified, ask me about anything missing, and stop before submission for my review.
```

The user must handle passwords, SMS/email codes, MFA, passkeys, and CAPTCHAs. ASu separately confirms personal-data input, file uploads, and final submission; it does not read cookies, tokens, or password storage, and does not bypass anti-bot or access controls.

## How the eight entries work together

Recommended order:

1. Use `/contributor` to make real open-source contributions relevant to your target role, and generate an evidence card once the PR merges;
2. When you have AI coding conversations or delivery records, use `/evidence-recap` to recover project facts, ownership boundaries, and evidence gaps;
3. Use `/project-guide` to turn an existing project repository into study notes, interview answers, and source evidence;
4. Use `/great-resume` to lock in role targeting from the evidence card and your existing experience, and to improve resume phrasing and HR talking points;
5. Use `/make-resume` to turn the confirmed copy into an editable resume and export PDF;
6. Use `/job-apply` to connect a browser, fill one specific application, and review it before submission;
7. Use `/interview` to predict likely questions and verify through follow-up drilling that the resume holds up in interviews;
8. Use `/offer` to record the status of applications, assessments, interviews, and offers.

You can also state a combined goal in a single request, e.g.: “first use `/project-guide` to generate project study notes and interview answers, then `/great-resume` to improve the experience, and finally `/make-resume` to generate an HTML resume”.

When combining multiple entries, when your materials conflict, or when a resume contains strong claims, you can copy [`assets/career-claim-ledger-template.json`](assets/career-claim-ledger-template.json) to set up a claim–evidence ledger. It lets open-source contributions, experience improvements, and resume files share the same facts, confirmation statuses, and personal boundaries; see [`skills/great-resume/references/claim-evidence-ledger.md`](skills/great-resume/references/claim-evidence-ledger.md) for the detailed rules.

To see how one person's materials flow through the entries, read the [end-to-end fictional job-search case](docs/end-to-end-fictional-case.md). Starting from course projects and an open-source contribution, it walks through the evidence card, the experience rewrite, the editable resume, and the application tracker, clearly distinguishing completed, in-progress, and to-be-filled items.

## Truthfulness boundaries

ASu-skills' “great-resume” approach means strong positioning, strong evidence, and clear expression — never fabricated experience. Please keep to these rules:

- Keep real titles, companies, dates, and education;
- Distinguish team results from personal contributions;
- Only use strong wording like “led”, “owned”, or “Owner” when you have the evidence;
- Use verifiable qualitative results when no reliable numbers exist;
- Never write planned work as completed work;
- Never claim AI-generated code as unverified personal capability;
- Never write real names, phone numbers, emails, passwords, verification codes, or recruiting privacy into public skill files.

## File structure

```text
asu-skills/
├── .claude-plugin/
│   ├── plugin.json              # Claude Code plugin manifest
│   └── marketplace.json         # Claude Code plugin marketplace manifest
├── .codex-plugin/
│   └── plugin.json              # Plugin manifest
├── .trae-plugin/
│   └── plugin.json              # TraeWork plugin manifest
├── package.json                 # DSH plugin pack manifest (bundle patch entry)
├── cordis.patch.yml             # Registers the DSH filesystem skill provider
├── lib/
│   └── index.js                 # DSH plugin entry module
├── skills/
│   ├── great-resume/
│   │   ├── SKILL.md             # /great-resume experience improvement
│   │   └── agents/openai.yaml
│   ├── contributor/
│   │   ├── SKILL.md             # /contributor open-source contributions
│   │   └── agents/openai.yaml
│   ├── evidence-recap/
│   │   ├── SKILL.md             # /evidence-recap AI coding conversation review
│   │   └── agents/openai.yaml
│   ├── project-guide/
│   │   ├── SKILL.md             # /project-guide project study notes and interview answers
│   │   └── agents/openai.yaml
│   ├── make-resume/
│   │   ├── SKILL.md             # /make-resume resume building
│   │   └── agents/openai.yaml
│   ├── interview/
│   │   ├── SKILL.md             # /interview prediction, drilling & targeted retry
│   │   ├── references/          # Interview contracts, scoring, scenarios & retry rules
│   │   └── agents/openai.yaml
│   ├── offer/
│       ├── SKILL.md             # /offer campus recruitment tracking
│       └── agents/openai.yaml
│   └── job-apply/
│       ├── SKILL.md             # /job-apply job-application autofill
│       ├── references/          # Kimi WebBridge connection and safety rules
│       └── agents/openai.yaml
├── scripts/
│   └── kimi-webbridge.mjs       # Kimi WebBridge local HTTP client
├── assets/                      # Templates, images, tracker, and example resources
│   ├── asu-resume-template.html # Read-only master for the ASu-style editable resume
│   ├── icons/                   # Personal & general information SVG icons
│   └── logos/                   # LobeHub Icons static SVG logos
├── references/                  # Reference for organizing recruiting emails
├── .github/
│   ├── CONTRIBUTING.md          # Contribution guide
│   ├── CONTRIBUTING_en.md       # English contribution guide
│   └── PULL_REQUEST_TEMPLATE.md # Pull request template
└── README.md
```

## Contributing

Issues and PRs are welcome. See the [contributing guide](.github/CONTRIBUTING_en.md), or browse the repository's [Pull Requests](https://github.com/Hisn00w/ASu-skills/pulls).

## Acknowledgments

Thanks to the following Xiaohongshu(Chinese IG) creators for their public sharing and inspiration:

- [**阿酥在coding**](https://xhslink.cn/m/2LHuLJZ30b2): sharing on Coding interview experience;
- [**Hi Mr Lonely**](https://xhslink.cn/m/3kVQDyUJ6of): sharing on resume presentation and job-search communication.

This plugin has organized, structured, and compliance-adjusted the relevant content and turned it into a reusable job-search workflow.

Thanks to [LobeHub/lobe-icons](https://github.com/lobehub/lobe-icons) for the open-source brand icon resources; following its skill guide, this plugin prefers `@lobehub/icons` and static SVG/CDN assets.

Thanks to [Kimi WebBridge](https://www.kimi.com/products/kimi-webbridge) for the local browser-connection capability that lets `/job-apply` drive a browser you are already signed into via the Chrome DevTools Protocol, keeping login sessions and page content on your machine.

## Contributors

Thanks to everyone who contributes to ASu-skills.

<a href="https://github.com/Hisn00w/ASu-skills/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Hisn00w/ASu-skills" alt="Contributors" />
</a>

## License

This project is released under the [MIT License](LICENSE). Free to use, modify, and distribute; forks and PRs are welcome. The open-source governance is led by community Owners, with 100% license coverage across the entire pipeline.

## Star History

<a href="https://www.star-history.com/?repos=Hisn00w%2FASu-skills&type=timeline&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=Hisn00w/ASu-skills&type=timeline&theme=dark&legend=top-left&sealed_token=bjbMfvRN5HhBif26VkNL7fMNZhYEU6NOxOMDWOzZvQnyJjYS5cPBNShexQ_xybTo30fuVzzhrKWq4x4IZAHEFrDesIwfK5iGJONtmrR_3Hhz3B2UFaKxs2iptYBKSxN0TbubpjnmkGaFme25ufww7AXpqptuXSHNK9KAWAP45t26kEa8NXXbLPxqH-5w" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=Hisn00w/ASu-skills&type=timeline&legend=top-left&sealed_token=bjbMfvRN5HhBif26VkNL7fMNZhYEU6NOxOMDWOzZvQnyJjYS5cPBNShexQ_xybTo30fuVzzhrKWq4x4IZAHEFrDesIwfK5iGJONtmrR_3Hhz3B2UFaKxs2iptYBKSxN0TbubpjnmkGaFme25ufww7AXpqptuXSHNK9KAWAP45t26kEa8NXXbLPxqH-5w" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=Hisn00w/ASu-skills&type=timeline&legend=top-left&sealed_token=bjbMfvRN5HhBif26VkNL7fMNZhYEU6NOxOMDWOzZvQnyJjYS5cPBNShexQ_xybTo30fuVzzhrKWq4x4IZAHEFrDesIwfK5iGJONtmrR_3Hhz3B2UFaKxs2iptYBKSxN0TbubpjnmkGaFme25ufww7AXpqptuXSHNK9KAWAP45t26kEa8NXXbLPxqH-5w" />
  </picture>
</a>
