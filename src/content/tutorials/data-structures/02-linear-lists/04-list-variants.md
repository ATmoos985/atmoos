---
title: 1.4 链表变体
description: 双链表、循环链表与静态链表的结构和操作。
publishDate: 2026-10-06
sourceUpdated: 2026-08-11
course: data-structures
series: 数据结构
chapter: 线性表
chapterOrder: 1
order: 4
tags:
  - 数据结构
  - 线性表
draft: false
---
> [!abstract] 本页速览
> **本页解决的问题**：
> - 单链表只能向后访问、尾部处理不便或运行环境不能保存普通指针时，可以怎样改变结点表示。
> - 双向链接、循环链接和数组游标分别维护什么不变量，又增加哪些空间与边界成本。
>
> **知识位置**：
> - 本页建立在 [1.3 单链表](/tutorials/data-structures/02-linear-lists/03-linked-list) 之上，讨论三类有明确用途的链表变体，而不是把它们当作互相替代的名称清单。
>
> **前置知识**：
> - [1.3 单链表](/tutorials/data-structures/02-linear-lists/03-linked-list)：头结点、前驱定位、插入删除和动态内存释放。
>
> **学完后应能解释**：
> - 已知目标结点时，双链表为什么能直接访问前驱。
> - 循环链表的判空和遍历终止条件为什么不能再依赖 `NULL`。
> - 静态链表虽然使用数组，为什么仍然不支持按逻辑位序随机访问。

> [!note] 知识卡片
> - [403-链表四种结构与操作核心](/tutorials/data-structures/03-cards/403-list-structures)


---

## § 1.4.1 变体从什么问题出发

单链表只保存后继地址，这种最小表示并不适合所有工作负载：

- 若已知当前结点却经常要找前驱，单向遍历需要重新从表头寻找。
- 若处理过程需要从尾部回到开头，尾结点的 `NULL` 会中断遍历。
- 若数据要放在固定共享区域或环境不能使用普通地址指针，需要用可重定位的编号表达链接。

由此得到三种独立改动：

- **双链表**增加前驱指针，以空间换取反向导航。
- **循环链表**把边界链接接回哨兵，适合循环处理；配合尾指针时还能直接得到头结点、首元结点和尾结点。
- **静态链表**把指针替换为数组下标，保留“沿链接访问、局部改链”的性质。

## § 1.4.2 双链表

### 一、表示与不变量

本节先讨论带头结点、尾结点后继为 `NULL` 的普通双链表。

```c
#include <stdbool.h>
#include <stddef.h>
#include <stdlib.h>

typedef int ElemType;

typedef struct DNode {
    ElemType data;
    struct DNode *prior;
    struct DNode *next;
} DNode;

typedef struct {
    DNode *head;
    size_t length;
} DoublyList;
```

除单链表的一般不变量外，双链表还必须满足双向一致性：

- 若 `p->next == q`，则 `q->prior == p`。
- 若 `q->prior == p`，则 `p->next == q`。
- 头结点的 `prior == NULL`。
- 尾结点的 `next == NULL`。

- 增加 `prior` 后，已知结点 `p` 就能在 $\Theta(1)$ 时间得到其前驱。
	- 代价是每个结点多一个指针，并且每次改链要维护两个方向。

### 二、在已知结点后插入

```c
bool InsertAfterDNode(
    DoublyList *list,
    DNode *position,
    ElemType value
) {
    if (list == NULL || position == NULL) return false;

    DNode *node = malloc(sizeof *node);
    if (node == NULL) return false;

    DNode *successor = position->next;

    node->data = value;
    node->prior = position;
    node->next = successor;

    if (successor != NULL) {
        successor->prior = node;
    }
    position->next = node;

    ++list->length;
    return true;
}
```

> [!example] 过程拆解：双链表在已知结点后插入
> 设原链为 `... <-> position <-> successor <-> ...`，插入新结点 `node`。共四处指针需要修改，顺序应以“先连新结点、后改旧链”为原则。
> ```text
> 初态              ① 新结点指向前驱与后继
> position  succ     position      succ
>  |  \      |       |  \        /  |
> prior next        prior node    next
>
> ② 后继的前驱指向新结点   ③ 前驱的后继指向新结点（完成）
> position      succ       position      succ
>  |  \  ^       |         |   \_/|       |
> prior node   next       prior  node    next
> ```
> 1. **新结点自身双向就位**：`node->prior = position`，`node->next = successor`，尚未扰动原链。
> 2. **后继端先接入**：`successor->prior = node`，原后继识别新结点为前驱。
> 3. **前驱端后接入**：`position->next = node`，新结点正式接入主链；尾插时后继为空，跳过第 2 步。
> 4. 校验：`position->next == node` 且 `node->prior == position`；若有后继则两组双向关系均成立。

- 这里先用 `successor` 保存原后继，使修改顺序更容易核验。
	- 插入完成后要检查两组关系：
		- `position->next == node` 且 `node->prior == position`。
		- 若存在原后继，则 `node->next == successor` 且 `successor->prior == node`。

### 三、删除已知结点

```c
bool DeleteDNode(
    DoublyList *list,
    DNode *target,
    ElemType *out_value
) {
    if (list == NULL || target == NULL || out_value == NULL) {
        return false;
    }
    if (target == list->head || target->prior == NULL) return false;

    DNode *predecessor = target->prior;
    DNode *successor = target->next;

    predecessor->next = successor;
    if (successor != NULL) {
        successor->prior = predecessor;
    }

    *out_value = target->data;
    free(target);
    --list->length;
    return true;
}
```

- 已知合法目标结点时，删除本身为 $\Theta(1)$。
	- 若调用者只有位序或值，仍要先执行 $\Theta(n)$ 的定位；双链表不会自动让查找变成常数时间。

> [!warning] 结点必须属于当前链表
> 上述局部函数假定 `position` 或 `target` 是当前表中的有效结点。仅检查非空无法证明所有权；公共库接口通常还需隐藏结点指针、保存所有者标识，或在调试模式中验证成员关系。

## § 1.4.3 循环单链表

### 一、环形表示

带头结点的循环单链表令尾结点 `next` 指回头结点。空表中头结点也指向自身，所以主链中不再使用 `NULL` 作为终点。

```text
空表：
head ──next──> head

非空表：
head -> A -> B -> C
 ^                 |
 |_________________|
```

相应不变量是：

- 空表：`head->next == head`。
- 非空表：从首元结点沿 `next` 最终回到 `head`。
- 遍历终止条件是“再次到达哨兵”，不是 `current == NULL`。
- 任何改动尾结点的操作都必须恢复 `tail->next == head`。

### 二、只保存尾指针

若表对象保存尾指针 `rear`，并让 `rear->next` 始终指向头结点，则头部和尾部都能直接访问：

- 头结点：`rear->next`。
- 首元结点：`rear->next->next`。
- 尾结点：`rear`。

```c
typedef struct CNode {
    ElemType data;
    struct CNode *next;
} CNode;

typedef struct {
    CNode *rear;
    size_t length;
} CircularList;

bool InitCircularList(CircularList *list) {
    if (list == NULL) return false;

    list->rear = NULL;
    list->length = 0;

    CNode *head = malloc(sizeof *head);
    if (head == NULL) return false;

    head->next = head;
    list->rear = head;
    list->length = 0;
    return true;
}

void DestroyCircularList(CircularList *list) {
    if (list == NULL || list->rear == NULL) return;

    CNode *head = list->rear->next;
    CNode *current = head->next;
    while (current != head) {
        CNode *next = current->next;
        free(current);
        current = next;
    }

    free(head);
    list->rear = NULL;
    list->length = 0;
}
```

- 空表时 `rear` 就是头结点；非空时 `rear` 是最后一个数据结点。
	- 两种状态都满足 `rear->next` 指向头结点。

> [!warning] 环形结构的生命周期
> `InitCircularList` 只应接收尚未持有结点，或已经销毁过的对象；初始化失败时 `rear == NULL`。销毁时必须以“再次到达头结点”为终止条件，最后单独释放头结点，不能复用普通链表的 `current != NULL` 循环。

### 三、两端插入

```c
bool PushFrontCircular(CircularList *list, ElemType value) {
    if (list == NULL || list->rear == NULL) return false;

    CNode *head = list->rear->next;
    CNode *node = malloc(sizeof *node);
    if (node == NULL) return false;

    node->data = value;
    node->next = head->next;
    head->next = node;

    if (list->length == 0) {
        list->rear = node;
        node->next = head;
    }

    ++list->length;
    return true;
}

bool PushBackCircular(CircularList *list, ElemType value) {
    if (list == NULL || list->rear == NULL) return false;

    CNode *head = list->rear->next;
    CNode *node = malloc(sizeof *node);
    if (node == NULL) return false;

    node->data = value;
    node->next = head;
    list->rear->next = node;
    list->rear = node;
    ++list->length;
    return true;
}
```

- 两端插入都只修改常数个指针。
	- 若只有头指针而没有尾指针，表尾插入通常要先遍历到尾结点。

### 四、完整状态示例

> [!example] 示例：尾指针循环单链表
> 1. 初始化：`rear == head`，`head->next == head`，长度为 0。
> 2. 尾插 `A`：`head -> A -> head`，`rear == A`。
> 3. 尾插 `B`：`head -> A -> B -> head`，`rear == B`。
> 4. 头插 `X`：`head -> X -> A -> B -> head`，`rear` 仍为 `B`。
> 5. 从 `head->next` 开始遍历，依次访问 `X`、`A`、`B`；下一指针回到 `head` 时终止。
>
> **合理性检查**：长度为 3，恰好访问 3 个数据结点；`rear->next == head` 始终成立。

- 两个各自带尾指针的循环单链表可以通过常数次改链完成拼接，但必须明确如何处理两个头结点以及空表所有权。
	- 若保留两个哨兵而不调整，第二个头结点会误入数据链；因此拼接函数不能只凭一句“尾部相连”省略资源处理。

## § 1.4.4 循环双链表

循环双链表通常使用一个头结点同时充当前后边界：

- 空表：`head->next == head` 且 `head->prior == head`。
- 非空表：`head->next` 是首元结点，`head->prior` 是尾结点。
- 任一结点 `p` 都有非空的 `prior` 和 `next`，但指向头结点时表示越过逻辑边界。

在结点 `position` 后插入 `node` 的核心改链为：

```c
bool LinkAfterCircularDNode(DNode *position, DNode *node) {
    if (position == NULL || node == NULL) return false;

    node->next = position->next;
    node->prior = position;
    position->next->prior = node;
    position->next = node;
    return true;
}
```

- 普通双链表在尾部要判断原后继是否为 `NULL`；循环双链表的原后继至少是头结点，因此不需要该空指针分支。
	- 它仍然必须维护双向一致性，不能把“无 `NULL`”误解成“无边界条件”。

## § 1.4.5 静态链表

### 一、为什么数组也能表达链

静态链表预先分配结点数组，并用数组下标作为**游标**。游标表达“下一个逻辑结点在哪个槽位”，而不是“下一个数组下标是多少”。

本页采用以下约定：

- 槽位 0 是主链头结点。
- `head == 0`。
- `free_head` 指向空闲链首槽位。
- `CURSOR_NONE == -1` 表示链尾。
- 主链和空闲链共同覆盖全部槽位，且互不重叠。

```c
#define STATIC_CAPACITY 16
#define CURSOR_NONE (-1)

typedef struct {
    ElemType data;
    int next;
} StaticNode;

typedef struct {
    StaticNode nodes[STATIC_CAPACITY];
    int head;
    int free_head;
    size_t length;
} StaticList;

void InitStaticList(StaticList *list) {
    if (list == NULL) return;

    list->head = 0;
    list->nodes[0].next = CURSOR_NONE;
    list->length = 0;

    list->free_head = STATIC_CAPACITY > 1 ? 1 : CURSOR_NONE;
    for (int i = 1; i < STATIC_CAPACITY - 1; ++i) {
        list->nodes[i].next = i + 1;
    }
    if (STATIC_CAPACITY > 1) {
        list->nodes[STATIC_CAPACITY - 1].next = CURSOR_NONE;
    }
}
```

### 二、申请与回收槽位

```c
static int AllocateNode(StaticList *list) {
    if (list == NULL || list->free_head == CURSOR_NONE) {
        return CURSOR_NONE;
    }

    int index = list->free_head;
    list->free_head = list->nodes[index].next;
    list->nodes[index].next = CURSOR_NONE;
    return index;
}

static void ReleaseNode(StaticList *list, int index) {
    list->nodes[index].next = list->free_head;
    list->free_head = index;
}
```

- 这两个函数分别模拟 `malloc` 与 `free`。
	- 申请从空闲链摘下一个槽位，回收则把槽位重新挂回空闲链。

### 三、在已知游标后插入与删除

```c
bool InsertAfterCursor(
    StaticList *list,
    int predecessor,
    ElemType value
) {
    if (list == NULL) return false;
    if (predecessor < 0 || predecessor >= STATIC_CAPACITY) return false;

    int node = AllocateNode(list);
    if (node == CURSOR_NONE) return false;

    list->nodes[node].data = value;
    list->nodes[node].next = list->nodes[predecessor].next;
    list->nodes[predecessor].next = node;
    ++list->length;
    return true;
}

bool DeleteAfterCursor(
    StaticList *list,
    int predecessor,
    ElemType *out_value
) {
    if (list == NULL || out_value == NULL) return false;
    if (predecessor < 0 || predecessor >= STATIC_CAPACITY) return false;

    int removed = list->nodes[predecessor].next;
    if (removed == CURSOR_NONE) return false;

    *out_value = list->nodes[removed].data;
    list->nodes[predecessor].next = list->nodes[removed].next;
    ReleaseNode(list, removed);
    --list->length;
    return true;
}
```

- 公共接口还应验证 `predecessor` 当前确实属于主链，不能只验证下标范围。
	- 本页代码把它作为内部前置条件，以突出游标改链过程。

### 四、为什么不支持随机访问

- 虽然所有结点位于数组中，但逻辑第 $i$ 个元素未必位于 `nodes[i]`。
	- 例如主链游标可能是 `0 -> 7 -> 2 -> 11 -> -1`；读取第 3 个逻辑元素必须从头沿游标走到槽位 11，仍是 $\Theta(n)$。

静态链表的主要边界是容量固定：空闲链耗尽后无法插入，即使某些数组槽位中的旧值看似“没有使用”，也只有出现在空闲链中的槽位才可重新分配。

## § 1.4.6 选择、复杂度与失败路径

| 结构 | 解决的主要问题 | 已知位置后的局部修改 | 按位定位 | 额外状态 |
| --- | --- | --- | --- | --- |
| 普通双链表 | 直接访问前驱 | $\Theta(1)$ | $\Theta(n)$ | 每结点一个 `prior` |
| 循环单链表 | 从尾回到头、循环处理 | $\Theta(1)$ | $\Theta(n)$ | 环形终止条件，常配尾指针 |
| 循环双链表 | 双向循环与统一边界 | $\Theta(1)$ | $\Theta(n)$ | 两个方向都接回哨兵 |
| 静态链表 | 用可重定位游标代替地址指针 | $\Theta(1)$ | $\Theta(n)$ | 固定数组与空闲链 |

> [!warning] 边界与失败路径
> - 双链表每次改 `next` 时都要恢复对应的 `prior`，反之亦然。
> - 循环链表不能用 `current != NULL` 作为遍历终止条件，否则会无限循环。
> - 删除循环单链表最后一个数据结点时，尾指针必须重新指向头结点。
> - 循环结构没有空指针并不表示可以忽略哨兵；把头结点当作数据会多访问一个伪元素。
> - 静态链表的结束游标必须全篇统一使用 `-1` 或其他约定，不能和有效下标混用。
> - 静态链表回收同一槽位两次会破坏空闲链，必须保证每个槽位只属于主链或空闲链中的一个。

> [!question]- 理解检查
> 1. 已知目标结点时，双链表删除为何可以是 $\Theta(1)$，按位删除为何仍可为 $\Theta(n)$？
> 2. 尾指针循环单链表中，怎样同时得到头结点和尾结点？
> 3. 静态链表使用数组，为什么读取第 $i$ 个逻辑元素仍需遍历？
>
> **参考回答**：
> 1. `prior` 直接给出前驱，局部改链是常数次；只给位序时仍要遍历找到目标结点。
> 2. 尾结点就是 `rear`，头结点是 `rear->next`；空表时二者是同一个哨兵。
> 3. 数组下标只是物理槽位，逻辑次序由 `next` 游标决定，逻辑第 $i$ 个元素不一定在槽位 $i$。

## 总结

- 双链表用额外的 `prior` 换取反向导航；已知合法目标结点时可常数时间删除，但按位定位仍为 $\Theta(n)$，每次改链还必须恢复双向一致性。
- 循环链表用回到哨兵代替 `NULL` 作为终点；尾指针可同时提供尾结点和头部入口，遍历、删除最后一个结点与销毁都必须维护环形边界。
- 静态链表虽然存放在数组中，逻辑次序仍由游标链接决定，因此不支持按位随机访问；主链与空闲链必须互斥并共同管理固定槽位。

← [1.3 单链表](/tutorials/data-structures/02-linear-lists/03-linked-list) | [00-数据结构](/tutorials) | [1.5 顺序表与链表对比](/tutorials/data-structures/02-linear-lists/05-comparison) →
