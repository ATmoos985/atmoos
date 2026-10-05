---
title: "多线程与企业版边界"
description: "多线程与企业版边界"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","enterprise","multithreading"]
order: 3
series: "timefold"
section: "06-tuning"
sectionOrder: 6
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

多线程不是“开了就更快”。Timefold 中部分多线程能力属于 Enterprise Edition。社区版项目应优先通过模型、约束、算法和数据分解优化。

## 多线程类型

| 类型 | 含义 | 注意 |
| --- | --- | --- |
| 多数据集并行 | 多个 Solver 同时解不同问题 | `SolverManager` 可支持 |
| move 多线程 | 同一问题内并行评估 move | 企业版能力 |
| Partitioned Search | 拆分同一问题并行求解 | 企业版能力 |
| 多个独立 Solver 抢最好结果 | 成本高，收益有限 | 通常不推荐 |

## 社区版优先策略

- 降低候选值范围。
- 优化约束性能。
- 控制问题规模。
- 滚动窗口求解。
- 分批求解后合并。
- Benchmark 找更合适的算法。

## 企业版可能带来的能力

- Nearby selection。
- 多线程增量求解。
- Partitioned Search。
- 自动 node sharing。
- 更高级的事件节流等能力。

具体能力需以目标版本官方文档为准。

## 生产排程判断

如果 10000 订单全量求解过慢，先不要直接寄希望于多线程。应先问：

- 是否可以按时间窗口拆。
- 是否可以按产线组拆。
- 是否可以冻结近期计划。
- 是否可以只重排受影响区域。
- 是否有无效候选值被大量尝试。

## 易错点

- 把性能问题简单归因于 CPU 不够。
- 多线程 Benchmark 不控制机器负载。
- 线程开太多导致 GC 和上下文切换变重。
- 忽略企业版/社区版功能边界。

## 关联笔记

- [性能调优清单](/blog/timefold/06-tuning/01-performance-checklist)
- [大规模排程建模策略](/blog/timefold/06-tuning/04-large-scale-scheduling)
- [运行 Solver 与 SolverManager](/blog/timefold/01-getting-started/04-running-solver)
