---
title: "PlanningClone 与 SolutionManager / ScoreManager"
description: "@DeepPlanningClone 强制问题事实参与克隆；SolutionManager 用于解可行性分析和分数分解；ScoreManager 用于对任意方案计算分数"
publishDate: "2026-07-21"
updatedDate: "2026-07-31"
tags: ["timefold","solver","planning-clone","solution-manager","score-manager"]
order: 8
series: "timefold"
section: "02-domain-modeling"
sectionOrder: 2
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

三个常被遗漏但实际项目一定会碰到的概念：

- `@DeepPlanningClone`：防止 JPA 关联导致克隆不完整。
- `SolutionManager`：解释方案分数、分析可行性、更新影子变量。
- `ScoreManager`：给任意方案计分，不启动 Solver。

## 规划克隆机制

Timefold 内部会对 PlanningSolution 做规划克隆（planning clone）。克隆时：
- **规划实体被深克隆**（它们的规划变量会被修改）。
- **问题事实默认不克隆**（它们在求解过程中不变）。

### 问题：JPA 双向引用导致克隆不完整

当问题事实类通过 `@ManyToOne` 引用回 PlanningSolution 时，默认克隆不克隆问题事实，可能引发持久化异常：

```java
@PlanningSolution
@Entity
public class Conference {
    @OneToMany(mappedBy = "conference")
    private List<Room> roomList;
}

@Entity
public class Room {
    @ManyToOne
    private Conference conference;   // 引用回 PlanningSolution
}
```

### 解决：@DeepPlanningClone

```java
@DeepPlanningClone
@Entity
public class Room {
    @ManyToOne
    private Conference conference;
}
```

加了 `@DeepPlanningClone` 后，Room 也会在规划克隆时被克隆，避免 cloned entity 和原始 entity 共享 Conference 引用。

## SolutionManager

用于分析和解释方案。不启动 Solver，只对已有方案操作。

### 创建

```java
// 手动创建
SolutionManager<MySolution, HardSoftScore> solutionManager
    = SolutionManager.create(solverFactory);
```

```java
// Spring Boot 注入
@Autowired
SolutionManager<Timetable, HardSoftScore> solutionManager;
```

### 核心操作

```java
// 判断方案是否可行（hard 约束是否全部满足）
ScoreAnalysis<HardSoftScore> analysis = solutionManager.analyze(solution);
boolean feasible = analysis.isFeasible();

// 获取每个约束的贡献明细
Map<String, ConstraintAnalysis> constraintMap = analysis.getConstraintAnalysisMap();

// 更新影子变量（不求解，只计算派生字段）
solutionManager.updateShadowVariables(solution);
```

### 更新影子变量

`SolutionManager.updateShadowVariables(solution)` 在给定规划变量值的前提下，触发所有影子变量更新和级联计算。用途：

- 手工构造方案后补齐推导字段。
- 测试时验证影子变量逻辑。
- 插单/重排前预处理已有方案。

## ScoreManager

比 SolutionManager 更轻量，只计算分数。

### 创建

```java
// 手动创建
ScoreManager<MySolution, HardSoftScore> scoreManager
    = ScoreManager.create(solverFactory);
```

```java
// Spring Boot 注入
@Autowired
ScoreManager<Timetable, HardSoftScore> scoreManager;
```

### 核心操作

```java
// 计算方案分数
HardSoftScore score = scoreManager.updateScore(solution);

// 获取带解释的分数
ScoreExplanation<MySolution, HardSoftScore> explanation
    = scoreManager.explainScore(solution);
```

## 三者对比

| 工具 | 用途 | 是否修改方案 |
| --- | --- | --- |
| `@DeepPlanningClone` | 强制事实类参与克隆 | 注解，运行时生效 |
| `SolutionManager` | 分析可行性、解释分数、更新影子变量 | 会更新影子变量字段 |
| `ScoreManager` | 计算和解释分数 | 不会修改方案 |

| 工具 | 适用场景 |
| --- | --- |
| `SolutionManager` | 调试分数组成、验证方案可行、影子变量测试 |
| `ScoreManager` | REST 接口返回方案分数、多方案快速比较 |

## Spring Boot 自动注入

Timefold Spring Boot Starter 可自动注入以下类型：

- `SolverConfig`
- `SolverFactory`
- `SolverManager`
- `SolutionManager`
- `ScoreManager`
- `ConstraintMetaModel`
- `ConstraintVerifier`

以上只需要在 Spring 组件中 `@Autowired` 即可，框架根据 classpath 和配置自动识别领域类。

## 关联笔记

- [Score 体系：硬约束、软约束与权重](/blog/timefold/03-constraints/01-score)
- [Score 解释：Analysis、Diff、HeatMap](/blog/timefold/03-constraints/06-score-analysis)
- [Spring Boot、Quarkus 与持久化集成](/blog/timefold/01-getting-started/05-framework-integration)
- [ConstraintVerifier 约束单元测试](/blog/timefold/03-constraints/08-testing)
