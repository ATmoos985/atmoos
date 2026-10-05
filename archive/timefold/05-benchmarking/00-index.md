---
title: "Benchmark 测试索引"
description: "Benchmark 测试索引"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","benchmark","index"]
order: 0
series: "timefold"
section: "05-benchmarking"
sectionOrder: 5
isIndex: true
source: "Obsidian"
maturity: "working"
---

## 这个文件夹解决什么

本文件夹回答：如何用 Timefold Benchmarker 比较不同 Solver 配置、不同数据集和不同参数组合。

## 笔记列表

| 笔记 | 状态 | 一句话说明 |
| --- | --- | --- |
| [Benchmarker 总览](/blog/timefold/05-benchmarking/01-benchmarker) | 持续整理 | 为什么要基准测试，以及什么时候测 |
| [Benchmark 配置文件](/blog/timefold/05-benchmarking/02-configuration) | 持续整理 | benchmark XML / API 配置 |
| [SolutionFileIO 与数据集管理](/blog/timefold/05-benchmarking/03-datasets) | 持续整理 | 输入输出数据集读写 |
| [Benchmark 报告解读与关键指标](/blog/timefold/05-benchmarking/04-reports) | 持续整理 | best score、score calculation speed、统计图 |
| [统计基准与矩阵测试](/blog/timefold/05-benchmarking/05-statistics) | 持续整理 | 多次重复、参数矩阵、聚合报告 |
| [调优实验记录模板](/blog/timefold/05-benchmarking/06-experiment-template) | 持续整理 | 保存自己的实验结论 |

## 第一原则

Benchmark 的意义不是“跑一次看看快不快”，而是让调参变成可复现实验：

- 同一批数据集。
- 同一硬件和环境。
- 多个配置对比。
- 记录分数、耗时、稳定性和失败情况。

## 关联官方文档

- Benchmarking and tweaking: [官方文档](https://docs.timefold.ai/timefold-solver/latest/using-timefold-solver/benchmarking-and-tweaking)
