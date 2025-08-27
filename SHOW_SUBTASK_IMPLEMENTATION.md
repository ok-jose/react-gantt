# showSubTask 功能实现总结

## 概述

成功为 React Gantt Chart 组件添加了 `showSubTask` 属性，该属性控制是否显示子任务行。当设置为 `false`（默认值）时，左侧表格不展示嵌套结构，右侧甘特图不展示子任务行；当设置为 `true` 时，显示完整的嵌套结构。

## 实现的功能

### 1. 属性定义

在 `src/types/public-types.ts` 中的 `StylingOption` 接口添加了：

```typescript
/**
 * 是否显示子任务，左侧 table 不展示嵌套表，右边 gantt 不展示子任务行
 * 默认为 false，设置为 true 时显示子任务
 */
showSubTask?: boolean;
```

### 2. 核心逻辑修改

#### 2.1 任务扁平化处理 (`src/helpers/bar-helper.ts`)

- 修改了 `convertToBarTasks` 函数，添加 `showSubTask` 参数
- 修改了 `flattenTasks` 函数，根据 `showSubTask` 参数决定是否包含子任务
- 当 `showSubTask` 为 `false` 时，只显示顶层任务
- 当 `showSubTask` 为 `true` 时，递归包含所有子任务

#### 2.2 任务列表显示 (`src/components/task-list/task-list-table.tsx`)

- 修改了 `TaskListTableDefault` 组件，添加 `showSubTask` 参数
- 修改了 `renderTaskRows` 函数，根据 `showSubTask` 参数决定是否递归显示子任务
- 当 `showSubTask` 为 `false` 时，只显示顶层任务行
- 当 `showSubTask` 为 `true` 时，显示完整的嵌套结构

#### 2.3 上下文传递 (`src/contexts/GanttContext.tsx`)

- 在 `GanttContextValue` 接口的 `styling` 对象中添加了 `showSubTask` 属性
- 确保属性能够正确传递给所有子组件

#### 2.4 主组件集成 (`src/components/gantt/gantt.tsx`)

- 修改了 `GanttInternal` 组件，从 `styling` 中获取 `showSubTask` 参数
- 修改了 `convertToBarTasks` 的调用，传递 `showSubTask` 参数
- 修改了 `useEffect` 的依赖数组，包含 `showSubTask` 参数
- 修改了 `Gantt` 主组件，在 `contextValue` 中正确设置 `showSubTask`

#### 2.5 任务列表组件 (`src/components/task-list/task-list.tsx`)

- 修改了 `TaskList` 组件，从 `styling` 中获取 `showSubTask` 参数
- 将 `showSubTask` 参数传递给 `TaskListTable` 组件

### 3. 类型兼容性

为了保持向后兼容性，在 `Task` 类型中添加了：

```typescript
/**
 * 所属项目ID（向后兼容，推荐使用 children 结构）
 */
project?: string;

/**
 * 显示顺序
 */
displayOrder?: number;
```

### 4. 测试和示例

#### 4.1 创建了测试文件 (`src/test-showSubTask.tsx`)

- 包含两个项目的嵌套任务结构
- 展示了 `showSubTask={true}` 和 `showSubTask={false}` 的效果对比
- 包含多层级嵌套的子任务

#### 4.2 更新了示例文件 (`src/example-nested-structure.tsx`)

- 添加了 `showSubTask` 功能的演示
- 展示了三种不同的配置：默认、显示子任务、隐藏子任务

#### 4.3 更新了文档 (`README.md`)

- 在 API 参考中添加了 `showSubTask` 属性的说明
- 添加了使用示例和代码片段
- 说明了默认值和功能效果

## 功能特点

### 1. 默认行为（showSubTask=false）

- 左侧任务列表只显示顶层任务
- 右侧甘特图只显示顶层任务行
- 项目任务仍然可以显示分段进度条（如果 `showProjectSegmentProgress=true`）
- 保持简洁的视图，适合高层级项目管理

### 2. 详细视图（showSubTask=true）

- 左侧任务列表显示完整的嵌套结构，包括缩进
- 右侧甘特图显示所有子任务行
- 支持多层级嵌套显示
- 适合详细的任务管理场景

### 3. 向后兼容性

- 保持对传统 `project` 字段的支持
- 不影响现有的 `hideChildren` 功能
- 与 `showProjectSegmentProgress` 功能兼容

## 使用示例

```tsx
// 默认行为：不显示子任务
<Gantt
  tasks={tasks}
  showSubTask={false} // 默认值
  // ... 其他属性
/>

// 显示子任务
<Gantt
  tasks={tasks}
  showSubTask={true}
  // ... 其他属性
/>
```

## 技术实现细节

### 1. 条件渲染逻辑

```typescript
// 在 flattenTasks 函数中
if (
  task.children &&
  task.children.length > 0 &&
  task.hideChildren !== true &&
  showSubTask // 新增的条件
) {
  // 包含子任务
}
```

### 2. 递归处理

- 使用递归算法处理多层级嵌套结构
- 保持任务的层级关系和依赖关系
- 确保扁平化后的任务顺序正确

### 3. 性能优化

- 只在 `showSubTask` 参数变化时重新计算任务列表
- 避免不必要的重新渲染
- 保持现有的缓存机制

## 测试结果

- ✅ 类型检查通过
- ✅ 构建成功
- ✅ 功能正常工作
- ✅ 向后兼容性保持
- ✅ 文档完整

## 总结

`showSubTask` 功能的实现完全满足了需求：

1. **功能完整**：成功控制子任务的显示/隐藏
2. **默认行为**：默认为 `false`，不显示子任务
3. **向后兼容**：不影响现有功能
4. **类型安全**：完整的 TypeScript 支持
5. **文档完善**：提供了详细的使用说明和示例

这个功能为用户提供了更灵活的任务显示选项，可以根据不同的使用场景选择合适的显示模式。
