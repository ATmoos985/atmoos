---
title: "MoveSelector 移动选择器"
description: "MoveSelector 移动选择器"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","move-selector"]
order: 4
series: "timefold"
section: "04-algorithms"
sectionOrder: 4
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

MoveSelector 决定 Solver 每一步“尝试怎样改变方案”。变量模型不同，可用 move 类型也不同。

## 基本变量的 move

| Move | 含义 |
| --- | --- |
| ChangeMove | 改一个实体的一个变量 |
| SwapMove | 交换两个实体的变量值 |
| PillarChangeMove | 一组同值实体一起改 |
| PillarSwapMove | 两组同值实体交换 |
| RuinRecreateMove | 拆掉一部分再用 CH 重建 |

## list variable 的 move

适合车辆路径、任务列表：

- ListChangeMove：移动列表元素。
- ListSwapMove：交换列表元素。
- SubListChangeMove：移动一段连续子列表。
- SubListSwapMove：交换两段子列表。
- KOpt：路径类问题常见边重连。

## chained variable 的 move

适合链式排程、路径：

- TailChainSwap：交换链尾。
- SubChainChange：移动一段子链。
- SubChainSwap：交换两段子链。

链式问题里，move 不只是换一个字段，而是改变一段顺序，可能连带影响后续影子变量。

## ChangeMove 为什么重要

ChangeMove 是最细粒度 move，几乎所有 metaheuristic 都应该包含它。它保证理论上能通过一系列小步到达各种解。

粗粒度 move 可以提高跳出局部最优的能力，但不能完全替代细粒度 move。

## Ruin and Recreate

RuinRecreate 会把一部分实体取消分配，再用构建启发式重建。它适合跳出局部最优，但代价较高，频率要控制。

生产排程中可以理解为：把一小段计划拆开，重新插入。

## 易错点

- 只用粗粒度 move，局部细调能力不足。
- 只用细粒度 move，跳不出某些局部最优。
- RuinRecreate 频率过高，拖慢整体求解。
- chained/list 模型套错 move 类型。

## 关联笔记

- [局部搜索 Local Search](/blog/timefold/04-algorithms/03-local-search)
- [影子变量与链式建模](/blog/timefold/02-domain-modeling/04-shadow-variables)
- [性能调优清单](/blog/timefold/06-tuning/01-performance-checklist)
