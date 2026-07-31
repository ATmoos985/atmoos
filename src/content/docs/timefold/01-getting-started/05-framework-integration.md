---
title: "Spring Boot、Quarkus 与持久化集成"
description: "Spring Boot、Quarkus 与持久化集成"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","spring-boot","quarkus","integration"]
order: 5
series: "timefold"
section: "01-getting-started"
sectionOrder: 1
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Spring Boot / Quarkus 集成的核心价值是把 Solver 变成服务能力：注入 `SolverManager`，从数据库加载问题，异步求解，保存最终解或中间解。

## 服务化结构

典型后端结构：

1. Controller 接收求解请求。
2. Service 组装 `PlanningSolution`。
3. `SolverManager` 异步提交 problem。
4. best solution consumer 保存中间结果。
5. final consumer 保存最终结果。
6. 前端轮询或订阅求解状态。

## 持久化边界

数据库模型不一定等于求解模型。建议增加转换层：

- 数据库实体：面向业务 CRUD 和历史记录。
- 求解模型：面向 Solver 性能和约束表达。
- 输出转换：把 best solution 转回排程结果表。

不要让 Solver 直接操作复杂 ORM 关系对象，否则约束和克隆都容易变重。

## JSON / XML 集成

Timefold 支持用 Jackson / JAXB 等方式读写方案。Benchmark 数据集也需要 `SolutionFileIO` 来加载输入和输出。

项目中可用 JSON 做：

- demo 数据集。
- Benchmark 固定数据集。
- 求解结果快照。
- 问题复现包。

## Spring Boot 与 Quarkus

| 集成 | 特点 |
| --- | --- |
| Spring Boot | 贴合常见 Java 后端，易和现有业务系统结合 |
| Quarkus | 原生编译和云原生支持更强，Timefold 集成较深 |

如果现有项目是 Spring Boot，不必为了 Timefold 单独迁移技术栈。

## 易错点

- 不要在 score calculation 中查数据库或远程接口。
- 不要把 JPA 懒加载对象直接放入高频约束路径。
- 不要在 best solution event 中修改 Solver 正在使用的对象。
- 不要把求解任务绑定到 HTTP 请求生命周期。

## 生产排程建议

- 数据加载前先做清洗和补全，例如换型矩阵、产线能力、日历。
- 求解模型尽量扁平、只保留约束需要的字段。
- 保存求解结果时记录配置版本、约束权重、数据集版本。
- 对异常求解生成可复现数据包，方便 Benchmark 和调试。

## 关联笔记

- [运行 Solver 与 SolverManager](/docs/timefold/01-getting-started/04-running-solver)
- [SolutionFileIO 与数据集管理](/docs/timefold/05-benchmarking/03-datasets)
