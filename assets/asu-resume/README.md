# ASu 简历内容壳

`template.html` 只保留简历内容与结构。ASu 与 18 套模板共同使用 `../templates-html/frame/toolbar.html`、`toolbar.css` 和 `editor.js`，字体、格式编辑、照片、保存 HTML 和打印功能只有一份实现。

`../templates-html/frame/asu/base.css` 保留 ASu 版式；`asu/toolbar.html` 仅补充页面模式、历史、字号、重置及状态控件；`asu/editor.js` 仅处理已有的页面模式、自动保存和重置。复杂单双页选择逻辑不扩展。

制作简历时，Agent 只读取内容壳，并在用户目录创建和修改副本，不读取外框代码。组装用户副本：

```bash
node scripts/build-asu-resume.mjs user-content.html user-resume.html
```

脚本从仓库读取共享外框，不依赖用户目录中的 `frame/`。图片仍按输出 HTML 的相对路径引用，需同时交付对应的 `icons/`、`logos/` 或用户照片。不得覆盖仓库内容壳或母版。

维护模板或公共功能后重新生成仓库母版并校验：

```bash
npm run build:asu-resume
npm run check:asu-resume
```

生成过程确定性一致，但公共功能更新会改变生成产物，不再要求与重构前逐字节相等。回归测试检查所有模板内联同一编辑器，并验证用户副本组装不修改母版。
