import React, { useRef, useEffect } from 'react';
import { Grid } from '../grid/grid';
import type { GridProps } from '../grid/grid';
import { Calendar } from '../calendar/calendar';
import type { CalendarProps } from '../calendar/calendar';
import { TaskGanttContent } from './task-gantt-content';
import type { TaskGanttContentProps } from './task-gantt-content';
import styles from './gantt.module.css';

export type TaskGanttProps = {
  gridProps: GridProps;
  calendarProps: CalendarProps;
  barProps: TaskGanttContentProps;
  ganttHeight: number;
  scrollY: number;
  scrollX: number;
};

export const TaskGantt: React.FC<TaskGanttProps> = ({
  gridProps,
  calendarProps,
  barProps,
  ganttHeight,
  scrollY,
  scrollX,
}) => {
  const gridSVGRef = useRef<SVGSVGElement>(null);
  const tasksSVGRef = useRef<SVGSVGElement>(null);
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const verticalGanttContainerRef = useRef<HTMLDivElement>(null);
  const newBarProps = { ...barProps, svg: tasksSVGRef };

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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={gridProps.svgWidth}
        height={calendarProps.headerHeight}
        fontFamily={barProps.fontFamily}
      >
        <Calendar {...calendarProps} />
      </svg>
      <div
        ref={horizontalContainerRef}
        className={styles.horizontalContainer}
        style={
          ganttHeight
            ? {
                height: ganttHeight,
                width: gridProps.svgWidth,
                position: 'relative', // 为绝对定位的任务 SVG 提供定位上下文
              }
            : {
                width: gridProps.svgWidth,
                position: 'relative', // 为绝对定位的任务 SVG 提供定位上下文
              }
        }
      >
        {/* 网格 SVG - 静态，很少重绘，性能优化 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={gridProps.svgWidth}
          height={barProps.rowHeight * barProps.tasks.length}
          fontFamily={barProps.fontFamily}
          ref={gridSVGRef}
          className={styles.gridSvg}
          style={{
            pointerEvents: 'none', // 不接收交互事件，提升性能
            willChange: 'auto', // 减少重绘优化
          }}
        >
          <Grid {...gridProps} />
        </svg>

        {/* 任务 SVG - 动态，频繁重绘，接收交互事件 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={gridProps.svgWidth}
          height={barProps.rowHeight * barProps.tasks.length}
          fontFamily={barProps.fontFamily}
          ref={tasksSVGRef}
          className={styles.tasksSvg}
          style={{
            pointerEvents: 'auto', // 接收拖拽等交互事件
            willChange: 'transform', // 拖拽时优化
            position: 'absolute', // 绝对定位，覆盖在网格上
            top: 0,
            left: 0,
          }}
        >
          <TaskGanttContent {...newBarProps} />
        </svg>
      </div>
    </div>
  );
};
