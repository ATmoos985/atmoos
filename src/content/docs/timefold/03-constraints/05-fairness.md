---
title: "公平性与负载均衡约束"
description: "公平性与负载均衡约束"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","fairness","load-balancing"]
order: 5
series: "timefold"
section: "03-constraints"
sectionOrder: 3
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

公平性不是简单追求平均数，而是尽量让最重负载的人/资源不要过重；当第一重负载相同，再比较第二重负载，以此类推。

## 什么是公平

如果 15 个任务分给 5 个人，理想平均是每人 3 个。但现实会有技能、资格、设备、时间窗口等限制，所以不一定能完美平均。

公平性目标通常是：

- 让最忙的人尽量不太忙。
- 在最忙相同时，让第二忙的人也尽量少。
- 依次比较整个负载分布。

## Timefold 的支持

Timefold 支持通过 grouping 和 load balancing collector 写公平性约束。它会计算一个 unfairness 值：

- 0 表示完全公平。
- 越大表示越不公平。
- 不同数据集之间 unfairness 不宜直接比较。

## 为什么推荐 BigDecimal

公平性值是有理数。如果粗暴四舍五入成整数，会丢失细微差异，导致 score trap。官方建议使用 `HardSoftBigDecimalScore` 等 BigDecimal 类型。

如果为了性能用整数，需要按固定倍数放大并保留足够精度，同时重新平衡其他约束权重。

## 生产排程中的公平性

可以用于：

- 产线负载均衡。
- 班组工作量均衡。
- 模具使用压力均衡。
- 订单延期风险在产线间均衡。

但要注意：负载均衡通常是软约束，不应压过交期和硬工艺规则。

## 易错点

- 把“平均”当成公平，忽略技能/能力限制。
- 用 int 直接舍弃小数，造成分数平坦。
- 让公平性权重过高，牺牲交期或换型。
- 跨不同数据集直接比较 unfairness。

## 关联笔记

- [Score 体系：硬约束、软约束与权重](/docs/timefold/03-constraints/01-score)
- [常用构件：forEach、filter、join、groupBy](/docs/timefold/03-constraints/03-stream-building-blocks)
- [性能调优清单](/docs/timefold/06-tuning/01-performance-checklist)
