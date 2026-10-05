---
title: "ProblemFact、PlanningEntity、PlanningSolution"
description: "ProblemFact、PlanningEntity、PlanningSolution"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","domain-modeling","planning-solution"]
order: 2
series: "timefold"
section: "02-domain-modeling"
sectionOrder: 2
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Timefold 领域模型的第一刀是：求解过程中什么会变，什么不变。

- `ProblemFact`：求解过程中不变，但约束会用到。
- `PlanningEntity`：求解过程中会被移动、分配或排序。
- `PlanningSolution`：承载整个问题实例、实体列表、事实列表、值范围和最终分数。

## 三者怎么区分

| 类型 | 是否变化 | 典型内容 | 排程例子 |
| --- | --- | --- | --- |
| ProblemFact | 不变 | 资源、规则、基础数据、候选值 | 产线、模具、产品、换型矩阵 |
| PlanningEntity | 会变 | 被安排、被排序、被分配的对象 | 订单任务、生产任务 |
| PlanningSolution | 容器 | 全部事实、全部实体、候选值、分数 | 某天/某周的排程问题实例 |

最朴素的判断题：如果求解器运行时会改它的某个字段，它很可能是 `PlanningEntity`；如果只是被规则查询，它更可能是 `ProblemFact`。

## ProblemFact

ProblemFact 是约束计算需要知道、但求解器不修改的对象。它可以是普通 Java 对象，不一定需要 Timefold 注解。

常见用途：

- 描述资源能力：产线能生产哪些产品。
- 描述固定规则：换型时间、工艺路线、工作日历。
- 描述候选值：可选时间段、可选房间、可选车辆。

在脏数据或遗留系统中，建议先转成适合求解的中间模型。不要让约束层直接面对混乱的业务表结构。

## PlanningEntity

PlanningEntity 是求解器实际改变的对象。它必须是可变对象，不能用 Java `record` 或 enum 直接当实体。

实体上通常有：

- 定义性字段：业务身份，求解中不变。
- 规划变量：求解器会改变。
- 影子变量：由规划变量推导出来。

排程例子：

- `ProductionTask` 是规划实体。
- `orderNo`、`productCode`、`quantity` 是定义性字段。
- `previousTaskOrLine`、`line`、`timeslot` 这类字段可能是规划变量。
- `startTime`、`endTime`、`anchorLine` 这类字段可能是影子变量。

## PlanningSolution

PlanningSolution 是整个问题实例。它至少要能提供：

- 所有规划实体。
- 所有问题事实。
- 规划变量的候选值范围。
- `@PlanningScore` 分数。

可以把它理解成 Solver 的输入和输出：输入时是未求解或部分求解的问题，输出时是带有更好变量分配和分数的解。

## @PlanningId

`@PlanningId` 用来让 Timefold 稳定识别问题事实和规划实体。某些功能需要它，例如多线程增量求解和实时规划中的 move rebase。

建议：

- 用数据库 ID、业务唯一 ID、UUID 等稳定值。
- 求解开始前不能为 null。
- 不要让 `hashCode()` 或 `equals()` 依赖规划变量。

## 易错点

| 易错点 | 后果 | 建议 |
| --- | --- | --- |
| 把汇总字段建成实体 | 实体数量膨胀，搜索变慢 | 汇总值优先放约束或影子变量 |
| 实体 `hashCode()` 依赖规划变量 | 放入集合后求解器修改变量，集合行为异常 | 只用稳定身份字段 |
| 直接使用遗留数据库模型 | 约束难写、性能差 | 转成专用求解模型 |
| 多实体类滥用 | 实现复杂度上升 | 能用单实体就先单实体 |

## 生产排程映射

| 业务对象 | Timefold 角色 | 原因 |
| --- | --- | --- |
| 产线 | ProblemFact / 锚点 | 求解中产线能力不变，也可作为链的起点 |
| 模具 | ProblemFact | 被任务引用，用于资源冲突和换型 |
| 订单任务 | PlanningEntity | 求解器要决定它的位置和顺序 |
| 换型矩阵 | ProblemFact | 分数和时间推导都会查询 |
| 排程计划 | PlanningSolution | 包含任务、资源、候选值和分数 |

## 关联笔记

- [影子变量与链式建模](/blog/timefold/02-domain-modeling/04-shadow-variables)
- [Score 体系：硬约束、软约束与权重](/blog/timefold/03-constraints/01-score)
