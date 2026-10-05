---
title: "TimeFold 学习索引"
description: "TimeFold 学习索引"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","index","programming"]
order: 0
series: "timefold"
sectionOrder: 0
isIndex: true
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Timefold Solver 是一个 Java 生态的规划求解器，适合处理排程、路径、分配、装箱、资源负载等组合优化问题。学习主线不是“先背 API”，而是先掌握 4 件事：

1. 领域模型：哪些对象会被求解器改变，哪些只是事实。
2. 约束评分：业务规则如何变成 `Score`。
3. 搜索算法：求解器如何从初始解迭代到更好的解。
4. 验证调优：如何用环境模式、解释分数和 Benchmark 证明模型可信。

## 版本说明

- 这批笔记的原始知识骨架来自 Timefold Solver 1.31.0，适合用来建立领域建模、约束评分和求解流程的基础概念。
- 截至 2026-07-31，[Timefold Solver 官方 latest 文档](https://docs.timefold.ai/timefold-solver/latest/introduction) 指向 2.3.0-rc-1；[1.x 官方文档线](https://docs.timefold.ai/timefold-solver/1.x/introduction) 为 1.33.0。
- 版本号、依赖坐标和 API 以目标版本的官方文档为准；1.x → 2.x 的破坏性变更见 [破坏性变更详解：1.x → 2.x 升级手册](/blog/timefold/01-getting-started/07-migration-1-to-2)。
- 商业版能力说明见 [Plus 与 Enterprise 企业版功能详解](/blog/timefold/06-tuning/07-commercial-editions)。

## 学习路径

| 顺序 | 主题 | 入口 | 目的 |
| --- | --- | --- | --- |
| 1 | 配置与运行 | [TimeFold配置索引](/blog/timefold/01-getting-started/00-index) | 先把 Solver 跑起来 |
| 2 | 领域建模 | [领域模型建模索引](/blog/timefold/02-domain-modeling/00-index) | 把业务对象翻译成求解模型 |
| 3 | 约束评分 | [约束编程索引](/blog/timefold/03-constraints/00-index) | 把业务规则写成可优化的分数 |
| 4 | 算法配置 | [求解算法配置索引](/blog/timefold/04-algorithms/00-index) | 理解 CH、LS、Move 和搜索边界 |
| 5 | Benchmark | [Benchmark测试索引](/blog/timefold/05-benchmarking/00-index) | 用实验比较配置 |
| 6 | 调优扩展 | [调优与扩展索引](/blog/timefold/06-tuning/00-index) | 进入真实项目调优 |

## 先写完的核心笔记

- [TimeFold 是什么与适用场景](/blog/timefold/01-getting-started/01-introduction)
- [快速开始与项目依赖](/blog/timefold/01-getting-started/02-quick-start)
- [Solver 配置 XML 与代码配置](/blog/timefold/01-getting-started/03-solver-configuration)
- [运行 Solver 与 SolverManager](/blog/timefold/01-getting-started/04-running-solver)
- [Spring Boot、Quarkus 与持久化集成](/blog/timefold/01-getting-started/05-framework-integration)
- [版本路线与升级注意](/blog/timefold/01-getting-started/06-version-upgrades)
- [破坏性变更详解：1.x → 2.x 升级手册](/blog/timefold/01-getting-started/07-migration-1-to-2)
- [规划问题建模总览](/blog/timefold/02-domain-modeling/01-modeling-overview)
- [ProblemFact、PlanningEntity、PlanningSolution](/blog/timefold/02-domain-modeling/02-domain-objects)
- [PlanningVariable 与 ValueRange](/blog/timefold/02-domain-modeling/03-planning-variables)
- [影子变量与链式建模](/blog/timefold/02-domain-modeling/04-shadow-variables)
- [时间建模模式](/blog/timefold/02-domain-modeling/05-time-modeling)
- [动态问题：插单与连续规划](/blog/timefold/02-domain-modeling/06-continuous-planning)
- [PlanningListVariable 与列表变量影子体系](/blog/timefold/02-domain-modeling/07-list-variables)
- [PlanningClone 与 SolutionManager / ScoreManager](/blog/timefold/02-domain-modeling/08-solution-management)
- [Score 体系：硬约束、软约束与权重](/blog/timefold/03-constraints/01-score)
- [Constraint Streams 总览](/blog/timefold/03-constraints/02-constraint-streams)
- [常用构件：forEach、filter、join、groupBy](/blog/timefold/03-constraints/03-stream-building-blocks)
- [约束权重运行时调整](/blog/timefold/03-constraints/04-constraint-weights)
- [公平性与负载均衡约束](/blog/timefold/03-constraints/05-fairness)
- [Score 解释：Analysis、Diff、HeatMap](/blog/timefold/03-constraints/06-score-analysis)
- [约束性能优化](/blog/timefold/03-constraints/07-performance)
- [ConstraintVerifier 约束单元测试](/blog/timefold/03-constraints/08-testing)
- [算法总览：CH、LS、ES](/blog/timefold/04-algorithms/01-overview)
- [构建启发式 Construction Heuristic](/blog/timefold/04-algorithms/02-construction-heuristic)
- [局部搜索 Local Search](/blog/timefold/04-algorithms/03-local-search)
- [MoveSelector 移动选择器](/blog/timefold/04-algorithms/04-move-selectors)
- [穷举搜索与适用边界](/blog/timefold/04-algorithms/05-exhaustive-search)
- [终止条件、环境模式与可复现性](/blog/timefold/04-algorithms/06-termination-reproducibility)
- [Benchmarker 总览](/blog/timefold/05-benchmarking/01-benchmarker)
- [Benchmark 配置文件](/blog/timefold/05-benchmarking/02-configuration)
- [SolutionFileIO 与数据集管理](/blog/timefold/05-benchmarking/03-datasets)
- [Benchmark 报告解读与关键指标](/blog/timefold/05-benchmarking/04-reports)
- [统计基准与矩阵测试](/blog/timefold/05-benchmarking/05-statistics)
- [调优实验记录模板](/blog/timefold/05-benchmarking/06-experiment-template)
- [性能调优清单](/blog/timefold/06-tuning/01-performance-checklist)
- [动态约束与权重调参](/blog/timefold/06-tuning/02-dynamic-constraints)
- [多线程与企业版边界](/blog/timefold/06-tuning/03-multithreading-editions)
- [大规模排程建模策略](/blog/timefold/06-tuning/04-large-scale-scheduling)
- [常见问题 FAQ](/blog/timefold/06-tuning/05-faq)
- [ProblemChange 与实时增量更新](/blog/timefold/06-tuning/06-problem-change)
- [Plus 与 Enterprise 企业版功能详解](/blog/timefold/06-tuning/07-commercial-editions)

## 待补

- 把生产排程项目中的”产线、订单、模具、换型矩阵、插单”抽象为一套 Timefold 建模样例。
