---
title: "Benchmarker 总览"
description: "Benchmarker 总览"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","benchmark"]
order: 1
series: "timefold"
section: "05-benchmarking"
sectionOrder: 5
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Benchmarker 用来比较不同 Solver 配置在同一批数据集上的表现。它把“我感觉这个配置更好”变成可复现实验。

## 为什么需要 Benchmark

Timefold 有多种算法和参数，不存在永远最好的配置。最佳配置依赖：

- 领域模型。
- 数据规模。
- 约束复杂度。
- 运行时间。
- 业务目标权重。

## Benchmark 比什么

- 不同 CH 类型。
- 不同 LS acceptor。
- 不同 acceptedCountLimit。
- 不同 MoveSelector。
- 不同约束实现。
- 不同权重组合。

## 基本流程

1. 准备多个代表性数据集。
2. 准备多个 solver benchmark 配置。
3. 运行 benchmark。
4. 查看 HTML 报告。
5. 选择 favorite solver 或继续实验。

## 生产排程数据集

建议至少准备：

- 小规模功能验证数据。
- 中等规模真实数据。
- 最大规模压力数据。
- 异常数据，例如产能不足、资源缺失、插单密集。

## 易错点

- 只用一份顺利数据调参。
- 只看 best score，不看失败和稳定性。
- 没有固定数据集版本。
- 把 benchmark 产物提交进源码仓库。

## 关联笔记

- [Benchmark 报告解读与关键指标](/docs/timefold/05-benchmarking/04-reports)
- [调优实验记录模板](/docs/timefold/05-benchmarking/06-experiment-template)
