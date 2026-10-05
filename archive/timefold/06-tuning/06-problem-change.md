---
title: "ProblemChange 与实时增量更新"
description: "用 ProblemChange 接口和 ProblemChangeDirector 在不重启 Solver 的情况下增删改问题事实和规划实体，支持插单、取消、资源变更等实时场景"
publishDate: "2026-07-21"
updatedDate: "2026-07-31"
tags: ["timefold","solver","problem-change","real-time-planning","incremental-update"]
order: 6
series: "timefold"
section: "06-tuning"
sectionOrder: 6
isIndex: false
source: "Obsidian"
maturity: "working"
---

## 30 秒速览

`ProblemChange` 是 Timefold 的实时增量更新机制。求解过程中不重启 Solver，直接向 working solution 增/删/改问题事实和规划实体。常用于插单、订单取消、设备故障等场景。

## ProblemChange 接口

```java
public interface ProblemChange<Solution_> {
    void doChange(Solution_ workingSolution, ProblemChangeDirector problemChangeDirector);
}
```

实现 `doChange`，在 working solution 上做修改，通知 director 你改了什么。

## 三种提交入口

| 入口 | 场景 |
| --- | --- |
| `Solver.addProblemChange(change)` | 直接使用 Solver 同步求解 |
| `SolverManager.addProblemChange(problemId, change)` | 服务化异步求解，按 problemId 定位 |
| `SolverJob.addProblemChange(change)` | 持有 SolverJob 引用时使用 |

批量提交用 `addProblemChanges(List<ProblemChange>)`，减少通知开销。

## ProblemChangeDirector 的作用

Director 负责在 working solution 中查找对象并通知 Solver 变更：

```java
// 核心方法：查找 working clone 中的对应对象
<T> T lookUpWorkingObject(T externalObject);
```

查找依赖实体上的 `@PlanningId`。所以需要被查找的实体必须标注 `@PlanningId`：

```java
@PlanningEntity
public class Task {
    @PlanningId
    private Long id;
    // ...
}
```

Director 的其他方法（1.x 文档未详细列出所有签名，以下是常用模式）：

- 添加/移除问题事实 → director 知道后增量更新受影响约束。
- 添加/移除规划实体 → director 知道后更新搜索空间。
- 变更问题事实 → 更新约束中对该事实的引用。

## 标准流程

```java
public class AddTaskProblemChange implements ProblemChange<ProductionSchedule> {

    private final Task newTask;

    public AddTaskProblemChange(Task newTask) {
        this.newTask = newTask;
    }

    @Override
    public void doChange(ProductionSchedule workingSolution,
                          ProblemChangeDirector director) {
        workingSolution.getTasks().add(newTask);
        // director 自动感知实体集合变化，无需手动 notify
    }
}

// 提交
solverManager.addProblemChange(scheduleId, new AddTaskProblemChange(urgentTask));
```

## 关键规则

1. **只改 workingSolution**：`doChange` 的参数是 Solver 内部的工作克隆，不是你提交时的原对象。
2. **问题事实必须先克隆**：官方明确指出规划克隆不会克隆问题事实和问题事实集合。如果要在 `ProblemChange` 中修改问题事实，先做一份克隆再挂到 working solution，否则 working solution 和 best solution 会共享同一个事实对象，引发竞态条件。
3. **用 `lookUpWorkingObject` 找对象**：不要用你持有的外部对象引用。传入的 `newTask` 和 working solution 中的 Task 不是同一个实例。
4. **批量提交**：连续多个变更尽量用 `addProblemChanges` 批量提交。
5. **部分初始化解是可接受的**：前提是第一个求解阶段是 Construction Heuristic。

## 典型场景

### 插单

```java
class InsertOrderChange implements ProblemChange<ProductionSchedule> {
    private final Order newOrder;

    @Override
    public void doChange(ProductionSchedule ws, ProblemChangeDirector director) {
        Task task = Task.fromOrder(newOrder);
        ws.getTasks().add(task);
    }
}
```

### 订单取消

```java
class CancelOrderChange implements ProblemChange<ProductionSchedule> {
    private final long orderId;

    @Override
    public void doChange(ProductionSchedule ws, ProblemChangeDirector director) {
        ws.getTasks().removeIf(t -> t.getOrderId() == orderId);
    }
}
```

### 设备故障（资源不可用）

```java
class MachineDownChange implements ProblemChange<ProductionSchedule> {
    private final String lineId;

    @Override
    public void doChange(ProductionSchedule ws, ProblemChangeDirector director) {
        Line line = director.lookUpWorkingObject(
            ws.getLines().stream().filter(l -> l.getId().equals(lineId)).findFirst().orElse(null));
        if (line != null) {
            line.setAvailable(false);
        }
    }
}
```

## 与 pinned / 连续规划的区别

| 机制 | 适用场景 |
| --- | --- |
| ProblemChange | 求解进行中，动态增删改对象 |
| pinned 实体 | 固定某些实体不动，其余重排 |
| 热启动 + 重新求解 | 全面重新规划，不关心求解过程的中间状态 |

这三种不互斥，可以组合使用。

## 关联笔记

- [动态问题：插单与连续规划](/blog/timefold/02-domain-modeling/06-continuous-planning)
- [ProblemFact、PlanningEntity、PlanningSolution](/blog/timefold/02-domain-modeling/02-domain-objects)
- [运行 Solver 与 SolverManager](/blog/timefold/01-getting-started/04-running-solver)
