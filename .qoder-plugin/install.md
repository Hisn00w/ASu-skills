# Qoder 安装入口

本目录提供 Qoder 平台的插件安装说明。ASu-skills 通过 `.qoder-plugin/plugin.json` 清单被 Qoder IDE 识别为插件，九个 skill 会以斜杠命令的形式挂载在对话中。以下两种方式任选其一。

## 前置条件

- 已安装 Qoder
- 方式一需要 `qodercli` 可用（部分版本随附于 `~/.qoder/bin/qodercli/`；该目录下没有可执行文件时，说明当前版本未随附 CLI，请改用方式二）
- 方式二无需终端，全部在 Qoder 对话框内完成

## 安装方式

### 方式一：官方 CLI（推荐）

当前版本随附 `qodercli` 时，安装会自动完成注册与启用，无需手动修改任何配置文件。

1. 把本仓库克隆或下载到本地任意目录；
2. 运行安装命令（默认 `user` 全局作用域）：

   ```bash
   qodercli plugin install <仓库本地路径>
   ```

   若 `qodercli` 不在 PATH，可在 `~/.qoder/bin/qodercli/` 下找到；该目录不存在时说明当前版本未随附 CLI，请改走方式二；
3. 重启 Qoder 或**新建一个对话**，在输入框输入 `/`，从命令列表选择 `contributor`、`evidence-recap`、`project-guide`、`great-resume`、`make-resume`、`job-match`、`job-apply`、`interview` 或 `offer`。

### 方式二：让 Qoder Agent 安装

适合不想使用终端的用户，通过对话式交互完成安装。

1. 在 Qoder 中新开一个对话，输入：

   ```text
   请把 https://github.com/Hisn00w/ASu-skills 安装为 Qoder 本地插件：仓库放到 ~/.qoder/plugins/asu-skills，按 .qoder-plugin/install.md 里「手动注册的关键字段」完成市场注册与启用，然后新建对话验证九个入口是否可用；不可用时把最新运行日志中的 InstalledPlugins 与 StartupCheck 行贴回来。
   ```

2. 等待 Agent 完成插件安装；
3. 重启 Qoder，到设置中开启插件，返回对话，输入 `/` 确认九个 skill 均已出现。

#### 手动注册的关键字段

Qoder 会在校验后**静默丢弃**不合法的注册条目，不弹任何错误，因此以下三点必须逐字对齐：

- 插件 ID 必须是 `<插件名>@<市场名>`，即 `asu-skills@asu`（市场名取自本仓库自带的 `.claude-plugin/marketplace.json`，其 `name` 为 `asu`，插件 `source` 为 `./`）。写成裸名 `asu-skills` 会被判为 invalid entry 整条丢弃；
- 市场需要先注册：`~/.qoder/settings.json` 的 `extraKnownMarketplaces` 中加一条 `asu`，`source.path` 使用**绝对路径**；
- `installed_plugins_v2.json` 与 `settings.json` 中的键名必须一致，均为 `asu-skills@asu`。

```jsonc
// ~/.qoder/settings.json
{
  "enabledPlugins": {
    "asu-skills@asu": true
  },
  "extraKnownMarketplaces": {
    "asu": {
      "source": {
        "source": "directory",
        "path": "/ABSOLUTE/PATH/TO/.qoder/plugins/asu-skills"
      }
    }
  }
}
```

```jsonc
// ~/.qoder/plugins/installed_plugins_v2.json（片段）
{
  "version": 2,
  "plugins": {
    "asu-skills@asu": [
      {
        "scope": "user",
        "installPath": "/ABSOLUTE/PATH/TO/.qoder/plugins/asu-skills",
        "version": "0.4.0"
      }
    ]
  }
}
```

首次新建对话时，Qoder 会自动生成 `~/.qoder/plugins/known_marketplaces.json` 与 `~/.qoder/plugins/marketplaces/asu/`（市场清单的镜像副本），无需手工创建；技能实际仍从上表的 `installPath` 加载，因此更新插件时覆盖该目录即可。

## 验证

1. 重启 Qoder 或新建一个对话；
2. 在输入框输入 `/`，确认以下九个命令均可用：
   - `/contributor`、`/evidence-recap`、`/project-guide`
   - `/great-resume`、`/make-resume`、`/job-match`
   - `/job-apply`、`/interview`、`/offer`
3. 任选一个 skill 试用（例如对 Qoder 说「帮我把实习经历酥化一下」），若能正确触发对应技能，即安装成功。
4. 若第 2 步一个入口都看不到，说明注册条目被静默丢弃，转「常见问题 · 按说明注册后仍看不到九个入口」用启动日志定位。

## 卸载

### 方式一安装的卸载

```bash
qodercli plugin uninstall asu-skills
```

### 方式二安装的卸载

删除 `~/.qoder/plugins/` 下的 `asu-skills` 目录，并在 `~/.qoder/plugins/installed_plugins_v2.json` 中移除 `"asu-skills@asu"` 条目、在 `~/.qoder/settings.json` 中移除 `enabledPlugins` 与 `extraKnownMarketplaces` 里的对应项；`~/.qoder/plugins/marketplaces/asu/` 与 `known_marketplaces.json` 中的 `asu` 条目由 Qoder 生成，可一并删除。

卸载不会影响你在项目或用户目录里编辑过的求职进度表。

## 常见问题

### 安装后设置里看不到插件

Qoder 对话不会实时刷新插件列表。修改插件配置后，必须**新建对话或重启 Qoder** 才能看到变更。排查问题时请始终用一个新对话验证。若新对话后仍然看不到，转下一条「按说明注册后仍看不到九个入口」用启动日志确认条目是否被静默丢弃。

### 按说明注册后仍看不到九个入口

Qoder 对注册表是「校验失败即静默丢弃」，界面和对话都不会报错。用**新建的**对话所在那一次运行的日志确认：

```bash
grep -E "InstalledPlugins|StartupCheck" ~/.qoder/logs/runs/$(ls -1t ~/.qoder/logs/runs | head -1)/qodercli.log
```

- `V2 file has 1 invalid entry (asu-skills)` → 键名写成了裸名，改成 `asu-skills@asu`；
- `Ignoring enabled plugin intent "asu-skills@asu" because it is not resolvable from a registered marketplace` → 市场没注册成功，核对 `extraKnownMarketplaces` 的键是否与市场清单里的 `name`（`asu`）一致、`path` 是否为绝对路径且真实存在；
- 两行都不出现、且日志里 `plugin_missing=0`，即为注册成功。

### 仅复制文件到插件目录没有反应

Qoder 不会自动扫描注册第三方插件。仅把文件复制进插件目录**不会**被自动识别，必须通过上述方式之一（CLI 或 Agent）完成注册。

### `qodercli` 不在 PATH

`qodercli` 由 Qoder 自动管理，位于 `~/.qoder/bin/qodercli/`。可以：

- 将该目录加入系统 PATH；
- 或使用完整路径调用：`~/.qoder/bin/qodercli/qodercli.exe plugin install <仓库本地路径>`（Windows）。

## 协议

本安装入口遵循本仓库 MIT License。原技能内容版权归原作者（Hisn00w）所有。
