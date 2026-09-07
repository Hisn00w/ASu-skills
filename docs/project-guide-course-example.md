# `/project-guide` 源码课程对话案例

以下案例用于展示源码课程模式的触发方式和交付边界。路径与符号来自仓库中的 `scripts/project_guide.py`。

## 用户输入

> 用 `/project-guide` 把 `scripts/project_guide.py` 设计成两课源码课程。先输出大纲，再展开第 1 课并生成理解题；不要修改第 2 课。

## Agent 回复节选

已生成 `tutorial.md` 与 `practice.md`。第 1 课沿参数解析、输入来源选择、内容校验和退出码返回展开；第 2 课保持大纲状态。

`tutorial.md` 中第 1 课的主链：

```text
命令行参数 → main() → build_parser() → args.func(args) → command_check() → read_description() → analyze_input() → 输出检查结果与退出码
```

`practice.md` 只包含第 1 课已经讲过的理解题，例如：

1. `--file`、`--description` 与标准输入同时存在时，`read_description()` 按什么顺序选择输入？
2. 输入为空与描述过短时，`command_check()` 分别返回什么退出码，调用方会看到什么状态？

交付检查：第 2 课正文未展开，练习未包含第 2 课内容，也未修改目标脚本。
