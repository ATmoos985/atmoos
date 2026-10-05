---
title: "Score 解释：Analysis、Diff、HeatMap"
description: "Score 解释：Analysis、Diff、HeatMap"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","score-analysis","explainability"]
order: 6
series: "timefold"
section: "03-constraints"
sectionOrder: 3
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

分数解释用于回答：为什么这个方案是这个分？哪些约束扣分最多？两个方案差在哪里？哪些实体最“热”、最影响方案质量？

## 为什么需要解释

如果只给业务看 `0hard/-12000soft`，几乎没有意义。业务真正关心：

- 哪些订单延期。
- 哪条产线负载过重。
- 哪些资源冲突。
- 哪些约束拉低了分数。
- 调整权重后方案变在哪里。

## Score Analysis

Score Analysis 用来查看约束匹配情况。它能帮助定位：

- 哪些约束被违反。
- 每个约束贡献多少分。
- 哪些实体参与了扣分。

Constraint Streams 通常能自动支持 constraint match，有利于解释。

## Solution Diff

Solution Diff 用来比较两个方案的差异，例如：

- 调整权重前后哪些任务移动了。
- 插单重排后哪些计划发生变化。
- 新算法配置与旧配置的结果差在哪里。

这对计划稳定性尤其重要。

## Heat Map

Heat Map 用来可视化“热点实体”。例如：

- 哪些订单经常造成延期。
- 哪些产线冲突多。
- 哪些任务换型成本高。

热力图适合给业务做诊断，不一定直接作为求解输入。

## 调试流程

1. 先看 hard 是否为 0。
2. 再看扣分最高的约束。
3. 抽取 top N 个约束匹配。
4. 对比业务直觉。
5. 若不符合直觉，检查约束逻辑或权重。

## 易错点

- 只看总分，不看分数组成。
- 约束命名不清，导致报告难读。
- 动态权重改了，但没有比较方案差异。
- 业务调参没有可视化反馈。

## 关联笔记

- [Score 体系：硬约束、软约束与权重](/blog/timefold/03-constraints/01-score)
- [约束权重运行时调整](/blog/timefold/03-constraints/04-constraint-weights)
- [Benchmark 报告解读与关键指标](/blog/timefold/05-benchmarking/04-reports)
