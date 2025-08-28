# 内部任务更新实现

## 概述

本次修改将 `handleTaskChange` 函数从外部实现移到了 Gantt 组件内部，对外只暴露改变后的 tasks。`onDateChange` API 现在接收 `(changedTask, allTasks)` 参数，其中 `allTasks` 是改变后的全量 task 列表。

## 主要修改

### 1. 添加 `updateTaskRecursively` 函数到 `other-helper.ts`

```typescript
/**
 * 递归更新任务列表中的指定任务
 * @param taskList 任务列表
 * @param updatedTask 要更新的任务
 * @returns 更新后的任务列表
 */
export const updateTaskRecursively = (
  taskList: Task[],
  updatedTask: Task
): Task[] => {
  // 实现递归更新逻辑
  // 支持项目任务和子任务的同步更新
};
```

### 2. 修改 `task-gantt-content.tsx` 中的事件处理逻辑

在组件顶层获取 Context 中的 tasks：

```typescript
const { events, tasks: currentTasks } = useGanttContext();
```

在 `onDateChange` 和 `onProgressChange` 调用中：

```typescript
// 先进行内部任务更新，获取更新后的全量 tasks
const updatedTasks = updateTaskRecursively(currentTasks, newChangedTask);

// 调用外部的 onDateChange，传递更新后的全量 tasks
const result = await finalOnDateChange(newChangedTask, updatedTasks);
```

### 3. 更新类型定义

在 `public-types.ts` 中更新了 `onDateChange` 和 `onProgressChange` 的类型定义：

```typescript
onDateChange?: (
  changedTask: Task,
  allTasks: Task[]  // 改为全量 tasks
) => void | boolean | Promise<void> | Promise<boolean>;

onProgressChange?: (
  task: Task,
  allTasks: Task[]  // 改为全量 tasks
) => void | boolean | Promise<void> | Promise<boolean>;
```

### 4. 更新示例文件

更新了所有示例文件中的事件处理函数，使其接收新的参数格式：

- `src/stories/Gantt.tsx`
- `src/examples/ContextUsageExample.tsx`
- `src/test-showSubTask.tsx`
- `src/example-nested-structure.tsx`

## API 变化

### 之前的 API

```typescript
onDateChange?: (changedTask: Task, children: Task[]) => void | boolean | Promise<void> | Promise<boolean>;
```

### 现在的 API

```typescript
onDateChange?: (changedTask: Task, allTasks: Task[]) => void | boolean | Promise<void> | Promise<boolean>;
```

## 使用示例

### 之前的使用方式

```typescript
const handleTaskChange = (task: Task) => {
  // 需要手动更新任务状态
  const newTasks = updateTaskRecursively(tasks, task);
  setTasks(newTasks);
};
```

### 现在的使用方式

```typescript
const handleTaskChange = (task: Task, allTasks: Task[]) => {
  // 直接使用更新后的全量任务列表
  setTasks(allTasks);
};
```

## 优势

1. **简化外部使用**：外部组件不再需要实现复杂的任务更新逻辑
2. **一致性保证**：所有任务更新都使用相同的内部逻辑，确保行为一致
3. **更好的封装**：任务更新逻辑完全封装在 Gantt 组件内部
4. **类型安全**：提供更新后的全量 tasks，避免外部组件手动计算错误

## 兼容性

这是一个破坏性变更，需要更新所有使用 `onDateChange` 和 `onProgressChange` 的代码。但是这种变更提供了更好的 API 设计和使用体验。
