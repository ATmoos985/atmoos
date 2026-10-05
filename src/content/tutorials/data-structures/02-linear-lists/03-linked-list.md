---
title: 1.3 单链表
description: 从头结点、前驱与指针操作，理解单链表的实现和不变量。
publishDate: 2026-10-06
sourceUpdated: 2026-08-11
course: data-structures
series: 数据结构
chapter: 线性表
chapterOrder: 1
order: 3
tags:
  - 数据结构
  - 线性表
draft: false
---
> [!abstract] 本页速览
> **本页解决的问题**：
> - 不依赖整体连续内存时，怎样用结点和指针保持线性次序。
> - 查找、插入、删除、建表和逆置分别修改哪些指针，怎样避免断链和内存泄漏。
>
> **知识位置**：
> - 单链表是线性表最基本的链式实现，也是链栈、链队列、邻接表和散列拉链等结构的基础。
>
> **前置知识**：
> - [1.1 线性表](/tutorials/data-structures/02-linear-lists/01-list)：线性表接口和逻辑不变量。
> - [1.2 顺序表](/tutorials/data-structures/02-linear-lists/02-array-list)：连续表示的操作代价，便于理解链式表示解决了什么问题。
>
> **学完后应能解释**：
> - 头指针、头结点和首元结点的区别。
> - 为什么按位插入通常是 $\Theta(n)$，而已知前驱后的链接修改是 $\Theta(1)$。
> - 每次指针修改前必须保存什么，以及删除后为什么必须释放结点。

> [!note] 知识卡片
> - [401-单链表头节点的作用](/tutorials/data-structures/03-cards/401-head-node)
> - [403-链表四种结构与操作核心](/tutorials/data-structures/03-cards/403-list-structures)


---

## § 1.3.1 为什么需要链式表示

- 顺序表把整个序列放在一段连续空间中，因此中间插入和删除需要移动后缀。
	- 单链表改用另一种策略：每个元素单独放入一个结点，结点再保存后继地址。
	- 元素的逻辑顺序由链接决定，而不是由物理地址相邻决定。

这带来一组明确的交换：

- 新结点不必和旧结点相邻，也不需要整体扩容。
- 已知正确前驱时，插入或删除只修改常数个指针。
- 仅知道位序时，无法直接计算结点地址，必须沿 `next` 逐个前进。
- 每个结点需要附加指针，并承担动态分配、释放和较弱空间局部性的成本。

## § 1.3.2 结点、头指针与头结点

### 一、C11 数据表示

本页统一采用**带头结点的单链表**，并在表对象中记录长度。`head` 指向头结点，头结点不保存有效元素。

```c
#include <stdbool.h>
#include <stddef.h>
#include <stdlib.h>

typedef int ElemType;

typedef struct LNode {
    ElemType data;
    struct LNode *next;
} LNode;

typedef struct {
    LNode *head;
    size_t length;
} LinkedList;
```

- 每个数据结点分为 `data` 与 `next` 两个区域。
	- 物理地址可以分散，但从 `head->next` 连续跟随 `next` 得到的访问顺序必须与逻辑位序一致。

### 二、三个概念

| 概念 | 本页中的含义 | 空表时的状态 |
| --- | --- | --- |
| **头指针** | 表对象中的 `head` 指针，是访问链表的入口 | 仍指向已分配的头结点 |
| **头结点** | 位于所有数据结点之前的哨兵结点 | `head->next == NULL` |
| **首元结点** | 第一个保存有效数据的结点 | 不存在 |

- 带头结点的主要价值是让首元结点也有统一前驱。
	- 第 1 位插入、删除与中间位置操作都可以改写“前驱的 `next`”，不需要额外改动入口指针。

> [!warning] 头结点不计入表长
> 本页把头结点视为实现细节。`length` 只统计数据结点；逻辑第 1 个元素位于 `head->next`，而不是头结点的 `data`。

### 三、结构不变量

一个有效的 `LinkedList` 必须满足：

- `head != NULL`，并且头结点由该表拥有。
- 从 `head->next` 出发，沿 `next` 最终到达 `NULL`，不存在意外环。
- 可达数据结点恰有 `length` 个。
- 每个数据结点只在主链中出现一次。
- 最后一个数据结点的 `next == NULL`。

## § 1.3.3 初始化、销毁与查找

### 一、初始化和销毁

```c
bool InitList(LinkedList *list) {
    if (list == NULL) return false;

    list->head = malloc(sizeof *list->head);
    if (list->head == NULL) {
        list->length = 0;
        return false;
    }

    list->head->next = NULL;
    list->length = 0;
    return true;
}

void DestroyList(LinkedList *list) {
    if (list == NULL) return;

    LNode *current = list->head;
    while (current != NULL) {
        LNode *next = current->next;
        free(current);
        current = next;
    }

    list->head = NULL;
    list->length = 0;
}
```

> [!warning] 初始化与销毁必须配对
> `InitList` 只应接收尚未持有链表，或已经由 `DestroyList` 销毁过的对象；对仍拥有结点的对象再次初始化会丢失原入口并造成内存泄漏。初始化成功或失败后都可以调用 `DestroyList`，但不能把从未初始化的随机指针对象直接交给销毁函数。

- 销毁时必须先保存 `current->next`，再释放 `current`。
	- 释放后继续读取 `current->next` 属于对失效对象的访问。

### 二、定位第 `position` 个结点

下面的内部函数把头结点视为位置 0，便于查找插入位置的前驱：

```c
static LNode *NodeAt(LinkedList *list, size_t position) {
    if (list == NULL || list->head == NULL) return NULL;
    if (position > list->length) return NULL;

    LNode *current = list->head;
    for (size_t step = 0; step < position; ++step) {
        current = current->next;
    }
    return current;
}
```

- `NodeAt(list, 0)` 返回头结点。
- `NodeAt(list, 1)` 返回首元结点。
- `NodeAt(list, length)` 返回尾结点；空表中位置 0 的头结点同时是建表时的尾部哨兵。

### 三、按位与按值查找

```c
bool GetElem(
    const LinkedList *list,
    size_t position,
    ElemType *out_value
) {
    if (list == NULL || list->head == NULL || out_value == NULL) {
        return false;
    }
    if (position < 1 || position > list->length) return false;

    const LNode *current = list->head->next;
    for (size_t current_position = 1;
         current_position < position;
         ++current_position) {
        current = current->next;
    }

    *out_value = current->data;
    return true;
}

bool LocateElem(
    const LinkedList *list,
    ElemType value,
    size_t *out_position
) {
    if (list == NULL || list->head == NULL || out_position == NULL) {
        return false;
    }

    const LNode *current = list->head->next;
    size_t position = 1;
    while (current != NULL) {
        if (current->data == value) {
            *out_position = position;
            return true;
        }
        current = current->next;
        ++position;
    }
    return false;
}
```

- 两种查找的最坏时间都是 $\Theta(n)$。
	- 按位查找也需要遍历，是因为位序不能转换为分散结点的地址。

## § 1.3.4 插入操作

### 一、已知前驱后的后插

若已经持有前驱结点 `predecessor`，插入分为四步：

1. 申请新结点。
2. 让新结点指向原后继。
3. 让前驱指向新结点。
4. 更新表长。

```c
static bool InsertAfter(
    LinkedList *list,
    LNode *predecessor,
    ElemType value
) {
    if (list == NULL || predecessor == NULL) return false;

    LNode *node = malloc(sizeof *node);
    if (node == NULL) return false;

    node->data = value;
    node->next = predecessor->next;
    predecessor->next = node;
    ++list->length;
    return true;
}
```

- 语句 `node->next = predecessor->next` 必须在 `predecessor->next = node` 之前执行。
	- 若顺序颠倒，原后继地址会丢失，随后新结点可能指向自己并形成自环。

### 二、按位序插入

```c
bool ListInsert(
    LinkedList *list,
    size_t position,
    ElemType value
) {
    if (list == NULL || list->head == NULL) return false;
    if (position < 1 || position > list->length + 1) return false;

    LNode *predecessor = NodeAt(list, position - 1);
    return InsertAfter(list, predecessor, value);
}
```

完整操作包含两个成本：

- 找第 `position - 1` 个结点：最坏 $\Theta(n)$。
- 已知前驱后修改链接：$\Theta(1)$。

因此，“单链表插入是 $O(1)$”只适用于调用者已经持有正确前驱的情形；按逻辑位序插入的最坏时间仍为 $\Theta(n)$。

## § 1.3.5 删除操作

删除第 `position` 个结点时，必须先找到它的前驱：

```c
bool ListDelete(
    LinkedList *list,
    size_t position,
    ElemType *out_value
) {
    if (list == NULL || list->head == NULL || out_value == NULL) {
        return false;
    }
    if (position < 1 || position > list->length) return false;

    LNode *predecessor = NodeAt(list, position - 1);
    LNode *removed = predecessor->next;

    *out_value = removed->data;
    predecessor->next = removed->next;
    free(removed);
    --list->length;
    return true;
}
```

正确顺序是：

1. 用 `removed` 保存被删结点地址。
2. 让前驱跳过被删结点。
3. 释放被删结点。
4. 更新表长。

若只执行“跳过”而不 `free`，结点将无法再从入口访问，却仍占用堆空间，形成内存泄漏。

> [!note] 已知目标结点不总能常数时间删除
> 单链表删除目标结点通常还需要它的前驱。把后继数据复制到目标结点、再删除后继的技巧只适用于目标不是尾结点且允许改变结点身份语义的场景；它不是一般删除接口的等价替代。

## § 1.3.6 头插法与尾插法建表

假设输入数组依次为 `[10, 20, 30]`。

### 一、头插法

每次把新结点插入头结点之后，后读入的元素会排在前面：

```c
bool BuildByHeadInsert(
    LinkedList *list,
    const ElemType values[],
    size_t count
) {
    if (list == NULL || list->head == NULL) return false;
    if (count > 0 && values == NULL) return false;
    if (list->length != 0) return false;

    for (size_t i = 0; i < count; ++i) {
        if (!InsertAfter(list, list->head, values[i])) {
            return false;
        }
    }
    return true;
}
```

状态依次为：

1. 插入 `10`：`head -> 10 -> NULL`。
2. 插入 `20`：`head -> 20 -> 10 -> NULL`。
3. 插入 `30`：`head -> 30 -> 20 -> 10 -> NULL`。

- 因此结果与输入顺序相反。
	- 若中途分配失败，函数返回 `false`，已成功插入的前缀仍在表中；需要全有或全无语义时，应在临时表构建成功后再交换。

### 二、尾插法

尾插法维护 `tail`，使它始终指向当前尾结点：

```c
bool BuildByTailInsert(
    LinkedList *list,
    const ElemType values[],
    size_t count
) {
    if (list == NULL || list->head == NULL) return false;
    if (count > 0 && values == NULL) return false;
    if (list->length != 0) return false;

    LNode *tail = list->head;

    for (size_t i = 0; i < count; ++i) {
        LNode *node = malloc(sizeof *node);
        if (node == NULL) return false;

        node->data = values[i];
        node->next = NULL;
        tail->next = node;
        tail = node;
        ++list->length;
    }
    return true;
}
```

- 结果为 `head -> 10 -> 20 -> 30 -> NULL`，与输入顺序一致。
	- 维护尾指针后，每次追加只需常数次链接修改，总建表时间为 $\Theta(n)$；若每次都从头寻找尾结点，总时间会退化为 $\Theta(n^2)$。

## § 1.3.7 原地逆置

逆置过程中维护两个集合：

- `current` 及其后继是尚未处理的原链。
- `head->next` 开始的部分是已经逆置的前缀。

每轮先保存原后继，再把 `current` 头插到已逆置部分：

```c
void ReverseList(LinkedList *list) {
    if (list == NULL || list->head == NULL) return;

    LNode *current = list->head->next;
    list->head->next = NULL;

    while (current != NULL) {
        LNode *next_unprocessed = current->next;
        current->next = list->head->next;
        list->head->next = current;
        current = next_unprocessed;
    }
}
```

> [!example] 示例：逆置 `(A, B, C)`
> 1. 初态：已逆置部分为空，未处理部分为 `A -> B -> C`。
> 2. 处理 `A`：`head -> A`，未处理部分为 `B -> C`。
> 3. 处理 `B`：`head -> B -> A`，未处理部分为 `C`。
> 4. 处理 `C`：`head -> C -> B -> A`，未处理部分为空。
> 5. 终止时表长未变，每个旧结点恰好出现一次，最后结点 `A->next == NULL`。

时间为 $\Theta(n)$，只使用常数个指针，辅助空间为 $\Theta(1)$。

## § 1.3.8 复杂度与失败路径

| 操作 | 时间复杂度 | 成本条件 |
| --- | --- | --- |
| 求表长 | $\Theta(1)$ | 本页显式维护 `length`；不维护时需遍历 |
| 按位或按值查找 | 最坏 $\Theta(n)$ | 从首元结点沿 `next` 前进 |
| 已知前驱后插入 | $\Theta(1)$ | 不含内存分配器内部代价 |
| 按位序插入 | 最坏 $\Theta(n)$ | 先定位前驱 |
| 已知前驱后删除 | $\Theta(1)$ | 必须拥有被删结点并正确释放 |
| 按位序删除 | 最坏 $\Theta(n)$ | 先定位前驱 |
| 头插或带尾指针尾插建表 | $\Theta(n)$ | 每个元素处理一次 |
| 原地逆置 | $\Theta(n)$ | 每个结点改链一次 |

> [!warning] 边界与失败路径
> - 初始化分配头结点失败时，不能继续调用普通操作。
> - 空表读取、删除和逆置分别应返回失败、返回失败和保持空表。
> - 第 1 位插入或删除由头结点统一处理；不带头结点的实现必须改写入口指针。
> - 插入分配失败时，原链和表长都必须保持不变。
> - 任何改链前都要保存之后仍需访问的地址；断链后无法靠数据值恢复结点地址。
> - `free` 后不得读取、写入或再次释放该结点。
> - 意外形成的环会使遍历和销毁无法终止；结构不变量必须排除环。

> [!question]- 理解检查
> 1. 头结点怎样统一第 1 位和中间位置的插入？
> 2. 按第 $i$ 位插入为什么不是无条件的 $\Theta(1)$？
> 3. 逆置时为什么要先保存 `current->next`？
>
> **参考回答**：
> 1. 头结点充当首元结点的前驱，所有插入都能改写某个前驱的 `next`。
> 2. 修改链接是常数次，但仅知道位序时必须从表头寻找第 $i-1$ 个结点，最坏需要线性时间。
> 3. 改写 `current->next` 后，原后继地址会丢失；先保存它才能继续处理剩余原链。

## 总结

- 单链表用结点的 `next` 保存逻辑次序；带头结点时，头结点是位置 0 的哨兵，不保存有效元素，也不计入表长。
- 仅知道位序时，查找、插入和删除通常先遍历定位，最坏为 $\Theta(n)$；已持有正确前驱后，局部改链才是 $\Theta(1)$。
- 改链前必须保存后续仍需访问的地址，删除后必须释放结点；初始化、销毁和分配失败路径都要保持入口、表长与可达结点一致。

← [1.2 顺序表](/tutorials/data-structures/02-linear-lists/02-array-list) | [00-数据结构](/tutorials) | [1.4 链表变体](/tutorials/data-structures/02-linear-lists/04-list-variants) →
