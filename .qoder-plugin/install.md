# Qoder 安装入口

本目录提供 Qoder 平台的插件安装说明。ASu-skills 通过根目录 `plugin.json`（技能发现入口）和 `.qoder-plugin/plugin.json`（附加元数据）被 Qoder 识别为插件，九个 skill 会以斜杠命令的形式挂载在对话中。以下两种方式任选其一。

## 前置条件

- 已安装 Qoder
- 方式一需要 `qodercli` 可用（Qoder 自带，位于 `~/.qoder/bin/qodercli/`，若已在 PATH 中可直接调用）
- 方式二无需终端，全部在 Qoder 对话框内完成

## 安装方式

### 方式一：官方 CLI（推荐）

Qoder 自带 `qodercli`，安装时会自动完成注册与启用，无需手动修改任何配置文件。

1. 把本仓库克隆或下载到本地任意目录；
2. 运行安装命令（默认 `user` 全局作用域）：

   ```bash
   qodercli plugin install <仓库本地路径>
   ```

   若 `qodercli` 不在 PATH，可在 `~/.qoder/bin/qodercli/` 下找到；
3. 重启 Qoder 或**新建一个对话**，在输入框输入 `/`，从命令列表选择 `contributor`、`evidence-recap`、`project-guide`、`great-resume`、`make-resume`、`job-match`、`job-apply`、`interview` 或 `offer`。

### 方式二：让 Qoder Agent 安装

适合不想使用终端的用户，通过对话式交互完成安装。

1. 在 Qoder 中新开一个对话，输入：

   ```text
   /create-plugin Help me create a custom plugin: https://github.com/Hisn00w/ASu-skills
   ```

2. 等待 Agent 完成插件包生成后，在对话框继续输入：

   ```text
   注册这个插件
   ```

3. 重启 Qoder，在设置 → 插件中启用 `asu-skills`；
4. 新建对话，输入 `/` 确认九个 skill 均已出现。

## 验证

1. 重启 Qoder 或新建一个对话；
2. 在输入框输入 `/`，确认以下九个命令均可用：
   - `/contributor`、`/evidence-recap`、`/project-guide`
   - `/great-resume`、`/make-resume`、`/job-match`
   - `/job-apply`、`/interview`、`/offer`
3. 任选一个 skill 试用（例如对 Qoder 说「帮我把实习经历酥化一下」），若能正确触发对应技能，即安装成功。

## 卸载

### 方式一安装的卸载

```bash
qodercli plugin uninstall asu-skills
```

### 方式二安装的卸载

删除 `~/.qoder/plugins/` 下的 `asu-skills` 目录，并在 `~/.qoder/plugins/installed_plugins_v2.json` 中移除对应条目。

卸载不会影响你在项目或用户目录里编辑过的求职进度表。

## 常见问题

### 安装后设置里看不到插件

Qoder 对话不会实时刷新插件列表。修改插件配置后，必须**新建对话或重启 Qoder** 才能看到变更。排查问题时请始终用一个新对话验证。

### 仅复制文件到插件目录没有反应

Qoder 不会自动扫描注册第三方插件。仅把文件复制进插件目录**不会**被自动识别，必须通过上述方式之一（CLI 或 Agent）完成注册。

### `qodercli` 不在 PATH

`qodercli` 由 Qoder 自动管理，位于 `~/.qoder/bin/qodercli/`。可以：

- 将该目录加入系统 PATH；
- 或使用完整路径调用：`~/.qoder/bin/qodercli/qodercli.exe plugin install <仓库本地路径>`（Windows）。

## 协议

本安装入口遵循本仓库 MIT License。原技能内容版权归原作者（Hisn00w）所有。
