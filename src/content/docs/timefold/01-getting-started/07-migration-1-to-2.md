---
title: "破坏性变更详解：1.x → 2.x 升级手册"
description: "Timefold Solver 1.x → 2.x 完整破坏性变更清单，涵盖 API、注解、包名、配置、弃用项，以及两个重要迁移指南：Chained Variable → List Variable 和 VariableListener → 声明式 ShadowVariable"
publishDate: "2026-07-21"
updatedDate: "2026-07-31"
tags: ["timefold","solver","upgrade","migration","breaking-changes"]
order: 7
series: "timefold"
section: "01-getting-started"
sectionOrder: 1
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Timefold Solver 2.x 是一次重大版本升级。**Java 基线从 17 → 21，Spring Boot 从 3.x → 4.x**。最关键的三个破坏性变化：

1. **Constraint Streams 终端 API 重写**：`penalize("name", score)` → `penalize(score).asConstraint("name")`
2. **Chained Variable 完全移除**：必须迁移到 `@PlanningListVariable` + 影子变量体系
3. **VariableListener 完全移除**：必须迁移到声明式 `@ShadowVariable(supplierName=...)` + `@ShadowSources`

## 版本兼容矩阵

| 特性 | 1.x | 2.x |
| --- | --- | --- |
| Java | 17+ | 21+ |
| Spring Boot Starter | 3.x | **4.x** |
| Quarkus | 3.x | 3.x |
| `ScoreManager` | 存在 | 重命名为 `SolutionManager` |
| `ProblemFactChange` | 存在 | 重命名为 `ProblemChange` |
| Chained Variable | 支持 | **完全移除** |
| VariableListener | 支持 | **完全移除** |
| 分数类型包 | 分包子包 | 扁平化 |

## 自动迁移工具

Timefold 提供 OpenRewrite 自动迁移：

```bash
# Maven
mvn org.openrewrite.maven:rewrite-maven-plugin:6.28.1:run \
  -Drewrite.recipeArtifactCoordinates=ai.timefold.solver:timefold-solver-migration:2.2.0 \
  -Drewrite.activeRecipes=ai.timefold.solver.migration.ToLatest
```

**注意**：工具不帮你改 Java/Spring Boot/Quarkus 版本，需手动升级。**Kotlin 用户必须手动执行所有迁移**（工具不支持 Kotlin）。

**必须先升级到 1.x 最新版**，再执行 1.x → 2.x 迁移。

---

## 一、Constraint Streams 终端 API 重写（影响最大）

### 变更

```java
// 1.x（旧）
.penalize("Room conflict", HardSoftScore.ONE_HARD)
.reward("Preferred room", HardSoftScore.ONE_SOFT)

// 2.x（新）
.penalize(HardSoftScore.ONE_HARD).asConstraint("Room conflict")
.reward(HardSoftScore.ONE_SOFT).asConstraint("Preferred room")
```

### 影响范围

- 所有 `penalize`/`reward`/`impact` 的 name-first 重载全部移除。
- `penalizeLong`/`rewardLong`/`impactLong` 重命名为 `penalize`/`reward`/`impact`。
- `ConstraintBuilder.asConstraint(package, name)` → `asConstraint(name)`（单参数）。
- "Constraint name" 改称 "Constraint ID"。
- "Constraint description" 和 "Constraint group" 移除，改为 `ConstraintMetadata`。

### ConstraintFactory 方法重命名

| 1.x | 2.x |
| --- | --- |
| `from(Class)` | `forEach(Class)` |
| `fromUnfiltered(Class)` | `forEachIncludingUnassigned(Class)` |
| `fromUniquePair(...)` | `forEachUniquePair(...)` |

---

## 二、Chained Variable → PlanningListVariable

**Chained planning variable 在 2.0 完全移除**，不是弃用，是不再存在。

### 迁移对照

**旧（链式变量）**：
```java
// 链的锚点
public class Vehicle implements Standstill { ... }

@PlanningEntity
public class Customer implements Standstill {
    @PlanningVariable(graphType = PlanningVariableGraphType.CHAINED,
                      valueRangeProviderRefs = "standstillRange")
    private Standstill previousStandstill;
}
```

**新（列表变量）**：
```java
@PlanningEntity
public class Vehicle {
    @PlanningListVariable
    private List<Customer> customers = new ArrayList<>();
}

@PlanningEntity
public class Customer {
    @InverseRelationShadowVariable(sourceVariableName = "customers")
    private Vehicle vehicle;

    @PreviousElementShadowVariable(sourceVariableName = "customers")
    private Customer previousCustomer;

    @NextElementShadowVariable(sourceVariableName = "customers")
    private Customer nextCustomer;
}
```

### 关键变化

| 概念 | 链式变量 | 列表变量 |
| --- | --- | --- |
| 变量位置 | 在子实体上（指向父实体） | 在父实体上（持有子实体列表） |
| 锚点 | 需要独立的锚点实体 | 不需要，父实体就是锚点 |
| 链完整性 | 手动约束保证 | 列表结构自然保证 |
| ValueRange | 需要两个 provider | 只需一个 provider |
| Move 类型 | TailChainSwap, SubChainChange | ListChangeMove, SubListChangeMove |

### 迁移清理清单

- 删除 `Standstill` 接口和相关方法。
- 删除 "同一链上元素共享同一锚点" 的约束（列表结构自然保证）。
- 审查遍历链的分数约束，改为读取 previous/next 影子变量。
- 不再需要 `@AnchorShadowVariable`，改为 `@InverseRelationShadowVariable`。

---

## 三、VariableListener → 声明式 ShadowVariable

**自定义 VariableListener 在 2.0 完全移除**，改为声明式 supplier 方法。

### 迁移对照

**旧（VariableListener）**：
```java
@PlanningEntity
public class Job {
    private int durationInDays;

    @PlanningVariable
    private LocalDate startDate;

    @ShadowVariable(variableListenerClass = EndDateUpdater.class,
                    sourceVariableName = "startDate")
    private LocalDate endDate;
}

public class EndDateUpdater implements VariableListener<Schedule, Job> {
    @Override
    public void afterVariableChanged(ScoreDirector<Schedule> sd, Job job) {
        sd.beforeVariableChanged(job, "endDate");
        job.setEndDate(job.getStartDate().plusDays(job.getDurationInDays()));
        sd.afterVariableChanged(job, "endDate");
    }
    // ... 6 个生命周期方法
}
```

**新（声明式）**：
```java
@PlanningEntity
public class Job {
    private int durationInDays;

    @PlanningVariable
    private LocalDate startDate;

    @ShadowVariable(supplierName = "endDateSupplier")
    private LocalDate endDate;

    @ShadowSources("startDate")
    public LocalDate endDateSupplier() {
        return startDate == null ? null : startDate.plusDays(durationInDays);
    }
}
```

`VariableListener` 类完全删除。

### Supplier 规则

- 必须是纯函数、确定性函数（无副作用、无字段修改）。
- 依赖的变量列在 `@ShadowSources` 中。
- 可以依赖其他影子变量，用点号路径：`@ShadowSources({"vehicle", "previousCustomer.arrivalTime"})`。
- 可以接收 PlanningSolution 作为参数访问全局数据。
- 一个 Listener 更新多个字段 → 拆成多个 supplier。

---

## 四、ScoreManager → SolutionManager

| 1.x (ScoreManager) | 2.x (SolutionManager) |
| --- | --- |
| `scoreManager.updateScore(sol)` | `solutionManager.update(sol, UPDATE_SCORE_ONLY)` |
| `scoreManager.explainScore(sol)` | `solutionManager.explain(sol, UPDATE_SCORE_ONLY)` |
| `scoreManager.getSummary(sol)` | `solutionManager.explain(sol, UPDATE_SCORE_ONLY).getSummary()` |

---

## 五、Score 相关变更

### Score getter 去 `get` 前缀

| 1.x | 2.x |
| --- | --- |
| `score.getScore()` | `score.score()` |
| `score.getHardScore()` | `score.hardScore()` |
| `score.getSoftScore()` | `score.softScore()` |
| `score.getInitScore()` | `score.initScore()` |

### 分数类型包扁平化

```java
// 1.x
ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore

// 2.x
ai.timefold.solver.core.api.score.HardSoftScore
```

### Long 分数类型合并

`SimpleLongScore`、`HardSoftLongScore`、`HardMediumSoftLongScore`、`BendableLongScore` — 全部合并到对应的非 Long 类型。例如 `HardSoftLongScore` 不存在了，直接使用 `HardSoftScore`（内部已用 `long`）。

---

## 六、命名/注解变更

### nullable → unassigned

| 1.x | 2.x |
| --- | --- |
| `@PlanningVariable(nullable = true)` | `@PlanningVariable(allowsUnassigned = true)` |
| `forEachIncludingNullVars()` | `forEachIncludingUnassigned()` |
| `ifExistsIncludingNullVars()` | `ifExistsIncludingUnassigned()` |

### Sorting API 重命名

| 1.x | 2.x |
| --- | --- |
| `difficultyComparatorClass` | `comparatorClass` |
| `strengthComparatorClass` | `comparatorClass` |
| `difficultyWeightFactoryClass` | `comparatorFactoryClass` |
| `DECREASING_DIFFICULTY` | `DESCENDING` |
| `INCREASING_STRENGTH` | `ASCENDING` |

### @PlanningSolution 属性移除

- `lookUpStrategyType` — 完全移除。
- `autoDiscoverMemberType` — 完全移除。

### 其他注解变更

- `@PlanningId` 包从 `domain.lookup` 移到 `domain.common`。
- `ScoreDirector` 移到 `impl` 包。
- `@ConstraintConfiguration` 被 `ConstraintWeightOverrides` 替代（1.x 后期已开始）。

---

## 七、SolverManager 变更

### 泛型简化

```java
// 1.x
SolverManager<Solution_, ProblemId_>

// 2.x
SolverManager<Solution_>  // 第二个类型参数移除
```

### Builder 模式

```java
// 1.x（弃用）
solverManager.solve(problemId, problemFinder, consumer);

// 2.x
solverManager.solveBuilder()
    .withProblemId(problemId)
    .withProblemFinder(problemFinder)
    .withFinalBestSolutionConsumer(consumer)
    .run();
```

---

## 八、配置属性变更

### SolverConfig

- `SolverConfig` 的 `domainAccessType` 方法全部移除。
- `CartesianProductMoveSelectorConfig` / `UnionMoveSelectorConfig`：`getMoveSelectorConfigList()` → `getMoveSelectorList()`。
- `LocalSearchAcceptorConfig` 不再支持 undo move tabu size / value tabu ratio（含 fading 变体）。
- Drools 相关方法从 `ScoreDirectorFactoryConfig` 移除。
- `ConstraintStreamImplType` 相关方法移除。
- `PlannerBenchmark.benchmarkAndShowReportInBrowser()` → `benchmark()`。

### application.properties

| 1.x | 2.x |
| --- | --- |
| `timefold.solver.solve-length` | `timefold.solver.solve.duration` |
| `quarkus.timefold.solver.solve-length` | `quarkus.timefold.solver.solve.duration` |

---

## 九、Constraint Collector 变更

| 1.x | 2.x |
| --- | --- |
| `countLong()` | `count()`（现在返回 long） |
| `countDistinctLong(fn)` | `countDistinct(fn)` |
| `sumLong(fn)` | `sum(fn)` |
| `averageLong(fn)` | `average(fn)` |

---

## 十、Maven 模块移除

- `timefold-solver-persistence-common` — 合并到 core。
- `timefold-solver-test` — 合并到 core。
- `timefold-solver-webui` — 移除。
- `timefold-solver-jsonb` — 移除。

测试 API 移到 core 包内：`ai.timefold.solver.core.api.score.stream.test`。

---

## 十一、2.2.0 新特性

### Neighborhoods API（预览）

Move Selector 的下一代替代方案。类型安全的声明式 Move 定义，通过 `PlanningSolutionMetaModel` 和 `VariableMetaModel` 操作变量。

```java
PlanningSolutionMetaModel<Timetable> meta = ...;
var timeslotVar = meta.genuineEntity(Lesson.class)
    .basicVariable("timeslot", Timeslot.class);
Move<Timetable> move = Moves.change(timeslotVar, lesson, newTimeslot);
```

### Diversified Late Acceptance（预览）

基于 Late Acceptance 的改进接受策略。

### Solution Diff（预览，Enterprise only）

比较两个方案间实体变量变化。API 在 `ai.timefold.solver.core.preview.api.domain.solution.diff`。

### Recommended Fit → Recommended Assignment

`SolutionManager.recommendFit()` → `recommendAssignment()`，类型 `RecommendedFit` → `RecommendedAssignment`。

---

## 升级检查清单

1. 升级到 1.x 最新版。
2. Java 升级到 21。
3. Spring Boot 升级到 4.x（如果用）。
4. 运行 OpenRewrite 自动迁移。
5. 手动迁移 Chained Variable → List Variable。
6. 手动迁移 VariableListener → 声明式 ShadowVariable。
7. 检查所有 Constraint Stream 终端 API。
8. 替换 `ScoreManager` → `SolutionManager`。
9. 替换 `ProblemFactChange` → `ProblemChange`。
10. 更新 `application.properties` 属性名。
11. 检查分数类型包导入路径。

## 关联笔记

- [版本路线与升级注意](/docs/timefold/01-getting-started/06-version-upgrades)
- [PlanningListVariable 与列表变量影子体系](/docs/timefold/02-domain-modeling/07-list-variables)
- [PlanningClone 与 SolutionManager / ScoreManager](/docs/timefold/02-domain-modeling/08-solution-management)
- [ProblemChange 与实时增量更新](/docs/timefold/06-tuning/06-problem-change)
