import React, { useRef, useEffect, useState } from 'react';
import type { Task, BarTask } from '../../types';
import { ViewMode } from '../../types';
import { useGanttDisplay } from '../../contexts/GanttContext';
import styles from './tooltip.module.css';

/**
 * 根据viewMode格式化时间显示
 * @param start 开始时间戳
 * @param end 结束时间戳
 * @param viewMode 视图模式
 * @returns 格式化后的时间字符串
 */
const formatTimeByViewMode = (
  start: number,
  end: number,
  viewMode: ViewMode
): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // 对于Hour和HalfHour模式，只显示时间
  if (viewMode === ViewMode.Hour || viewMode === ViewMode.HalfHour) {
    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    return `${formatTime(startDate)} ~ ${formatTime(endDate)}`;
  }

  // 其他模式显示日期
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export type TooltipProps = {
  task: BarTask;
  arrowIndent: number;
  rtl: boolean;
  svgContainerHeight: number;
  svgContainerWidth: number;
  svgWidth: number;
  headerHeight: number;
  taskListWidth: number;
  scrollX: number;
  scrollY: number;
  rowHeight: number;
  fontSize: string;
  fontFamily: string;
  TooltipContent: React.FC<{
    task: Task;
    fontSize: string;
    fontFamily: string;
  }>;
};
export const Tooltip: React.FC<TooltipProps> = ({
  task,
  rowHeight,
  rtl,
  svgContainerHeight,
  svgContainerWidth,
  scrollX,
  scrollY,
  arrowIndent,
  fontSize,
  fontFamily,
  headerHeight,
  taskListWidth,
  TooltipContent,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [relatedY, setRelatedY] = useState(0);
  const [relatedX, setRelatedX] = useState(0);
  useEffect(() => {
    if (tooltipRef.current) {
      const tooltipHeight = tooltipRef.current.offsetHeight * 1.1;
      const tooltipWidth = tooltipRef.current.offsetWidth * 1.1;

      // 计算 Y 位置：基于任务的实际 Y 坐标，考虑滚动偏移
      let newRelatedY = task.y - scrollY + headerHeight;

      // 计算 X 位置：基于任务的实际坐标，考虑任务列表宽度
      let newRelatedX: number;
      if (rtl) {
        // RTL 模式：tooltip 显示在任务左侧
        newRelatedX =
          task.x1 - arrowIndent * 1.5 - tooltipWidth - scrollX + taskListWidth;
        if (newRelatedX < taskListWidth) {
          newRelatedX = task.x2 + arrowIndent * 1.5 - scrollX + taskListWidth;
        }
        const tooltipLeftmostPoint = tooltipWidth + newRelatedX;
        if (tooltipLeftmostPoint > taskListWidth + svgContainerWidth) {
          newRelatedX = taskListWidth + svgContainerWidth - tooltipWidth;
          newRelatedY += rowHeight;
        }
      } else {
        // LTR 模式：tooltip 显示在任务右侧
        newRelatedX = task.x2 + arrowIndent * 1.5 + taskListWidth - scrollX;
        const tooltipLeftmostPoint = tooltipWidth + newRelatedX;
        const fullChartWidth = taskListWidth + svgContainerWidth;

        // 如果右侧空间不够，显示在左侧
        if (tooltipLeftmostPoint > fullChartWidth) {
          newRelatedX =
            task.x1 +
            taskListWidth -
            arrowIndent * 1.5 -
            scrollX -
            tooltipWidth;
        }

        // 如果左侧空间也不够，调整到右侧并换行
        if (newRelatedX < taskListWidth) {
          newRelatedX = taskListWidth + svgContainerWidth - tooltipWidth;
          newRelatedY += rowHeight;
        }
      }

      // 检查 Y 方向是否超出容器边界
      const tooltipLowerPoint = tooltipHeight + newRelatedY - scrollY;
      if (tooltipLowerPoint > svgContainerHeight - scrollY) {
        newRelatedY = svgContainerHeight - tooltipHeight;
      }

      setRelatedY(newRelatedY);
      setRelatedX(newRelatedX);
    }
  }, [
    tooltipRef,
    task,
    arrowIndent,
    scrollX,
    scrollY,
    headerHeight,
    taskListWidth,
    rowHeight,
    svgContainerHeight,
    svgContainerWidth,
    rtl,
  ]);

  return (
    <div
      ref={tooltipRef}
      className={
        relatedX
          ? styles.tooltipDetailsContainer
          : styles.tooltipDetailsContainerHidden
      }
      style={{ left: relatedX, top: relatedY }}
    >
      <StandardTooltipContent
        task={task}
        fontSize={fontSize}
        fontFamily={fontFamily}
        TooltipContent={TooltipContent}
      />
    </div>
  );
};

export const StandardTooltipContent: React.FC<{
  task: Task;
  fontSize: string;
  fontFamily: string;
  TooltipContent?: React.FC<{
    task: Task;
    fontSize: string;
    fontFamily: string;
  }>;
}> = ({ task, fontSize, fontFamily, TooltipContent }) => {
  const { viewMode } = useGanttDisplay();
  const style = {
    fontSize,
    fontFamily,
  };

  // 如果提供了自定义的TooltipContent，使用自定义组件

  // 否则使用默认的tooltip内容
  const timeString = formatTimeByViewMode(task.start, task.end, viewMode);

  return (
    <div className={styles.tooltipDefaultContainer} style={style}>
      <b style={{ fontSize: fontSize + 6 }}>{`${task.name}: ${timeString}`}</b>
      {TooltipContent ? (
        <TooltipContent
          task={task}
          fontSize={fontSize}
          fontFamily={fontFamily}
        />
      ) : (
        <>
          {task.end - task.start !== 0 && (
            <p
              className={styles.tooltipDefaultContainerParagraph}
            >{`Duration: ${~~(
              (task.end - task.start) /
              (1000 * 60 * 60 * 24)
            )} day(s)`}</p>
          )}

          <p className={styles.tooltipDefaultContainerParagraph}>
            {!!task.progress && `Progress: ${task.progress} %`}
          </p>
        </>
      )}
    </div>
  );
};
