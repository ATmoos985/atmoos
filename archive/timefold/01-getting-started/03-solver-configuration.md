---
title: "Solver 配置 XML 与代码配置"
description: "Solver 配置 XML 与代码配置"
publishDate: "2026-05-14"
updatedDate: "2026-07-31"
tags: ["timefold","solver","solver-config","configuration"]
order: 3
series: "timefold"
section: "01-getting-started"
sectionOrder: 1
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Timefold 的 Solver 配置至少要说明三件事：

1. 哪个类是 `@PlanningSolution`。
2. 哪些类是 `@PlanningEntity`。
3. 分数怎么计算，通常指向一个 `ConstraintProvider`。

算法和终止条件可以先用默认或简单配置，后续再通过 Benchmark 调。

## XML 配置的角色

XML 配置适合放稳定的求解器结构，例如：

- `solutionClass`：规划解类。
- `entityClass`：规划实体类。
- `scoreDirectorFactory`：评分方式。
- `termination`：终止条件。
- `constructionHeuristic`：构建初始解。
- `localSearch`：局部搜索阶段。

一个典型结构可以理解为：

```xml
<solver>
  <solutionClass>...</solutionClass>
  <entityClass>...</entityClass>

  <scoreDirectorFactory>
    <constraintProviderClass>...</constraintProviderClass>
  </scoreDirectorFactory>

  <termination>...</termination>
  <constructionHeuristic>...</constructionHeuristic>
  <localSearch>...</localSearch>
</solver>
```

## 代码配置的角色

`SolverConfig` 适合处理运行时变化，例如：

- 不同用户请求设置不同求解时长。
- 不同场景切换不同终止条件。
- Benchmark 中批量生成不同参数组合。

工程上常见做法：

1. 启动时读取一份模板配置。
2. 每次请求复制一份配置。
3. 在副本上修改动态参数。
4. 用副本创建 `SolverFactory`。

不要多个线程共享同一个会被修改的 `SolverConfig` 实例。

## SolverFactory 和 Solver

- `SolverFactory<Solution_>`：根据配置创建 Solver，泛型是规划解类型。
- `Solver<Solution_>`：真正执行求解。
- 一个 Solver 通常一次只解决一个问题实例。
- 服务化场景优先考虑 `SolverManager`，避免 HTTP 请求线程被长时间占住。

## 配置方式选择

| 场景 | 建议 |
| --- | --- |
| 学习和原型 | XML 简单配置，便于对照官方文档 |
| Spring Boot / Quarkus 项目 | 使用框架集成配置，减少样板代码 |
| 需要按请求动态调整 | `SolverConfig` 复制模板后修改 |
| 需要大量调参实验 | Benchmark 配置或程序化生成配置 |

## 易错点

- XML 路径建议使用 classpath resource，不要依赖本机绝对路径。
- `Solution_` 泛型必须是规划解类，不是实体类。
- 注解推荐放在 getter 上，字段注解也支持，但团队内最好统一。
- 领域访问默认可用反射；追求性能时再考虑 Gizmo 等直接访问方式。
- 自定义属性要暴露 public setter，便于配置注入。

## 和项目的关系

生产排程项目中，可以把稳定配置放在 `solverConfig.xml`，把这些内容留给运行时传入或动态设置：

- 求解时长。
- 环境模式。
- 是否启用某些软约束权重。
- 不同规模数据集对应的算法配置。

## 关联笔记

- [算法总览：CH、LS、ES](/blog/timefold/04-algorithms/01-overview)
- [Benchmark 测试索引](/blog/timefold/05-benchmarking/00-index)
