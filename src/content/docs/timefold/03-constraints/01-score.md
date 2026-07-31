---
title: "Score 体系：硬约束、软约束与权重"
description: "Score 体系：硬约束、软约束与权重"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","score","constraints"]
order: 1
series: "timefold"
section: "03-constraints"
sectionOrder: 3
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

`Score` 是 Timefold 判断两个方案谁更好的标准。求解器不会理解“业务上更好”是什么意思，除非你把它写进分数。

每个约束都要决定三件事：

1. 正负：奖励还是惩罚。
2. 权重：一次匹配影响多大。
3. 层级：hard、medium、soft 等优先级。

## Score 是什么

一个 `@PlanningSolution` 会有一个 `@PlanningScore` 字段。Solver 的目标是寻找更高分的解。

大多数规划问题以惩罚为主，所以分数通常是负数。完美方案可能是 `0hard/0soft`，违反越多分数越低。

## hard 和 soft 的区别

| 层级 | 含义 | 排程例子 |
| --- | --- | --- |
| hard | 不允许违反或违反后不可执行 | 同一时间一副模具被两个任务占用 |
| medium | 重要业务目标，优先于普通体验目标 | 核心订单延期 |
| soft | 希望尽量优化，但可权衡 | 换型时间、员工偏好、产线负载均衡 |

`HardSoftScore` 按字典序比较：先比 hard，再比 soft。一个 `-1hard/0soft` 的解，无论 soft 多好，都比不上 `0hard/-1000000soft`。

## 权重不是层级

不要用一个极大的 soft 权重假装 hard 约束。这叫 score folding，容易制造误判。

正确做法：

- 真正不可违反的规则放 hard。
- 可违反但代价很高的业务目标可以放 medium。
- 可权衡的偏好放 soft。

## 可行解

对 `HardSoftScore` 来说，hard 分数没有违反时，解才是 feasible。若业务数据本身无法满足所有 hard 约束，求解器会返回“最不坏”的不可行解，此时 hard 分数能反映缺口规模。

这对生产排程很重要：如果无可行解，不应只说“求解失败”，还要分析是产能不足、资源冲突过多，还是规则过紧。

## 常用 Score 类型

| Score 类型 | 适用场景 |
| --- | --- |
| `SimpleScore` | 只有单一目标，少见 |
| `HardSoftScore` | 最常见：硬约束 + 软目标 |
| `HardMediumSoftScore` | 需要三层优先级，例如硬底线、交付目标、效率目标 |
| `HardSoftBigDecimalScore` | 公平性或精细比例类目标 |
| `BendableScore` | 多层级且层数固定，少用 |

## 排程中的权重设计

生产排程可以先这样拆：

- hard：产线兼容、资源不可重叠、工艺禁止顺序。
- medium：关键订单交期、库存安全线。
- soft：换型时间、产线负载、普通订单延期、计划稳定性。

权重不是一次定死的。官方文档建议允许业务用户调整约束权重，并通过方案可视化比较结果。

## 易错点

| 易错点 | 后果 | 建议 |
| --- | --- | --- |
| 忘记实现关键业务约束 | 求解器给出看似高分但业务不可用的方案 | 先列约束清单，再写代码 |
| 用 double/float 算分 | 浮点误差导致分数污染 | 用 int、long、BigDecimal 或缩放整数 |
| 把所有约束都堆到 hard | 无可行解概率变高，优化空间变小 | 区分底线和偏好 |
| 权重靠拍脑袋 | 方案不符合业务直觉 | Benchmark + 可视化 + 业务调参 |

## 自测

1. “延期 1 天”和“模具冲突 1 次”应该在同一层级吗？
2. 如果所有订单都排不上，hard 分数能不能告诉你缺口严重程度？
3. 换型时间只影响开始时间，不影响 Score，会发生什么？

## 关联笔记

- [Constraint Streams 总览](/docs/timefold/03-constraints/02-constraint-streams)
- [影子变量与链式建模](/docs/timefold/02-domain-modeling/04-shadow-variables)
