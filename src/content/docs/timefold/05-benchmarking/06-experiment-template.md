---
title: "调优实验记录模板"
description: "调优实验记录模板"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","benchmark","template"]
order: 6
series: "timefold"
section: "05-benchmarking"
sectionOrder: 5
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 实验信息

- 实验日期：
- 项目/模型：
- Timefold 版本：
- Java 版本：
- 机器环境：
- 数据集：
- 目标：

## 配置对比

| 配置名称 | CH | LS / Acceptor | MoveSelector | 终止条件 | 备注 |
| --- | --- | --- | --- | --- | --- |
| baseline |  |  |  |  |  |

## 结果记录

| 配置名称 | Best score | Move eval speed | Score calc speed | 用时 | 是否失败 | 结论 |
| --- | --- | --- | --- | --- | --- | --- |
| baseline |  |  |  |  |  |  |

## 业务观察

- 哪些约束扣分最多：
- 方案是否可执行：
- 是否出现明显不合理安排：
- 业务最关心的指标是否改善：

## 性能观察

- 最慢约束：
- 是否出现 score trap：
- 是否早早停滞：
- 是否需要换 move 或调 acceptedCountLimit：

## 下一步

- 保留配置：
- 删除配置：
- 下次实验变量：
- 需要补充的数据集：

## 关联笔记

- [Benchmarker 总览](/docs/timefold/05-benchmarking/01-benchmarker)
- [Benchmark 报告解读与关键指标](/docs/timefold/05-benchmarking/04-reports)
- [统计基准与矩阵测试](/docs/timefold/05-benchmarking/05-statistics)
