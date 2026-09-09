# ASu 简历模板源文件

本目录只维护 `assets/asu-resume-template.html` 的内容与版式壳文件。通用功能外框与 `assets/templates-html/` 的模板在同一目录维护，避免两套工具栏和编辑逻辑发生功能漂移：

- `template.html`：简历内容与结构；
- `../templates-html/frame/asu/base.css`：页面及打印样式；
- `../templates-html/frame/asu/toolbar.html`：顶部工具栏；
- `../templates-html/frame/asu/editor.js`：编辑、保存、照片与字体功能。

`/make-resume` 的 Agent 只读取并改写本目录的 `template.html` 内容壳；不得读取或修改 `frame/` 下的工具栏、脚本和样式。构建脚本负责将共享外框内联到交付母版。

`assets/asu-resume-template.html` 仍是 `/make-resume` 默认使用的自包含只读母版。修改本目录后运行：

```bash
npm run build:asu-resume
npm run check:asu-resume
```

生成过程是确定性的；检查命令会阻止源文件和母版发生漂移。复杂的单双页选择逻辑仍保留现状，不在本次解耦中扩展。
