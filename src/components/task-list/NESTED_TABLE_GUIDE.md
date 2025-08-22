# 嵌套表使用指南

## 概述

新的 `TaskListTable` 组件支持嵌套表结构，允许任务在项目下展开显示，提供更好的层级可视化。

## 功能特性

### 1. 层级结构

- 项目作为父级，任务作为子级
- 支持多级嵌套（项目 → 任务 → 子任务）
- 自动缩进显示层级关系

### 2. 展开/收起功能

- 点击展开按钮（▶/▼）控制子任务显示
- 支持递归展开/收起
- 状态保持和同步

### 3. 视觉区分

- 项目行使用不同的背景色和字体样式
- 不同层级使用不同的缩进和背景色
- 悬停效果和交互反馈

## 使用方法

### 基础使用

```tsx
import { TaskListTableDefault } from './components/task-list/task-list-table';

// 定义任务数据
const tasks: Task[] = [
  {
    id: 'project-1',
    type: 'project',
    name: '项目 1',
    start: new Date('2025-01-01'),
    end: new Date('2025-01-31'),
    progress: 60,
    hideChildren: false, // 展开状态
  },
  {
    id: 'task-1-1',
    type: 'task',
    name: '任务 1-1',
    start: new Date('2025-01-01'),
    end: new Date('2025-01-15'),
    progress: 80,
    project: 'project-1',
  },
  {
    id: 'task-1-2',
    type: 'task',
    name: '任务 1-2',
    start: new Date('2025-01-16'),
    end: new Date('2025-01-31'),
    progress: 40,
    project: 'project-1',
  },
];

// 获取子任务的函数
const getTaskChildren = (taskId: string): Task[] => {
  return tasks.filter(task => task.project === taskId);
};

// 使用组件
<TaskListTableDefault
  rowHeight={50}
  rowWidth="200px"
  fontFamily="Arial"
  fontSize="14px"
  locale="zh-CN"
  tasks={tasks.filter(task => !task.project)} // 只显示顶级任务
  selectedTaskId=""
  setSelectedTask={taskId => console.log('Selected:', taskId)}
  onExpanderClick={task => {
    // 处理展开/收起逻辑
    console.log('Toggle expand:', task.id);
  }}
  getTaskChildren={getTaskChildren}
/>;
```

### 高级配置

```tsx
// 复杂嵌套结构
const complexTasks: Task[] = [
  {
    id: 'project-1',
    type: 'project',
    name: '主项目',
    start: new Date('2025-01-01'),
    end: new Date('2025-03-31'),
    progress: 50,
    hideChildren: false,
  },
  {
    id: 'subproject-1',
    type: 'project',
    name: '子项目 1',
    start: new Date('2025-01-01'),
    end: new Date('2025-02-28'),
    progress: 70,
    project: 'project-1',
    hideChildren: true, // 默认收起
  },
  {
    id: 'task-1-1',
    type: 'task',
    name: '具体任务 1',
    start: new Date('2025-01-01'),
    end: new Date('2025-01-15'),
    progress: 100,
    project: 'subproject-1',
  },
  {
    id: 'task-1-2',
    type: 'task',
    name: '具体任务 2',
    start: new Date('2025-01-16'),
    end: new Date('2025-01-31'),
    progress: 60,
    project: 'subproject-1',
  },
];

// 递归获取子任务
const getTaskChildrenRecursive = (taskId: string): Task[] => {
  return complexTasks.filter(task => task.project === taskId);
};
```

## 数据结构

### Task 类型定义

```typescript
export type TaskType = 'task' | 'milestone' | 'project';

export type Task = {
  id: string;
  type: TaskType;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  styles?: {
    backgroundColor?: string;
    backgroundSelectedColor?: string;
    progressColor?: string;
    progressSelectedColor?: string;
  };
  isDisabled?: boolean;
  project?: string; // 父级项目 ID
  dependencies?: string[];
  hideChildren?: boolean; // 展开/收起状态
  displayOrder?: number;
};
```

### 关键属性说明

- **`type`**: 任务类型
  - `'project'`: 项目，可以有子任务
  - `'task'`: 普通任务
  - `'milestone'`: 里程碑

- **`project`**: 父级项目 ID
  - 如果为空或 undefined，表示顶级任务
  - 如果设置了值，表示该任务属于指定的项目

- **`hideChildren`**: 展开状态
  - `true`: 收起状态，不显示子任务
  - `false`: 展开状态，显示子任务
  - `undefined`: 没有子任务

## 样式定制

### CSS 类名

```css
/* 项目行 */
.projectRow {
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

/* 任务行 */
.taskRow {
  background-color: #ffffff;
}

/* 嵌套层级 */
.taskRow[style*='paddingLeft: 20px'] {
  background-color: #fafbfc;
}

.taskRow[style*='paddingLeft: 40px'] {
  background-color: #f8f9fa;
}

/* 项目名称 */
.projectName {
  font-weight: 600;
  color: #495057;
}

/* 任务名称 */
.taskName {
  color: #6c757d;
}
```

### 自定义样式

```tsx
// 通过 styles 属性自定义任务样式
const customTasks: Task[] = [
  {
    id: 'project-1',
    type: 'project',
    name: '自定义项目',
    start: new Date('2025-01-01'),
    end: new Date('2025-01-31'),
    progress: 60,
    styles: {
      backgroundColor: '#e3f2fd',
      backgroundSelectedColor: '#bbdefb',
      progressColor: '#2196f3',
      progressSelectedColor: '#1976d2',
    },
  },
];
```

## 事件处理

### 展开/收起事件

```tsx
const handleExpanderClick = (task: Task) => {
  // 更新任务的展开状态
  const updatedTasks = tasks.map(t =>
    t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
  );

  // 更新状态
  setTasks(updatedTasks);
};
```

### 选择事件

```tsx
const handleTaskSelect = (taskId: string) => {
  setSelectedTaskId(taskId);

  // 可以在这里添加其他逻辑
  console.log('Selected task:', taskId);
};
```

## 性能优化

### 1. 虚拟化支持

```tsx
// 对于大量数据，建议启用虚拟化
<TaskListTableDefault
  // ... 其他属性
  enableVirtualization={true}
  virtualizationBuffer={5}
/>
```

### 2. 懒加载子任务

```tsx
const getTaskChildrenLazy = (taskId: string): Task[] => {
  // 只在需要时加载子任务
  if (!loadedChildren.has(taskId)) {
    // 从服务器加载子任务
    loadChildrenFromServer(taskId);
    return [];
  }
  return childrenCache.get(taskId) || [];
};
```

### 3. 记忆化子任务

```tsx
const memoizedGetTaskChildren = useMemo(() => {
  const cache = new Map<string, Task[]>();

  return (taskId: string): Task[] => {
    if (!cache.has(taskId)) {
      cache.set(
        taskId,
        tasks.filter(task => task.project === taskId)
      );
    }
    return cache.get(taskId) || [];
  };
}, [tasks]);
```

## 故障排除

### 问题 1: 子任务不显示

**检查项**:

1. 确保 `getTaskChildren` 函数正确实现
2. 检查任务的 `project` 属性是否正确设置
3. 验证 `hideChildren` 状态是否为 `false`

### 问题 2: 缩进不正确

**解决方案**:

```css
/* 确保容器支持相对定位 */
.taskListWrapper {
  position: relative;
}

/* 调整缩进值 */
.taskListTableRow {
  padding-left: calc(var(--level) * 20px);
}
```

### 问题 3: 样式不生效

**检查项**:

1. 确保 CSS 模块正确导入
2. 检查类名是否正确应用
3. 验证样式优先级

## 最佳实践

1. **数据结构设计**
   - 使用清晰的 ID 命名规则
   - 保持父子关系的完整性
   - 合理设置默认展开状态

2. **性能考虑**
   - 对于大量数据使用虚拟化
   - 实现懒加载子任务
   - 缓存子任务查询结果

3. **用户体验**
   - 提供展开/收起的视觉反馈
   - 使用合适的颜色和字体区分层级
   - 支持键盘导航

4. **可访问性**
   - 添加适当的 ARIA 标签
   - 支持屏幕阅读器
   - 提供键盘快捷键

## 总结

嵌套表功能为甘特图提供了更好的层级可视化能力，通过合理的结构设计和样式定制，可以创建直观、易用的项目管理界面。
