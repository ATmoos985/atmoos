---
title: "约束权重运行时调整"
description: "约束权重运行时调整"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","constraint-weight","dynamic-constraints"]
order: 4
series: "timefold"
section: "03-constraints"
sectionOrder: 3
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

约束权重很难一次定准。Timefold 支持在每个规划问题实例上覆盖约束权重，让同一套约束代码在不同场景下有不同偏好。

这适合做业务调参：同一批订单，可以分别试“更重交期”“更重换型”“更重负载均衡”的方案。

## 为什么需要动态权重

真实项目里，不同角色对“好方案”的理解常常不同：

- 计划员希望少换型。
- 交付侧希望少延期。
- 生产侧希望负载平稳。
- 管理层希望核心客户优先。

如果每次都改代码，成本高且不可解释。更好的方式是把权重作为方案输入，让业务通过界面或配置调整。

## ConstraintWeightOverrides

新方式是给 `@PlanningSolution` 增加 `ConstraintWeightOverrides<Score_>` 字段。它会随规划解一起传入，用来覆盖 `ConstraintProvider` 中默认写死的权重。

核心理解：

- 默认权重写在约束实现里。
- 覆盖权重写在规划解实例里。
- 覆盖权重可以把某个约束加重、减轻，甚至置为 0 禁用。

## 约束参数化

有些约束不是权重变化，而是参数变化，例如：

- 班次间最小休息时间。
- 连续生产最大时长。
- 换型后限制窗口。
- 安全库存阈值。

这类参数可以建成问题事实，放入 `PlanningSolution`，再在 Constraint Streams 中 join 或读取。

区分：

| 类型 | 例子 | 建议放法 |
| --- | --- | --- |
| 约束重要性变化 | 延期惩罚从 1soft 调到 10soft | `ConstraintWeightOverrides` |
| 业务阈值变化 | 库存低于 10 天必须优先 | 参数问题事实 |
| 约束逻辑变化 | 新增一种特殊工艺禁止规则 | 新约束或动态约束系统 |

## 旧版 @ConstraintConfiguration

官方文档中仍提到 `@ConstraintConfiguration`，但它已被标记为旧方式，后续版本会移除。新笔记和新项目应优先学习 `ConstraintWeightOverrides`。

## 生产排程用法

可以为一个排程计划设置一组权重：

- `Order tardiness`：普通订单延期。
- `Key customer tardiness`：核心客户延期。
- `Minimize changeover time`：换型时间。
- `Line load balance`：产线负载均衡。
- `Plan stability`：尽量少改已发布计划。

然后把不同权重组合跑出多个方案，让业务对比：

- 交期优先方案。
- 换型优先方案。
- 均衡生产方案。
- 稳定计划方案。

## 易错点

| 易错点 | 后果 | 建议 |
| --- | --- | --- |
| 约束名经常改 | 覆盖权重找不到目标 | 约束名视为稳定接口 |
| 用权重替代业务逻辑 | 参数变化和逻辑变化混在一起 | 权重、参数、逻辑分层 |
| 把 hard 约束随意置 0 | 可能生成不可执行方案 | hard 权重调整要有权限边界 |
| 只给权重不给可视化 | 业务无法理解调参效果 | 展示 Score Analysis 和方案差异 |

## 关联笔记

- [Score 体系：硬约束、软约束与权重](/blog/timefold/03-constraints/01-score)
- [Constraint Streams 总览](/blog/timefold/03-constraints/02-constraint-streams)
