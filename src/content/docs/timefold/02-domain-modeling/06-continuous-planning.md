---
title: "动态问题：插单与连续规划"
description: "动态问题：插单与连续规划"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","continuous-planning","replanning"]
order: 6
series: "timefold"
section: "02-domain-modeling"
sectionOrder: 2
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

现实排程不是一次排完就不变。插单、取消、设备异常、库存变化都会让问题发生变化。连续规划的核心是：保留已确定部分，只让可调整窗口重新求解。

## 常见动态场景

- 新订单插入。
- 订单取消或数量变化。
- 设备停机。
- 模具不可用。
- 交期提前。
- 已发布计划不希望大幅改动。

## 三种处理方式

| 方式 | 含义 | 适合场景 |
| --- | --- | --- |
| Backup planning | 预留备选计划 | 高风险资源、备用人员 |
| Overconstrained planning | 允许任务不分配 | 产能不足、任务过多 |
| Continuous planning | 滚动窗口重排 | 日常插单、局部变更 |

## pinned 实体

pinned 表示某些规划实体固定不动。求解器只调整未 pinned 的部分。

生产排程中：

- 已开工任务：固定。
- 近期已发布任务：通常固定或部分固定。
- 远期任务：允许重排。
- 新插单：未固定，交给 Solver 找位置。

## 热启动思路

不要每次从空计划开始。插单时可以：

1. 读取已有 best solution。
2. 固定不可变更任务。
3. 加入新任务。
4. 解冻一小段窗口。
5. 重新求解。

这样 Solver 从高质量已有解出发，通常比全量重排更快，也更符合业务稳定性。

## 约束层配合

连续规划通常需要额外约束：

- 计划稳定性：少移动已发布任务。
- 插单优先级：紧急订单优先。
- 冻结窗口：近期开工任务不可改。
- 变更成本：移动任务越多惩罚越大。

## 易错点

- 插单直接全量重排，业务难接受。
- 只固定已开工任务，没考虑计划稳定性。
- 允许 null 但没有惩罚未分配任务。
- 每次重排都重新初始化所有变量，浪费时间。

## 关联笔记

- [影子变量与链式建模](/docs/timefold/02-domain-modeling/04-shadow-variables)
- [Score 体系：硬约束、软约束与权重](/docs/timefold/03-constraints/01-score)
