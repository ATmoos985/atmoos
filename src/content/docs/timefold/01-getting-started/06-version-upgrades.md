---
title: "版本路线与升级注意"
description: "版本路线与升级注意"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","version","upgrade"]
order: 6
series: "timefold"
section: "01-getting-started"
sectionOrder: 1
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Timefold 的版本升级应按“当前依赖→目标版本→迁移指南→回归基准”的顺序进行。不要用 latest 文档直接推断已有代码的 API，也不要只因为新版本可用就跳过验证。

## 升级前先锁定基线

1. 从构建文件和 BOM 确认实际 Timefold 版本。
2. 记录 JDK、应用框架和 Timefold 集成模块的兼容范围。
3. 保存一组可重复的输入数据、得分、求解时间和可行性结果。
4. 为目标版本单独建立升级分支，避免在一次变更中同时改模型、约束和算法。

## 需要重点核对的内容

- Maven/Gradle 坐标、BOM 和 starter 名称。
- Java 版本、Spring Boot 或 Quarkus 的兼容性。
- 已弃用的注解、配置项和 API。
- Chained Variable、List Variable 与影子变量的建模方式。
- Constraint Streams 的语义、得分计算和解释结果。
- 社区版与商业版的能力边界。

## 安全的升级流程

1. 先阅读目标版本的发布说明与官方迁移指南。
2. 只升级依赖并修复编译错误，不同时调整业务规则。
3. 运行约束单元测试，核对硬约束可行性和每个约束的匹配数。
4. 使用同一数据集运行 Benchmark，比较得分质量、速度和内存。
5. 验证实时变更、持久化和并发调用等集成边界。

## 查阅方式

- 优先使用 [Timefold Solver 官方文档](https://docs.timefold.ai/timefold-solver/latest/) 查看目标版本要求。
- 对大版本迁移，逐项核对 [破坏性变更详解：1.x → 2.x 升级手册](/docs/timefold/01-getting-started/07-migration-1-to-2)。

## 相关教程

- [TimeFold 是什么与适用场景](/docs/timefold/01-getting-started/01-introduction)
- [Solver 配置 XML 与代码配置](/docs/timefold/01-getting-started/03-solver-configuration)
- [Plus 与 Enterprise 企业版功能详解](/docs/timefold/06-tuning/07-commercial-editions)
