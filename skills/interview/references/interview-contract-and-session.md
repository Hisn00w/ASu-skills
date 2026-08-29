# 面试契约与会话账本

模拟面试开始、恢复或切换轮次时读取本文件。Predict 的一次性题目清单不需要完整会话账本。

## 面试契约

根据用户明确要求和现有材料建立契约。只有缺失信息会显著改变训练时才提问；否则使用以下默认值并简短告知用户：

```yaml
role: 从JD或简历推断，无法推断则标记待确认
seniority: 从JD或用户背景推断
round: 技术面
duration_minutes: 30
focus:
  resume_claims: 50
  role_fundamentals: 20
  scenario_or_system_design: 20
  behavioral: 10
feedback_policy: deferred
hint_policy: on_request
max_followups_per_claim: 4
language: zh-CN
```

- `feedback_policy=deferred`：真实模拟，结束后统一反馈。
- `feedback_policy=immediate`：训练模式，每题后给简短证据反馈。
- `hint_policy=on_request`：用户主动要求才给提示。
- 用户明确指定题型、时长、语言或反馈方式时覆盖默认值。

契约是会话边界，不是必须展示的复杂表单。用户要求“直接开始”时，用一句话说明采用的轮次、时长和反馈策略后开始第一题。

## JD能力矩阵

避免只围绕简历提问而漏掉岗位硬要求：

```text
| 岗位能力 | 简历证据 | 状态 | 面试动作 |
|----------|----------|------|----------|
| Agent工具调用 | 项目A | 有证据 | 深挖实现与失败处理 |
| 端侧部署 | 无 | 缺口 | 场景设计题，不假设做过 |
```

状态使用 `有证据 / 部分证据 / 无证据 / 待确认`。没有简历证据的能力可以考基础或场景设计，但不能诱导用户伪造成项目经验。

## 会话账本

在对话内部维护最小状态：

```yaml
session:
  role: AI应用工程师
  round: 技术面
  feedback_policy: deferred
  question_count: 5
  elapsed_or_budget: 5/10 questions
  current_claim: project-cost

claims:
  - id: project-cost
    source: 简历中的“成本降低50%”
    status: partial
    evidence_found:
      - 说明了优化动作
    missing:
      - baseline
      - 样本量
      - 统计周期
    contradictions: []
    followup_depth: 2
    last_question_id: project-cost-02
```

允许的 Claim 状态：

- `verified`：必要证据得到支持；
- `partial`：部分支持，仍有明确缺口；
- `unverified`：无法提供最低限度事实；
- `contradictory`：与简历或前文存在未解决冲突；
- `not_covered`：本轮没有问到。

账本只记录回答证据、缺口和状态，不记录模型臆测。默认留在当前会话；用户明确要求保存时，先确认目标路径，不写入公开仓库或包含招聘隐私的共享文件。

## 恢复会话

用户说“继续上次面试”时：

1. 优先读取当前对话中的账本或阶段小结；
2. 没有可用记录时明确说明，要求用户粘贴上次复盘或选择重新开始；
3. 不假装记得已丢失的问题和回答；
4. 从最近一个未结束 Claim 或最高优先级缺口继续。
