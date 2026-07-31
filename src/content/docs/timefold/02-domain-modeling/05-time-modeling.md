---
title: "时间建模模式"
description: "时间建模模式"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","time-modeling","domain-pattern"]
order: 5
series: "timefold"
section: "02-domain-modeling"
sectionOrder: 2
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Timefold 中时间不一定都是规划变量。时间可以是固定事实、普通变量、时间粒度变量，也可以由链式顺序推导成影子变量。

## 时间类型选择

| Java 类型 | 适合场景 |
| --- | --- |
| `DayOfWeek` + `LocalTime` | 无具体日期的周内排班 |
| `LocalDate` | 只关心日期 |
| `LocalDateTime` | 单时区且不考虑 DST |
| `OffsetDateTime` | 涉及时区或夏令时 |
| 避免 `java.util.Date` | 慢且容易出错 |

## 三种主要模式

| 模式 | 核心 | 适用场景 |
| --- | --- | --- |
| Timeslot | 实体选择固定时间槽 | 课程表、固定班次 |
| TimeGrain | 实体选择时间粒度起点 | 会议、粗粒度起止时间 |
| Chained Through Time | 顺序决定开始时间 | 车辆路径、连续生产、任务队列 |

## Timeslot 模式

适合所有任务时长相同，或可以统一膨胀成相同时间槽的场景。

优点：

- 简单。
- 约束容易写。
- demo 友好。

缺点：

- 不适合大量不同持续时间的连续任务。

## TimeGrain 模式

把时间切成粒度，例如 15 分钟、半天、一天。实体选择开始粒度，结束时间由持续粒度推导。

风险：

- 粒度越细，候选值越多。
- 窗口越长，搜索空间越大。
- 1 分钟粒度 + 长周期通常不适合直接求解。

## Chained Through Time 模式

适合任务一个接一个执行，后一个任务的开始时间由前一个任务结束时间推导。

生产排程常见：

```text
产线 -> 任务A -> 任务B -> 任务C
```

`任务B.startTime = 任务A.endTime + 换型/等待时间`

这种模式重点优化顺序，而不是直接搜索每个任务的时间。

## 生产排程建议

- 固定班次选择：Timeslot。
- 粗排计划：TimeGrain。
- 产线连续生产、换型、前后顺序强相关：Chained Through Time。
- 只需要给人一个周任务包、不关心周内顺序：Time Bucket。

## 易错点

- 用分钟级 TimeGrain 处理长周期大规模任务，搜索空间会爆。
- 明明顺序决定时间，却把开始时间直接做成变量，约束会复杂很多。
- 只用影子时间保证物理正确，忘记用软约束惩罚换型和延期。

## 关联笔记

- [影子变量与链式建模](/docs/timefold/02-domain-modeling/04-shadow-variables)
- [PlanningVariable 与 ValueRange](/docs/timefold/02-domain-modeling/03-planning-variables)
