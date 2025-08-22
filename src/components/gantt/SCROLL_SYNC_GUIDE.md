# 滚动同步指南

## 问题描述

在甘特图中，左侧任务列表和右侧时间网格的滚动不同步，导致在滚动到底部时出现对齐错位的问题。

## 解决方案

### 1. 启用滚动同步

```tsx
<TaskGantt
  enableScrollSync={true} // 启用滚动同步
  // ... 其他配置
/>
```

### 2. 滚动同步机制

#### 自动同步

- 左侧任务列表滚动时，右侧时间网格自动同步
- 右侧时间网格滚动时，左侧任务列表自动同步
- 使用节流机制避免性能问题

#### 手动同步

```tsx
// 手动设置滚动位置
syncScrollPosition(scrollTop);
```

### 3. 配置选项

```tsx
const { leftContainerRef, rightContainerRef, syncScrollPosition } =
  useScrollSync({
    enabled: true, // 是否启用滚动同步
    throttleMs: 16, // 节流时间（毫秒）
  });
```

## 技术实现

### 滚动同步 Hook

```typescript
export const useScrollSync = (options: UseScrollSyncOptions = {}) => {
  const { enabled = true, throttleMs = 16 } = options;

  const leftContainerRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);

  // 同步逻辑...

  return {
    leftContainerRef,
    rightContainerRef,
    syncScrollPosition,
  };
};
```

### 关键特性

1. **双向同步**
   - 左侧 → 右侧
   - 右侧 → 左侧

2. **节流优化**
   - 避免频繁的滚动事件
   - 默认 16ms 节流时间

3. **防循环**
   - 使用 `isScrollingRef` 防止无限循环
   - 滚动标志自动重置

4. **性能优化**
   - 使用 `passive: true` 事件监听
   - 异步重置滚动标志

## 使用示例

### 基础使用

```tsx
import { TaskGantt } from './components/gantt/task-gantt';

function App() {
  return (
    <TaskGantt
      enableScrollSync={true}
      gridProps={gridProps}
      calendarProps={calendarProps}
      barProps={barProps}
      ganttHeight={600}
      scrollY={0}
      scrollX={0}
    />
  );
}
```

### 高级配置

```tsx
<TaskGantt
  enableScrollSync={true}
  enableVirtualization={true}
  virtualizationBuffer={5}
  useVirtualizedCanvas={true}
  enablePerformanceMonitoring={true}
  enableDebug={false}
  // ... 其他配置
/>
```

## 故障排除

### 问题 1: 滚动不同步

**症状**: 左侧和右侧滚动位置不一致

**解决方案**:

```tsx
// 确保启用滚动同步
<TaskGantt enableScrollSync={true} />;

// 检查容器高度是否一致
const leftHeight = leftContainer.scrollHeight;
const rightHeight = rightContainer.scrollHeight;
console.log('Container heights:', { leftHeight, rightHeight });
```

### 问题 2: 滚动卡顿

**症状**: 滚动时出现卡顿现象

**解决方案**:

```tsx
// 增加节流时间
const { leftContainerRef, rightContainerRef } = useScrollSync({
  enabled: true,
  throttleMs: 32, // 增加节流时间
});
```

### 问题 3: 滚动位置跳跃

**症状**: 滚动时位置突然跳跃

**解决方案**:

```tsx
// 检查滚动事件监听
useEffect(() => {
  const container = rightContainerRef.current;
  if (!container) return;

  const handleScroll = () => {
    console.log('Scroll position:', container.scrollTop);
  };

  container.addEventListener('scroll', handleScroll, { passive: true });
  return () => container.removeEventListener('scroll', handleScroll);
}, []);
```

## 性能优化

### 1. 节流设置

```tsx
// 高性能场景
const { leftContainerRef, rightContainerRef } = useScrollSync({
  throttleMs: 8, // 更快的响应
});

// 低性能设备
const { leftContainerRef, rightContainerRef } = useScrollSync({
  throttleMs: 32, // 更慢但更稳定
});
```

### 2. 条件启用

```tsx
// 根据设备性能动态启用
const enableScrollSync = useMemo(() => {
  return window.innerWidth > 768; // 只在桌面端启用
}, []);

<TaskGantt enableScrollSync={enableScrollSync} />;
```

### 3. 内存优化

```tsx
// 组件卸载时清理
useEffect(() => {
  return () => {
    // 清理滚动监听器
    if (leftContainerRef.current) {
      leftContainerRef.current.removeEventListener('scroll', handleScroll);
    }
    if (rightContainerRef.current) {
      rightContainerRef.current.removeEventListener('scroll', handleScroll);
    }
  };
}, []);
```

## 最佳实践

1. **始终启用滚动同步**

   ```tsx
   <TaskGantt enableScrollSync={true} />
   ```

2. **合理设置节流时间**

   ```tsx
   // 桌面端：16ms
   // 移动端：32ms
   // 低性能设备：64ms
   ```

3. **监控滚动性能**

   ```tsx
   <TaskGantt enableScrollSync={true} enablePerformanceMonitoring={true} />
   ```

4. **测试边界情况**
   - 大量任务数据
   - 快速滚动
   - 不同屏幕尺寸

## 总结

滚动同步功能解决了甘特图中左右两侧滚动不同步的问题，确保用户在任何滚动位置都能看到正确的对齐关系。通过合理的配置和优化，可以提供流畅的滚动体验。
