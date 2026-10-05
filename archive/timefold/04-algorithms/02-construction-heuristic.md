---
title: "构建启发式 Construction Heuristic"
description: "构建启发式 Construction Heuristic"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","construction-heuristic"]
order: 2
series: "timefold"
section: "04-algorithms"
sectionOrder: 4
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Construction Heuristic 负责快速构造一个初始解。它不一定最优，甚至不一定完全可行，但要足够快，为 Local Search 留出优化时间。

## 为什么需要 CH

Local Search 需要从一个已初始化解开始。如果规划实体的变量还都是 null，Local Search 无法直接工作。CH 的任务就是先把变量填起来。

## 常见类型

| 类型 | 直觉 |
| --- | --- |
| First Fit | 按实体顺序，一个个放到当前最好的值 |
| First Fit Decreasing | 先安排更难的实体 |
| Weakest Fit | 先尝试较弱的值 |
| Strongest Fit | 先尝试较强的值 |
| Cheapest Insertion | 在所有实体-值组合中找当前代价最低 |

## First Fit

最简单、常用的起点。它每次选一个未初始化实体，为它选择当前最好的值，之后不再回头改。

优点：

- 快。
- 配置简单。
- 适合作为基线。

缺点：

- 前面的错误选择可能限制最终效果。
- 需要 Local Search 后续修正。

## First Fit Decreasing

先处理更难安排的实体。比如生产排程中，可以先安排：

- 交期更紧的订单。
- 可用产线更少的订单。
- 换型约束更强的任务。
- 加工时长更长的任务。

前提是模型支持 planning entity sorting。

## 多变量实体

如果一个实体有多个规划变量，默认可能用笛卡尔积一起分配，质量较好但可能爆炸。顺序分配更快，但质量可能下降。

例子：

- 变量 1：产线。
- 变量 2：时间段。
- 变量 3：人员。

每个变量 1000 个值时，笛卡尔积会非常夸张。生产规模下要重点关注。

## 性能目标

官方建议：CH 不应吃掉太多时间。一般希望：

- 从零构造初始解：尽量控制在可接受秒级。
- 实时规划：尽量毫秒级完成初始调整。

如果 CH 很慢，Local Search 就没有时间真正优化。

## 易错点

- 以为 CH 结果就是最终结果。
- 没有实体难度排序，导致难任务被剩余资源卡住。
- 多变量笛卡尔积导致初始化阶段极慢。
- 不用 Benchmark 比较 CH 类型。

## 关联笔记

- [算法总览：CH、LS、ES](/blog/timefold/04-algorithms/01-overview)
- [局部搜索 Local Search](/blog/timefold/04-algorithms/03-local-search)
- [Benchmark 报告解读与关键指标](/blog/timefold/05-benchmarking/04-reports)
