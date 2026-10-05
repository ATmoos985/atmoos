---
title: "局部搜索 Local Search"
description: "局部搜索 Local Search"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","local-search","metaheuristic"]
order: 3
series: "timefold"
section: "04-algorithms"
sectionOrder: 4
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Local Search 从一个已初始化解出发，每一步尝试若干 move，选择一个可接受的 move 作为下一步，不断改进方案。它是实际项目中的主力优化阶段。

## 三个核心组件

| 组件 | 作用 |
| --- | --- |
| MoveSelector | 产生候选 move |
| Acceptor | 判断 move 是否可接受 |
| Forager | 从可接受 move 中选下一步 |

## 搜索路径

Local Search 不是搜索树，而是一条路径：

```text
当前解 -> 尝试 moves -> 选择一步 -> 新当前解 -> 继续
```

这也是它能扩展到较大问题的原因：它不会保留和展开所有分支。

## 为什么会需要 Acceptor

如果只选当前最优 move，算法可能很快陷入局部最优。Acceptor 允许在一定条件下接受“不立刻变好”的 move，以跳出局部困境。

常见 acceptor：

- Tabu Search：近期动过的对象暂时禁用。
- Simulated Annealing：早期允许较多变差，后期趋于保守。
- Late Acceptance：和若干步之前的分数比较。

## acceptedCountLimit

真实问题 move 数量很大，不可能每步评估全部 move。`acceptedCountLimit` 限制每步评估的 accepted move 数量。

经验：

- 先让每步耗时控制在可接受范围内。
- 用 INFO 日志观察 step time。
- 用 Benchmark 调参数。

## 排程项目建议

生产排程可以从：

```text
Construction Heuristic + Late Acceptance
```

开始，再比较：

- Tabu Search。
- Simulated Annealing。
- Late Acceptance + Tabu。
- 不同 acceptedCountLimit。

## 易错点

- 直接使用 Hill Climbing，容易卡局部最优。
- acceptedCountLimit 太大，每步太慢。
- acceptedCountLimit 太小，搜索质量不稳定。
- 用 move 顺序表达业务偏好，而不是写 Score。

## 关联笔记

- [构建启发式 Construction Heuristic](/blog/timefold/04-algorithms/02-construction-heuristic)
- [MoveSelector 移动选择器](/blog/timefold/04-algorithms/04-move-selectors)
- [Benchmark 报告解读与关键指标](/blog/timefold/05-benchmarking/04-reports)
