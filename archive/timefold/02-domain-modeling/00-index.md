---
title: "领域模型建模索引"
description: "领域模型建模索引"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","domain-modeling","index"]
order: 0
series: "timefold"
section: "02-domain-modeling"
sectionOrder: 2
isIndex: true
source: "Obsidian"
maturity: "working"
---

## 这个文件夹解决什么

本文件夹回答：如何把真实业务对象拆成 Timefold 的问题事实、规划实体、规划变量、影子变量和规划解。

## 笔记列表

| 笔记 | 状态 | 一句话说明 |
| --- | --- | --- |
| [规划问题建模总览](/blog/timefold/02-domain-modeling/01-modeling-overview) | 持续整理 | 从业务问题到求解模型的翻译流程 |
| [ProblemFact、PlanningEntity、PlanningSolution](/blog/timefold/02-domain-modeling/02-domain-objects) | 持续整理 | 三类核心对象怎么区分 |
| [PlanningVariable 与 ValueRange](/blog/timefold/02-domain-modeling/03-planning-variables) | 持续整理 | 求解器真正改变的变量和候选值 |
| [影子变量与链式建模](/blog/timefold/02-domain-modeling/04-shadow-variables) | 持续整理 | 用派生变量表达时间、前后关系和归属 |
| [时间建模模式](/blog/timefold/02-domain-modeling/05-time-modeling) | 持续整理 | timeslot、time grain、chain 三种时间模式 |
| [动态问题：插单与连续规划](/blog/timefold/02-domain-modeling/06-continuous-planning) | 持续整理 | pinned、窗口规划、插单重排 |
| [PlanningListVariable 与列表变量影子体系](/blog/timefold/02-domain-modeling/07-list-variables) | 持续整理 | 一对多列表变量及全套影子变量注解 |
| [PlanningClone 与 SolutionManager / ScoreManager](/blog/timefold/02-domain-modeling/08-solution-management) | 持续整理 | 规划克隆机制、方案分析与计分工具 |

## 建模顺序

1. 先列出业务对象。
2. 标出求解过程中会变的属性。
3. 把会变的对象设为规划实体。
4. 把可选值集合设为值范围。
5. 把可由变量推导出的字段设为影子变量。
6. 把业务底线和优化目标交给约束层。

## 关联官方文档

- Modeling planning problems: [官方文档](https://docs.timefold.ai/timefold-solver/latest/using-timefold-solver/modeling-planning-problems)
- Design patterns: [官方文档](https://docs.timefold.ai/timefold-solver/latest/design-patterns/design-patterns)
- Responding to change: [官方文档](https://docs.timefold.ai/timefold-solver/latest/responding-to-change/responding-to-change)
