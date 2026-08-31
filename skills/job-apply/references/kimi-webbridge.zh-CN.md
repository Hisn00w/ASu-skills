# Kimi WebBridge 浏览器连接

`/job-apply` 可以通过官方 Kimi WebBridge 操作用户当前的 Chrome 或 Edge。WebBridge 由浏览器扩展和本机 daemon 组成，daemon 默认监听 `http://127.0.0.1:10086`，再通过 Chrome DevTools Protocol 把导航、点击、填写、截图和上传操作转发到浏览器。

## 用户准备

先从官方页面安装并启用 Kimi WebBridge 浏览器扩展：

<https://www.kimi.com/products/kimi-webbridge>

在官方页面选择“搭配本地 Agent”，根据操作系统执行对应的本地服务安装命令：

### macOS / Linux

```bash
curl -fsSL https://cdn.kimi.com/webbridge/install.sh | bash
```

### Windows PowerShell

```powershell
irm https://cdn.kimi.com/webbridge/install.ps1 | iex
```

安装完成后，用户还需要在 Chrome 或 Edge 中安装并启用 Kimi WebBridge 扩展。不要从第三方页面复制安装脚本；如果官方安装页显示的命令发生变化，以官方页面为准。登录、短信验证、MFA、通行密钥或 CAPTCHA 由用户自行在浏览器中完成。

## 连接检查

在 ASu-skills 仓库根目录执行：

```powershell
node scripts/kimi-webbridge.mjs status
```

需要看到类似结果：

```json
{"running":true,"extension_connected":true}
```

`running: true` 只表示本地服务正在监听；`extension_connected: true` 才表示浏览器扩展已经连上。两者不满足时，不要声称已经可以操作页面。

## 操作协议

所有请求都带同一个任务 session。建议每个职位使用一个稳定的 session 名称，例如 `job-apply-company-role`。Windows 下不要把中文简历内容直接内联在 PowerShell 参数中；将请求写入一次性 JSON 文件，再通过 `--body-file` 发送，避免终端编码和引号转义破坏内容。

```json
{
  "action": "navigate",
  "args": {
    "url": "https://example.com/application",
    "newTab": true,
    "group_title": "简历投递填写"
  },
  "session": "job-apply-company-role"
}
```

```powershell
node scripts/kimi-webbridge.mjs command --body-file "$env:TEMP\asu-webbridge-request.json"
```

请求返回后立即删除临时请求文件。不要把真实简历、联系方式或其他个人资料写进仓库，也不要把返回结果复制到公开日志。

支持的常用动作：

| 动作 | 用途 |
| --- | --- |
| `navigate` | 打开或跳转到申请页面 |
| `find_tab` / `list_tabs` | 找回当前任务的标签页 |
| `snapshot` | 读取页面可见结构和交互元素引用 |
| `click` | 点击可逆按钮或已核对的控件 |
| `fill` | 填写 input、textarea 或富文本框 |
| `upload` | 上传用户确认过的投递副本 |
| `screenshot` | 保存提交前的核对截图 |
| `evaluate` / `cdp` | 仅在普通动作无法完成时使用的高级接口 |

优先使用 `snapshot` 返回的 `@e` 元素引用；只有快照没有提供目标，或确实需要读取属性、滚动和复杂事件时才使用 CSS 选择器或 `evaluate`。`fill` 会替换已有内容，追加内容前必须先读取并核对当前值。

## 投递安全闸门

- 只操作用户明确指定的公司、岗位和网站，一次处理一个职位；
- 先上传简历，再等待解析完成，最后复核身份、教育经历、日期和重复模块；
- 密码、短信验证码、邮箱验证码、MFA、通行密钥和 CAPTCHA 必须由用户完成；
- 不读取 Cookie、令牌、密码管理器或浏览器数据库；
- 默认只填写并保存草稿，停在最终提交按钮前；
- “提交申请”“签署”“同意”“撤回”“付款”等不可逆动作，必须在当前页面、当前职位下再次得到用户明确确认；
- 若页面要求可信事件、跨域 iframe 或人工验证，暂停并让用户接管，不用 `evaluate` 绕过。

如果 WebBridge 不可用，回退到宿主已有的浏览器/computer-use 能力，再回退到隔离的 Playwright 浏览器；不要反复重启或切换用户的日常浏览器配置。
