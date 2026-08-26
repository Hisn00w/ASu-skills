# OpenCode 安装指南

## 方法 1：自动安装（推荐）

```bash
# 克隆仓库
git clone https://github.com/Hisn00w/ASu-skills.git
cd ASu-skills

# 运行安装脚本
python scripts/install-opencode.py
```

## 方法 2：手动安装

```bash
# 1. 克隆仓库
git clone https://github.com/Hisn00w/ASu-skills.git

# 2. 复制 skills 到 OpenCode 目录
# Windows
xcopy /E /I skills\* E:\Cache\skills\

# macOS / Linux
cp -r skills/* ~/.config/opencode/skills/

# 3. 重启 OpenCode 或执行 /reload-plugins
```

## 方法 3：通过 OpenCode 插件管理器（如果支持）

```bash
# 在 OpenCode 中执行
/plugin install Hisn00w/ASu-skills
```

## 使用方式

安装后，可通过以下方式触发：

| 用户意图 | 触发词 |
|---------|--------|
| 经历酥化 | /asu、我要酥化、改写经历 |
| 简历制作 | /resume、做简历、同款简历 |
| 面试准备 | /interview、面试预测、模拟面试 |
| 求职进度 | /offer、秋招进度 |
| 开源贡献 | /contributor、找 PR 机会 |
| 同款简历 | /asu-resume、阿酥同款简历 |

## 注意事项

- OpenCode skills 目录默认在 `E:\Cache\skills\`（Windows）或 `~/.config/opencode/skills/`（macOS/Linux）
- 安装后需重启 OpenCode 或执行 `/reload-plugins`
- 每个 skill 需要在 OpenCode 中配置触发词才能通过 `/` 菜单调用