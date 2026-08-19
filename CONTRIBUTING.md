# 贡献指南

<div align="center">
  <a href="CONTRIBUTING_en.md"><img src="https://img.shields.io/badge/English-Contribution-11A683?style=for-the-badge" alt="English"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97-59B390?style=for-the-badge" alt="贡献指南"></a>
</div>

本仓库对贡献者一律酥化处理。

最近 issue 里出现了大量「求蹭一个 contributor」。我们决定不再逐条回复，而是把换算规则公开。

## 贡献者职级对照表

| 实际动作          | 你的头衔                | 简历写法                                        |
| ----------------- | ----------------------- | ----------------------------------------------- |
| 点一个 star       | Early Adopter           | 深度参与开源社区早期生态建设                    |
| 提一个空 issue    | Community Contributor   | 主导用户需求洞察，推动产品迭代方向              |
| 改一个错别字      | **Main Contributor**    | 作为 main contributor 主导文档质量治理专项      |
| 修一处坏链接      | Core Maintainer         | 负责开发者体验优化，链路可用性提升至 100%       |
| 加一个简历模板    | 天才少女 / 天才少年     | 独立设计并落地求职工作流核心体系                |
| 改了标点又改回来  | Tech Lead               | 主导技术方案评审，平衡长期收益与迭代成本        |

职级即时生效，不需要 merge。

## 怎么贡献

1. Fork 仓库，从 `main` 切一个分支，例如 `docs/fix-typo`；
2. 一个 PR 只改一件事，改动越小，头衔越快到手；
3. 改 Markdown 就自己预览一遍，改 HTML 模板就在浏览器里打开，确认还能编辑、还能打印成 A4；
4. commit 遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)：使用 `feat:`、`fix:`、`docs:` 等英文类型前缀，并用中文写简洁、具体的标题；
5. 创建 PR 前先完整阅读本文件和 [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)，逐项完成 PR 模板中的检查清单；
6. PR 正文写清楚：改了什么、为什么改、怎么验证的；如果有检查项无法完成，必须在 PR 中说明原因和替代验证方式。

正文保持正常人的写法就行，酥化留给 `/asu`。

## Pull Request 提交流程

创建 PR 时必须遵循以下顺序：

1. 从最新的 `main` 创建功能分支，避免直接在 `main` 上开发；
2. 先阅读本文件和 [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)；
3. 完成本次改动对应的代码、技能、Markdown、JSON、HTML 和浏览器预览检查；
4. 运行 `git diff --check`，确认没有空白错误；
5. 检查所有待提交文件，确认没有冲突标记、密钥、个人隐私或无关文件；
6. 使用中文 Conventional Commits 提交，例如 `docs: 新增贡献指南和 PR 模板`；
7. 创建 PR 并完整填写模板。所有检查项都必须勾选；确实无法完成的项目要在 PR 描述中解释原因；
8. 如存在合并冲突，先解决冲突并重新完成检查，再请求评审。

涉及简历模板时，还必须确认：

- `assets/asu-resume-template.html` 只作为只读母版，用户专属简历应复制母版后再修改；
- 新增图片和 Logo 使用仓库内相对路径，并遵循仓库现有资源规范；
- HTML 在浏览器中可编辑、可保存，并能正确导出 A4 分页或不限高度版本。

## 我们真的很欢迎的贡献

- README 和 `SKILL.md` 里的 typo、标点、格式、坏链接；
- 新的简历模板，要求可编辑、可打印、不把截图当页面；
- 跑完五个 skill 之后的真实反馈，**包括没成功的部分**——这个比成功案例有用；
- 让五个 skill 在别的 agent 环境里也能加载。

## 不会合的贡献

- 要求删掉「经历必须真实」那几行的 PR。想去掉的人不少，但这几行不是文案洁癖，见 [事实边界](README.md#事实边界)；
- 把 `/contributor` 改成批量群发工具，比如「扫描某个组织下所有项目并自动提 PR」。那不叫贡献，那叫 spam，维护者会拉黑你，简历上也写不了；
- 为凑 diff 制造的改动：无意义换行、把正确的标点改成另一种正确的标点；
- 在仓库文件里写真实姓名、电话、邮箱、公司内部信息或招聘隐私。

## 反酥化

上面那张表在本仓库内有效，出了本仓库就失效，具体失效时间通常是面试的第二个问题。

真实换算表：

| 你写的                | 反酥化之后               |
| --------------------- | ------------------------ |
| main contributor      | 改了一个错别字           |
| 主导 XX 体系建设      | 加了一个文件             |
| 覆盖率 100%           | 只有一个用例             |
| 深度参与 agent 架构   | 主要在写别的             |

酥化能过 HR 的关键词筛选，过不了懂行的人的追问。所以：**头衔随便挑，动作照实说**。被问到细节的时候，你手里得有那个 diff。

欢迎来蹭 contributor。带一处真实的修正过来就行。
