---
title: "PlanningVariable 与 ValueRange"
description: "PlanningVariable 与 ValueRange"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","planning-variable","value-range"]
order: 3
series: "timefold"
section: "02-domain-modeling"
sectionOrder: 2
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

`PlanningVariable` 是求解器真正会改变的字段，`ValueRange` 是它可以选择的候选值集合。模型性能很大程度取决于：变量是否必要，候选值是否过大。

一句话：变量越多、候选值越大，搜索空间越大。

## PlanningVariable 是什么

规划变量是规划实体上会被 Solver 改变的属性。例如：

- 课程安排到哪个教室。
- 订单安排到哪条产线。
- 任务接在哪个任务后面。
- 车辆访问客户的顺序。

这些变量不能只是“业务上有意义”，还要能被约束评分利用。

## ValueRange 是什么

ValueRange 是规划变量可选值的集合。它可以来自：

- `@ValueRangeProvider` 提供的列表。
- 规划解上的全局候选值。
- 实体上的局部候选值。

候选值越宽，求解器尝试无效方案的概率越高。能在模型层排除的明显非法值，可以考虑通过局部值范围或过滤选择减少。

## 三类 genuine 变量

| 类型 | 含义 | 适合场景 |
| --- | --- | --- |
| `@PlanningVariable` | 一个实体选择一个值 | 排课教室、订单产线 |
| `@PlanningListVariable` | 一个实体持有一组有序值 | 车辆路径、资源任务列表 |
| Chained `@PlanningVariable` | 实体指向前驱形成链 | 任务排序、路径、生产顺序 |

选择变量类型时，先看业务关系：

- 多个任务可以选同一个值：普通变量。
- 每个任务必须被放入且只能放入一个资源列表：list variable。
- 顺序由“前驱关系”自然表达：chained variable。

## 允许未分配

在过约束问题中，可以允许变量为 null 或允许 list variable 中有未分配值。但这意味着约束必须惩罚未分配，否则“全部不排”可能反而得分最高。

适用场景：

- 任务太多，宁愿低优先级任务不安排。
- 产能不足，需要明确哪些任务被排除。

慎用场景：

- 实时规划或重复规划。每次重新求解都可能花时间重新初始化 null 变量。

## 生产排程中的设计

如果用链式模型：

- 规划实体：`ProductionTask`。
- 规划变量：`previousTaskOrLine`。
- 候选值：所有可作为前驱的任务 + 所有产线锚点。
- 影子变量：所属产线、开始时间、结束时间。

如果用普通变量：

- 规划变量可能是 `line` 和 `sequenceIndex`。
- 顺序维护会更麻烦，约束也可能更难写。

因此，对于“产线内任务顺序决定时间”的问题，链式模型更贴近业务。

## 易错点

| 易错点 | 后果 | 建议 |
| --- | --- | --- |
| 候选值范围过宽 | 大量无效 move，求解慢 | 尽量减少明显非法候选 |
| 允许 null 但不惩罚 | 全部未分配可能成为好解 | 为未分配写约束 |
| 用变量顺序表达业务偏好 | 不影响 Score，结果不保证 | 偏好必须写成约束 |
| 实体排序依赖当前变量 | CH 阶段变量可能为空 | 排序只用稳定事实字段 |

## 关联笔记

- [ProblemFact、PlanningEntity、PlanningSolution](/docs/timefold/02-domain-modeling/02-domain-objects)
- [影子变量与链式建模](/docs/timefold/02-domain-modeling/04-shadow-variables)
- [Score 体系：硬约束、软约束与权重](/docs/timefold/03-constraints/01-score)
