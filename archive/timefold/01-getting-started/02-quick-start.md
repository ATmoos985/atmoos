---
title: "快速开始与项目依赖"
description: "快速开始与项目依赖"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","quickstart","dependency"]
order: 2
series: "timefold"
section: "01-getting-started"
sectionOrder: 1
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

快速开始的目标不是直接做复杂 APS，而是用一个最小模型跑通 Timefold 的完整闭环：建模、写约束、配置 Solver、运行求解、查看结果。

## 最小闭环

一个 Timefold demo 至少包含：

1. 领域类：问题事实、规划实体、规划解。
2. 约束类：实现 `ConstraintProvider`。
3. 配置：指定 solution、entity、scoreDirectorFactory、termination。
4. 启动代码：构造 problem，调用 Solver，拿到 best solution。

## 官方快速开始类型

| 类型 | 适合场景 |
| --- | --- |
| Hello World | 纯 Java / Kotlin 学核心概念 |
| Spring Boot | 后端服务项目，适合 REST 接口 |
| Quarkus | 云原生、原生编译或 Quarkus 技术栈 |
| Vehicle Routing | 学链式/路径类问题 |

## 依赖理解

常见模块：

- `timefold-solver-core`：核心求解能力。
- `timefold-solver-spring-boot-starter`：Spring Boot 集成。
- `timefold-solver-quarkus`：Quarkus 集成。
- `timefold-solver-benchmark`：Benchmark 调参。
- `timefold-solver-test`：约束测试等。

实际项目建议用 BOM 管理版本，避免 core、benchmark、test 模块版本不一致。

## 学习建议

先跑学校排课类 demo，因为它具备最小但完整的概念：

- `Timeslot`、`Room` 是问题事实。
- `Lesson` 是规划实体。
- `timeslot`、`room` 是规划变量。
- `Timetable` 是规划解。
- 老师冲突、教室冲突、学生组冲突是硬约束。

跑通后再迁移到自己的排程业务。

## 迁移到生产排程

| Quick Start 概念 | 生产排程映射 |
| --- | --- |
| Room | 产线、设备、工位 |
| Timeslot | 时间段、班次、时间粒度 |
| Lesson | 订单任务、生产任务 |
| Timetable | 排程计划 |
| Teacher conflict | 资源冲突、模具冲突 |

## 易错点

- 不要一开始就把真实项目全部搬进 demo。
- 不要在未理解 Score 前直接调算法。
- 不要复制 quickstart 后忽略版本差异。
- 不要把 demo 的 Timeslot 模式误套到所有排程问题，连续生产通常更适合链式时间模式。

## 关联笔记

- [TimeFold 是什么与适用场景](/blog/timefold/01-getting-started/01-introduction)
- [Solver 配置 XML 与代码配置](/blog/timefold/01-getting-started/03-solver-configuration)
- [时间建模模式](/blog/timefold/02-domain-modeling/05-time-modeling)
