---
title: "Constraint Streams 总览"
description: "Constraint Streams 总览"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","constraint-streams","score-calculation"]
order: 2
series: "timefold"
section: "03-constraints"
sectionOrder: 3
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Constraint Streams 是 Timefold 推荐的约束编写方式。它把约束写成“从哪些对象出发，筛出哪些匹配，最后奖励或惩罚多少分”的声明式流程。

直觉公式：

```text
选择对象 -> 匹配/过滤/聚合 -> 计算权重 -> penalize/reward -> asConstraint
```

## 为什么用 Constraint Streams

相比把所有评分逻辑写在一个大方法里，Constraint Streams 有几个优势：

- 每个约束独立，便于命名和测试。
- 支持增量评分，适合大规模搜索。
- 支持分数解释，能看出哪些约束贡献了多少分。
- 代码更贴近业务规则。

官方不推荐新项目优先使用 EasyScoreCalculator 或手写增量评分器，除非有非常特殊的性能和维护理由。

## 一个约束的基本结构

约束通常写在 `ConstraintProvider` 中：

```java
Constraint machineConflict(ConstraintFactory factory) {
    return factory.forEach(Task.class)
            .filter(task -> ...)
            .penalize(HardSoftScore.ONE_HARD)
            .asConstraint("Machine conflict");
}
```

实际项目中，约束一般包括：

- 起点：`forEach(...)` 或相关变体。
- 匹配：`join(...)`、`forEachUniquePair(...)`。
- 过滤：`filter(...)`。
- 聚合：`groupBy(...)`。
- 评分：`penalize(...)`、`reward(...)`。
- 命名：`asConstraint("...")`。

## 约束命名

约束名非常重要，因为它会出现在：

- Score Analysis。
- 权重覆盖配置。
- Benchmark 报告。
- 调试日志。

建议命名规则：

- 用业务语言，不要只写方法名。
- 保持稳定，避免轻易改名。
- 每个约束名唯一。

例如：

- `Mold conflict`
- `Line product incompatibility`
- `Minimize changeover time`
- `Order tardiness`

## Constraint Streams 与权重

每个约束最终要选择一个 Score 权重：

```java
.penalize(HardSoftScore.ONE_HARD)
```

或者根据匹配对象动态计算惩罚值：

```java
.penalize(HardSoftScore.ONE_SOFT, task -> task.getDelayMinutes())
```

权重层级来自业务优先级，匹配权重来自具体违反程度。

## 生产排程常见约束形态

| 约束 | 常用写法直觉 |
| --- | --- |
| 同资源时间重叠 | 匹配任务对，过滤同资源且时间重叠 |
| 产线兼容性 | 遍历任务，过滤产品不在产线能力内 |
| 延期惩罚 | 遍历任务，按结束时间超过交期的分钟数惩罚 |
| 换型时间 | 遍历任务，读取前驱任务和换型矩阵后惩罚 |
| 负载均衡 | 按资源分组，计算负载差异 |

## 易错点

| 易错点 | 后果 | 建议 |
| --- | --- | --- |
| 在约束中修改实体 | 分数污染和不可复现 | Constraint Streams 必须只读 |
| 约束名不稳定 | 权重覆盖和分析结果失效 | 用稳定业务名 |
| 过度使用 filter 做大范围两两比较 | 性能差 | 优先用 joiner 缩小匹配范围 |
| 没写单元测试 | 约束看似运行，实际匹配错对象 | 每个核心约束配 ConstraintVerifier |

## 和动态约束的关系

动态约束不是指求解器随意改变业务规则，而是把可变部分设计成：

- 约束权重可配置。
- 约束参数来自问题事实。
- Groovy/脚本约束作为扩展层时，要控制性能和安全边界。

静态核心约束仍应尽量用 Java Constraint Streams 保持性能。

## 关联笔记

- [Score 体系：硬约束、软约束与权重](/docs/timefold/03-constraints/01-score)
- [约束权重运行时调整](/docs/timefold/03-constraints/04-constraint-weights)
