import { useRef, useCallback } from 'react';

export interface SimplePerformanceMetrics {
  renderTime: number;
  taskCount: number;
  visibleTaskCount: number;
  fps: number;
}

/**
 * 简化的性能监控 Hook
 * 避免复杂的状态管理，防止死循环
 */
export const useSimplePerformance = () => {
  const renderStartTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const currentFpsRef = useRef(60);

  // 开始渲染计时
  const startRender = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  // 结束渲染计时
  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTimeRef.current;
    lastRenderTimeRef.current = renderTime;

    // 更新 FPS
    frameCountRef.current++;
    const currentTime = performance.now();

    if (currentTime - lastFpsTimeRef.current >= 1000) {
      currentFpsRef.current = Math.round(
        (frameCountRef.current * 1000) / (currentTime - lastFpsTimeRef.current)
      );
      frameCountRef.current = 0;
      lastFpsTimeRef.current = currentTime;
    }

    // 性能警告
    if (renderTime > 16.67) {
      console.warn(
        `甘特图渲染性能警告: 渲染时间 ${renderTime.toFixed(2)}ms 超过 16.67ms`,
        { renderTime }
      );
    }
  }, []);

  // 获取当前指标
  const getMetrics = useCallback(
    (taskCount: number, visibleTaskCount: number): SimplePerformanceMetrics => {
      return {
        renderTime: lastRenderTimeRef.current,
        taskCount,
        visibleTaskCount,
        fps: currentFpsRef.current,
      };
    },
    []
  );

  // 获取性能建议
  const getPerformanceAdvice = useCallback((taskCount: number): string[] => {
    const advice: string[] = [];

    if (lastRenderTimeRef.current > 16.67) {
      advice.push('建议启用虚拟化渲染以减少渲染时间');
    }

    if (taskCount > 1000) {
      advice.push('任务数量较多，建议启用 Canvas 渲染模式');
    }

    if (currentFpsRef.current < 30) {
      advice.push('帧率较低，建议减少可见任务数量或启用性能优化选项');
    }

    return advice;
  }, []);

  return {
    startRender,
    endRender,
    getMetrics,
    getPerformanceAdvice,
  };
};
