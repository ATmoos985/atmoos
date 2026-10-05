---
title: "常见问题 FAQ"
description: "常见问题 FAQ"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","faq"]
order: 5
series: "timefold"
section: "06-tuning"
sectionOrder: 6
isIndex: false
source: "Obsidian"
maturity: "working"
---

## Timefold 会保证最优解吗？

真实规模下通常不能保证。Timefold 的目标是在有限时间内找到足够好的解。要证明最优通常需要穷举或精确算法，但它们不适合大规模生产排程。

## 为什么 Solver 给出不可行解？

可能原因：

- 数据本身无可行解。
- hard 约束太强。
- 允许未分配但惩罚不足。
- 终止太早，还没找到可行解。
- 约束写错，没有表达真实规则。

## 为什么分数看起来不符合业务直觉？

检查顺序：

1. 约束是否覆盖关键规则。
2. 约束层级是否正确。
3. 权重是否合理。
4. 约束匹配是否正确。
5. 是否存在 score trap。

## 为什么求解很慢？

常见原因：

- 候选值范围过大。
- 两两匹配没有 joiner。
- 约束里做远程调用或复杂遍历。
- 实体数量过大且未分解。
- 日志级别过细。

## 什么时候用 hard，什么时候用 soft？

无法执行、物理不可能、法律/安全底线放 hard。业务偏好、效率目标、体验目标放 soft。重要但可权衡的目标可以放 medium。

## 影子变量出问题怎么查？

- 用小数据集复现。
- 开 `TRACKED_FULL_ASSERT`。
- 检查变量监听/级联更新。
- 确认 score calculation 没有修改实体。

## 动态约束怎么做更稳？

优先顺序：

1. 静态 Constraint Streams。
2. 约束参数化。
3. 权重运行时调整。
4. 脚本/动态约束。

核心高频约束尽量不要脚本化。

## 关联笔记

- [性能调优清单](/blog/timefold/06-tuning/01-performance-checklist)
- [动态约束与权重调参](/blog/timefold/06-tuning/02-dynamic-constraints)
- [Score 解释：Analysis、Diff、HeatMap](/blog/timefold/03-constraints/06-score-analysis)
