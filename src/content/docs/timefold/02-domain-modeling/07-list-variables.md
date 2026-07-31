---
title: "PlanningListVariable 与列表变量影子体系"
description: "@PlanningListVariable 是 1.x 的第一公民变量类型，用于一对多有序列表分配，配套影子变量包括 @InverseRelationShadowVariable、@IndexShadowVariable、@PreviousElementShadowVariable、@NextElementShado…"
publishDate: "2026-07-21"
updatedDate: "2026-07-31"
tags: ["timefold","solver","planning-list-variable","shadow-variable","domain-modeling"]
order: 7
series: "timefold"
section: "02-domain-modeling"
sectionOrder: 2
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

`@PlanningListVariable` 建模"一个实体持有一组有序元素"的关系，如车辆→访问点列表、产线→任务列表。它自带一整套影子变量体系，不需要手写链式建模。

**和 Chained Variable 的区别：Chained 是实体指向前驱形成链，list variable 是实体直接持有一个有序 List。**

## 何时用 List Variable

三个条件同时满足时用：

1. 规划实体与规划值是一对多关系。
2. 列表中的顺序有意义。
3. 每个规划值只能分配给一个规划实体。

## 基本用法

```java
@PlanningEntity
public class Vehicle {
    private int capacity;

    @PlanningListVariable
    private List<Customer> customers = new ArrayList<>();
}
```

### 参数

| 参数 | 说明 |
|------|------|
| `allowsUnassignedValues` | 默认 `false`。设为 `true` 允许规划值不分配给任何列表 |
| `comparatorClass` | 规划值的排序比较器，帮助启发式算法更高效 |

### 允许未分配值

```java
@PlanningListVariable(allowsUnassignedValues = true)
public List<Customer> getCustomers() { return customers; }
```

理解：允许未分配后，必须在约束中惩罚未分配的值，否则"全部不分配"可能成为最优解。

Constraint Streams 默认过滤掉未分配值。需要处理时用 `forEachIncludingUnassigned()`。

## 配套影子变量体系

List variable 的规划值需要有 `@PlanningEntity` 注解，并用影子变量建立双向关系。

### @InverseRelationShadowVariable — 反向关系

建立"我被哪个实体持有"的双向关系：

```java
@PlanningEntity
public class Customer {
    @InverseRelationShadowVariable(sourceVariableName = "customers")
    private Vehicle vehicle;
}
```

`sourceVariableName` 指向持有方实体上 `@PlanningListVariable` 字段的名称。

### @IndexShadowVariable — 索引位置

获取元素在列表中的位置：

```java
@PlanningEntity
public class Customer {
    @IndexShadowVariable(sourceVariableName = "customers")
    private Integer indexInVehicle;   // 必须是 Integer，未分配时为 null
}
```

### @PreviousElementShadowVariable — 前驱元素

获取列表中前一个元素：

```java
@PlanningEntity
public class Customer {
    @PreviousElementShadowVariable(sourceVariableName = "customers")
    private Customer previousCustomer;
}
```

第一个元素的 previous 为 `null`。

### @NextElementShadowVariable — 后继元素

获取列表中后一个元素：

```java
@PlanningEntity
public class Customer {
    @NextElementShadowVariable(sourceVariableName = "customers")
    private Customer nextCustomer;
}
```

最后一个元素的 next 为 `null`。

### @CascadingUpdateShadowVariable — 级联更新

当前驱变化时，级联更新后续元素的影子变量（如到达时间）：

```java
@PlanningEntity
public class Customer {
    @CascadingUpdateShadowVariable(targetMethodName = "updateArrivalTime")
    private LocalDateTime arrivalTime;

    public void updateArrivalTime() {
        arrivalTime = previousCustomer == null
            ? vehicle.getDepartureTime()
            : previousCustomer.arrivalTime
                .plus(previousCustomer.serviceDuration)
                .plus(travelTimeFrom(previousCustomer));
    }
}
```

级联更新在所有影子变量更新后触发，当值不再变化或到达列表末尾时停止。

## Shadow Variable 测试

用 `SolutionManager.updateShadowVariables` 手动触发影子变量更新：

```java
var vehicle = new Vehicle();
var c1 = new Customer();
var c2 = new Customer();
vehicle.setCustomers(List.of(c1, c2));

SolutionManager.updateShadowVariables(VehicleRoutePlan.class, vehicle, c1, c2);

assertThat(c1.previousCustomer).isNull();
assertThat(c1.nextCustomer).isSameAs(c2);
```

## 生产排程映射

| List Variable 概念 | 排程映射 |
| --- | --- |
| 持有实体 (Vehicle) | 产线 / 设备 |
| 列表元素 (Customer) | 生产任务 |
| previous/next | 前后任务关系 |
| index | 任务顺序 |
| cascading update | 开始时间、结束时间级联计算 |
| inverse relation | 任务所属产线 |

## 和 Chained Variable 的选择

| 特性 | Chained Variable | List Variable |
| --- | --- | --- |
| 数据建模 | 实体指向前驱 | 实体持有列表 |
| 锚点 | 需要独立的锚点实体 | 不需要 |
| 适用场景 | 路径、生产顺序 | 车辆路径、任务列表 |
| 1.x 推荐 | 旧模式，有迁移指南 | 新项目推荐 |
| Move 类型 | TailChainSwap, SubChainChange | ListChangeMove, SubListChangeMove |

在 1.x 中，list variable 是官方推荐的方向。但如果项目已用 chained variable 完成建模且不需要迁移，不必强制改。

## 关联笔记

- [PlanningVariable 与 ValueRange](/docs/timefold/02-domain-modeling/03-planning-variables)
- [影子变量与链式建模](/docs/timefold/02-domain-modeling/04-shadow-variables)
- [ProblemFact、PlanningEntity、PlanningSolution](/docs/timefold/02-domain-modeling/02-domain-objects)
- [MoveSelector 移动选择器](/docs/timefold/04-algorithms/04-move-selectors)
