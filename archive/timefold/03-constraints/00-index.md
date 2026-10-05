---
title: "约束编程索引"
description: "约束编程索引"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","constraints","index"]
order: 0
series: "timefold"
section: "03-constraints"
sectionOrder: 3
isIndex: true
source: "Obsidian"
maturity: "working"
---

## 这个文件夹解决什么

本文件夹回答：如何把业务规则变成 Timefold 的 `Score`，并让分数可解释、可调权重、可测试、可优化。

## 笔记列表

| 笔记 | 状态 | 一句话说明 |
| --- | --- | --- |
| [Score 体系：硬约束、软约束与权重](/blog/timefold/03-constraints/01-score) | 持续整理 | 分数层级、权重、可行解和业务优先级 |
| [Constraint Streams 总览](/blog/timefold/03-constraints/02-constraint-streams) | 持续整理 | 用声明式流写约束 |
| [常用构件：forEach、filter、join、groupBy](/blog/timefold/03-constraints/03-stream-building-blocks) | 持续整理 | 常见 Constraint Streams 构件 |
| [约束权重运行时调整](/blog/timefold/03-constraints/04-constraint-weights) | 持续整理 | `ConstraintWeightOverrides` 与参数化约束 |
| [公平性与负载均衡约束](/blog/timefold/03-constraints/05-fairness) | 持续整理 | load balance 与公平分配 |
| [Score 解释：Analysis、Diff、HeatMap](/blog/timefold/03-constraints/06-score-analysis) | 持续整理 | 分数解释、方案差异和热力图 |
| [约束性能优化](/blog/timefold/03-constraints/07-performance) | 持续整理 | 写高性能约束的规则 |
| [ConstraintVerifier 约束单元测试](/blog/timefold/03-constraints/08-testing) | 持续整理 | 约束单元测试工具与写法 |

## 约束设计顺序

1. 把业务语言改写为“匹配什么对象，奖励/惩罚什么”。
2. 判断是硬约束、medium 约束还是软约束。
3. 选择分数类型，例如 `HardSoftScore` 或 `HardMediumSoftScore`。
4. 用 Constraint Streams 表达匹配模式。
5. 用 `ConstraintVerifier` 做约束单测。
6. 用 Score Analysis 检查约束贡献是否符合直觉。

## 关联官方文档

- Constraints and Score Overview: [官方文档](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/overview)
- Score calculation: [官方文档](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/score-calculation)
- Constraint configuration: [官方文档](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/constraint-configuration)
- Understanding the score: [官方文档](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/understanding-the-score)
