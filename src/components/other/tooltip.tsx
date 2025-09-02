import React, { useRef, useEffect, useState } from 'react';
import type { Task, BarTask } from '../../types';
import styles from './tooltip.module.css';

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

      // 添加调试信息
      console.log('Tooltip 位置计算:', {
        taskId: task.id,
        taskName: task.name,
        taskX1: task.x1,
        taskX2: task.x2,
        taskY: task.y,
        taskIndex: task.index,
        scrollX,
        scrollY,
        headerHeight,
        taskListWidth,
        svgContainerWidth,
        tooltipWidth,
        tooltipHeight,
        calculatedX: newRelatedX,
        calculatedY: newRelatedY,
        finalX: newRelatedX,
        finalY: newRelatedY,
      });

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
      <TooltipContent task={task} fontSize={fontSize} fontFamily={fontFamily} />
    </div>
  );
};

export const StandardTooltipContent: React.FC<{
  task: Task;
  fontSize: string;
  fontFamily: string;
}> = ({ task, fontSize, fontFamily }) => {
  const style = {
    fontSize,
    fontFamily,
  };
  return (
    <div className={styles.tooltipDefaultContainer} style={style}>
      <b style={{ fontSize: fontSize + 6 }}>{`${
        task.name
      }: ${task.start.getDate()}-${
        task.start.getMonth() + 1
      }-${task.start.getFullYear()} - ${task.end.getDate()}-${
        task.end.getMonth() + 1
      }-${task.end.getFullYear()}`}</b>
      {task.end.getTime() - task.start.getTime() !== 0 && (
        <p className={styles.tooltipDefaultContainerParagraph}>{`Duration: ${~~(
          (task.end.getTime() - task.start.getTime()) /
          (1000 * 60 * 60 * 24)
        )} day(s)`}</p>
      )}

      <p className={styles.tooltipDefaultContainerParagraph}>
        {!!task.progress && `Progress: ${task.progress} %`}
      </p>
    </div>
  );
};
