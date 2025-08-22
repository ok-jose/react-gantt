# Canvas 甘特图调试指南

## 白屏问题诊断

如果甘特图出现白屏（只显示网格，不显示任务条），请按以下步骤进行调试：

### 1. 启用调试模式

```tsx
<TaskGantt
  enableDebug={true} // 启用调试模式
  // ... 其他配置
/>
```

### 2. 检查控制台输出

调试模式会在控制台输出详细信息：

- Canvas 尺寸信息
- 任务数据信息
- 渲染过程日志
- 错误和警告信息

### 3. 常见问题及解决方案

#### 问题 1: 任务坐标缺失

**症状**: 控制台显示 "Task X missing coordinates"

**原因**: 任务数据缺少 `x1` 和 `x2` 属性

**解决方案**:

```tsx
// 确保任务数据包含坐标信息
const tasks = [
  {
    id: '1',
    name: '任务 1',
    start: new Date('2025-08-01'),
    end: new Date('2025-08-05'),
    x1: 100, // 必须包含
    x2: 300, // 必须包含
  },
];
```

#### 问题 2: 任务坐标无效

**症状**: 控制台显示 "Task X invalid coordinates: x1=300, x2=100"

**原因**: `x1` 大于或等于 `x2`

**解决方案**:

```tsx
// 确保 x1 < x2
const tasks = [
  {
    id: '1',
    name: '任务 1',
    x1: 100, // 起始位置
    x2: 300, // 结束位置，必须大于 x1
  },
];
```

#### 问题 3: Canvas 尺寸问题

**症状**: Canvas 宽度或高度为 0

**原因**: `svgWidth` 或 `rowHeight` 未正确设置

**解决方案**:

```tsx
<TaskGantt
  gridProps={{
    svgWidth: 1200, // 确保有正确的宽度
    // ... 其他属性
  }}
  barProps={{
    rowHeight: 40, // 确保有正确的高度
    // ... 其他属性
  }}
/>
```

#### 问题 4: 任务数据为空

**症状**: 控制台显示 "Tasks changed: 0"

**原因**: 传入的任务数组为空

**解决方案**:

```tsx
// 确保有任务数据
const tasks = [
  // 至少有一个任务
  {
    id: '1',
    name: '测试任务',
    start: new Date(),
    end: new Date(),
    x1: 0,
    x2: 100,
  },
];
```

### 4. 调试信息解读

#### Canvas 渲染信息

```
Canvas render: {
  width: 1200,        // Canvas 宽度
  height: 480,        // Canvas 高度
  tasksCount: 12,     // 任务数量
  svgWidth: 1200,     // SVG 宽度
  rowHeight: 40       // 行高
}
```

#### 任务信息

```
Task 0: {
  name: "任务 1-2",    // 任务名称
  x1: 100,           // 起始 X 坐标
  x2: 300,           // 结束 X 坐标
  y: 20,             // Y 坐标
  width: 200,        // 任务宽度
  height: 20         // 任务高度
}
```

### 5. 性能监控

启用性能监控以检查渲染性能：

```tsx
<TaskGantt enablePerformanceMonitoring={true} enableDebug={true} />
```

### 6. 常见修复步骤

1. **检查任务数据完整性**

   ```tsx
   console.log('Tasks:', tasks);
   ```

2. **验证坐标计算**

   ```tsx
   tasks.forEach((task, index) => {
     console.log(`Task ${index}:`, {
       x1: task.x1,
       x2: task.x2,
       width: task.x2 - task.x1,
     });
   });
   ```

3. **检查 Canvas 尺寸**

   ```tsx
   const canvas = canvasRef.current;
   console.log('Canvas size:', {
     width: canvas?.width,
     height: canvas?.height,
   });
   ```

4. **验证渲染时机**
   ```tsx
   useEffect(() => {
     console.log('Rendering with tasks:', tasks.length);
     render();
   }, [tasks, render]);
   ```

### 7. 临时解决方案

如果问题仍然存在，可以尝试：

1. **强制重新渲染**

   ```tsx
   useEffect(() => {
     setTimeout(() => {
       render();
     }, 100);
   }, []);
   ```

2. **使用 SVG 回退**

   ```tsx
   // 临时禁用 Canvas，使用 SVG 渲染
   <TaskGantt useVirtualizedCanvas={false} />
   ```

3. **简化任务数据**
   ```tsx
   // 使用最简单的任务数据进行测试
   const testTasks = [
     {
       id: 'test',
       name: 'Test',
       start: new Date(),
       end: new Date(),
       x1: 50,
       x2: 150,
     },
   ];
   ```

### 8. 联系支持

如果问题仍然无法解决，请提供以下信息：

1. 控制台完整日志
2. 任务数据结构
3. 组件配置参数
4. 浏览器版本信息
5. 重现步骤

这些信息将帮助快速定位和解决问题。
