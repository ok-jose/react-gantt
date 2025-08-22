# 性能监控死循环问题修复

## 问题描述

在原始的 `useGanttPerformance` Hook 中，`endRender` 函数会调用 `setMetrics` 更新状态，而状态更新会触发组件重新渲染，导致死循环。

## 问题原因

```typescript
// 问题代码
const endRender = () => {
  const renderTime = performance.now() - renderStartTimeRef.current;

  setMetrics(prev => ({
    // 这里会触发状态更新
    ...prev,
    renderTime,
    taskCount,
    visibleTaskCount,
  }));
};
```

每次渲染都会调用 `endRender`，而 `endRender` 又会触发状态更新，导致无限循环。

## 解决方案

### 1. 创建简化的性能监控 Hook

使用 `useRef` 存储性能数据，避免状态更新：

```typescript
export const useSimplePerformance = () => {
  const renderStartTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const currentFpsRef = useRef(60);

  const startRender = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTimeRef.current;
    lastRenderTimeRef.current = renderTime; // 只更新 ref，不触发状态更新

    // 性能警告
    if (renderTime > 16.67) {
      console.warn(`甘特图渲染性能警告: ${renderTime.toFixed(2)}ms`);
    }
  }, []);

  const getMetrics = useCallback(
    (taskCount: number, visibleTaskCount: number) => {
      return {
        renderTime: lastRenderTimeRef.current,
        taskCount,
        visibleTaskCount,
        fps: currentFpsRef.current,
      };
    },
    []
  );

  return { startRender, endRender, getMetrics };
};
```

### 2. 关键改进

- **使用 `useRef` 存储数据**：避免状态更新导致的重新渲染
- **按需获取指标**：通过 `getMetrics` 函数获取当前指标，而不是实时状态
- **减少更新频率**：只在需要时计算和显示性能数据

### 3. 使用方式

```tsx
// 在组件中使用
const { startRender, endRender, getMetrics } = useSimplePerformance();

// 渲染开始时
startRender();

// 渲染结束时
endRender();

// 获取性能指标（只在需要显示时调用）
const metrics = getMetrics(taskCount, visibleTaskCount);
```

## 性能对比

| 方案     | 状态更新频率 | 重新渲染次数 | 性能影响 |
| -------- | ------------ | ------------ | -------- |
| 原始方案 | 每次渲染     | 无限循环     | 严重     |
| 简化方案 | 无状态更新   | 正常         | 无影响   |

## 最佳实践

1. **避免在渲染函数中更新状态**：特别是与渲染相关的状态
2. **使用 `useRef` 存储临时数据**：不需要触发重新渲染的数据
3. **按需计算性能指标**：只在需要显示时计算，避免频繁计算
4. **合理使用性能监控**：在生产环境中可以关闭性能监控

## 总结

通过使用 `useRef` 替代 `useState` 来存储性能数据，成功解决了死循环问题。新的方案既保持了性能监控功能，又避免了不必要的重新渲染，确保了组件的稳定性和性能。
