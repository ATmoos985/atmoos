---
title: "Plus 与 Enterprise 企业版功能详解"
description: "Timefold Plus/Enterprise 商业版完整功能对比：ScoreAnalysis、NearbySelection、多线程求解、PartitionedSearch、多阶段Move、NodeSharing、ConstraintProfiling、增量影子变量，附配置方式"
publishDate: "2026-07-21"
updatedDate: "2026-07-31"
tags: ["timefold","solver","enterprise","plus","commercial"]
order: 7
series: "timefold"
section: "06-tuning"
sectionOrder: 6
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

Timefold 的商业版分 Plus 和 Enterprise 两档。Plus 提供分数分析和推荐功能，Enterprise 在此基础上加了性能优化和多线程求解。两者的 artifact 相同（`timefold-solver-enterprise-*`），通过许可证密钥控制功能级别。

## 功能对比

| 功能 | Plus | Enterprise |
| --- | --- | --- |
| Score Analysis（分数分析） | ✓ | ✓ |
| Recommendation API（推荐分配） | ✓ | ✓ |
| Nearby Selection（邻近选择） | | ✓ |
| Multi-threaded Solving（多线程求解） | | ✓ |
| Partitioned Search（分区搜索） | | ✓ |
| Constraint Profiling（约束性能分析） | | ✓ |
| Multi-stage Moves（多阶段移动） | | ✓ |
| Faster Shadow Variables（加速影子变量） | | ✓ |
| Automatic Node Sharing（自动节点共享） | | ✓ |
| Throttling Best Solution Events（节流最优解事件） | | ✓ |

## 许可证安装

四种方式，优先级从高到低：

1. 环境变量 `TIMEFOLD_LICENSE` — 直接填写 PEM 内容。
2. 环境变量 `TIMEFOLD_LICENSE_PATH` — 指向 PEM 文件路径。
3. 用户主目录下的 `timefold-license.pem`。
4. classpath 根目录下的 `timefold-license.pem`。

获取：Timefold License Manager。不要提交到公开仓库，不要记录到日志。

## Maven 坐标

社区版和企业版 artifact 并列存在，**只替换已在用的模块**：

| 社区版 | 企业版 |
| --- | --- |
| `ai.timefold.solver:timefold-solver-bom` | `ai.timefold.solver.enterprise:timefold-solver-enterprise-bom` |
| `ai.timefold.solver:timefold-solver-core` | `ai.timefold.solver.enterprise:timefold-solver-enterprise-core` |
| `ai.timefold.solver:timefold-solver-spring-boot-starter` | `ai.timefold.solver.enterprise:timefold-solver-enterprise-spring-boot-starter` |
| `ai.timefold.solver:timefold-solver-quarkus` | `ai.timefold.solver.enterprise:timefold-solver-enterprise-quarkus` |

注：Enterprise BOM 包含了社区版 BOM 中的所有模块 + 企业版模块。

---

## 一、Score Analysis — 分数分析（Plus）

回答"为什么这个方案是这个分"的核心工具。**不启动 Solver**，对现有方案做分数分解。

### 基本用法

```java
SolutionManager<VehicleRoutePlan, HardSoftScore> solutionManager
    = SolutionManager.create(solverFactory);

ScoreAnalysis<HardSoftScore> analysis = solutionManager.analyze(vehicleRoutePlan);

// 打印可读摘要
System.out.println(analysis.summarize());
// → -10343soft: constraint (minimizeTravelTime) has 6 matches:
//     -2335soft: Vehicle '1' total travel time is 0 hours 39 minutes.
//     ...

// 编程访问
analysis.constraintMap().forEach((constraintRef, constraintAnalysis) -> {
    String constraintId = constraintRef.constraintId();
    HardSoftScore score = constraintAnalysis.score();
    int count = constraintAnalysis.matchCount();
});
```

### Diff 两个方案

```java
ScoreAnalysis<HardSoftScore> diff = firstAnalysis.diff(secondAnalysis);
diff.constraintMap().forEach((constraintRef, analysis) -> {
    // analysis.score() — 差值分数（正数 = 第一方案更优）
});
```

### 性能

对大数据的 Score Analysis 可设置 `FETCH_MATCH_COUNT` 跳过匹配明细，只保留计数。

### ConstraintJustification

约束匹配可以附带业务信息，通过实现 `ConstraintJustification` 接口：

```java
record TravelTimeJustification(String vehicleName, long totalSeconds)
    implements ConstraintJustification {}
```

在 Constraint Stream 中：
```java
.penalize(HardSoftScore.ONE_SOFT)
.justifyWith((vehicle, totalTime) ->
    new TravelTimeJustification(vehicle.getName(), totalTime.getSeconds()))
.asConstraint("Minimize travel time");
```

---

## 二、Solution Diff — 方案差异（预览，Enterprise）

比较两个方案的实体变量变化。

```xml
<!-- 需启用预览特性 -->
<enablePreviewFeature>PLANNING_SOLUTION_DIFF</enablePreviewFeature>
```

```java
PlanningSolutionDiff<VehicleRoutePlan> diff
    = solutionManager.diff(oldSolution, newSolution);
// diff 包含：changedEntities, addedEntities, removedEntities
```

方便在调整约束权重后，看哪些任务移动了。

---

## 三、Nearby Selection — 邻近选择（Enterprise）

像 VRP 这类空间问题，A 地的车辆几乎不会直接跳到 50km 外的 B 地。Nearby selection 把候选 move 限制在"附近"，提高搜索效率。

```xml
<unionMoveSelector>
  <changeMoveSelector>
    <valueSelector>
      <nearbySelection>
        <originEntitySelector mimicSelectorRef="..."/>
        <nearbyDistanceMeterClass>...MyDistanceMeter</nearbyDistanceMeterClass>
        <nearbySelectionDistributionType>PARABOLIC</nearbySelectionDistributionType>
      </nearbySelection>
    </valueSelector>
  </changeMoveSelector>
</unionMoveSelector>
```

需要实现距离计量器（`NearbyDistanceMeter`）。分布类型决定"近多远少"的衰减方式。

---

## 四、Multi-threaded Solving — 多线程求解（Enterprise）

**同一问题内**，多个线程并行评估 move。

### 配置

```xml
<solver>
  <moveThreadCount>AUTO</moveThreadCount>
</solver>
```

```properties
# Spring Boot
timefold.solver.move-thread-count=AUTO

# Quarkus
quarkus.timefold.solver.move-thread-count=AUTO
```

### 参数

- `NONE`（默认，单线程）
- `AUTO`（推荐，低核机器自动退化为单线程）
- 或静数值（如 `4`）

### 前置条件

- 所有实体/值类必须有 `@PlanningId`。
- 确定性约束（不能在约束中调用随机数/当前时间）。

### 伸缩性

- Move eval speed ≤ 10K/sec：线性扩展到 N 核。
- Move eval speed ≈ 100K/sec：4-8 线程仍有收益。
- 更高速度：瓶颈已不在 move 评估，多线程无益，应考虑 score trap 或自定义 move。

### 可复现性

`moveThreadCount=AUTO` 或 CPU 核数依赖的值会因硬件不同产生不同结果。要保证所有机器一致，用固定数值。

---

## 五、Partitioned Search — 分区搜索（Enterprise）

将大数据集按规则拆分成 N 个子集，并行求解每个子集，最后合并。

### 适用场景

- 实体数 5000+。
- 约束跨分区边界较少。

### 局限

- 分区边界上的约束被忽略，解可能不是全局最优。
- 弥补方式：Partitioned Search 后面再跟一个非分区 Local Search。

### 配置

```xml
<partitionedSearch>
  <solutionPartitionerClass>...MyPartitioner</solutionPartitionerClass>
  <runnablePartThreadLimit>4</runnablePartThreadLimit>
  <constructionHeuristic>...</constructionHeuristic>
  <localSearch>...</localSearch>
</partitionedSearch>
```

### SolutionPartitioner 接口

```java
public interface SolutionPartitioner<Solution_> {
    List<Solution_> splitWorkingSolution(
        Solution_ workingSolution, Integer runnablePartThreadLimit);
}
```

`runnablePartThreadLimit`：`UNLIMITED` / `AUTO`（默认）/ 固定数字。控制同时占用多少 CPU 核心。

---

## 六、Multi-stage Moves — 多阶段移动（Enterprise）

由多个阶段组合的 Move，每个阶段评估但不执行，最后一次性执行。

适用场景：自定义 ruin-and-recreate move，预计算硬约束安全的候选值。

配置类：`MultistageMoveSelectorConfig` / `ListMultistageMoveSelectorConfig`。

---

## 七、Automatic Node Sharing — 自动节点共享（Enterprise）

**约束流中重复的 sub-stream 自动共享计算结果**。

### 原理

约束流中每个 building block（join/filter/groupBy）是一个节点。当多个约束做相同的操作（如都 join 同类型），这些操作可以复用同一个节点，从而只执行一次。

### 效果

对于有大量共享操作的 `ConstraintProvider` 带来明显的 move evaluation 加速。

### 约束

- `ConstraintProvider` 类不能是 `final`。
- 不能有 `final` 方法。
- 不能访问 `protected` 类/方法/字段。
- 在约束中打断点不会被命中（因为类被运行时字节码改写）。

### 启用

默认启用。禁用：

```xml
<scoreDirectorFactory>
  <constraintStreamAutomaticNodeSharing>false</constraintStreamAutomaticNodeSharing>
</scoreDirectorFactory>
```

---

## 八、Constraint Profiling — 约束性能分析（Enterprise）

找出哪个约束最慢。

### 启用

```properties
timefold.solver.constraint-stream-profiling-enabled=true
```

日志输出：
- **INFO**：每个约束的耗时、占比。
- **DEBUG**：每个 building block（join/filter/scoring）的耗时。
- **TRACE**：INSERT/UPDATE/RETRACT 生命周期分解。

### 前提

必须在**单线程**模式下运行（不能和多线程同时开）。

---

## 九、Faster Shadow Variables — 加速影子变量（Enterprise）

Enterprise Edition 中影子变量更新是增量的。这是默认行为，无需配置。

对于大量使用影子变量的模型，这是重要的性能提升。

---

## 十、Throttling Best Solution Events — 节流最优解事件（Enterprise）

在求解极快（如小数据集）或监听器处理重的场景下，限制 `BestSolutionChangedEvent` 的推送频率，减少处理压力。

---

## 十一、多 SolverManager 实例（社区版）

社区版支持按名称注入多个 `SolverManager`：

```properties
timefold.solver."fastSolver".termination.duration=5s
timefold.solver."regularSolver".termination.duration=30s
```

```java
@Named("fastSolver") SolverManager<Timetable> fastSolver;
@Named("regularSolver") SolverManager<Timetable> regularSolver;
```

这和多线程/分区搜索不同 — 这是独立求解不同问题实例。

---

## 选择建议

| 场景 | 建议版本 |
| --- | --- |
| 学习和原型 | Community |
| 需要分数解释给业务 | Plus |
| 数据量大（5000+ 实体） | Enterprise |
| 生产环境需要多线程 | Enterprise |
| 频繁需要性能调优 | Enterprise（Constraint Profiling） |
| 中小企业、无高并发行需求 | Community / Plus |

## 关联笔记

- [Score 体系：硬约束、软约束与权重](/blog/timefold/03-constraints/01-score)
- [Score 解释：Analysis、Diff、HeatMap](/blog/timefold/03-constraints/06-score-analysis)
- [多线程与企业版边界](/blog/timefold/06-tuning/03-multithreading-editions)
- [PlanningClone 与 SolutionManager / ScoreManager](/blog/timefold/02-domain-modeling/08-solution-management)
- [破坏性变更详解：1.x → 2.x 升级手册](/blog/timefold/01-getting-started/07-migration-1-to-2)
