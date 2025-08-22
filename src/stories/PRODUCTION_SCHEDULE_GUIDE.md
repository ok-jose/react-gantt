# 生产调度甘特图使用指南

## 概述

生产调度甘特图是专门为制造业设计的甘特图组件，支持生产线任务调度、时间调整和可视化管理。

## 功能特性

### 1. 生产线层级结构

- **硫化缸项目**: 作为生产线容器
- **OP任务**: 具体的操作任务
- **层级展开**: 支持展开/收起子任务

### 2. 时间轴管理

- **小时级精度**: 精确到小时的时间管理
- **拖拽调整**: 支持拖拽任务条边缘调整时间
- **实时更新**: 拖拽时实时显示时间变化

### 3. 视觉区分

- **颜色编码**: 不同OP任务使用不同颜色
  - 红色: OP-1 (关键操作)
  - 浅蓝色: OP-2, OP-3, OP-4, OP-8 (常规操作)
  - 浅灰色: OP-5, OP-7 (辅助操作)
- **任务条**: 圆角设计，现代化外观

### 4. 交互功能

- **工具提示**: 悬停显示详细信息
- **点击选择**: 点击任务进行选择
- **双击编辑**: 双击任务打开编辑界面
- **拖拽调整**: 拖拽任务条调整时间

## 数据结构

### 生产调度任务结构

```typescript
interface ProductionTask {
  id: string; // 任务ID
  name: string; // 任务名称 (如 "OP-1")
  type: 'project' | 'task'; // 任务类型
  start: Date; // 开始时间
  end: Date; // 结束时间
  progress: number; // 进度 (0-100)
  project?: string; // 所属项目ID
  hideChildren?: boolean; // 是否隐藏子任务
  styles?: {
    // 样式配置
    backgroundColor: string;
    backgroundSelectedColor: string;
    progressColor: string;
    progressSelectedColor: string;
  };
}
```

### 示例数据结构

```typescript
const productionTasks = [
  // 硫化缸01 项目
  {
    id: '硫化缸01',
    name: '1 ▼ 硫化缸01',
    type: 'project',
    start: new Date(2025, 5, 15, 1), // 2025-06-15 01:00
    end: new Date(2025, 5, 15, 19), // 2025-06-15 19:00
    progress: 100,
    hideChildren: false,
  },
  // OP-1 任务
  {
    id: '硫化缸01-OP-1',
    name: 'OP-1',
    type: 'task',
    start: new Date(2025, 5, 15, 1), // 01:00
    end: new Date(2025, 5, 15, 3), // 03:00
    progress: 100,
    project: '硫化缸01',
    styles: {
      backgroundColor: '#ff6b6b',
      backgroundSelectedColor: '#ff6b6b',
      progressColor: '#ff6b6b',
      progressSelectedColor: '#ff6b6b',
    },
  },
  // ... 更多任务
];
```

## 使用方法

### 基础使用

```tsx
import React, { useState, useCallback } from 'react';
import { Gantt } from './components/gantt/gantt';
import { initProductionScheduleData } from './stories/data-helper';
import { ProductionTooltip } from './components/other/production-tooltip';

function ProductionSchedule() {
  const [tasks, setTasks] = useState(() => initProductionScheduleData(2, 4));

  const handleExpanderClick = useCallback(task => {
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
      )
    );
  }, []);

  const handleDateChange = useCallback(async (task, children) => {
    console.log('任务时间调整:', {
      taskName: task.name,
      newStart: task.start,
      newEnd: task.end,
      duration: (task.end - task.start) / (1000 * 60 * 60), // 小时
    });

    setTasks(prev => prev.map(t => (t.id === task.id ? task : t)));
    return true;
  }, []);

  return (
    <Gantt
      tasks={tasks}
      listCellWidth="200px"
      ganttHeight={400}
      rowHeight={50}
      columnWidth={60}
      viewMode="Hour"
      preStepsCount={1}
      onExpanderClick={handleExpanderClick}
      onDateChange={handleDateChange}
      TooltipContent={ProductionTooltip}
      enableScrollSync={true}
      enableVirtualization={true}
      useVirtualizedCanvas={true}
      barCornerRadius={3}
      barFill={80}
      fontFamily="Arial, sans-serif"
      fontSize="12px"
      headerHeight={50}
      handleWidth={8}
      timeStep={3600000} // 1小时
    />
  );
}
```

### 高级配置

```tsx
// 自定义工具提示
const CustomTooltip = ({ task, fontSize, fontFamily }) => (
  <div
    style={{
      backgroundColor: 'white',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize,
      fontFamily,
    }}
  >
    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{task.name}</div>
    <div>开始: {task.start.toLocaleTimeString()}</div>
    <div>结束: {task.end.toLocaleTimeString()}</div>
    <div>
      时长: {((task.end - task.start) / (1000 * 60 * 60)).toFixed(1)}小时
    </div>
  </div>
);

// 使用自定义工具提示
<Gantt
  // ... 其他属性
  TooltipContent={CustomTooltip}
/>;
```

## 事件处理

### 展开/收起事件

```tsx
const handleExpanderClick = task => {
  // 更新任务的展开状态
  setTasks(prev =>
    prev.map(t =>
      t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
    )
  );
};
```

### 时间调整事件

```tsx
const handleDateChange = async (task, children) => {
  const duration = (task.end - task.start) / (1000 * 60 * 60);

  console.log('时间调整:', {
    taskName: task.name,
    startTime: task.start.toLocaleTimeString(),
    endTime: task.end.toLocaleTimeString(),
    duration: `${duration.toFixed(1)}小时`,
  });

  // 更新任务数据
  setTasks(prev => prev.map(t => (t.id === task.id ? task : t)));

  // 可以在这里添加验证逻辑
  if (duration < 0.5) {
    alert('任务时间不能少于30分钟');
    return false; // 拒绝调整
  }

  return true; // 允许调整
};
```

### 任务选择事件

```tsx
const handleTaskClick = task => {
  console.log('选中任务:', task.name);
  // 可以在这里更新选中状态
};

const handleTaskDoubleClick = task => {
  console.log('双击任务:', task.name);
  // 可以在这里打开任务详情对话框
};
```

## 样式定制

### 任务颜色配置

```typescript
const getTaskColor = (taskName: string) => {
  if (taskName.includes('OP-1')) {
    return '#ff6b6b'; // 红色 - 关键操作
  } else if (
    taskName.includes('OP-2') ||
    taskName.includes('OP-3') ||
    taskName.includes('OP-4') ||
    taskName.includes('OP-8')
  ) {
    return '#74c0fc'; // 浅蓝色 - 常规操作
  } else {
    return '#adb5bd'; // 浅灰色 - 辅助操作
  }
};

const tasks = [
  {
    // ... 其他属性
    styles: {
      backgroundColor: getTaskColor(task.name),
      backgroundSelectedColor: getTaskColor(task.name),
      progressColor: getTaskColor(task.name),
      progressSelectedColor: getTaskColor(task.name),
    },
  },
];
```

### 自定义CSS样式

```css
/* 项目行样式 */
.projectRow {
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

/* 任务行样式 */
.taskRow {
  background-color: #ffffff;
}

/* 任务条样式 */
.gantt-bar {
  border-radius: 3px;
  transition: all 0.2s ease;
}

.gantt-bar:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

## 性能优化

### 虚拟化渲染

```tsx
<Gantt
  // ... 其他属性
  enableVirtualization={true}
  useVirtualizedCanvas={true}
  enablePerformanceMonitoring={true}
/>
```

### 大量数据处理

```tsx
// 对于大量数据，建议使用虚拟化
const handleLargeData = () => {
  const largeTasks = initProductionScheduleData(20, 10); // 20个项目，每个10个任务

  return (
    <Gantt
      tasks={largeTasks}
      enableVirtualization={true}
      useVirtualizedCanvas={true}
      virtualizationBuffer={10}
      // ... 其他属性
    />
  );
};
```

## 故障排除

### 问题 1: 任务时间调整不生效

**检查项**:

1. 确保 `onDateChange` 回调返回 `true`
2. 检查任务数据更新逻辑
3. 验证时间格式是否正确

### 问题 2: 工具提示不显示

**解决方案**:

```tsx
// 确保传入正确的 TooltipContent
<Gantt
  TooltipContent={ProductionTooltip}
  // ... 其他属性
/>
```

### 问题 3: 拖拽不流畅

**优化建议**:

```tsx
// 使用 Canvas 渲染提高性能
<Gantt
  useVirtualizedCanvas={true}
  enableVirtualization={true}
  // ... 其他属性
/>
```

## 最佳实践

1. **数据结构设计**
   - 使用清晰的命名规则
   - 合理设置任务层级关系
   - 保持时间数据的准确性

2. **用户体验**
   - 提供清晰的操作反馈
   - 使用合适的颜色区分任务类型
   - 支持键盘快捷键操作

3. **性能考虑**
   - 对于大量数据使用虚拟化
   - 合理设置缓冲区大小
   - 监控渲染性能

4. **可访问性**
   - 提供屏幕阅读器支持
   - 使用语义化的颜色对比
   - 支持键盘导航

## 总结

生产调度甘特图提供了完整的生产线任务管理功能，通过合理的配置和定制，可以满足各种制造业的调度需求。
