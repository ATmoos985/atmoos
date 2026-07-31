---
title: "SolutionFileIO 与数据集管理"
description: "SolutionFileIO 与数据集管理"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","solution-file-io","dataset"]
order: 3
series: "timefold"
section: "05-benchmarking"
sectionOrder: 5
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Benchmark 需要能读取输入问题、可选地写出最佳解。`SolutionFileIO` 就是负责把文件和 `PlanningSolution` 对象相互转换的接口。

## 为什么要数据集文件

数据集文件用于：

- 复现问题。
- 重跑 Benchmark。
- 对比版本升级。
- 保存异常现场。
- 做 CI 中的轻量求解测试。

## JSON 数据集

常见做法是用 Jackson 读写 JSON。优点：

- 适合人工检查。
- 易和接口数据互转。
- 适合保存问题快照。

缺点：

- 大数据集文件可能较大。
- 复杂 ORM 对象直接序列化容易出问题。

## 数据集分层

建议准备：

- `tiny`：约束单测和手工检查。
- `small`：快速 benchmark。
- `medium`：日常调参。
- `large`：生产规模压力测试。
- `edge`：异常场景。

## 输出文件

默认不一定需要保存每次 benchmark 的 best solution，因为大数据输出可能很占空间。需要复盘时再开启。

## 生产排程数据包

一个可复现数据包最好包含：

- 输入订单。
- 产线和资源。
- 工艺和换型矩阵。
- 日历。
- 约束权重。
- solver 配置。
- 版本信息。

## 易错点

- 只保存最终结果，不保存输入和配置。
- JSON 里带大量无关字段，拖慢读取。
- 数据集命名不体现规模和场景。
- 输入输出格式不一致，输出不能再次作为输入。

## 关联笔记

- [Benchmark 配置文件](/docs/timefold/05-benchmarking/02-configuration)
- [调优实验记录模板](/docs/timefold/05-benchmarking/06-experiment-template)
- [Spring Boot、Quarkus 与持久化集成](/docs/timefold/01-getting-started/05-framework-integration)
