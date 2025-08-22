import { useEffect, useRef, useState } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  taskCount: number;
  visibleTaskCount: number;
  memoryUsage?: number;
  fps: number;
}

export interface UseGanttPerformanceOptions {
  /**
   * 是否启用性能监控，默认 true
   */
  enabled?: boolean;
  /**
   * 性能监控的采样间隔（毫秒），默认 1000
   */
  sampleInterval?: number;
  /**
   * 性能警告阈值（毫秒），默认 16.67 (60fps)
   */
  warningThreshold?: number;
}

/**
 * 甘特图性能监控 Hook
 * 用于监控渲染性能并提供优化建议
 */
export const useGanttPerformance = (
  taskCount: number,
  visibleTaskCount: number,
  options: UseGanttPerformanceOptions = {}
) => {
  const {
    enabled = true,
    sampleInterval = 1000,
    warningThreshold = 16.67,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    taskCount,
    visibleTaskCount,
    fps: 60,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderStartTimeRef = useRef(0);

  // 开始渲染计时
  const startRender = () => {
    if (!enabled) return;
    renderStartTimeRef.current = performance.now();
  };

  // 结束渲染计时
  const endRender = () => {
    if (!enabled) return;
    const renderTime = performance.now() - renderStartTimeRef.current;

    setMetrics(prev => ({
      ...prev,
      renderTime,
      taskCount,
      visibleTaskCount,
    }));

    // 检查性能警告
    if (renderTime > warningThreshold) {
      console.warn(
        `甘特图渲染性能警告: 渲染时间 ${renderTime.toFixed(2)}ms 超过阈值 ${warningThreshold}ms`,
        {
          taskCount,
          visibleTaskCount,
          renderTime,
        }
      );
    }
  };

  // FPS 监控
  useEffect(() => {
    if (!enabled) return;

    const updateFPS = () => {
      const currentTime = performance.now();
      frameCountRef.current++;

      if (currentTime - lastTimeRef.current >= sampleInterval) {
        const fps = Math.round(
          (frameCountRef.current * 1000) / (currentTime - lastTimeRef.current)
        );

        setMetrics(prev => ({
          ...prev,
          fps,
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      requestAnimationFrame(updateFPS);
    };

    const animationId = requestAnimationFrame(updateFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [enabled, sampleInterval]);

  // 内存使用监控（如果支持）
  useEffect(() => {
    if (!enabled || !('memory' in performance)) return;

    const updateMemoryUsage = () => {
      const memory = (performance as any).memory;
      if (memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }
    };

    const intervalId = setInterval(updateMemoryUsage, sampleInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, sampleInterval]);

  // 性能建议
  const getPerformanceAdvice = (): string[] => {
    const advice: string[] = [];

    if (metrics.renderTime > warningThreshold) {
      advice.push('建议启用虚拟化渲染以减少渲染时间');
    }

    if (taskCount > 1000) {
      advice.push('任务数量较多，建议启用 Canvas 渲染模式');
    }

    if (metrics.fps < 30) {
      advice.push('帧率较低，建议减少可见任务数量或启用性能优化选项');
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      advice.push('内存使用较高，建议启用虚拟化渲染');
    }

    return advice;
  };

  return {
    metrics,
    startRender,
    endRender,
    getPerformanceAdvice,
  };
};
