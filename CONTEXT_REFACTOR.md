# Gantt 组件 Context 重构说明

## 概述

本次重构将 Gantt 组件的 props 传递机制改为使用 React Context API，有效解决了 props drilling（层层透传）的问题，提高了代码的可维护性和可读性。

## 主要改进

### 1. 创建了 GanttContext

- **文件位置**: `src/contexts/GanttContext.tsx`
- **功能**: 管理 Gantt 组件的所有共享状态和配置
- **结构**:
  - `styling`: 样式相关配置（颜色、字体、尺寸等）
  - `display`: 显示相关配置（视图模式、语言、方向等）
  - `events`: 事件处理函数
  - `state`: 状态管理（选中任务、甘特图事件等）

### 2. 提供了便捷的 Hooks

```typescript
// 获取完整的上下文
const context = useGanttContext();

// 获取样式配置
const styling = useGanttStyling();

// 获取显示配置
const display = useGanttDisplay();

// 获取事件处理函数
const events = useGanttEvents();

// 获取状态管理
const state = useGanttState();
```

### 3. 重构的组件

#### 主要组件

- **Gantt**: 主组件，现在使用 Context Provider 包装内部实现
- **TaskList**: 使用 Context 获取配置，减少了 10+ 个 props
- **TaskGanttContent**: 使用 Context 获取事件处理函数
- **Calendar**: 使用 Context 获取样式和显示配置
- **Grid**: 使用 Context 获取样式配置

#### Props 减少情况

- **TaskList**: 从 15+ 个 props 减少到 6 个
- **Calendar**: 所有样式 props 变为可选，优先使用 Context
- **Grid**: 所有样式 props 变为可选，优先使用 Context

## 使用方法

### 基本使用

```typescript
import { Gantt } from './components/gantt/gantt';

function App() {
  const tasks = [/* 任务数据 */];

  return (
    <Gantt
      tasks={tasks}
      viewMode={ViewMode.Day}
      onDateChange={handleDateChange}
      onProgressChange={handleProgressChange}
      // ... 其他配置
    />
  );
}
```

### 在子组件中使用 Context

```typescript
import { useGanttContext, useGanttStyling } from '../contexts/GanttContext';

function MyCustomComponent() {
  // 获取样式配置
  const { headerHeight, fontFamily, fontSize } = useGanttStyling();

  // 获取事件处理函数
  const { onDateChange, onProgressChange } = useGanttEvents();

  // 获取状态
  const { selectedTask, setSelectedTask } = useGanttState();

  return (
    <div style={{ height: headerHeight, fontFamily, fontSize }}>
      {/* 组件内容 */}
    </div>
  );
}
```

## 兼容性

### 向后兼容

- 所有原有的 props 仍然支持
- 子组件优先使用传入的 props，如果没有则使用 Context 中的值
- 不会破坏现有的使用方式

### 渐进式迁移

- 可以逐步将子组件迁移到使用 Context
- 新旧方式可以并存
- 提供了详细的迁移指南

## 性能优化

### Context 优化

- 将 Context 值按功能分组，避免不必要的重渲染
- 使用 `useMemo` 优化 Context 值的创建
- 提供了专门的 Hooks 来获取特定配置

### 组件优化

- 减少了 props 传递，降低了组件重渲染的频率
- 使用 `React.memo` 优化子组件渲染
- 保持了原有的性能特性

## 示例

查看 `src/examples/ContextUsageExample.tsx` 文件，了解完整的使用示例。

## 迁移指南

### 从旧版本迁移

1. **更新导入**

   ```typescript
   // 旧版本
   import { Gantt } from './components/gantt/gantt';

   // 新版本（导入方式不变）
   import { Gantt } from './components/gantt/gantt';
   ```

2. **使用方式保持不变**

   ```typescript
   // 使用方式完全相同
   <Gantt
     tasks={tasks}
     viewMode={ViewMode.Day}
     onDateChange={handleDateChange}
     // ... 其他配置
   />
   ```

3. **可选：在子组件中使用 Context**

   ```typescript
   // 如果需要在自定义子组件中访问配置
   import { useGanttContext } from '../contexts/GanttContext';

   function CustomComponent() {
     const { styling, events } = useGanttContext();
     // 使用配置...
   }
   ```

## 注意事项

1. **Context 必须在 Provider 内使用**
   - 所有使用 Context 的组件必须在 `GanttProvider` 内部
   - 如果在外部使用会抛出错误

2. **Props 优先级**
   - 传入的 props 优先于 Context 中的值
   - 这样可以保持灵活性

3. **性能考虑**
   - Context 值变化会导致所有使用该 Context 的组件重渲染
   - 建议将 Context 值按功能分组

## 未来计划

1. **进一步优化**
   - 考虑使用 `useReducer` 管理复杂状态
   - 添加更多的性能优化

2. **功能扩展**
   - 支持主题系统
   - 支持国际化
   - 支持插件系统

3. **文档完善**
   - 添加更多使用示例
   - 提供最佳实践指南
