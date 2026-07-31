---
title: "动态约束与权重调参"
description: "动态约束与权重调参"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","dynamic-constraints","tuning"]
order: 2
series: "timefold"
section: "06-tuning"
sectionOrder: 6
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

动态调参要分清三层：权重变化、参数变化、逻辑变化。权重变化适合 `ConstraintWeightOverrides`，参数变化适合问题事实，逻辑变化才需要动态约束系统。

## 三层模型

| 层级 | 例子 | 处理方式 |
| --- | --- | --- |
| 权重变化 | 延期更重要 | 覆盖约束权重 |
| 参数变化 | 最小休息 30/60 分钟 | 参数问题事实 |
| 逻辑变化 | 新工艺禁止 A 后接 B | 新约束或动态约束引擎 |

## 调参闭环

1. 跑 baseline。
2. 用 Score Analysis 找主要扣分。
3. 调整权重或参数。
4. 重新求解。
5. 用 Solution Diff 比较变化。
6. 保存配置和结果。

## 与自定义约束系统的关系

Java 静态约束适合高频、稳定、核心规则。Groovy 或动态规则适合变化快、业务试验期、低频规则。

性能优先级：

```text
静态 Constraint Streams > 参数化约束 > 动态脚本约束
```

## 易错点

- 把所有变化都做成动态脚本，性能和维护都会变差。
- 允许业务随意关闭 hard 约束。
- 调权后不看方案差异。
- 没有保存权重版本，导致结果无法复现。

## 关联笔记

- [约束权重运行时调整](/docs/timefold/03-constraints/04-constraint-weights)
