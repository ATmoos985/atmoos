---
title: "统计基准与矩阵测试"
description: "统计基准与矩阵测试"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","benchmark","statistics"]
order: 5
series: "timefold"
section: "05-benchmarking"
sectionOrder: 5
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

一次 benchmark 可能受随机性和 JVM 状态影响。统计基准通过多次重复和分布图看稳定性；矩阵测试通过组合参数系统探索调参空间。

## 为什么要多次重复

求解器存在随机选择、JVM 预热、机器负载波动。一次结果不能代表配置稳定性。

建议：

- 重要配置多次重复。
- 比较分数分布，而不只看单次最高。
- 记录失败率和最差表现。

## subSingleCount

`subSingleCount` 用来让同一个 single benchmark 重复多次。Timefold 会用不同随机种子，同时保持可复现。

适合：

- 比较随机性强的算法。
- 验证配置稳定性。
- 给生产配置选型。

## 矩阵测试

矩阵测试用于组合多个参数，例如：

- tabu size：5、7、11、13。
- acceptedCountLimit：500、1000、2000。
- lateAcceptanceSize：不同档位。

组合后批量跑，再看哪些区域表现好。

## 统计图

重点看：

- best score distribution。
- winning score difference。
- best score over time。
- move evaluation speed。
- score calculation speed。

## 易错点

- 参数组合太多，跑不完也看不懂。
- 没有先做粗筛，直接大矩阵。
- 只看平均值，不看最差情况。
- 不记录机器环境。

## 关联笔记

- [Benchmark 报告解读与关键指标](/blog/timefold/05-benchmarking/04-reports)
- [调优实验记录模板](/blog/timefold/05-benchmarking/06-experiment-template)
- [局部搜索 Local Search](/blog/timefold/04-algorithms/03-local-search)
