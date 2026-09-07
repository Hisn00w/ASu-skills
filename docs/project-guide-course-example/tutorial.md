# project_guide.py 源码课程

## 学习范围与源码基线

ASu-skills 是中文求职工作流插件。本次只学习标准库命令行脚本 [scripts/project_guide.py](../../scripts/project_guide.py)：它提供材料检查和提示词拼装，不调用模型，也不直接写入导学、面经或课程文件。

- 源码版本：`14a2b199b52bc2365a8ec43803380f5840d90a93`，当前为 detached HEAD。开始时工作区无已有改动，根目录不存在 `tutorial.md`、`practice.md`。
- 远程核对：已尝试读取远程引用；GitHub 连接失败，无法确认远程是否有更新。本文以本地源码为准。
- 前置基础：Python 函数调用、条件判断、列表、dataclass；知道命令行参数、标准输入、标准输出、标准错误和进程退出码的区别。
- 覆盖范围：两课大纲分别覆盖 `check` 和 `build-prompt`；本次只展开第 1 课，并在 [practice.md](practice.md) 提供第 1 课理解题。
- 尚未展开：第 2 课的 JSON 输入、简称校验和提示词拼装；不覆盖其他脚本、技能执行器、简历模板或整个插件运行机制。
- 下述调用均为同步调用。`args.func` 的运行目标有 `set_defaults` 注册证据，不涉及异步事件或后台任务。

## 两课课程大纲

### 第 1 课：一次 check 如何从描述输入走到检查结果

状态：已展开；以下保留课程大纲与阅读路线，随后给出本课讲解。

读完能回答：描述从哪里读取，什么决定 `ok`，检查不通过时用户会看到什么，退出码又是什么？

主链：CLI `check` → `__main__` → `main` → `build_parser` 注册处理函数 → `parse_args` → `args.func(args)` / `command_check` → `read_description` → 空输入提前返回，或 `analyze_input` → `has_any_keyword` → `CheckResult` → 文本或 JSON 输出 → 返回码 → `SystemExit`。

必读路径均在 [scripts/project_guide.py](../../scripts/project_guide.py)，按运行顺序阅读：

1. `__main__`、`main`、`build_parser`、`add_common_input_args`：输入命令行，注册 `command_check` 并解析为 Namespace，下一步由 `args.func(args)` 分派，输出处理函数返回码。
2. `command_check` → `read_description`：输入 Namespace，按文件、直接参数、stdin 的顺序选择来源，输出去除首尾空白的描述；空描述结束，否则进入分析。
3. `analyze_input` → `has_any_keyword` → `CheckResult`：输入描述和可选技术栈、岗位，累积缺项、建议和备注，返回检查对象供输出层使用。
4. 返回 `command_check`：输入检查对象，按 `args.json` 分支输出 JSON 或文本，返回 `0`；入口将返回码交给 `SystemExit`。

选读验证：[tests/test_project_guide.py](../../tests/test_project_guide.py) 中 `test_analyze_short_description_requires_more_input`、`test_analyze_complete_description_has_note`、`test_main_check_prints_json_output`。

暂缓阅读：`command_build_prompt`、`load_json`、`read_json_text`、`validate_short_name`、`build_prompt`、`escape_markdown_fences`，归第 2 课。

#### 1.1 场景与入口：检查一段项目描述

假设用户执行 `python scripts/project_guide.py check -d "太短了" --json`，想知道材料还缺什么。本课要追到 JSON 输出与进程结束，并理解“材料不足”和“命令执行失败”的区别。stdout 承载正常结果，stderr 承载错误提示；退出码是另一条独立信号。

按上方主链先读脚本底部（`main` 从第 310 行开始）。直接执行文件会进入 `if __name__ == "__main__"`，求值 `main()`，再用它的结果构造 `SystemExit`。仅导入模块不会执行这个入口。

`main` 先调用 `build_parser()`，再执行 `parser.parse_args(argv)`，最后 `return args.func(args)`。默认 `argv=None` 时 argparse 读取进程命令行；测试可直接传入参数列表。

`build_parser`（第 289 行）要求必须选择子命令。它为 `check` 调用 `add_common_input_args` 注册描述、文件、技术栈、岗位参数，再注册 `--json`。这里的关键绑定是：

```python
check_parser.set_defaults(func=command_check)
```

因此 `args.func(args)` 在此场景中同步调用 `command_check(args)`，并非按字符串猜测函数名。缺少子命令或传入非法参数时，argparse 会在分派前报错并退出；常规解析错误退出码为 `2`，不会进入描述分析。

#### 1.2 读取描述：选择来源后才检查内容

`command_check`（第 216 行）的第一步是 `read_description(args)`（第 208 行）。它按下列顺序检查参数的真值，命中一个来源就返回：

| 条件 | 读取动作 | 返回内容 |
| --- | --- | --- |
| `args.file` 为真 | `Path(args.file).read_text(encoding="utf-8")` | 文件全文经 `strip()` 后的字符串 |
| 否则 `args.description` 为真 | 读取参数字符串 | 参数经 `strip()` 后的字符串 |
| 两者均不为真 | `sys.stdin.read()`，读到 EOF | stdin 经 `strip()` 后的字符串 |

它没有将 `--file` 和 `-d` 配置成互斥参数；两者同时存在时文件优先。优先来源读出空白后直接返回空字符串，不会尝试下一个来源。特别地，`-d "   "` 在 strip 前为真，因此走参数分支，strip 后才变空；显式空字符串在分支判断时为假，可能转而读取 stdin。交互运行而没有其他来源时，stdin 会等待读入结束。

读完回到 `command_check`：如果描述为空，向 stderr 打印 `Error: empty description. Use -d, --file, or pipe text.`，返回 `1`，不调用 `analyze_input`。即便指定了 `--json`，此处也不会产生 JSON。

文件读取不在 `try/except` 内。路径不存在、没有读取权限或 UTF-8 解码失败时，异常直接向上传播；直接执行脚本通常显示 traceback 并非零退出，不会转成 `CheckResult`，也不会回退到 `-d` 或 stdin。

#### 1.3 分析描述：分别累积缺项、建议和备注

非空输入进入 `analyze_input(description, args.tech or None, args.role or None)`（第 67 行）。函数先创建三个空列表，再对描述执行 `strip()`。源码常量 `MIN_DESCRIPTION_CHARS = 40`，这里比较的是 Python 字符串长度，不是字节数或单词数。

分析按以下顺序发生，多个条件可以同时成立：

1. 描述少于 40 个字符：向 `missing` 加入描述过短的提示。这是当前唯一增加必须补齐项的规则。
2. 调用 `has_any_keyword(desc, KEYWORD_HINTS)`（第 62 行）：将文本和关键词转小写，再做子串匹配。如果没有命中且长度小于 80，增加职责、技术难点两条追问。关键词包括“职责”“结果”“源码”“qps”等；这只是文本启发式，不验证项目事实。源码先求值关键词检查，再判断长度条件。
3. 技术栈未提供或只有空白：增加一条建议；岗位同样处理。它们不进入 `missing`。
4. 无条件追加三条建议，询问证据、关键取舍、失败或异常案例。
5. 长度至少 40：在 `notes` 加入长度达标备注。

最后返回 `CheckResult(ok=not missing, missing=missing, suggestions=suggestions, notes=notes)`。`CheckResult` 是第 36 行定义的 dataclass，保存四类结果，不负责打印。`ok` 只由 `missing` 是否为空决定，因此有很多建议时仍可能通过；长度达标也不代表职责和效果已经被核实。

#### 1.4 返回输出层：业务状态与退出码分开

`analyze_input` 返回后，控制流回到 `command_check`：

| 条件 | 可见结果 | 函数返回值 |
| --- | --- | --- |
| `args.json` 为真 | `asdict(result)` 转字典，再经 `json.dumps(..., ensure_ascii=False, indent=2)` 和 `print` 输出到 stdout | `0`，不继续打印文本报告 |
| 未指定 JSON 且 `result.ok` 为真 | stdout 打印 `[PASS]`、建议，以及存在时的备注 | `0` |
| 未指定 JSON 且 `result.ok` 为假 | stdout 打印 `[NEEDS_INPUT]`、必须补齐项、建议，以及存在时的备注 | `0` |

因此非空但过短的描述，在 JSON 中表现为 `ok: false`，在文本中表现为 `NEEDS_INPUT`，两者的退出码仍是 `0`。自动化调用方要判断材料是否达标，需要读取业务结果，不能只看进程退出码。

`command_check` 的整数经 `main` 原样返回。直接执行脚本时，由底部 `SystemExit` 将其交给进程；测试直接调用 `main([...])` 时得到的是整数。空描述返回 `1` 的路径发生在输出格式分支之前，与材料过短的路径不同。

#### 1.5 用一个输入串联完整流程

重走 `python scripts/project_guide.py check -d "太短了" --json`：入口调用 `main`，解析器通过已注册的处理函数进入 `command_check`；`read_description` 选择 `-d`，返回长度为 3 的非空字符串。`analyze_input` 记录一条缺项，关键词未命中且长度小于 80，追加两条追问；缺少技术栈和岗位再追加两条建议，最后追加固定三条建议。没有长度达标备注，得到 `ok=False`、1 条 missing、7 条 suggestions、空 notes。输出层将其打印为 JSON，返回 `0`，进程正常结束。

以下是不同输入的替代路径，不能接在上面当作同一次执行：

- 改为 `-d "   "`：读取后为空，在分析前输出 stderr 错误并返回 `1`。
- 改为 `--file` 指向不存在的文件：读取异常向上传播，尚未完成描述读取，没有结构化结果。
- 改为一段 40 字符以上的非空描述：不产生长度缺项，`ok=True`；可选信息和证据建议仍可能存在。

源码没有自动重试、补问后恢复、写文件或专门的清理流程。文件读取由 `Path.read_text` 完成；stdin 在这里不被显式关闭。调用结束后不会保存检查进度，需要补充材料时由调用者重新发起命令。

选读测试可以帮助核对结论：短描述与达标描述测试直接验证 `analyze_input`；`test_main_check_prints_json_output` 通过模拟 stdin、捕获 stdout/stderr，验证从 `main` 到 JSON 的集成路径。文件优先级、空输入和读取异常的解释来自当前源码分支，不冒充这些测试已经覆盖的场景。

自行复述任务：无需运行项目，用自己的话说明上述短描述如何从参数到达 JSON，并指出空白描述会在哪一步提前结束，以及这两种情况为何具有不同的退出码。

### 第 2 课：一次 build-prompt 如何从材料走到提示词文本

状态：大纲；本次不展开，也不生成本课理解题。

读完能回答：命令行或 JSON 材料如何进入提示词，哪些输入会被拒绝，输出究竟是提示词还是生成后的文档？

主链：CLI `build-prompt` → `__main__` → `main` → `build_parser` / `parse_args` → `args.func(args)` / `command_build_prompt` → 可选 `load_json`、`read_json_text` → `validate_short_name` → 描述非空检查 → `build_prompt` → `escape_markdown_fences` → stdout → 返回码 → `SystemExit`。JSON 加载或字段错误、简称错误及缺失描述分别进入错误返回分支。

必读路径均在 [scripts/project_guide.py](../../scripts/project_guide.py)：

1. `main` → `build_parser` → `command_build_prompt`：输入命令行，解析并分派到提示词处理函数，准备描述及可选字段，下一步判断 JSON 来源。
2. `command_build_prompt` → `load_json` → `read_json_text`（仅传入 `--json-file` 时）：输入 JSON 路径，读取对象和文本字段，输出供校验的材料；异常时输出错误并返回。
3. `command_build_prompt` → `validate_short_name`：输入简称，输出清理后的简称或抛出校验错误；随后检查描述，成功进入拼装。
4. `build_prompt` → `escape_markdown_fences` → 返回 `command_build_prompt`：输入材料，拼接提示词字符串，最后通过 `sys.stdout.write` 输出并返回 `0`。

选读验证：[tests/test_project_guide.py](../../tests/test_project_guide.py) 中 `test_main_build_prompt_reads_json_file`、`test_build_prompt_json_canonical_fields_take_precedence`、`test_build_prompt_contains_skill_outputs_and_handoffs`。

暂缓阅读：`check` 的输入分析已归第 1 课，不在本课重复展开；提示词中要求的导学和面经实际生成不属于此脚本的实现范围。
