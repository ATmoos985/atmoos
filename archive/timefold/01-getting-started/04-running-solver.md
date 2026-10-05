---
title: "运行 Solver 与 SolverManager"
description: "运行 Solver 与 SolverManager"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","solver-manager"]
order: 4
series: "timefold"
section: "01-getting-started"
sectionOrder: 1
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

`Solver.solve(problem)` 适合本地同步调用，但它会占住当前线程。服务化系统里更常用 `SolverManager`，因为它能异步提交任务、并行处理多个问题，并通过 problemId 管理状态。

## Solver 的角色

`Solver` 负责解决一个规划问题实例。使用前需要：

1. 已经通过配置创建 `SolverFactory`。
2. 已经构造好一个 `@PlanningSolution` 问题实例。
3. 问题实例里有实体、事实、候选值范围和初始分数。

基本流程：

```java
Timetable problem = ...;
Timetable bestSolution = solver.solve(problem);
```

注意：传入的 problem 可能会被求解器改动，但最终最优解通常是规划克隆后的另一个实例。不要把“输入对象被修改”当作最终 best solution 的唯一来源。

## 为什么服务里要用 SolverManager

同步 `solve()` 可能运行几秒、几分钟甚至更久，直接放在 HTTP 请求线程里容易超时。`SolverManager` 更适合：

- REST 服务异步求解。
- 多个数据集并行求解。
- 查询某个 problemId 的求解状态。
- 提前终止求解。
- 监听中间 best solution。

核心区别：

| 方式 | 特点 | 适用场景 |
| --- | --- | --- |
| `Solver.solve()` | 阻塞当前线程，一次解一个问题 | demo、本地工具、批处理内部 |
| `SolverManager.solve()` | 立即返回，后台异步求解 | Web 服务、企业应用 |
| `solveAndListen()` | 持续消费中间 best solution | 用户等待结果时展示进度 |

## problemId

提交给 `SolverManager` 的每个问题都需要唯一 problemId。它用于：

- 查询状态。
- 提前终止。
- 区分并行求解任务。

建议使用不可变类型，例如 `Long`、`String`、`UUID`。

## 环境模式

环境模式用于发现模型、约束、Move 或影子变量的问题。越严格越慢，但越容易暴露 bug。

| 模式 | 用途 |
| --- | --- |
| `PHASE_ASSERT` | 开发默认推荐，能较早发现分数污染 |
| `STEP_ASSERT` | 短测试使用，较慢 |
| `FULL_ASSERT` | 深度验证，夜间或专项测试 |
| `TRACKED_FULL_ASSERT` | 排查影子变量/变量监听问题，最慢 |
| `NO_ASSERT` | 生产可考虑，失去部分保护 |
| `NON_REPRODUCIBLE` | 生产可考虑，但不利于复现问题 |

开发阶段优先可复现，生产阶段再根据稳定性和性能权衡。

## 日志与监控

日志层级可以帮助观察 Solver 的黑盒过程：

- `info`：阶段开始结束、整体进度。
- `debug`：每一步的信息，可能明显拖慢性能。
- `trace`：每个 move，极慢，只适合定位瓶颈。

Spring Boot / Quarkus 集成时可以通过 Micrometer 暴露指标，例如求解时长、错误数、分数计算次数、move 评估次数、问题规模、best score 等。

## 排程系统用法建议

- 夜间批量排程：用 `SolverManager` 并行提交多个数据集，允许较长求解时间。
- 白天插单重排：用已有方案作为部分初始化解，限制窗口，快速求解。
- 用户等待页面：用中间 best solution 展示进度，并允许提前终止。
- 调试影子变量：小数据集使用 `TRACKED_FULL_ASSERT`。

## 易错点

| 易错点 | 后果 | 建议 |
| --- | --- | --- |
| HTTP 请求里直接 `solve()` | 请求超时，线程被占满 | 用 `SolverManager` |
| 修改 best solution event 返回的对象 | 可能污染求解过程 | 只读或复制后处理 |
| 用 HashSet 存实体和值范围 | 遍历顺序不稳定，影响复现 | 用 `LinkedHashSet` / `LinkedHashMap` |
| 开 debug/trace 做性能测试 | 日志本身拖慢求解 | Benchmark 时控制日志 |

## 关联笔记

- [Solver 配置 XML 与代码配置](/blog/timefold/01-getting-started/03-solver-configuration)
- [Benchmark 报告解读与关键指标](/blog/timefold/05-benchmarking/04-reports)
- [性能调优清单](/blog/timefold/06-tuning/01-performance-checklist)
