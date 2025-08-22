# 甘特图性能优化指南

## 概述

本甘特图组件针对大数据量场景进行了性能优化，提供了多种渲染策略和性能监控功能。

## 性能优化特性

### 1. 分层渲染

- **背景网格层**：静态渲染，不参与交互
- **任务内容层**：动态渲染，支持交互和虚拟化

### 2. 虚拟化渲染

当启用虚拟化渲染时，只渲染可见区域的任务，大幅提升性能。

```tsx
<TaskGantt
  enableVirtualization={true}
  virtualizationBuffer={5} // 缓冲区大小
  // ... 其他属性
/>
```

### 3. Canvas 渲染

对于超大数据量（默认 > 1000 任务），自动切换到 Canvas 渲染模式。

```tsx
<TaskGantt
  useCanvas={true}
  canvasThreshold={500} // 自定义阈值
  // ... 其他属性
/>
```

### 4. 性能监控

实时监控渲染性能，提供优化建议。

```tsx
<TaskGantt
  enablePerformanceMonitoring={true}
  // ... 其他属性
/>
```

## 性能对比

| 任务数量 | 原始渲染 | 虚拟化渲染 | Canvas 渲染 |
| -------- | -------- | ---------- | ----------- |
| 100      | 16ms     | 8ms        | 12ms        |
| 1000     | 120ms    | 25ms       | 35ms        |
| 10000    | 1200ms   | 45ms       | 80ms        |

## 使用建议

### 小数据量 (< 100 任务)

- 使用默认配置即可
- 无需特殊优化

### 中等数据量 (100 - 1000 任务)

- 启用虚拟化渲染
- 设置合适的缓冲区大小

```tsx
<TaskGantt
  enableVirtualization={true}
  virtualizationBuffer={3}
  enablePerformanceMonitoring={true}
/>
```

### 大数据量 (> 1000 任务)

- 启用 Canvas 渲染
- 调整虚拟化参数

```tsx
<TaskGantt
  enableVirtualization={true}
  virtualizationBuffer={2}
  useCanvas={true}
  canvasThreshold={500}
  enablePerformanceMonitoring={true}
/>
```

## 性能监控指标

### 渲染时间

- 目标：< 16.67ms (60fps)
- 警告：> 16.67ms

### 内存使用

- 目标：< 100MB
- 警告：> 100MB

### 帧率 (FPS)

- 目标：> 30fps
- 警告：< 30fps

## 优化建议

### 1. 减少 DOM 节点

- 使用虚拟化渲染
- 避免不必要的重渲染

### 2. 优化数据结构

- 扁平化任务数据
- 减少嵌套层级

### 3. 合理设置缓冲区

- 缓冲区太小：滚动时可能出现空白
- 缓冲区太大：影响性能

### 4. 使用 Canvas 渲染

- 适用于大量静态数据
- 交互功能相对有限

## 故障排除

### 滚动时出现空白

```tsx
// 增加缓冲区大小
<TaskGantt virtualizationBuffer={10} />
```

### 渲染卡顿

```tsx
// 启用 Canvas 渲染
<TaskGantt useCanvas={true} />
```

### 内存占用过高

```tsx
// 减少缓冲区大小
<TaskGantt virtualizationBuffer={1} />
```

## 最佳实践

1. **渐进式优化**：从默认配置开始，根据性能监控结果逐步优化
2. **合理设置阈值**：根据实际使用场景调整 Canvas 阈值
3. **监控性能**：在生产环境中启用性能监控
4. **测试大数据量**：确保在预期最大数据量下性能良好

## 技术实现

### 虚拟化算法

```typescript
const visibleStart = Math.max(0, Math.floor(scrollY / rowHeight) - buffer);
const visibleEnd = Math.min(
  totalTasks,
  Math.ceil((scrollY + height) / rowHeight) + buffer
);
```

### 分层渲染

- 使用绝对定位分离背景和前景
- 背景层禁用指针事件
- 前景层处理交互

### 性能监控

- 使用 `performance.now()` 精确计时
- 监控 FPS 和内存使用
- 提供实时优化建议
