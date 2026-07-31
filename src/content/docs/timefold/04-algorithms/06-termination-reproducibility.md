---
title: "终止条件、环境模式与可复现性"
description: "终止条件、环境模式与可复现性"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","termination","reproducibility"]
order: 6
series: "timefold"
section: "04-algorithms"
sectionOrder: 4
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Solver 不会自动知道什么时候“够好”。终止条件决定求解何时结束，环境模式决定调试强度，可复现性决定问题能不能稳定复盘。

## 常见终止条件

| 条件 | 用途 |
| --- | --- |
| 时间限制 | 生产常用，例如 5 分钟内返回 |
| 步数限制 | Benchmark 和可复现测试友好 |
| 最佳分数限制 | 达到目标就停 |
| 未改善时间 | 长时间没有提升就停 |

生产系统常用时间限制，实验调优时也可用步数限制减少随机波动。

## 环境模式

见 [运行 Solver 与 SolverManager](/docs/timefold/01-getting-started/04-running-solver)。开发时建议：

- 默认 `PHASE_ASSERT`。
- 小测试跑 `STEP_ASSERT`。
- 夜间或专项验证跑 `FULL_ASSERT`。
- 调影子变量问题用 `TRACKED_FULL_ASSERT`。

## 可复现性

可复现意味着：同一数据集、同一配置、同一随机种子，多次运行每一步一致。

影响可复现的因素：

- HashSet / HashMap 的不稳定迭代顺序。
- time spent termination 与时间梯度算法组合。
- 非固定 random seed。
- 外部数据源或系统时间参与评分。

## 排程项目建议

- 调试阶段使用可复现模式。
- 数据集用 JSON 快照保存。
- 配置、权重、随机种子和版本号一起记录。
- Benchmark 时控制日志和机器环境。

## 易错点

- 生产 bug 无法复现，因为没保存输入和配置。
- 用 HashSet 存实体列表，导致运行顺序漂移。
- 在评分里读取当前时间。
- 用时间限制对比极细微性能变化。

## 关联笔记

- [运行 Solver 与 SolverManager](/docs/timefold/01-getting-started/04-running-solver)
- [Benchmark 报告解读与关键指标](/docs/timefold/05-benchmarking/04-reports)
- [性能调优清单](/docs/timefold/06-tuning/01-performance-checklist)
