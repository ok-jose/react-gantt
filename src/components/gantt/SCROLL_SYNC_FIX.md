# 滚动同步修复方案

## 问题描述

甘特图中左侧任务列表和右侧时间网格的滚动不同步，导致在滚动到底部时出现对齐错位的问题。

## 解决方案

### 1. 新的滚动同步架构

我们采用了更简单直接的滚动同步方案：

```tsx
// 主 Gantt 组件结构
<div className={styles.scrollSyncContainer}>
  {/* 左侧任务列表 */}
  <div className={styles.scrollSyncLeft} ref={leftRef}>
    <TaskList {...tableProps} />
  </div>

  {/* 右侧时间网格 */}
  <div className={styles.scrollSyncRight} ref={rightRef}>
    <TaskGantt {...ganttProps} />
  </div>
</div>
```

### 2. CSS 布局

```css
.scrollSyncContainer {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.scrollSyncLeft {
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.scrollSyncRight {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
```

### 3. 滚动同步 Hook

```typescript
export const useSimpleScrollSync = () => {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // 双向滚动同步逻辑
  useEffect(() => {
    const leftElement = leftRef.current;
    const rightElement = rightRef.current;

    if (!leftElement || !rightElement) return;

    const handleLeftScroll = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        rightElement.scrollTop = leftElement.scrollTop;
        requestAnimationFrame(() => {
          isScrollingRef.current = false;
        });
      }
    };

    const handleRightScroll = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        leftElement.scrollTop = rightElement.scrollTop;
        requestAnimationFrame(() => {
          isScrollingRef.current = false;
        });
      }
    };

    leftElement.addEventListener('scroll', handleLeftScroll, { passive: true });
    rightElement.addEventListener('scroll', handleRightScroll, {
      passive: true,
    });

    return () => {
      leftElement.removeEventListener('scroll', handleLeftScroll);
      rightElement.removeEventListener('scroll', handleRightScroll);
    };
  }, []);

  return { leftRef, rightRef };
};
```

## 关键特性

### 1. 防循环机制

- 使用 `isScrollingRef` 防止无限循环
- 使用 `requestAnimationFrame` 异步重置标志

### 2. 性能优化

- 使用 `passive: true` 事件监听
- 避免频繁的 DOM 操作

### 3. 布局优化

- 使用 Flexbox 布局
- 左侧固定宽度，右侧自适应
- 统一的滚动条样式

## 使用方法

### 基础使用

```tsx
import { Gantt } from './components/gantt/gantt';

function App() {
  return (
    <Gantt
      tasks={tasks}
      listCellWidth="200px"
      ganttHeight={600}
      // ... 其他配置
    />
  );
}
```

### 高级配置

```tsx
<Gantt
  tasks={tasks}
  listCellWidth="200px"
  ganttHeight={600}
  enableVirtualization={true}
  useVirtualizedCanvas={true}
  enablePerformanceMonitoring={true}
  // ... 其他配置
/>
```

## 故障排除

### 问题 1: 滚动仍然不同步

**检查项**:

1. 确保两个容器都有相同的内容高度
2. 检查 CSS 样式是否正确应用
3. 验证滚动事件监听器是否正常工作

**调试代码**:

```tsx
useEffect(() => {
  const leftElement = leftRef.current;
  const rightElement = rightRef.current;

  console.log('Container heights:', {
    left: leftElement?.scrollHeight,
    right: rightElement?.scrollHeight,
  });
}, []);
```

### 问题 2: 滚动卡顿

**解决方案**:

```tsx
// 增加防抖时间
const handleScroll = useCallback(
  debounce((scrollTop: number) => {
    // 滚动同步逻辑
  }, 16),
  []
);
```

### 问题 3: 布局错位

**检查项**:

1. 确保 `listCellWidth` 设置正确
2. 检查 `rowHeight` 是否一致
3. 验证容器高度计算

## 性能优化建议

### 1. 虚拟化

```tsx
<Gantt
  enableVirtualization={true}
  virtualizationBuffer={5}
  useVirtualizedCanvas={true}
/>
```

### 2. 性能监控

```tsx
<Gantt enablePerformanceMonitoring={true} />
```

### 3. 条件渲染

```tsx
// 根据数据量动态启用虚拟化
const enableVirtualization = tasks.length > 100;
```

## 总结

新的滚动同步方案通过以下方式解决了问题：

1. **简化的架构**: 直接在主组件中处理滚动同步
2. **CSS 布局**: 使用 Flexbox 确保布局一致性
3. **事件监听**: 双向滚动事件监听和同步
4. **防循环**: 使用标志位防止无限循环
5. **性能优化**: 被动事件监听和异步重置

这个方案更加稳定和高效，能够确保左侧任务列表和右侧时间网格的完美同步。
