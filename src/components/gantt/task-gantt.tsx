import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Calendar } from '../calendar/calendar';
import type { CalendarProps } from '../calendar/calendar';
import { TaskGanttCanvas } from './task-gantt-canvas';
import type { TaskGanttCanvasProps } from './task-gantt-canvas';
import { TaskGanttCanvasVirtualized } from './task-gantt-canvas-virtualized';
import type { TaskGanttCanvasVirtualizedProps } from './task-gantt-canvas-virtualized';
import { useGanttPerformance } from '../../hooks/useGanttPerformance';
import styles from './gantt.module.css';

export type TaskGanttProps = {
  gridProps: any; // 保留类型兼容性
  calendarProps: CalendarProps;
  barProps: TaskGanttCanvasProps;
  ganttHeight: number;
  scrollY: number;
  scrollX: number;
  /**
   * 是否启用虚拟化渲染，默认 true
   */
  enableVirtualization?: boolean;
  /**
   * 虚拟化渲染的缓冲区大小，默认 5
   */
  virtualizationBuffer?: number;
  /**
   * 是否启用性能监控，默认 false
   */
  enablePerformanceMonitoring?: boolean;
  /**
   * 是否使用虚拟化 Canvas 渲染，默认 true
   */
  useVirtualizedCanvas?: boolean;
};

/**
 * 基于 Canvas 的甘特图组件
 * 提供高性能渲染，适用于大数据量场景
 */
export const TaskGantt: React.FC<TaskGanttProps> = ({
  gridProps,
  calendarProps,
  barProps,
  ganttHeight,
  scrollY,
  scrollX,
  enableVirtualization = true,
  virtualizationBuffer = 5,
  enablePerformanceMonitoring = false,
  useVirtualizedCanvas = true,
}) => {
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const verticalGanttContainerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  // 计算可见区域的任务范围
  const visibleTasks = useMemo(() => {
    if (!enableVirtualization || !ganttHeight) {
      return barProps.tasks;
    }

    const rowHeight = barProps.rowHeight;
    const visibleStart = Math.max(
      0,
      Math.floor(scrollY / rowHeight) - virtualizationBuffer
    );
    const visibleEnd = Math.min(
      barProps.tasks.length,
      Math.ceil((scrollY + ganttHeight) / rowHeight) + virtualizationBuffer
    );

    setVisibleRange({ start: visibleStart, end: visibleEnd });

    return barProps.tasks.slice(visibleStart, visibleEnd);
  }, [
    barProps.tasks,
    scrollY,
    ganttHeight,
    barProps.rowHeight,
    enableVirtualization,
    virtualizationBuffer,
  ]);

  // 计算可见任务的偏移量
  const visibleTasksOffset = useMemo(() => {
    if (!enableVirtualization) return 0;
    return visibleRange.start * barProps.rowHeight;
  }, [visibleRange.start, barProps.rowHeight, enableVirtualization]);

  // 性能监控
  const { metrics, getPerformanceAdvice } = useGanttPerformance(
    barProps.tasks.length,
    visibleTasks.length,
    { enabled: enablePerformanceMonitoring }
  );

  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  useEffect(() => {
    if (verticalGanttContainerRef.current) {
      verticalGanttContainerRef.current.scrollLeft = scrollX;
    }
  }, [scrollX]);

  return (
    <div
      className={styles.ganttVerticalContainer}
      ref={verticalGanttContainerRef}
      dir="ltr"
    >
      {/* 日历头部 - 仍然使用 SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={gridProps.svgWidth}
        height={calendarProps.headerHeight}
        fontFamily={barProps.fontFamily}
      >
        <Calendar {...calendarProps} />
      </svg>

      {/* 甘特图主体 - 使用 Canvas */}
      <div
        ref={horizontalContainerRef}
        className={styles.horizontalContainer}
        style={
          ganttHeight
            ? { height: ganttHeight, width: gridProps.svgWidth }
            : { width: gridProps.svgWidth }
        }
      >
        {useVirtualizedCanvas ? (
          <TaskGanttCanvasVirtualized
            {...barProps}
            tasks={barProps.tasks}
            scrollY={scrollY}
            viewportHeight={ganttHeight}
            virtualizationBuffer={virtualizationBuffer}
          />
        ) : (
          <TaskGanttCanvas
            {...barProps}
            tasks={enableVirtualization ? visibleTasks : barProps.tasks}
            virtualizationOffset={visibleTasksOffset}
          />
        )}
      </div>

      {/* 性能监控显示 */}
      {enablePerformanceMonitoring && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 1000,
          }}
        >
          <div>{useVirtualizedCanvas ? '虚拟化 Canvas' : 'Canvas'} 甘特图</div>
          <div>渲染时间: {metrics.renderTime.toFixed(2)}ms</div>
          <div>任务总数: {metrics.taskCount}</div>
          <div>可见任务: {metrics.visibleTaskCount}</div>
          <div>FPS: {metrics.fps}</div>
          {metrics.memoryUsage && (
            <div>内存: {metrics.memoryUsage.toFixed(1)}MB</div>
          )}
          {getPerformanceAdvice().length > 0 && (
            <div style={{ marginTop: '4px', color: '#ff6b6b' }}>
              建议: {getPerformanceAdvice().join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
