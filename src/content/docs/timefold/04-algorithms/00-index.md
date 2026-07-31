---
title: "求解算法配置索引"
description: "求解算法配置索引"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","optimization-algorithms","index"]
order: 0
series: "timefold"
section: "04-algorithms"
sectionOrder: 4
isIndex: true
source: "Obsidian"
maturity: "working"
---

## 这个文件夹解决什么

本文件夹回答：Timefold 怎么搜索解空间，构建启发式、局部搜索、Move Selector、穷举搜索分别适合什么情况。

## 笔记列表

| 笔记 | 状态 | 一句话说明 |
| --- | --- | --- |
| [算法总览：CH、LS、ES](/docs/timefold/04-algorithms/01-overview) | 持续整理 | CH、LS、ES 的定位和选择顺序 |
| [构建启发式 Construction Heuristic](/docs/timefold/04-algorithms/02-construction-heuristic) | 持续整理 | 快速生成初始解 |
| [局部搜索 Local Search](/docs/timefold/04-algorithms/03-local-search) | 持续整理 | 在初始解上持续改进 |
| [MoveSelector 移动选择器](/docs/timefold/04-algorithms/04-move-selectors) | 持续整理 | 求解器一次尝试怎样的变化 |
| [穷举搜索与适用边界](/docs/timefold/04-algorithms/05-exhaustive-search) | 持续整理 | 小规模问题和精确搜索边界 |
| [终止条件、环境模式与可复现性](/docs/timefold/04-algorithms/06-termination-reproducibility) | 持续整理 | 时间、步数、断言模式和随机性 |

## 推荐学习顺序

1. 先理解搜索空间为什么爆炸。
2. 再理解 CH 用于生成初始解。
3. 再理解 LS 用于改进解。
4. 最后通过 Benchmark 比较不同算法组合。

## 关联官方文档

- Optimization Algorithms Overview: [官方文档](https://docs.timefold.ai/timefold-solver/latest/optimization-algorithms/overview)
- Construction heuristics: [官方文档](https://docs.timefold.ai/timefold-solver/latest/optimization-algorithms/construction-heuristics)
- Local search: [官方文档](https://docs.timefold.ai/timefold-solver/latest/optimization-algorithms/local-search)
- Move Selector reference: [官方文档](https://docs.timefold.ai/timefold-solver/latest/optimization-algorithms/move-selector-reference)
