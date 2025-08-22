# React Gantt Chart

一个功能丰富的 React 甘特图组件，支持任务管理、进度跟踪、依赖关系等功能。

## 特性

- 📊 可视化任务时间线
- 🔗 任务依赖关系
- 📈 进度跟踪
- 🎯 里程碑标记
- 📱 响应式设计
- 🌍 国际化支持
- 🎨 可自定义样式
- 📋 任务列表视图
- 🔄 展开/折叠项目
- 🖱️ 拖拽调整任务时间

## 数据结构

### 基本任务结构

```typescript
export type Task = {
  id: string;
  type: TaskType; // 'task' | 'project' | 'milestone'
  name: string;
  start: Date;
  end: Date;
  progress: number; // 0-100
  styles?: {
    backgroundColor?: string;
    backgroundSelectedColor?: string;
    progressColor?: string;
    progressSelectedColor?: string;
  };
  isDisabled?: boolean;
  project?: string; // 向后兼容的字段
  dependencies?: string[];
  hideChildren?: boolean;
  displayOrder?: number;
  children?: Task[]; // 新的嵌套结构
};
```

### 任务组织方式

#### 1. 传统方式（向后兼容）

使用 `project` 字段来标识任务属于哪个项目：

```typescript
const tasks: Task[] = [
  {
    id: 'Project1',
    name: '项目1',
    type: 'project',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
    progress: 50,
  },
  {
    id: 'Task1',
    name: '任务1',
    type: 'task',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-10'),
    progress: 80,
    project: 'Project1', // 通过 project 字段关联
  },
];
```

#### 2. 新的嵌套结构（推荐）

使用 `children` 数组来组织任务，支持多层级嵌套：

```typescript
const tasks: Task[] = [
  {
    id: 'SoftwareProject',
    name: '软件开发项目',
    type: 'project',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
    progress: 30,
    hideChildren: false,
    children: [
      {
        id: 'Planning',
        name: '项目规划',
        type: 'task',
        start: new Date('2024-01-01'),
        end: new Date('2024-01-05'),
        progress: 100,
        children: [
          {
            id: 'Requirements',
            name: '需求分析',
            type: 'task',
            start: new Date('2024-01-01'),
            end: new Date('2024-01-03'),
            progress: 100,
          },
          {
            id: 'Design',
            name: '系统设计',
            type: 'task',
            start: new Date('2024-01-03'),
            end: new Date('2024-01-05'),
            progress: 80,
            dependencies: ['Requirements'],
          },
        ],
      },
      {
        id: 'Development',
        name: '开发阶段',
        type: 'project',
        start: new Date('2024-01-05'),
        end: new Date('2024-01-25'),
        progress: 20,
        children: [
          {
            id: 'Frontend',
            name: '前端开发',
            type: 'task',
            start: new Date('2024-01-05'),
            end: new Date('2024-01-15'),
            progress: 30,
            dependencies: ['Design'],
          },
          {
            id: 'Backend',
            name: '后端开发',
            type: 'task',
            start: new Date('2024-01-07'),
            end: new Date('2024-01-20'),
            progress: 15,
            dependencies: ['Design'],
          },
        ],
      },
    ],
  },
];
```

### 嵌套结构的优势

1. **更直观的组织方式**：任务层级关系一目了然
2. **支持多层级嵌套**：可以创建复杂的项目结构
3. **更好的代码可读性**：数据结构更清晰
4. **向后兼容**：仍然支持传统的 `project` 字段
5. **自动缩进显示**：任务列表会根据层级自动缩进

## 安装

```bash
npm install react-gantt-chart
# 或
yarn add react-gantt-chart
# 或
pnpm add react-gantt-chart
```

## 基本使用

```tsx
import React from 'react';
import { Gantt } from 'react-gantt-chart';
import { ViewMode } from 'react-gantt-chart';

const App = () => {
  const tasks = [
    {
      id: 'Task1',
      name: '任务1',
      type: 'task',
      start: new Date('2024-01-01'),
      end: new Date('2024-01-10'),
      progress: 50,
    },
    // ... 更多任务
  ];

  const handleTaskChange = task => {
    console.log('任务变更:', task);
  };

  return (
    <Gantt
      tasks={tasks}
      viewMode={ViewMode.Day}
      onDateChange={handleTaskChange}
      listCellWidth="155px"
      columnWidth={65}
    />
  );
};
```

## 高级功能

### 任务展开/折叠

```tsx
const handleExpanderClick = task => {
  // 处理任务展开/折叠
  console.log('展开/折叠任务:', task);
};

<Gantt
  tasks={tasks}
  onExpanderClick={handleExpanderClick}
  // ... 其他属性
/>;
```

### 自定义样式

```tsx
<Gantt
  tasks={tasks}
  barBackgroundColor="#b8c2cc"
  barProgressColor="#a3a3ff"
  projectBackgroundColor="#fac465"
  milestoneBackgroundColor="#f1c453"
  // ... 其他样式属性
/>
```

### 国际化

```tsx
<Gantt
  tasks={tasks}
  locale="zh-CN" // 支持中文
  // ... 其他属性
/>
```

## API 参考

### Gantt 组件属性

| 属性               | 类型                   | 默认值         | 描述               |
| ------------------ | ---------------------- | -------------- | ------------------ |
| `tasks`            | `Task[]`               | -              | 任务数据数组       |
| `viewMode`         | `ViewMode`             | `ViewMode.Day` | 视图模式           |
| `onDateChange`     | `(task: Task) => void` | -              | 任务日期变更回调   |
| `onProgressChange` | `(task: Task) => void` | -              | 任务进度变更回调   |
| `onExpanderClick`  | `(task: Task) => void` | -              | 展开/折叠点击回调  |
| `listCellWidth`    | `string`               | `'155px'`      | 任务列表单元格宽度 |
| `columnWidth`      | `number`               | `65`           | 甘特图列宽度       |
| `rowHeight`        | `number`               | `50`           | 行高度             |
| `locale`           | `string`               | `'en-GB'`      | 国际化语言         |

### Task 类型

| 字段           | 类型                                 | 必需 | 描述                   |
| -------------- | ------------------------------------ | ---- | ---------------------- |
| `id`           | `string`                             | ✅   | 任务唯一标识           |
| `name`         | `string`                             | ✅   | 任务名称               |
| `type`         | `'task' \| 'project' \| 'milestone'` | ✅   | 任务类型               |
| `start`        | `Date`                               | ✅   | 开始时间               |
| `end`          | `Date`                               | ✅   | 结束时间               |
| `progress`     | `number`                             | ✅   | 进度 (0-100)           |
| `children`     | `Task[]`                             | ❌   | 子任务数组（新结构）   |
| `project`      | `string`                             | ❌   | 所属项目ID（向后兼容） |
| `dependencies` | `string[]`                           | ❌   | 依赖任务ID数组         |
| `hideChildren` | `boolean`                            | ❌   | 是否隐藏子任务         |

## 迁移指南

### 从传统结构迁移到嵌套结构

1. **识别项目任务**：找到所有 `type: 'project'` 的任务
2. **收集子任务**：找到所有 `project` 字段指向该项目的任务
3. **重构数据结构**：将子任务放入项目的 `children` 数组中
4. **移除 project 字段**：从子任务中移除 `project` 字段（可选）

```typescript
// 迁移前
const oldTasks = [
  { id: 'Project1', name: '项目1', type: 'project', ... },
  { id: 'Task1', name: '任务1', type: 'task', project: 'Project1', ... },
  { id: 'Task2', name: '任务2', type: 'task', project: 'Project1', ... },
];

// 迁移后
const newTasks = [
  {
    id: 'Project1',
    name: '项目1',
    type: 'project',
    children: [
      { id: 'Task1', name: '任务1', type: 'task', ... },
      { id: 'Task2', name: '任务2', type: 'task', ... },
    ],
  },
];
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
