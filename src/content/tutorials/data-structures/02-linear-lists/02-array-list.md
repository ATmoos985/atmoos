---
title: 1.2 顺序表
description: 顺序表的存储、插入、删除与查找，附 C 语言实现。
publishDate: 2026-10-06
sourceUpdated: 2026-08-11
course: data-structures
series: 数据结构
chapter: 线性表
chapterOrder: 1
order: 2
tags:
  - 数据结构
  - 线性表
draft: false
---
> [!abstract] 本页速览
> **本页解决的问题**：
> - 怎样用连续内存实现线性表，并从位序直接计算元素地址。
> - 插入、删除为什么需要按特定方向移动元素，动态扩容又怎样改变容量边界。
>
> **知识位置**：
> - 本页把 [1.1 线性表](/tutorials/data-structures/02-linear-lists/01-list) 的逻辑接口落实为数组表示；它也是数组、动态数组和许多表内结点布局的基础。
>
> **前置知识**：
> - [1.1 线性表](/tutorials/data-structures/02-linear-lists/01-list)：位序、操作契约和逻辑不变量。
> - [0.2 算法和算法评价](/tutorials/data-structures/01-introduction/02-algorithms)：最好、最坏、平均与均摊代价。
>
> **学完后应能解释**：
> - 静态顺序表与动态顺序表的状态字段和不变量。
> - 第 $i$ 个元素的地址、插入和删除的逐步状态。
> - 为什么“随机访问为常数时间”不等于“按值查找也为常数时间”。

> [!note] 知识卡片
> - [402-顺序表位序与数组下标](/tutorials/data-structures/03-cards/402-position-index)


---

## § 1.2.1 为什么使用连续存储

- 若操作经常给出逻辑位序，例如“读取第 100 个元素”，最直接的办法是让每个元素占用相同大小，并把它们依次放入连续地址。
	- 这样不必从第一个元素开始寻找，只需用首地址加上固定偏移。

连续布局同时带来约束：

- 数组中第 $i$ 个位置之前必须恰好保存前 $i-1$ 个元素，不能出现空洞。
- 中间插入不能直接占用已有位置，需要先移动后缀。
- 中间删除会留下空洞，需要移动后缀将其填上。
- 当前长度和已分配容量必须分开记录。

因此，**顺序表以连续空间换取直接定位和良好局部性，也承担后缀移动与容量管理的代价**。

## § 1.2.2 存储表示与不变量

### 一、静态顺序表

静态顺序表把最大容量编入类型，适合容量上界明确的场景。以下代码统一采用 C11，逻辑位序从 1 开始，数组下标从 0 开始。

```c
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#define SEQ_CAPACITY 50

typedef int ElemType;

typedef struct {
    ElemType data[SEQ_CAPACITY];
    size_t length;
} SqList;

void InitSqList(SqList *list) {
    if (list != NULL) {
        list->length = 0;
    }
}
```

- 初始化只需把 `length` 置为 0。
	- 空表中数组槽位的旧位模式不属于有效元素，不需要逐个清零。

静态顺序表必须始终满足：

- `0 <= length && length <= SEQ_CAPACITY`。
- 有效元素恰好位于 `data[0]` 到 `data[length - 1]`。
- `data[length]` 及其后的槽位不属于当前线性表，即使其中仍残留旧值。
- 第 $i$ 个逻辑元素对应 `data[i - 1]`。

### 二、动态顺序表

动态顺序表仍然使用连续空间，只是数组在运行时申请，并在容量不足时整体迁移。

```c
#include <stdint.h>
#include <stdlib.h>

typedef struct {
    ElemType *data;
    size_t length;
    size_t capacity;
} DynamicList;

bool InitDynamicList(DynamicList *list, size_t initial_capacity) {
    if (list == NULL) return false;

    list->data = NULL;
    list->length = 0;
    list->capacity = 0;

    if (initial_capacity == 0) return true;
    if (initial_capacity > SIZE_MAX / sizeof *list->data) {
        return false;
    }

    list->data = malloc(initial_capacity * sizeof *list->data);
    if (list->data == NULL) return false;

    list->capacity = initial_capacity;
    return true;
}

void DestroyDynamicList(DynamicList *list) {
    if (list == NULL) return;
    free(list->data);
    list->data = NULL;
    list->length = 0;
    list->capacity = 0;
}
```

> [!warning] 初始化函数的资源前提
> `InitDynamicList` 只应接收尚未持有动态数组，或已经由 `DestroyDynamicList` 释放过的对象。若对仍持有 `data` 的对象再次初始化，旧指针会被覆盖，从而造成内存泄漏。

动态分配不会把顺序表变成链表：扩容前后，每一时刻的有效元素仍位于一段连续地址中。它的不变量还包括：

- `length <= capacity`。
- 当 `capacity == 0` 时，`data` 可以为 `NULL`，此时 `length` 必须为 0。
- 当 `capacity > 0` 时，`data` 指向至少能容纳 `capacity` 个 `ElemType` 的连续区域。

## § 1.2.3 地址计算与两套编号

设首元素地址为 $\operatorname{LOC}(a_1)$，每个元素占 $w$ 个字节，则第 $i$ 个元素的地址为：

$$
\operatorname{LOC}(a_i)=\operatorname{LOC}(a_1)+(i-1)w,\qquad 1\le i\le n
$$

> [!info]- 公式解读
> - $\operatorname{LOC}(a_i)$：第 $i$ 个逻辑元素的起始地址。
> - $\operatorname{LOC}(a_1)$：连续存储区的起始地址。
> - $i-1$：第 $i$ 个元素之前已有的元素数。
> - $w$：每个元素占用的字节数，实际 C 实现中对应 `sizeof(ElemType)`。
> - 整句可读为：目标地址等于首地址加上前面 $i-1$ 个等长元素的总字节数。

| 逻辑含义 | 位序 | 数组下标 |
| --- | ---: | ---: |
| 第一个元素 | 1 | 0 |
| 第 $i$ 个元素 | $i$ | $i-1$ |
| 最后一个有效元素 | `length` | `length - 1` |
| 表尾追加位置 | `length + 1` | `length` |

> [!tip] 不依赖图片也能验证地址公式
> 若首地址为 `1000`、每个元素占 `4 B`，则第 3 个元素的地址是 `1000 + (3 - 1) × 4 = 1008`。地址等差增长依赖“元素等长且连续存放”。
>
> 这只保证**按位访问**为常数时间；若只给定一个值而不知道它的位序，仍需使用查找算法。

## § 1.2.4 查询操作

### 一、按位读取

```c
bool GetElem(const SqList *list, size_t position, ElemType *out_value) {
    if (list == NULL || out_value == NULL) return false;
    if (position < 1 || position > list->length) return false;

    *out_value = list->data[position - 1];
    return true;
}
```

合法性检查和一次下标访问都不随表长增长，因此按位读取为 $\Theta(1)$。

### 二、按值查找

```c
bool LocateElem(
    const SqList *list,
    ElemType value,
    size_t *out_position
) {
    if (list == NULL || out_position == NULL) return false;

    for (size_t index = 0; index < list->length; ++index) {
        if (list->data[index] == value) {
            *out_position = index + 1;
            return true;
        }
    }
    return false;
}
```

这段实现返回第一个匹配元素的位序：

- 最好情况在首元素命中，只比较 1 次，为 $\Theta(1)$。
- 最坏情况在表尾命中或不存在，需要比较 $n$ 次，为 $\Theta(n)$。
- 若表按关键字有序，可以另用折半查找达到 $\Theta(\log n)$；这是有序性和算法带来的收益，不是普通 `LocateElem` 自动拥有的性质。

## § 1.2.5 插入操作

在长度为 $n$ 的表中，第 `position` 位插入的合法范围是 1 到 $n+1$。

### 一、状态变化

1. 检查对象、位序和剩余容量。
2. 从最后一个元素开始，把原第 `position` 位到第 $n$ 位依次后移。
3. 把新值写入下标 `position - 1`。
4. 最后把 `length` 增加 1。

```c
bool ListInsert(SqList *list, size_t position, ElemType value) {
    if (list == NULL) return false;
    if (position < 1 || position > list->length + 1) return false;
    if (list->length == SEQ_CAPACITY) return false;

    for (size_t j = list->length; j >= position; --j) {
        list->data[j] = list->data[j - 1];
    }

    list->data[position - 1] = value;
    ++list->length;
    return true;
}
```

> [!warning] 插入为什么必须从后向前移动
> 例如把 `[A, B, C, _]` 的第 2 位腾空，应先把 `C` 移到末尾，再把 `B` 移到原 `C` 的位置，得到 `[A, B, B, C]`，最后写入新值。
>
> 若从前向后移动，第一次复制 `B` 就会覆盖尚未读取的 `C`，后续无法还原原序列。

### 二、移动次数

第 $i$ 位插入需要移动 $n-i+1$ 个旧元素：

- 表尾追加 $i=n+1$：移动 0 个，时间为 $\Theta(1)$。
- 表头插入 $i=1$：移动 $n$ 个，时间为 $\Theta(n)$。
- 若 $n+1$ 个插入位序等概率，平均移动次数为：

$$
\frac{1}{n+1}\sum_{i=1}^{n+1}(n-i+1)=\frac{n}{2}
$$

> [!info]- 公式解读
> - $i$：本次插入的逻辑位序。
> - $n-i+1$：插入点到原表尾之间需要后移的元素数。
> - 分母 $n+1$：长度为 $n$ 的表共有 $n+1$ 个合法插入位序。
> - 整句可读为：在等概率位置假设下，插入平均移动一半旧元素，因此平均时间为 $\Theta(n)$。

### 三、动态扩容

动态顺序表在 `length == capacity` 时可以先扩容。下面采用“容量翻倍，零容量先变为 1”的策略：

```c
bool ReserveForInsert(DynamicList *list) {
    if (list == NULL) return false;
    if (list->length < list->capacity) return true;

    size_t new_capacity = list->capacity == 0
        ? 1
        : list->capacity * 2;

    if (new_capacity < list->capacity) return false;
    if (new_capacity > SIZE_MAX / sizeof *list->data) return false;

    ElemType *new_data =
        realloc(list->data, new_capacity * sizeof *new_data);
    if (new_data == NULL) return false;

    list->data = new_data;
    list->capacity = new_capacity;
    return true;
}
```

- 必须先用临时指针接收 `realloc` 结果；若直接覆盖 `list->data`，分配失败会丢失原内存地址。
	- 翻倍策略下，表尾追加的单次最坏时间仍可能是 $\Theta(n)$，但连续多次追加的均摊时间为 $O(1)$，推导见 [均摊分析](/tutorials/data-structures/01-introduction/02-algorithms#-027-均摊分析)。

## § 1.2.6 删除操作

### 一、状态变化

1. 检查删除位序是否在 1 到 $n$。
2. 保存被删值。
3. 从被删元素的后继开始，由前向后依次覆盖前一个位置。
4. 把 `length` 减少 1。

```c
bool ListDelete(
    SqList *list,
    size_t position,
    ElemType *out_value
) {
    if (list == NULL || out_value == NULL) return false;
    if (position < 1 || position > list->length) return false;

    *out_value = list->data[position - 1];

    for (size_t j = position; j < list->length; ++j) {
        list->data[j - 1] = list->data[j];
    }

    --list->length;
    return true;
}
```

> [!tip] 删除为什么从前向后移动
> 删除 `[A, B, C, D]` 的第 2 位时，依次用 `C` 覆盖 `B`、用 `D` 覆盖 `C`，再把长度减 1，逻辑结果是 `[A, C, D]`。
>
> 每轮都先读取右侧尚未覆盖的元素，因此不会丢失下一次搬移所需的旧值。

- 第 $i$ 位删除需要移动 $n-i$ 个元素：删表尾移动 0 个，删表头移动 $n-1$ 个。
	- 若 $n$ 个删除位序等概率，平均移动次数为 $(n-1)/2$。

## § 1.2.7 完整可复算示例

> [!example] 示例：在容量为 6 的表中插入并删除
> **初态**：`data = [10, 20, 30, 40, _, _]`，`length = 4`。
>
> **目标一**：在第 2 位插入 `15`。
>
> 1. 检查：合法位序为 1 到 5，容量仍有 2 格。
> 2. `40` 从下标 3 移到 4：`[10, 20, 30, 40, 40, _]`。
> 3. `30` 从下标 2 移到 3：`[10, 20, 30, 30, 40, _]`。
> 4. `20` 从下标 1 移到 2：`[10, 20, 20, 30, 40, _]`。
> 5. 把 `15` 写入下标 1，并更新长度：`[10, 15, 20, 30, 40, _]`，`length = 5`。
>
> **目标二**：删除新的第 4 位。
>
> 1. 被删值为 `30`。
> 2. `40` 从下标 4 移到 3：`[10, 15, 20, 40, 40, _]`。
> 3. 更新长度为 4，有效序列是 `(10, 15, 20, 40)`。
>
> **合理性检查**：插入移动 3 个旧元素，符合 $n-i+1=4-2+1=3$；删除移动 1 个元素，符合 $n-i=5-4=1$。下标 4 残留的 `40` 不属于有效表。

## § 1.2.8 复杂度、选择与失败路径

| 操作 | 最好时间 | 最坏时间 | 代价来源 |
| --- | --- | --- | --- |
| 按位读取 | $\Theta(1)$ | $\Theta(1)$ | 地址可直接计算 |
| 普通按值查找 | $\Theta(1)$ | $\Theta(n)$ | 比较直到命中或扫描结束 |
| 插入 | $\Theta(1)$ | $\Theta(n)$ | 移动插入点后的旧元素；动态表还可能扩容 |
| 删除 | $\Theta(1)$ | $\Theta(n)$ | 移动删除点后的旧元素 |
| 顺序遍历 | $\Theta(n)$ | $\Theta(n)$ | 每个有效元素访问一次 |

> [!warning] 边界与失败路径
> - 空表不能读取或删除，但可在第 1 位插入。
> - 静态表已满时，合法位序也无法插入；操作失败后必须保持原表不变。
> - 动态扩容可能因乘法溢出或内存分配失败而终止，不能先改 `capacity` 再申请。
> - `length` 使用无符号类型时，循环边界必须避免减到负数后回绕。
> - 保存内部元素地址后再扩容，旧地址可能失效；调用者不能把数组内部指针当作永久引用。
> - 仅把 `length` 减少不会清除槽位位模式；若元素持有外部资源，删除前还需执行该类型的资源释放逻辑。

> [!question]- 理解检查
> 1. 为什么第 $i$ 个元素位于 `data[i - 1]`？
> 2. 在长度为 7 的表中第 3 位插入，需要移动多少个旧元素，移动方向是什么？
> 3. 动态顺序表扩容后，为什么旧的元素指针可能失效？
>
> **参考回答**：
> 1. 位序从 1 开始，而数组下标从 0 开始；第 $i$ 个元素前有 $i-1$ 个元素。
> 2. 移动 $7-3+1=5$ 个元素，从表尾向插入位置移动，避免覆盖尚未读取的旧值。
> 3. 扩容可能申请新地址并复制元素，再释放旧区域；指向旧区域的指针因此不再指向当前数组。

## 总结

- 顺序表用连续空间保存线性表，第 $i$ 个元素映射到 `data[i - 1]`，因此按位访问为 $\Theta(1)$，普通按值查找仍可能为 $\Theta(n)$。
- 中间插入必须从后向前移动后缀，删除必须从前向后填补空洞；二者平均和最坏时间均为 $\Theta(n)$。
- 动态扩容仍保持连续存储；实现必须检查容量计算和分配失败，并注意扩容可能使旧元素指针失效。几何扩容下，连续表尾追加的均摊时间为 $O(1)$。

← [1.1 线性表](/tutorials/data-structures/02-linear-lists/01-list) | [00-数据结构](/tutorials) | [1.3 单链表](/tutorials/data-structures/02-linear-lists/03-linked-list) →
