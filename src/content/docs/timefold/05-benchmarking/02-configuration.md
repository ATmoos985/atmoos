---
title: "Benchmark 配置文件"
description: "Benchmark 配置文件"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","benchmark-config"]
order: 2
series: "timefold"
section: "05-benchmarking"
sectionOrder: 5
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Benchmark 配置文件描述：用哪些 Solver 配置，跑哪些输入数据，报告输出到哪里，以及如何排名。

## 核心元素

| 元素 | 含义 |
| --- | --- |
| benchmarkDirectory | 报告输出目录 |
| inheritedSolverBenchmark | 公共配置 |
| solverBenchmark | 一个待比较的 Solver 配置 |
| problemBenchmarks | 数据集配置 |
| inputSolutionFile | 输入问题文件 |

## inheritedSolverBenchmark

当多个配置有共同部分时，放到 inherited 中，避免重复。每个 solver benchmark 再覆盖自己的算法差异。

注意：继承的 solver phase 不是被覆盖，而是追加或组合，配置时要确认最终 phases。

## solverBenchmark

每个 solverBenchmark 应命名清楚，例如：

- `First Fit + Late Acceptance`
- `First Fit Decreasing + Tabu`
- `CH sequential variables`
- `RuinRecreate low frequency`

名称会进入报告，也会变成文件名相关内容，避免使用特殊字符。

## problemBenchmarks

数据集要覆盖真实差异：

- 订单规模。
- 产线数量。
- 换型复杂度。
- 交期紧张程度。
- 异常约束场景。

## 配置建议

- benchmarkDirectory 放到 `local/` 等被 gitignore 的目录。
- 输入文件用相对路径和正斜杠 `/`。
- 每个配置使用相同数据集。
- 先跑少量配置快速筛选，再做矩阵测试。

## 易错点

- 只比较算法，忽略数据集多样性。
- benchmark 输出目录进入版本控制。
- 配置名混乱，报告难读。
- 不同 Solver 终止条件不一致，比较不公平。

## 关联笔记

- [Benchmarker 总览](/docs/timefold/05-benchmarking/01-benchmarker)
- [SolutionFileIO 与数据集管理](/docs/timefold/05-benchmarking/03-datasets)
- [Benchmark 报告解读与关键指标](/docs/timefold/05-benchmarking/04-reports)
