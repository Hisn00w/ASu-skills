# ASu-skills



<div align="center">
  <img src="assets/asu-circle.png" width="180" height="180" alt="ASu-skills logo">
  <h3>A job-search workflow plugin for Chinese job seekers</h3>
  <p>Six standalone entry points for open-source contributions, experience Sulishing, resume building, ASu-style resume replication, interview preparation, and fall recruitment tracking.</p>
</div>


<div align="center">
  <a href="https://chatgpt.com/codex"><img src="https://img.shields.io/badge/Build%20with-EVERYONE-59B390?style=for-the-badge&logo=openai&logoColor=white" alt="Build with Everyone"></a>
  <a href="https://github.com/Hisn00w/ASu-skills/stargazers"><img src="https://img.shields.io/github/stars/Hisn00w/ASu-skills?style=for-the-badge" alt="GitHub Stars"></a>
</div>
<div align="center">
  <a href="README_en.md"><img src="https://img.shields.io/badge/English-README-11A683?style=for-the-badge" alt="English"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87-README-59B390?style=for-the-badge" alt="Chinese"></a>
</div>

## The ASu-style Resume

Type “**I want an ASu-style resume**” and the plugin builds yours. Both AI-assisted and manual editing are supported.

<img src="assets/asu-resume-editor.png" alt="ASu-style resume editor" width="900" />

## A Harness Project Update

ASu is building a Harness project tailored to the job-search journey. We welcome real application cases, skills, and terminal experiences via Issues and PRs.

<img src="assets/harness-update.png" alt="ASu Harness project update" width="560" />

[Check out the ASu Harness project on GitHub](https://github.com/Hisn00w/Asu)

ASu-skills is now a plugin pack. Installing it provides six individually callable entry points:

| Entry          | Purpose                   | Primary deliverables                                              |
| -------------- | ------------------------ | ----------------------------------------------------------------- |
| `/contributor` | Open-source contributions | Finds candidates, shows diffs, submits a PR after your confirmation, and hands the contribution to `/asu` |
| `/asu`         | Experience Sulishing     | Role targeting, project bullet rewrites, evidence of results, HR opener |
| `/resume`      | Resume building          | Editable HTML resume, template replication, PDF export            |
| `/asu-resume`  | ASu-style resume         | Recreates the ASu single-column high-density technical resume, logo assets and PDF |
| `/interview`   | Interview preparation    | Resume-driven interview predictions, follow-up drilling, and mastery review |
| `/offer`       | Fall recruitment tracking | Tracks applications, assessments, interviews, offers, rejections, and recruiting emails |

## First time: where to start

Pick your first entry based on the problem you most need to solve right now:

| Situation | Start with |
| --------- | ---------- |
| No verifiable projects or collaboration experience yet | `/contributor` |
| Have experience, but unsure how to match it to a target role | `/asu` |
| Resume content is settled; need a regular editable resume | `/resume` |
| Want to recreate the ASu-style high-density technical resume | `/asu-resume` |
| Interviews coming up; want to predict questions and drill the weak spots | `/interview` |
| Already applying; need to organize recruiting emails and follow-ups | `/offer` |

You can also combine entries:

- **No internships, want real experience**: use `/contributor` to make role-relevant open-source contributions first, then hand them to `/asu` to turn into verifiable resume statements;
- **Have projects, ready to apply**: use `/asu` to align with the target role first, then `/resume` or `/asu-resume` to generate the resume;
- **Already applying, tracking ongoing progress**: use `/offer` directly to organize emails and statuses; come back to `/asu` and `/resume` whenever the resume needs an update.

## Installation

ASu-skills works with both Codex and Claude Code: the repo root has `.codex-plugin/` for Codex and `.claude-plugin/` for Claude Code, sharing the same `skills/`, `assets/`, and `references/`.

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

If the install summary says `Run /reload-plugins to activate.`, run `/reload-plugins`; otherwise restart Claude Code. After installation, run `claude plugin details asu-skills` to confirm all six skills are loaded.

Update and uninstall:

```text
/plugin marketplace update asu
/plugin uninstall asu-skills
```

Uninstalling the plugin only removes the plugin cache; it never touches the application tracker you have edited in your project or user directory.

### Codex

The easiest way is to send the GitHub link directly to Codex and ask it to install the plugin:

```text
Install the ASu-skills plugin from this GitHub repository and enable the six skills: contributor, asu, resume, asu-resume, interview, offer:
https://github.com/Hisn00w/ASu-skills
```

After installation, start a new Codex conversation so the new skills get reloaded. Then type `/` in the input box and pick `contributor`, `asu`, `resume`, `asu-resume`, `interview`, or `offer` from the command list.

If your Codex version does not surface skills in the `/` menu, you can also use the official explicit invocation syntax:

```text
$contributor Find open-source contribution candidates for my target role; show me the diffs first. I'll confirm before you open the PR, and hand the merged contribution to /asu for Sulishing.
$asu Rewrite my internship experience for an AI application engineer role.
$resume Turn my experience into an editable Chinese HTML resume.(Considering maybe ur not a Manderin speaker,try saying "resume Turn my experience into an editable English HTML resume.")
$asu-resume Recreate the single-column high-density technical resume from the reference image and output an editable HTML.
$interview Predict likely interview questions from my resume and drill me with one follow-up question at a time to check whether I really master these experiences.
$offer Turn these recruiting emails into a fall recruitment application tracker.
```

## Local validation

After modifying SKILL.md, `agents/openai.yaml`, `.codex-plugin/plugin.json`, or adding a new skill, run the static validator to confirm that frontmatter, metadata, and resource references are valid:

```bash
python3 scripts/validate_skills.py
```

The validator checks: that each SKILL.md exists; that its frontmatter parses; that `name` matches the directory name; that `description` is non-empty and not too long; that `agents/openai.yaml` parses; that local references/assets paths cited in SKILL.md exist; and that `.codex-plugin/plugin.json` is valid JSON pointing to resources that actually exist. GitHub Actions runs this validator automatically on PRs that touch `skills/**` and related paths.

Routing regression cases live in `tests/skill-routing-cases.yaml`, recording the expected routing for each job-search entry, as input for future Agent Evals.

## `/contributor`: Make real open-source contributions

You don't need to start by refactoring Kubernetes. `/contributor` finds active projects that match your target company and role, prioritizing typos, punctuation, Markdown, formatting, broken links, and small README fixes. It shows candidates, proposed changes, and verification results first; it only forks, pushes, and opens a PR after you explicitly confirm.

Small changes can still tell a big story: a typo fix is documentation quality governance, a broken-link fix is developer-experience optimization, and touching multiple repositories is a cross-project collaboration loop. Keep the PR itself normal; once merged, hand the real links and data to `/asu` for Sulishing. Anything unmerged simply goes down as “collaborating”.

Typical usage:

```text
/contributor

Target role: AI Application Engineer
Tech stack: TypeScript, React, Python
Weekly availability: 4 hours
Start with 3 small PRs that are easy to merge, then add 1 technical contribution I can expand on in an interview.
```

## `/asu`: Sulish your experience

> **Sulish（酥化）** — a brand term coined from “ASu” + “polish”: reshaping your real experience so it reads sharp, confident, and aligned with your target role — strong positioning, strong evidence, and clear expression. Never fabrication.

Suitable for:

- Re-positioning your experience against a target role;
- Translating low-level work like pages, APIs, and data binding into hiring language;
- Rewriting project bullets, resume summaries, and personal introductions;
- Generating HR openers for LinkedIn or Line;
- Preparing interview follow-up questions, evidence checklists, and the boundary between fact and framing.

For best results, provide the target role, job description, current resume, project descriptions, real responsibilities, and measurable outcomes. When information is missing, the skill drafts what it can and marks the gaps with a `【待补】` (“to be filled in”) placeholder — it never invents titles, companies, tech stacks, or numbers.

Typical usage:

```text
/asu

Target role: AI Application Engineer
Based on my internship and project experience below, give me a steady framing and a bold framing, rewrite the resume bullets, and draft an opener to send to HR.
```

### Example HR opener

<img src="assets/hr-intro-example.jpg" width="360" alt="Example HR opener">

## `/resume`: Build a resume

`/resume` handles the deliverables. It picks a template based on your experience, or replicates the layout from a resume screenshot you upload — and it always produces a genuinely editable HTML, never an image of the original embedded in a page.

Supported:

- 18 Chinese HTML templates;(ask ur agent for a English ver if u like :)
- A4 single- or two-page layout;
- In-browser editing of text, photo, fonts, colors, and bold;
- “Local fonts” reads fonts installed on your system (Chrome 103+, requires browser permission); “Import fonts” loads local font files (TTF/OTF/WOFF/WOFF2) as a supplement;
- Print-to-PDF export;
- Layout analysis from screenshots: columns, spacing, font size, colors, and pagination;
- Fictional placeholder photos by default; swap in your own for the real resume.

Typical usage:

```text
/resume

Using the education, internship, and project experience I provide, pick a template suited to a back-end developer role, generate an editable HTML resume, and tell me how to export it as PDF.
```

### Template preview

![Resume template preview](assets/template-overview.jpg)

## `/asu-resume`: Recreate the ASu-style high-density technical resume

`/asu-resume` recreates the single-column technical resume from the reference image — ideal for new grads, interns, and AI / Agent / LLM roles. You can also trigger the same skill by typing “I want an ASu-style resume”. It first Sulishes your real experience against the target role, then uses the template as a read-only master to generate your own editable HTML. Screenshots are never embedded into the resume, and the template source file is never modified.

The template includes:

- Identity, contact info, public links, and education in the header;
- A reserved photo slot in the top-right; the personal info section uses SVG icons, no emoji;
- Blue section headings, light-gray company bars, and dense project bullets;
- Phone, email, WeChat, identity, education, and Star icons under `assets/icons/`;
- OpenAI, Claude, ByteDance, bilibili, and GitHub SVG logos under `assets/logos/`;
- Continuous A4 two-page layout with in-browser editing and PDF export;
- An HTML toolbar that toggles between `A4 paginated` and `A4 long-page (unlimited height)`; the paginated mode shows paper shadow, while the long-page mode keeps A4 width and centers the content;
- The toolbar's “Local fonts” option reads fonts installed on your system (Chrome 103+, requires browser permission), and “Import fonts” loads local font files (TTF/OTF/WOFF/WOFF2) as a supplement; select text and apply a font from the “Local fonts” group. Imported fonts last for the current session only and must be re-imported after a refresh.

Typical usage:

```text
/asu-resume

Read the resume I provide, recreate the same single-column high-density technical resume as the reference image, and output editable HTML and PDF.
```

When adding new AI, model, platform, or company logos, follow the [LobeHub Icons skill guide](https://lobehub.com/icons/skill.md) and use the SVG/CDN assets from `@lobehub/icons` or `@lobehub/icons-static-svg` — never low-res screenshots or hand-drawn brand icons.

## `/interview`: Stress-test your resume

`/interview` extracts the claims that need verification from your resume and target role, predicts high-probability interview questions, and — asking exactly one question at a time — drills you with follow-up questions to check whether you can clearly explain your individual responsibilities, technical implementation, metric definitions, decision trade-offs, and failure stories. The review flags high-risk wording, knowledge gaps, and resume claims that need more evidence or a softer tone; it never fabricates interview answers for you.

Typical usage:

```text
/interview grill

Here is my resume; my target role is AI Application Engineer. Start from the highest-risk project and ask me one question at a time; if my answer is vague, keep drilling.
```

## `/offer`: Fall recruitment progress management

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

Organize the recruiting emails and screenshots I uploaded into a fall recruitment tracker, merge duplicate applications, and list the next step for each company.
```

### Tracker preview

![Fall recruitment tracker preview](assets/application-tracker-overview.svg)

## How the six entries work together

Recommended order:

1. Use `/contributor` to make real open-source contributions relevant to your target role, and generate an evidence card once the PR merges;
2. Use `/asu` to lock in role targeting from the evidence card and your existing experience, and to polish resume phrasing and HR talking points;
3. Use `/resume` to turn the confirmed copy into an editable resume and export PDF;
4. When you want the ASu-style resume, use `/asu-resume` to generate the same high-density technical resume;
5. Use `/interview` to predict likely questions and verify through follow-up drilling that the resume holds up in interviews;
6. Use `/offer` to record the status of applications, assessments, interviews, and offers.

You can also state a combined goal in a single request, e.g.: “first use `/contributor` to gather the merged PRs, then `/asu` to rewrite the experience, and finally `/resume` to generate an HTML resume”.

When combining multiple entries, when your materials conflict, or when a resume contains strong claims, you can copy [`assets/career-claim-ledger-template.json`](assets/career-claim-ledger-template.json) to set up a claim–evidence ledger. It lets open-source contributions, experience rewrites, and resume files share the same facts, confirmation statuses, and personal boundaries; see [`skills/asu/references/claim-evidence-ledger.md`](skills/asu/references/claim-evidence-ledger.md) for the detailed rules.

To see how one person's materials flow through the entries, read the [end-to-end fictional job-search case](docs/end-to-end-fictional-case.md). Starting from course projects and an open-source contribution, it walks through the evidence card, the experience rewrite, the editable resume, and the application tracker, clearly distinguishing completed, in-progress, and to-be-filled items.

## Truthfulness boundaries

ASu-skills' “Sulishing” means strong positioning, strong evidence, and clear expression — never fabricated experience. Please keep to these rules:

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
├── package.json                 # DSH plugin pack manifest (bundle patch entry)
├── cordis.patch.yml             # Registers the DSH filesystem skill provider
├── lib/
│   └── index.js                 # DSH plugin entry module
├── skills/
│   ├── asu/
│   │   ├── SKILL.md             # /asu experience Sulishing
│   │   └── agents/openai.yaml
│   ├── contributor/
│   │   ├── SKILL.md             # /contributor open-source contributions
│   │   └── agents/openai.yaml
│   ├── resume/
│   │   ├── SKILL.md             # /resume resume building
│   │   └── agents/openai.yaml
│   ├── asu-resume/
│   │   ├── SKILL.md             # /asu-resume ASu-style technical resume
│   │   ├── references/          # Template structure & layout rules
│   │   └── agents/openai.yaml
│   ├── interview/
│   │   ├── SKILL.md             # /interview interview prediction & follow-up drilling
│   │   └── agents/openai.yaml
│   └── offer/
│       ├── SKILL.md             # /offer fall recruitment tracking
│       └── agents/openai.yaml
├── assets/                      # Templates, images, tracker, and example resources
│   ├── asu-resume-template.html # Read-only master for the ASu-style editable resume
│   ├── icons/                   # Personal & general information SVG icons
│   └── logos/                   # LobeHub Icons static SVG logos
├── references/                  # Reference for organizing recruiting emails
├── .github/
│   ├── CONTRIBUTING.md          # Contribution guide & contributor tier table
│   ├── CONTRIBUTING_en.md       # English contribution guide
│   └── PULL_REQUEST_TEMPLATE.md # Pull request template
└── README.md
```

## Contributing

Issues and PRs are welcome. The [contributing guide](.github/CONTRIBUTING_en.md) publishes the contributor-tier conversion table, showing exactly what title a single typo fix can earn you — and when that title stops working.

## Acknowledgments

Thanks to the following Xiaohongshu(Chinese IG) creators for their public sharing and inspiration:

- [**阿酥在coding**](https://xhslink.cn/m/2LHuLJZ30b2): sharing on Coding interview experience;
- [**Hi Mr Lonely**](https://xhslink.cn/m/3kVQDyUJ6of): sharing on resume presentation and job-search communication.

This plugin has organized, structured, and compliance-adjusted the relevant content and turned it into a reusable job-search workflow.

Thanks to [LobeHub/lobe-icons](https://github.com/lobehub/lobe-icons) for the open-source brand icon resources; following its skill guide, this plugin prefers `@lobehub/icons` and static SVG/CDN assets.

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
