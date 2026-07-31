---
title: "TimeFold 配置索引"
description: "本文件夹回答：如何把 Timefold Solver 引入项目、配置求解器、运行求解任务，并和 Spring Boot / Quarkus / 持久化层集成。"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","configuration","index"]
order: 0
series: "timefold"
section: "01-getting-started"
sectionOrder: 1
isIndex: true
source: "Obsidian"
maturity: "working"
---

## 这个文件夹解决什么

> 本文件夹回答：如何把 Timefold Solver 引入项目、配置求解器、运行求解任务，并和 Spring Boot / Quarkus / 持久化层集成。

## 笔记列表

| 笔记 | 状态 | 一句话说明 |
| --- | --- | --- |
| [TimeFold 是什么与适用场景](/docs/timefold/01-getting-started/01-introduction) | 持续整理 | 判断 Timefold 适合解决什么问题 |
| [快速开始与项目依赖](/docs/timefold/01-getting-started/02-quick-start) | 持续整理 | Maven/Gradle 依赖、Quick Start 项目结构 |
| [Solver 配置 XML 与代码配置](/docs/timefold/01-getting-started/03-solver-configuration) | 持续整理 | XML 与 `SolverConfig` 两种配置方式 |
| [运行 Solver 与 SolverManager](/docs/timefold/01-getting-started/04-running-solver) | 持续整理 | 单次求解、异步求解、批量求解 |
| [Spring Boot、Quarkus 与持久化集成](/docs/timefold/01-getting-started/05-framework-integration) | 持续整理 | 服务化集成与数据读写 |
| [版本路线与升级注意](/docs/timefold/01-getting-started/06-version-upgrades) | seed | 1.x 到 2.x 的差异追踪 |
| [破坏性变更详解：1.x → 2.x 升级手册](/docs/timefold/01-getting-started/07-migration-1-to-2) | 持续整理 | 完整升级手册：API/注解/包名/配置变更 + 迁移指南 |

## 复习顺序

1. 先读 [TimeFold 是什么与适用场景](/docs/timefold/01-getting-started/01-introduction)，确认它和普通算法、OR-Tools、规则引擎的区别。
2. 再读 [Solver 配置 XML 与代码配置](/docs/timefold/01-getting-started/03-solver-configuration)，看清一个最小可运行 Solver 需要哪些配置。
3. 后续补 [运行 Solver 与 SolverManager](/docs/timefold/01-getting-started/04-running-solver)，把“本地调用”升级成“服务中运行”。

## 关联官方文档

- Timefold Solver Introduction: [官方文档](https://docs.timefold.ai/timefold-solver/latest/introduction)
- Using Timefold Solver Overview: [官方文档](https://docs.timefold.ai/timefold-solver/latest/using-timefold-solver/overview)
- Configuring Timefold Solver: [官方文档](https://docs.timefold.ai/timefold-solver/latest/using-timefold-solver/configuration)
- Running Timefold Solver: [官方文档](https://docs.timefold.ai/timefold-solver/latest/using-timefold-solver/running-the-solver)
