# ASu-skills

<div align="center">
  <img src="assets/asu-circle.png" width="180" height="180" alt="ASu-skills 图标">
  <h3>中文简历包装与 HR 开场自我介绍技能</h3>
  <p>把零散经历整理成清晰、有证据、匹配岗位的求职表达。</p>
</div>

## 技能简介

ASu-skills 用于简历包装、项目经历改写、岗位定位，以及 Boss 直聘和微信场景下的 HR 开场自我介绍。

它会帮助你：

- 提炼一句话职业定位和目标岗位标签；
- 将基础工作翻译成清晰的系统能力和业务价值；
- 强化项目复杂度、个人贡献和成果证据；
- 生成简历摘要、项目要点和 HR 开场白；
- 处理面试压力、岗位标签、跨公司经历和 AI 辅助开发的表达；
- 用“主张—证据—范围—风险”审计包装内容，避免无依据夸大。

## 调用方式

在 Codex 中使用：

```text
我要酥化
```

也可以显式调用技能：

```text
使用 $asu-skills，根据我的经历和目标岗位，帮我包装简历并写一段发给 HR 的中文自我介绍。
```

提供以下信息，效果会更好：

1. 目标岗位或岗位描述；
2. 当前简历、项目经历或作品集；
3. 真实职责、成果数据和个人贡献；
4. 求职渠道和期望语气。

## 安装教程

GitHub 仓库：[https://github.com/Hisn00w/ASu-skills](https://github.com/Hisn00w/ASu-skills)

### 方法一：从 GitHub 克隆安装（推荐）

确保电脑已安装 Git，然后在 PowerShell 中执行：

```powershell
$skillTarget = "C:\Users\你的用户名\.codex\skills\asu-skills"

New-Item -ItemType Directory -Force -Path (Split-Path $skillTarget) | Out-Null
git clone https://github.com/Hisn00w/ASu-skills.git $skillTarget
```

当前 Windows 用户可以直接使用：

```powershell
$skillTarget = "C:\Users\Hisn0w\.codex\skills\asu-skills"

New-Item -ItemType Directory -Force -Path (Split-Path $skillTarget) | Out-Null
git clone https://github.com/Hisn00w/ASu-skills.git $skillTarget
```

如果目标目录已经存在并且本身就是 Git 仓库，不要重复 `clone`，改用更新命令：

```powershell
$skillTarget = "C:\Users\你的用户名\.codex\skills\asu-skills"
git -C $skillTarget pull
```

### 方法二：下载 ZIP 或手动复制

从 GitHub 仓库选择 **Code → Download ZIP**，解压后将整个 `asu-skills` 文件夹放入 Codex 的个人技能目录：

```text
C:\Users\你的用户名\.codex\skills\asu-skills
```

确保技能根目录直接包含以下文件和目录，避免多嵌套一层：

```text
asu-skills/
├── SKILL.md
├── README.md
├── agents/openai.yaml
└── assets/
```

### 方法三：PowerShell 复制本地文件夹

如果技能文件夹已经下载到本地，可以执行：

```powershell
$skillSource = "C:\你的路径\asu-skills"
$skillTarget = "C:\Users\你的用户名\.codex\skills\asu-skills"

New-Item -ItemType Directory -Force -Path (Split-Path $skillTarget) | Out-Null
Copy-Item -LiteralPath $skillSource -Destination $skillTarget -Recurse -Force
```

### 安装后验证

1. 关闭并重新打开 Codex，或新建一个对话，让技能列表重新加载；
2. 确认以下文件存在：

   ```text
   C:\Users\你的用户名\.codex\skills\asu-skills\SKILL.md
   C:\Users\你的用户名\.codex\skills\asu-skills\agents\openai.yaml
   C:\Users\你的用户名\.codex\skills\asu-skills\assets\asu-circle.png
   ```
3. 在 Codex 中输入以下任意一种方式：

   ```text
   使用 $asu-skills，帮我把下面这段经历包装成适合发给 HR 的中文自我介绍。
   ```

   或者：

   ```text
   我要酥化
   ```

如果技能没有被识别，优先检查文件夹是否多嵌套了一层，例如是否误放成了 `asu-skills\asu-skills\SKILL.md`，然后重新启动 Codex。

## 默认输出

1. 一句话职业定位；
2. 简历顶部摘要；
3. 项目经历改写；
4. Boss 直聘 / 微信 HR 开场白；
5. 证据补强清单；
6. HR 可能追问。

## 参考示例

下面是 Boss 直聘场景下的 HR 开场自我介绍示例。使用时应替换为自己的真实经历、职责和成果，不要直接照搬其中的身份、公司、项目或数据。

<div align="center">
  <img src="assets/hr-intro-example.jpg" width="360" alt="Boss 直聘 HR 开场自我介绍示例">
</div>

## 表达边界

ASu-skills 强调“强表达”，但不伪造 title、学校、公司、项目归属、技术栈、数据或管理权限。可以校准岗位标签、突出真实职责、补充可验证证据，但不能把参与写成独立负责，也不能把 AI 生成的代码冒领为未经验证的个人成果。

## 文件结构

```text
asu-skills/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
└── assets/
    ├── asu.png          # 原始技能图片
    ├── asu-circle.png   # 圆形透明背景图标
    └── hr-intro-example.jpg # Boss 直聘开场示例图
```

## 致谢

感谢小红书博主 [**Hi Mr Lonely**](https://xhslink.cn/m/3kVQDyUJ6of) 的公开分享与启发。本技能对相关内容进行了整理、结构化和合规化改写，用于形成可复用的求职表达工作流。
