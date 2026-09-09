# templates-html 说明

本目录是 18 套内置简历模板的**源材料**，不是交付物。

自「外框解耦」重构起，每套模板从「自包含 HTML」降级为**纯设计稿壳文件**：只保留 `title`、body class 与 `<main>` 简历内容，外框（`<style>` / 顶部工具栏 / `<script>`）统一抽到共享 `frame/`。改一次外框，18 套全部生效。

## 目录结构

```
assets/templates-html/
  frame/
    base.css       # 共享样式（含全部 variant-* 与 print 规则），壳文件通过 <link> 引用
    toolbar.html   # 顶部工具栏（唯一来源）
    editor.js      # 共享编辑脚本
    toolbar.css    # 共享工具栏样式
    asu/           # ASu 版式及页面模式、自动保存、重置扩展，不重复公共功能
  01-大厂极简简历模板.html   # …18 个壳文件：设计稿，无 toolbar / script
  README.md
```

每个壳文件本质是 `{ title, bodyClass, content }` 三元组 + 一份 100% 共享的外框：

- body class 追加了 `design-preview`：壳文件没有固定定位 toolbar，该规则把顶部预留的 76px 灰色边距归小，纯观感处理；
- 壳文件**不带** toolbar 与 editor.js——没有编辑按钮，脚本无意义，直接浏览器打开即看页面布局。

ASu 默认模板也使用同一份 `frame/toolbar.html`、`toolbar.css` 和 `editor.js`。`../asu-resume/template.html` 保存简历内容，`frame/asu/` 只保存版式与特有扩展。公共功能修改一次，两个构建脚本都会带入更新。修改后运行 `npm run build:asu-resume`，不要直接编辑 `../asu-resume-template.html`。

## 交付必须走 inline 脚本

用户拿到的 `.html` 必须**自包含**（可单独打开、离线、打印、导出 PDF），解耦只发生在源码侧。

```bash
node scripts/inline-template.mjs assets/templates-html/01-大厂极简简历模板.html out.html
# 或一次性内联全部壳文件
node scripts/inline-template.mjs --all dist/templates
```

inline 脚本会把 `frame/base.css` 与 `toolbar.css` 内联进 `<head>`、注入 `frame/toolbar.html` 与 `frame/editor.js`、移除 `design-preview` 类。外框始终从仓库读取，支持放在用户目录中的内容壳副本。内联是确定性的，公共功能更新会改变产物，不再要求与历史产物逐字节等价。[scripts/validate_skills.py](../../scripts/validate_skills.py) 校验结构完整性；Node 回归测试检查 19 套模板共用同一编辑器及用户副本组装。

**注意**：壳文件拷出仓库会断链（缺 `frame/`）。请始终交付 inline 之后的文件，不要把壳文件直接交给用户。

## 加第 19 套

复制任意壳文件 → 改 `<title>`、body class、`<main>` 内容（如需要再在 `frame/base.css` 加新的 `variant-*` 艺术规则）→ 浏览器直接打开预览。不需要任何构建步骤。
