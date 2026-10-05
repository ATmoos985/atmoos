---
title: "穷举搜索与适用边界"
description: "穷举搜索与适用边界"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","exhaustive-search"]
order: 5
series: "timefold"
section: "04-algorithms"
sectionOrder: 4
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Exhaustive Search 能找到全局最优，但几乎只适合玩具数据、教学和小规模验证。真实排程一般不要指望穷举。

## 两类穷举

| 类型 | 含义 |
| --- | --- |
| Brute Force | 枚举所有可能解 |
| Branch and Bound | 用边界剪枝，但仍是指数级搜索 |

## 为什么不适合真实项目

规划问题的搜索空间随实体和候选值指数增长。多几个订单、多几个产线、多几个时间段，搜索量就可能暴涨。

硬件提升通常追不上组合爆炸。

## 什么时候可以用

- 教学理解搜索空间。
- 小数据验证模型是否能找到最优。
- 对比 CH + LS 在小问题上的效果。
- 为单元测试构造极小场景。

## Branch and Bound

Branch and Bound 会优先探索更有希望的节点，并用 optimistic bound / pessimistic bound 剪掉不可能更好的分支。

它比暴力枚举聪明，但仍然会碰到指数级墙。

## 排程项目建议

不要用 ES 做生产排程主算法。更现实的路线：

```text
Construction Heuristic -> Local Search -> Benchmark 调参
```

需要验证最优性时，只在非常小的数据集上用 ES 做对照。

## 易错点

- 看到“全局最优”就想用于生产。
- 小数据能跑通就误判可扩展。
- 忽略内存增长。
- 没有设置 InitializingScoreTrend，导致剪枝弱。

## 关联笔记

- [算法总览：CH、LS、ES](/blog/timefold/04-algorithms/01-overview)
- [构建启发式 Construction Heuristic](/blog/timefold/04-algorithms/02-construction-heuristic)
- [局部搜索 Local Search](/blog/timefold/04-algorithms/03-local-search)
