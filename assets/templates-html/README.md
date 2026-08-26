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
  01-大厂极简简历模板.html   # …18 个壳文件：设计稿，无 toolbar / script
  README.md
```

每个壳文件本质是 `{ title, bodyClass, content }` 三元组 + 一份 100% 共享的外框：

- body class 追加了 `design-preview`：壳文件没有固定定位 toolbar，该规则把顶部预留的 76px 灰色边距归小，纯观感处理；
- 壳文件**不带** toolbar 与 editor.js——没有编辑按钮，脚本无意义，直接浏览器打开即看页面布局。

## 交付必须走 inline 脚本

用户拿到的 `.html` 必须**自包含**（可单独打开、离线、打印、导出 PDF），解耦只发生在源码侧。

```bash
node scripts/inline-template.mjs assets/templates-html/01-大厂极简简历模板.html out.html
# 或一次性内联全部壳文件
node scripts/inline-template.mjs --all dist/templates
# 或回归校验：内联产物与历史基准逐字节相等
node scripts/inline-template.mjs --check <基准目录>
```

inline 脚本会把 `frame/base.css` 内联进 `<head>`、注入 `frame/toolbar.html` 与 `frame/editor.js`、移除 `design-preview` 类，产物与重构前**逐字节等价**。

**注意**：壳文件拷出仓库会断链（缺 `frame/`）。请始终交付 inline 之后的文件，不要把壳文件直接交给用户。

## 加第 19 套

复制任意壳文件 → 改 `<title>`、body class、`<main>` 内容（如需要再在 `frame/base.css` 加新的 `variant-*` 艺术规则）→ 浏览器直接打开预览。不需要任何构建步骤。
