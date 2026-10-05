---
title: "调优与扩展索引"
description: "调优与扩展索引"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","tuning","extension","index"]
order: 0
series: "timefold"
section: "06-tuning"
sectionOrder: 6
isIndex: true
source: "Obsidian"
maturity: "working"
---

## 这个文件夹解决什么

本文件夹回答：真实项目里如何让 Timefold 模型跑快、跑稳、可解释、可维护。

## 笔记列表

| 笔记 | 状态 | 一句话说明 |
| --- | --- | --- |
| [性能调优清单](/blog/timefold/06-tuning/01-performance-checklist) | 持续整理 | 模型、约束、算法、数据规模四层调优 |
| [动态约束与权重调参](/blog/timefold/06-tuning/02-dynamic-constraints) | 持续整理 | 运行时权重、参数化约束、业务调参 |
| [多线程与企业版边界](/blog/timefold/06-tuning/03-multithreading-editions) | 持续整理 | 社区版/企业版能力边界 |
| [大规模排程建模策略](/blog/timefold/06-tuning/04-large-scale-scheduling) | 持续整理 | 分解、滚动窗口、固定窗口、热启动 |
| [常见问题 FAQ](/blog/timefold/06-tuning/05-faq) | 持续整理 | 建模和调参中的高频问题 |
| [ProblemChange 与实时增量更新](/blog/timefold/06-tuning/06-problem-change) | 持续整理 | 运行时动态增删改实体与事实 |
| [Plus 与 Enterprise 企业版功能详解](/blog/timefold/06-tuning/07-commercial-editions) | 持续整理 | Plus/Enterprise 功能对比、配置和各特性用途 |

## 先记住

真实项目调优一般不是只调算法，而是同时调：

- 模型：减少无意义变量和候选值。
- 约束：减少高复杂度匹配。
- 算法：选择合适 CH + LS 组合。
- 数据：分批、窗口、固定已确定部分。
- 验证：环境模式、约束单测、Benchmark。
