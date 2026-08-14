# ASu-skills 协作规范

## 项目说明

ASu-skills 是中文求职工作流插件，包含开源贡献、经历酥化、简历制作、同款简历复刻和秋招进度管理等入口。

## 修改规则

- 修改前先检查当前分支、工作区状态和远程更新。
- `assets/asu-resume-template.html` 是同款简历只读母版。生成用户专属简历时复制模板，不直接修改母版。
- README 中的图片使用仓库内相对路径，图片资源放在 `assets/` 下。
- 品牌 Logo 优先使用 `@lobehub/icons` 或 `@lobehub/icons-static-svg` 的 SVG，不自行绘制或使用低清截图。
- 修改后检查 Markdown 冲突标记、路径、JSON 格式和相关技能的可用性。
- 合并远程更新时保留双方有效内容；解决冲突后再提交合并结果。

## 提交规范

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)：

```text
<type>: <中文简短标题>
```

常用类型：

- `feat:` 新增功能或资源；
- `fix:` 修复问题；
- `docs:` 修改 README、规范或其他文档；
- `refactor:` 重构代码或目录，不改变功能；
- `chore:` 构建、依赖或维护性修改；
- `test:` 新增或修改测试。

标题使用中文、简洁明确，并说明具体改动和原因。例如：

```text
docs: 新增仓库协作与提交规范说明
feat: 新增可编辑同款简历模板
fix: 修复模板自动保存覆盖新内容
```

## 提交前检查

```powershell
git diff --check
git status --short
```

涉及技能修改时，运行对应的技能校验；涉及 HTML 模板时，至少进行一次浏览器预览，确认布局、资源路径和分页效果。
