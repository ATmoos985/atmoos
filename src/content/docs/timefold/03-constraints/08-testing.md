---
title: "ConstraintVerifier 约束单元测试"
description: "用 ConstraintVerifier 对单个约束或整个 ConstraintProvider 做单元测试，验证 penalize/reward 值和约束匹配数量"
publishDate: "2026-07-21"
updatedDate: "2026-07-31"
tags: ["timefold","solver","constraint-verifier","testing","constraint-streams"]
order: 8
series: "timefold"
section: "03-constraints"
sectionOrder: 3
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

`ConstraintVerifier` 是 Timefold 提供的约束单元测试工具。它让你在不启动 Solver 的情况下，直接验证某个约束对一组给定数据产生的惩罚/奖励值是否正确。

核心流程：`verifyThat(约束方法) → given(测试数据) → penalizesBy(期望值)`。

## 为什么需要

- 约束逻辑错了，Solver 在优化错误的分数。
- 解质量问题的根因往往是"约束没表达业务规则"，而不是算法不够好。
- 约束测试比 Solver 集成测试快得多，适合高频运行。

## 基本结构

```java
private ConstraintVerifier<MyConstraintProvider, MySolution> constraintVerifier
    = ConstraintVerifier.build(
        new MyConstraintProvider(),
        MySolution.class,
        MyEntity.class,
        MyFact.class);
```

参数：ConstraintProvider 实例 → 规划解类 → 所有涉及的实体和事实类。

## 测试单个约束

```java
@Test
void roomConflict() {
    Room roomA = new Room("A");
    Lesson lesson1 = new Lesson(1, "Math", "Monday 08:00", roomA);
    Lesson lesson2 = new Lesson(2, "Physics", "Monday 08:00", roomA);

    constraintVerifier.verifyThat(MyConstraintProvider::roomConflict)
            .given(roomA, lesson1, lesson2)
            .penalizesBy(1);   // HardSoftScore.ONE_HARD 被匹配 1 次
}
```

`penalizesBy(n)` 的值 = 单次匹配权重 × 匹配次数。

### 动态权重的断言

```java
constraintVerifier.verifyThat(MyConstraintProvider::minimizeChangeover)
        .given(task1, task2)
        .penalizesBy(30);   // 换型时间 30 分钟 → 扣 30 soft
```

### 用 `rewardsWith()` 断言奖励

```java
constraintVerifier.verifyThat(MyConstraintProvider::preferredRoom)
        .given(roomB, lesson)
        .rewardsWith(1);
```

## 测试全部约束

不传约束方法，用 `scores()` 断言总分数：

```java
@Test
void givenFactsMultipleConstraints() {
    constraintVerifier.verifyThat()
            .given(roomA, lesson1, lesson2)
            .scores(HardSoftScore.ofSoft(20));  // 期望 0hard/-20soft
}
```

需要确保 `given()` 提供了约束涉及的所有实体和事实，否则会漏匹配或报错。

## givenSolution 与影子变量

可以直接传整个 PlanningSolution，但影子变量默认不更新：

```java
// 影子变量不会自动设置
constraintVerifier.verifyThat(MyConstraintProvider::capacity)
        .givenSolution(solution)
        .penalizesBy(20);

// 显式要求更新所有影子变量
constraintVerifier.verifyThat(MyConstraintProvider::capacity)
        .givenSolution(solution)
        .settingAllShadowVariables()
        .penalizesBy(20);
```

注意：`ConstraintVerifier` 不会触发自定义变量监听器（custom variable listener），只会更新内置的影子变量。如果约束依赖手动变量监听器，需由测试代码自行赋值。

## Spring Boot 集成

在 Spring Boot 项目中直接注入：

```java
@SpringBootTest
public class MyConstraintProviderTest {
    @Autowired
    ConstraintVerifier<MyConstraintProvider, MySolution> constraintProvider;
}
```

## 常用断言模式

| 场景 | 断言 |
| --- | --- |
| 无违反 | `.penalizesBy(0)` 或 `.rewardsWith(0)` |
| 匹配 N 次 | `.penalizesBy(N)` |
| 动态惩罚值 | `.penalizesBy(expectedValue)` |
| 总分数验证 | `.scores(HardSoftScore.ofHard(1))` |

## 排程约束测试示例

```java
// 模具冲突 — 同一时间同一模具被两个任务占用
@Test
void moldConflict() {
    Mold mold = new Mold("M001");
    Task task1 = new Task(1, mold, LocalDateTime.parse("2026-07-21T08:00"));
    Task task2 = new Task(2, mold, LocalDateTime.parse("2026-07-21T08:00"));

    constraintVerifier.verifyThat(MyProvider::moldConflict)
            .given(mold, task1, task2)
            .penalizesBy(1);   // ONE_HARD
}

// 产线不兼容
@Test
void lineIncompatible() {
    Line line = new Line("L1", Set.of("A", "B"));
    Task task = new Task(1, "C", line);

    constraintVerifier.verifyThat(MyProvider::lineProductIncompatible)
            .given(line, task)
            .penalizesBy(1);
}

// 延期
@Test
void orderTardiness() {
    Task task = new Task(1, "CUSTOMER_A",
        LocalDateTime.parse("2026-07-21T16:00"),    // 交期
        LocalDateTime.parse("2026-07-21T18:00"));   // 实际结束

    constraintVerifier.verifyThat(MyProvider::orderTardiness)
            .given(task)
            .penalizesBy(120);   // 延期 120 分钟
}
```

## 约束可见性

约束方法必须对测试类可见。在 `ConstraintProvider` 实现中，约束方法通常是 `public`，这自然满足要求。如果约束被提取为私有方法辅助，需要改成包可见或公开。

## 关联笔记

- [Constraint Streams 总览](/docs/timefold/03-constraints/02-constraint-streams)
- [常用构件：forEach、filter、join、groupBy](/docs/timefold/03-constraints/03-stream-building-blocks)
- [Score 体系：硬约束、软约束与权重](/docs/timefold/03-constraints/01-score)
- [PlanningListVariable 与列表变量影子体系](/docs/timefold/02-domain-modeling/07-list-variables)
