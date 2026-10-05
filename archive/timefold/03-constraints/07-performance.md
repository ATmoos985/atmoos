---
title: "约束性能优化"
description: "约束性能优化"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","constraint-performance"]
order: 7
series: "timefold"
section: "03-constraints"
sectionOrder: 3
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

约束性能优化的核心是减少流过 Constraint Streams 的数据量，尤其避免大规模笛卡尔积。大多数慢约束不是算法问题，而是匹配范围太大。

## 优先原则

1. 能提前过滤就提前过滤。
2. 能用 joiner 就不要只靠 filter。
3. 高频查询要用缓存或索引。
4. 不要在 score calculation 中调用远程服务。
5. 用 Benchmark 比较，不凭感觉。

## joiner 优先于 filter

如果两个任务只有同产线才可能冲突，应先用 joiner 按产线匹配，再判断时间重叠。

错误直觉：

```text
所有任务两两组合 -> filter 同产线 -> filter 重叠
```

更好：

```text
按产线 join -> 再 filter 重叠
```

## 预计算问题事实

如果某些信息在求解过程中不变，且约束频繁使用，可以做成 cached problem fact：

- 产品到可用产线集合。
- 换型矩阵查询表。
- 订单优先级。
- 日历工作窗口。

## 约束权重为 0

如果某个约束在当前数据集不需要，可以把权重设为 0。Constraint Streams 中权重为 0 的约束不会加入节点网络，通常没有性能成本。

## 排查方法

1. 记录完整约束下的 move evaluation speed。
2. 逐个关闭约束或只保留一个约束。
3. 找出速度下降最大的约束。
4. 检查是否存在大 join、大 filter、远程调用、复杂遍历。
5. 改完后用 `FULL_ASSERT` 验证正确性。

## 易错点

- 为了性能把本该是软约束的内容剪出候选值，导致搜索空间过窄。
- 在约束里使用 Java Stream 做嵌套遍历。
- 为了省事用全量 pair，再慢慢 filter。
- 优化后只看 best score，不看计算速度。

## 关联笔记

- [常用构件：forEach、filter、join、groupBy](/blog/timefold/03-constraints/03-stream-building-blocks)
- [性能调优清单](/blog/timefold/06-tuning/01-performance-checklist)
- [Benchmark 报告解读与关键指标](/blog/timefold/05-benchmarking/04-reports)
