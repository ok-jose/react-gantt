import { useEffect, useRef, useState, useCallback } from 'react';

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
  const lastRenderTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);

  // 开始渲染计时
  const startRender = useCallback(() => {
    if (!enabled) return;
    renderStartTimeRef.current = performance.now();
  }, [enabled]);

  // 结束渲染计时
  const endRender = useCallback(() => {
    if (!enabled) return;
    const renderTime = performance.now() - renderStartTimeRef.current;
    lastRenderTimeRef.current = renderTime;

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
  }, [enabled, warningThreshold, taskCount, visibleTaskCount]);

  // 批量更新指标，避免频繁的状态更新
  const updateMetrics = useCallback(() => {
    const currentTime = performance.now();

    // 限制更新频率，避免过于频繁的状态更新
    if (currentTime - lastUpdateTimeRef.current < sampleInterval) {
      return;
    }

    setMetrics(prev => ({
      ...prev,
      renderTime: lastRenderTimeRef.current,
      taskCount,
      visibleTaskCount,
    }));

    lastUpdateTimeRef.current = currentTime;
  }, [taskCount, visibleTaskCount, sampleInterval]);

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

  // 定期更新渲染时间指标
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(updateMetrics, sampleInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, updateMetrics, sampleInterval]);

  // 性能建议
  const getPerformanceAdvice = useCallback((): string[] => {
    const advice: string[] = [];

    if (lastRenderTimeRef.current > warningThreshold) {
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
  }, [taskCount, metrics.fps, metrics.memoryUsage, warningThreshold]);

  return {
    metrics,
    startRender,
    endRender,
    getPerformanceAdvice,
  };
};
