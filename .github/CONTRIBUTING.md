# 贡献指南

<div align="center">
  <a href="CONTRIBUTING_en.md"><img src="https://img.shields.io/badge/English-Contribution-11A683?style=for-the-badge" alt="English"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97-59B390?style=for-the-badge" alt="贡献指南"></a>
</div>

欢迎通过 Issue 与 Pull Request 参与本项目。为保障协作质量，请在提交变更前阅读并遵循以下指引。

## 提交变更

1. Fork 本仓库，并从 `main` 创建独立开发分支，建议以改动内容命名，例如 `docs/fix-typo`；
2. 一个 Pull Request 仅处理一处改动，保持变更聚焦、边界清晰；
3. 提交前请完成相应的自检：
   - Markdown 改动在本地渲染预览；
   - HTML 模板在浏览器中打开，确认可编辑、可保存，并可导出 A4；
   - 涉及 `SKILL.md`、`agents/openai.yaml`、插件清单或新增 skill 时，在仓库根目录运行 `python3 scripts/validate_skills.py`，确认 frontmatter、元数据与资源引用校验通过；
4. 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)，使用 `feat:`、`fix:`、`docs:` 等英文类型前缀，并附简洁、具体的中文标题；
5. 创建 Pull Request 前，请完整阅读本文件与 [`PULL_REQUEST_TEMPLATE.md`](PULL_REQUEST_TEMPLATE.md)，并逐项完成模板中的检查清单；
6. Pull Request 描述应说明改动内容、变更原因与验证方式；如确有无法完成的检查项，请说明原因并提供替代验证方式。

## 本地校验

修改 `SKILL.md`、`agents/openai.yaml`、插件清单或新增 skill 后，请在仓库根目录运行静态校验器：

```bash
python3 scripts/validate_skills.py
```

校验内容包括：`SKILL.md` 是否存在、frontmatter 是否可解析、`name` 是否与目录名一致、`description` 是否非空且不过长、`agents/openai.yaml` 是否可解析、`SKILL.md` 引用的本地 `references/assets` 路径是否存在，以及 Codex、TraeWork、Claude Code、OpenCode 插件清单是否为合法 JSON 并覆盖必要入口。GitHub Actions 会在涉及 `skills/**` 等路径的 Pull Request 上自动运行该校验。

路由回归用例存放在 `tests/skill-routing-cases.yaml`，记录各求职入口的预期路由，由 GitHub Actions 执行不调用 LLM 的确定性 schema 校验。校验会检查 YAML 结构、用例字段、重复 prompt，以及 `expected` 是否对应 `skills/` 下的实际目录；它不判断 prompt 的语义路由结果。

## Pull Request 提交流程

创建 Pull Request 时请遵循以下顺序：

1. 从最新的 `main` 创建功能分支，避免在 `main` 上直接开发；
2. 先阅读本文件与 [`PULL_REQUEST_TEMPLATE.md`](PULL_REQUEST_TEMPLATE.md)；
3. 完成本次改动对应的代码、技能、Markdown、JSON、HTML 及浏览器预览检查；
4. 运行 `git diff --check`，确认无空白错误；
5. 检查所有待提交文件，确认无冲突标记、密钥、个人隐私或无关文件；
6. 使用中文 Conventional Commits 提交，例如 `docs: 新增贡献指南和 PR 模板`；
7. 创建 Pull Request 并完整填写模板，所有检查项均需勾选；确有无法完成的项目需在描述中说明原因；
8. 如存在合并冲突，请先解决冲突并重新完成检查，再请求评审。

涉及简历模板时，还需确认：

- `assets/asu-resume-template.html` 仅作为只读母版，用户专属简历应复制母版后再修改；
- 新增图片与 Logo 使用仓库内相对路径，并遵循仓库现有资源规范；
- HTML 在浏览器中可编辑、可保存，并能正确导出 A4 分页或不限高度版本。

## 欢迎的贡献

- README 与 `SKILL.md` 中的 typo、标点、格式与坏链接修正；
- 新的简历模板，要求可编辑、可打印、不以截图充当页面；
- 完整运行各 skill 后的真实反馈，包括未成功的部分——此类反馈比成功案例更具价值；
- 让各 skill 在其他 agent 环境中正常加载。

## 不予合并的贡献

- 要求删除「经历必须真实」相关表述的 Pull Request。此类表述并非文案偏好，详见 [事实边界](../README.md#事实边界)；
- 将 `/contributor` 改造为批量群发工具，例如「扫描某组织下所有项目并自动提 Pull Request」。此类改动不属贡献，而属批量骚扰，维护者将予拉黑，亦无法写入简历；
- 仅为扩充 diff 而制造的改动：无意义换行、将正确标点替换为另一种正确标点；
- 在仓库文件中写入真实姓名、电话、邮箱、公司内部信息或招聘隐私。
