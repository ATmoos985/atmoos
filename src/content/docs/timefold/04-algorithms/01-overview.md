---
title: "算法总览：CH、LS、ES"
description: "算法总览：CH、LS、ES"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","construction-heuristic","local-search","exhaustive-search"]
order: 1
series: "timefold"
section: "04-algorithms"
sectionOrder: 4
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

真实规划问题的搜索空间通常大到无法穷举。Timefold 的常见路线是：

1. 用 Construction Heuristic 快速构造一个初始解。
2. 用 Local Search / Metaheuristic 在初始解上迭代改进。
3. 用 Benchmark 比较不同参数，而不是靠感觉调。

## 搜索空间为什么会爆炸

如果有 100 个任务，每个任务有 20 个可选位置或资源，组合数量会迅速超过人工和穷举可处理范围。生产排程还要叠加顺序、时间、资源冲突、工艺规则，搜索空间会更夸张。

因此 Timefold 的目标通常不是证明全局最优，而是在可接受时间内找到业务可用的高质量解。

## 三类算法家族

| 类型 | 作用 | 适用场景 |
| --- | --- | --- |
| ES: Exhaustive Search | 尝试系统遍历解空间 | 小规模、教学、需要验证最优的小问题 |
| CH: Construction Heuristic | 快速构建初始解 | 几乎所有实际项目的第一阶段 |
| LS / Metaheuristics | 持续改进已有解 | 生产场景主力 |

## Construction Heuristic

CH 负责把未初始化的实体分配上值，快速得到一个可继续优化的解。

常见直觉：

- First Fit：按顺序放到第一个可行位置。
- First Fit Decreasing：先处理更难安排的实体。

在排程里，CH 适合先把订单大致排进产线或时间序列，后续再交给局部搜索慢慢改善。

## Local Search

Local Search 从一个已有解出发，每一步尝试一个 move，例如：

- 把任务换到另一个位置。
- 交换两个任务。
- 移动一段任务序列。

如果新方案分数更好，或符合某些接受策略，就进入下一步。常见 metaheuristic 包括 Tabu Search、Simulated Annealing、Late Acceptance 等。

## Exhaustive Search

ES 会尝试遍历或剪枝遍历解空间。它可以用于小问题验证，但对真实生产规模通常不可行。

不要因为 ES 能“找最优”就默认使用它。排程问题一旦实体数上来，穷举会失控。

## 官方推荐的起步路线

可以按这个路线推进：

1. 先用简单快速配置跑通，例如 First Fit。
2. 加实体难度排序，尝试 First Fit Decreasing。
3. 后面接 Local Search，例如 Late Acceptance。
4. 用 Benchmark 比较 Tabu Search、Simulated Annealing、Late Acceptance 等配置。
5. 对关键参数做矩阵实验。

## 排程项目里的选择

对大规模生产排程，优先考虑：

- CH 用于快速构造可行初始解。
- LS 用于降低延期、换型、负载不均。
- 问题分解用于控制规模。
- Benchmark 用于比较配置。

如果单次全量 10000 订单太大，算法配置之外还要做业务侧拆分，例如按时间窗口、产线组、产品族、固定窗口/滚动窗口拆解。

## 易错点

| 易错点 | 后果 | 建议 |
| --- | --- | --- |
| 一上来调复杂算法 | 没有基线，调参无意义 | 先用简单配置建立基线 |
| 只看小数据结果 | 生产数据效果不可预测 | 早测生产规模数据 |
| 把算法当成业务约束 | 结果不稳定或不可解释 | 业务目标必须进 Score |
| 手工调参数 | 经验不可复现 | 用 Benchmark 留实验记录 |

## 关联笔记

- [Benchmark 测试索引](/docs/timefold/05-benchmarking/00-index)
- [Score 体系：硬约束、软约束与权重](/docs/timefold/03-constraints/01-score)
