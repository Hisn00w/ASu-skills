# ASu 简历模板源文件

本目录维护 `assets/asu-resume-template.html` 的解耦源文件：

- `template.html`：简历内容与结构；
- `frame/base.css`：页面及打印样式；
- `frame/toolbar.html`：顶部工具栏；
- `frame/editor.js`：编辑、保存、照片与字体功能。

`assets/asu-resume-template.html` 仍是 `/make-resume` 默认使用的自包含只读母版。修改本目录后运行：

```bash
npm run build:asu-resume
npm run check:asu-resume
```

生成过程是确定性的；检查命令会阻止源文件和母版发生漂移。复杂的单双页选择逻辑仍保留现状，不在本次解耦中扩展。
