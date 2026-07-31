---
title: "性能调优清单"
description: "性能调优清单"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","performance","tuning"]
order: 1
series: "timefold"
section: "06-tuning"
sectionOrder: 6
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Timefold 性能调优优先看“每秒能评估多少 move / 计算多少分数”，不要一开始只盯最终 best score。最终分数受算法、时间、局部最优影响，性能指标更能直接反映约束和模型是否变快。

## 四层调优

| 层级 | 要问的问题 |
| --- | --- |
| 模型层 | 实体、变量、候选值是否过多 |
| 约束层 | 是否产生大规模笛卡尔积，是否能用 joiner |
| 算法层 | CH、LS、Move Selector 是否合适 |
| 数据层 | 是否需要分解、滚动窗口、固定已发布计划 |

## 评分性能

Solver 大部分时间会花在 move evaluation 和 score calculation。Constraint Streams 支持增量评分，变量变动时只计算相关 delta，不必全量重算。

优化时重点看：

- move evaluation speed。
- score calculation speed。
- 增加/删除某个约束后速度变化。
- 某个约束是否拖垮整体性能。

## 约束写法清单

优先：

- 用 `Joiners` 缩小匹配范围。
- 在 join 前过滤明显无关对象。
- 把可预计算部分做成 cached problem fact。
- 使用稳定、快速的字段访问。
- 对高频查询使用 Map/Set 或数组索引。

避免：

- 在 score calculation 中调用远程服务。
- 在约束热路径中使用复杂 Stream 遍历。
- 先做大范围两两组合，再靠 filter 丢掉绝大部分。
- 在评分中修改实体或问题事实。

## 大 cross-product 问题

最典型的性能坑是两两匹配。比如 1000 个任务两两组合，理论上就是百万级匹配。即使最后绝大多数被过滤掉，也已经浪费了很多计算。

优化思路：

1. 先过滤掉不参与约束的对象。
2. 用 joiner 按资源、人员、产线等字段索引匹配。
3. 把区分度高的 joiner 放前面。
4. enum、boolean 这种区分度低的条件放后面。

## 候选值和硬约束

有些硬约束可以前移到值范围或选择器中，减少无效 move。例如某产品绝不可能上某产线，就不要让它一直被尝试后再 hard 惩罚。

但要小心：过早剪掉搜索空间可能影响算法跳出局部最优，也可能让模型不够灵活。原则是：

- 永远非法的规则，可以考虑前移。
- 业务偏好和可权衡规则，不要前移，放进 Score。

## 避免 score trap

score trap 是指约束分数太平，不能区分“更坏”和“稍坏”。例如缺 1 个资源和缺 10 个资源都只扣一次 hard，求解器就没有梯度改善。

改法：

- 按违反程度惩罚，而不是只按是否违反。
- 为不可行程度提供细粒度分数。
- 必要时增加粗粒度 move，让求解器能跨出局部困境。

## 验证清单

- 小数据用 `STEP_ASSERT` 跑短测试。
- 专项调影子变量时用 `TRACKED_FULL_ASSERT`。
- 优化后用 `FULL_ASSERT` 做验证，不在生产开启。
- 用 Benchmark 在同一机器、同一数据集上多次比较。
- 不要用 debug/trace 日志做性能基准。

## 生产排程调优顺序

1. 先保证模型正确：时间、产线归属、资源冲突无误。
2. 再保证约束可测：核心约束有单测。
3. 再看性能瓶颈：逐个约束观察速度。
4. 再做算法调参：CH + LS + Move Selector。
5. 最后做业务分解：窗口、分批、冻结、热启动。

## 关联笔记

- [Constraint Streams 总览](/docs/timefold/03-constraints/02-constraint-streams)
- [Benchmark 报告解读与关键指标](/docs/timefold/05-benchmarking/04-reports)
