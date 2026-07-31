---
title: "常用构件：forEach、filter、join、groupBy"
description: "常用构件：forEach、filter、join、groupBy"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","constraint-streams"]
order: 3
series: "timefold"
section: "03-constraints"
sectionOrder: 3
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Constraint Streams 的常用构件可以按一句话理解：`forEach` 选对象，`filter` 筛对象，`join` 配对对象，`groupBy` 聚合对象，最后 `penalize/reward` 打分。

## forEach

`forEach(Entity.class)` 是约束入口，表示遍历某类对象。

用法：

- 检查单个任务是否延期。
- 检查单个任务是否未分配。
- 读取任务的影子变量做评分。

## filter

`filter` 用于保留满足条件的匹配。

适合：

- 任务已取消则不参与约束。
- 订单结束时间超过交期。
- 产线不支持当前产品。

性能提醒：能在 join 前过滤就尽量提前过滤，减少后续匹配数量。

## join

`join` 用于把两类对象配对。资源冲突、时间重叠、兼容性检查常用。

性能重点：

- 尽量用 `Joiners.equal(...)` 等 joiner 建索引。
- 不要先做全量笛卡尔积，再用 filter 丢掉绝大部分。
- 区分度高的 joiner 放前面。

## groupBy

`groupBy` 用于聚合，例如：

- 按产线统计总负载。
- 按员工统计任务数量。
- 按订单统计子任务完成情况。
- 做公平性 / 负载均衡。

## 常见组合

| 业务规则 | 构件组合 |
| --- | --- |
| 订单延期 | `forEach + filter + penalize` |
| 同模具冲突 | `forEachUniquePair / join + filter overlap + penalize` |
| 产线负载 | `forEach + groupBy(line, sum(duration))` |
| 公平性 | `groupBy + loadBalance collector` |
| 兼容性 | `forEach + filter(!canProduce)` |

## 易错点

- 在 filter 中做昂贵查询。
- 忘记排除自身配对，导致任务和自己冲突。
- 用字符串拼接或临时对象做高频匹配。
- 对大集合做两两匹配但没有 joiner。

## 关联笔记

- [Constraint Streams 总览](/docs/timefold/03-constraints/02-constraint-streams)
- [约束性能优化](/docs/timefold/03-constraints/07-performance)
- [公平性与负载均衡约束](/docs/timefold/03-constraints/05-fairness)
