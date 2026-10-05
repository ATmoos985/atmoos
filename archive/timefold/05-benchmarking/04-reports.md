---
title: "Benchmark 报告解读与关键指标"
description: "Benchmark 报告解读与关键指标"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","benchmark","metrics"]
order: 4
series: "timefold"
section: "05-benchmarking"
sectionOrder: 5
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Benchmark 报告不是只看“哪个分数最高”。至少要同时看：

- best score：解质量。
- score calculation speed：评分性能。
- move evaluation speed：搜索推进速度。
- best score over time：收敛过程。
- score distribution：稳定性。
- failed benchmark：配置是否可靠。

## 报告产物

Benchmark 完成后会在 benchmark directory 下生成 HTML 报告，一般入口是 `index.html`。报告包含：

- 汇总图表和表格。
- 每个数据集的统计。
- 每个 Solver 配置的排名。
- Benchmark 环境信息，例如硬件、配置、数据集。

## favorite Solver

报告会自动给 Solver 配置排名。排名第 0 的配置称为 favorite Solver，表示整体表现最好。

但它不一定在每个数据集上都最好。因此生产配置不能只看 rank，还要看：

- 是否存在某些数据集表现很差。
- 数据集规模变化时是否稳定。
- 是否有失败或未初始化解。
- 性能和质量是否符合业务时间窗口。

## 常见指标

| 指标 | 看什么 | 用途 |
| --- | --- | --- |
| Best score | 最终方案质量 | 比较配置效果 |
| Best score per problem scale | 规模变化后的质量 | 看可扩展性 |
| Score calculation speed | 每秒评分次数 | 看约束性能 |
| Move evaluation speed | 每秒 move 评估 | 看算法和评分综合性能 |
| Time spent | 耗时 | 看构建启发式或固定目标耗时 |
| Best score over time | 分数随时间变化 | 看是否陷入停滞 |
| Constraint match statistics | 各约束贡献 | 定位约束问题 |
| Move type statistics | 哪类 move 有贡献 | 调 Move Selector |

## 排名方式

常见排序目标：

- `TOTAL_SCORE`：总体分数最高，默认思路。
- `WORST_SCORE`：最小化最差情况，适合重视稳定性。
- `TOTAL_RANKING`：各数据集规模差异大时更公平。

生产排程通常不能只追求平均好，还要避免某些数据集极差。因此 `WORST_SCORE` 和分布图也值得看。

## 如何判断一个配置值得保留

一个配置值得进入候选，通常要满足：

- 没有失败 benchmark。
- 在主要生产规模数据集上分数稳定。
- score calculation speed 没有明显退化。
- best score over time 没有长时间早早停住。
- 结果业务可解释，不只是数字好看。

## 易错点

| 易错点 | 后果 | 建议 |
| --- | --- | --- |
| 只跑一个数据集 | 配置可能只对单例有效 | 准备多规模、多类型数据 |
| 只看最终分数 | 看不到收敛速度和稳定性 | 同时看曲线和分布 |
| 固定时间下比较 time spent | 指标无意义 | 根据终止条件选择指标 |
| 打开太多统计项 | 统计本身拖慢求解 | 需要时再开细粒度统计 |

## 调优记录模板

每次实验建议记录：

```text
数据集：
配置名称：
终止条件：
Best score：
Score calculation speed：
Move evaluation speed：
异常/失败：
业务观察：
下一步：
```

## 关联笔记

- [Benchmark 测试索引](/blog/timefold/05-benchmarking/00-index)
- [算法总览：CH、LS、ES](/blog/timefold/04-algorithms/01-overview)
- [性能调优清单](/blog/timefold/06-tuning/01-performance-checklist)
