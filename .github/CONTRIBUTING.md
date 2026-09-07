# 贡献指南

<div align="center">
  <a href="CONTRIBUTING_en.md"><img src="https://img.shields.io/badge/English-Contribution-11A683?style=for-the-badge" alt="English"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97-59B390?style=for-the-badge" alt="贡献指南"></a>
</div>
欢迎通过 Issue 与 Pull Request 参与本项目。为保障协作质量，请在提交变更前阅读并遵循以下指引。

## 关于 Issue

涉及大规模改动时，请先开 Issue 讨论，等待项目维护者确认方案后再提交 PR。以下场景推荐先开 Issue。

- 新增功能、大功能改造、架构改动：先确定维护者态度、是否符合项目定位、实现方案
- 修复不确定 Bug：不确定是否是真正的 Bug、是否为预期行为、修复方案是否合理

## 提交变更

1. Fork 本仓库，并从 `main` 创建独立开发分支，建议以改动内容命名，例如 `docs/fix-typo`；
2. 一个 Pull Request 仅处理一处改动，保持变更聚焦、边界清晰；
3. 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)，使用 `feat:`、`fix:`、`docs:` 等英文类型前缀，并附简洁、具体的中文标题；
4. 创建 Pull Request 前，请完整阅读本文件与 [Pull Request 模板](PULL_REQUEST_TEMPLATE.md)，并逐项完成模板中的检查清单；
5. Pull Request 描述应说明改动内容、变更原因与验证方式；如确有无法完成的检查项，请说明原因并提供替代验证方式。

同时，注意以下非强制但推荐进行的事项：

1. 涉及 SKILL 改动时，请在提交 PR 时额外提交一份包含用户输入和 Agent 回复的对话案例。

## 项目结构说明

- **skill 入口**：以 `skills.registry.json` 作为唯一事实源。
  - 新增、删除或重命名 skill 入口时，先更新根目录 `skills.registry.json`，再运行 `npm run sync:skills` 同步各插件清单、安装脚本、Issue 模板与 README 总览，并确认 `npm run sync:skills --check` 通过；
  - README 中 [第一次使用：从哪个入口开始](../README.md#第一次使用：从哪个入口开始)，仍需手动维护。（后续可能会修）
- **html模板**：`assets\templates-html` 下的模板为设计稿、样式、代码、顶部工具栏分离模式：
  - 设计稿为可直接打开无顶部工具栏的 html 形式；
  - 无依赖的 html 文件需使用内联脚本输出 `node scripts/inline-template.mjs --all dist/templates` 
- **静态校验**：可以参考 CI 流程中的校验流程进行本地校验，或在提交时检查 CI 结果。

## 欢迎的贡献

- README 与 `SKILL.md` 中会影响理解、渲染或链接访问的 typo、标点、格式与坏链接修正；
- 新的简历模板，要求可编辑、可打印、不以截图充当页面；
- 完整运行各 skill 后的真实反馈，包括未成功的部分——此类反馈比成功案例更具价值；
- 让各 skill 在其他 agent 环境中正常加载。

## 不予合并的贡献

- 要求删除「经历必须真实」相关表述的 Pull Request。此类表述并非文案偏好，详见 [事实边界](../README.md#事实边界)；
- 将 `/contributor` 改造为批量群发工具，例如「扫描某组织下所有项目并自动提 Pull Request」。此类改动不属贡献，而属批量骚扰，维护者将予拉黑，亦无法写入简历；
- 仅为扩充 diff 而制造的改动：无意义换行、将正确标点替换为另一种正确标点，详见 [禁止无实质内容的提交](#禁止无实质内容的提交)；
- 在仓库文件中写入真实姓名、电话、邮箱、公司内部信息或招聘隐私。

## 禁止无实质内容的提交

本项目不接受仅为产生 diff 或“刷贡献记录”的无效提交。除非改动修复了明确的问题、满足渲染或格式规范，或与同一 Pull Request 中的功能改动直接相关，否则禁止：

- 仅把正确标点替换成另一种正确标点；
- 仅删除或添加空格、空行、换行、缩进；
- 仅调整不影响内容和渲染结果的排版；
- 通过机械化批量替换制造大量无关改动。

如果确实发现标点、空格或格式问题，请在 Pull Request 中说明复现位置、实际影响和验证方式；没有明确影响的微小改动不要单独提交。