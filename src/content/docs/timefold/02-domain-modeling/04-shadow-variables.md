---
title: "影子变量与链式建模"
description: "影子变量与链式建模"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","shadow-variable","chained-model"]
order: 4
series: "timefold"
section: "02-domain-modeling"
sectionOrder: 2
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

影子变量是由规划变量推导出来的字段。求解器不直接优化影子变量，但会在规划变量变化后维护它们一致。

链式建模适合表达“顺序决定结果”的问题，例如车辆路径、生产任务顺序、设备上的作业队列。它的核心是：实体指向前一个对象，整条链从锚点开始。

## 为什么需要影子变量

如果每个约束都临时遍历链条计算开始时间、所属产线、前后任务，会很慢，也容易写错。影子变量把这些派生结果缓存下来：

- 约束写起来更自然。
- 评分时能直接读取字段。
- 真正变化时由求解器触发更新。

排程中常见影子变量：

- `anchorLine`：当前任务属于哪条产线。
- `previousTask` / `nextTask`：前后任务。
- `startTime` / `endTime`：任务开始结束时间。
- `index`：任务在列表中的位置。

## Genuine 变量与 Shadow 变量

| 类型 | 是否由求解器直接改变 | 例子 |
| --- | --- | --- |
| Genuine planning variable | 是 | 任务分到哪个时间段、排在谁后面 |
| Shadow planning variable | 否 | 开始时间、结束时间、所属产线 |

真正被搜索的是 genuine 变量。影子变量服务于可读性、性能和约束表达。

## 链式建模的直觉

生产排程可以这样理解：

```text
产线A -> 任务1 -> 任务7 -> 任务3
产线B -> 任务2 -> 任务4 -> 任务9
```

求解器改变的是“任务接在谁后面”。当这个前驱关系变化时：

1. 任务所属产线可能变化。
2. 任务开始时间需要重新计算。
3. 后续任务的时间也可能级联变化。
4. 换型时间、延期、资源冲突等约束随之改变。

## 影子变量的几种常见形式

| 场景 | 影子变量 | 用途 |
| --- | --- | --- |
| 双向关系 | `@InverseRelationShadowVariable` | 从值反查有哪些实体引用它 |
| 列表位置 | `@IndexShadowVariable` | 获取实体/值在列表中的索引 |
| 前后关系 | previous / next shadow | 表达序列邻接 |
| 级联更新 | cascading shadow | 当前任务变化后更新后续任务 |
| 自定义推导 | `@ShadowVariable` | 处理内置注解无法表达的派生字段 |

## 生产排程中的关键原则

换型时间要同时出现在两个地方：

1. 影子时间计算里：保证排程时间物理正确。
2. 软约束评分里：给求解器减少换型的优化压力。

只把换型写进开始时间，不代表求解器会主动减少换型。求解器只会优化分数。

## 易错点

| 易错点 | 后果 | 建议 |
| --- | --- | --- |
| 在 score calculation 中修改实体 | 可能造成分数污染和不可复现 | 分数计算必须只读 |
| 每次约束都遍历链算时间 | 性能差，复杂约束难维护 | 用影子变量缓存时间 |
| 影子变量更新不完整 | 约束看到脏数据 | 用严格环境模式和单元测试验证 |
| 链式模型没有稳定锚点 | 所属资源难以推导 | 用产线/车辆等资源作为链锚点 |

## 在生产排程场景中的应用

在生产排程场景里，链式模型适合表达“每条产线上的任务顺序”。影子变量负责维护时间和所属产线，约束负责判断：

- 模具资源是否冲突。
- 产品和产线是否兼容。
- 任务是否延期。
- 换型时间是否过高。

## 关联笔记

- [ProblemFact、PlanningEntity、PlanningSolution](/docs/timefold/02-domain-modeling/02-domain-objects)
- [Constraint Streams 总览](/docs/timefold/03-constraints/02-constraint-streams)
