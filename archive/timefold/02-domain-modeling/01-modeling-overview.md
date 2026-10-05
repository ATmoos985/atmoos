---
title: "规划问题建模总览"
description: "规划问题建模总览"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","domain-modeling"]
order: 1
series: "timefold"
section: "02-domain-modeling"
sectionOrder: 2
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

建模不是把业务表搬进 Solver，而是把业务问题重写成：哪些对象要被决策，决策变量是什么，可选值是什么，什么方案更好。

## 建模流程

1. 画业务类图。
2. 标出求解中会变化的关系。
3. 把会变的一侧建成规划变量。
4. 把被改变的对象建成规划实体。
5. 把不变但约束需要的数据建成问题事实。
6. 把能从变量推导出的字段建成影子变量。
7. 用 Score 表达业务底线和偏好。

## 三个核心判断

| 问题 | 指向 |
| --- | --- |
| Solver 会改变它吗？ | PlanningEntity / PlanningVariable |
| Solver 只读取它吗？ | ProblemFact |
| 它能由其他变量推导吗？ | Shadow Variable |

## 选择固定实体数量

官方建模指南强调：尽量选择求解过程中数量固定的对象作为规划实体。

排程中，订单任务数量通常在一次求解中固定，因此适合作为实体。员工每天做多少任务、产线最终有多少任务，是求解结果，不适合作为实体数量的来源。

## 避免无意义变量

每个 `@PlanningVariable` 都会增加搜索空间。只有 Solver 需要决策的关系才应是规划变量。

例如订单任务中：

- 产品类型不应是规划变量，它是订单事实。
- 分配产线或前驱任务可能是规划变量。
- 开始时间如果由顺序推导，应是影子变量。

## 生产排程建模直觉

```text
业务输入：订单、产线、模具、工艺、日历、换型矩阵
规划实体：生产任务
规划变量：任务所在位置 / 前驱 / 所属资源
影子变量：产线、开始时间、结束时间
约束评分：冲突、交期、换型、负载、稳定性
```

## 易错点

- 把报表汇总字段建成实体。
- 把历史数据和当前求解窗口混在一起。
- 把业务偏好藏在排序里，而不是写进 Score。
- 直接用数据库模型，导致约束层复杂且低效。

## 关联笔记

- [ProblemFact、PlanningEntity、PlanningSolution](/blog/timefold/02-domain-modeling/02-domain-objects)
- [PlanningVariable 与 ValueRange](/blog/timefold/02-domain-modeling/03-planning-variables)
- [影子变量与链式建模](/blog/timefold/02-domain-modeling/04-shadow-variables)
