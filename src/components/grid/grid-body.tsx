import React from 'react';
import type { Task } from '../../types';
import { addToDate } from '../../helpers/date-helper';
import styles from './grid.module.css';
import { hasOverlappingChildren } from '../../helpers/bar-helper';
import { useGanttContext } from '../../contexts/GanttContext';

export type GridBodyProps = {
  tasks: Task[];
  dates: Date[];
  svgWidth: number;
  rowHeight?: number;
  columnWidth?: number;
  todayColor?: string;
  rtl?: boolean;
};

export const GridBody: React.FC<GridBodyProps> = ({
  tasks,
  dates,
  svgWidth,
  rowHeight: propRowHeight,
  columnWidth: propColumnWidth,
  todayColor: propTodayColor,
  rtl: propRtl,
}) => {
  const { styling, display } = useGanttContext();
  const {
    rowHeight: contextRowHeight,
    columnWidth: contextColumnWidth,
    todayColor: contextTodayColor,
  } = styling;
  const { rtl: contextRtl } = display;

  // 使用 props 优先，如果没有则使用 Context 中的值
  const rowHeight = propRowHeight || contextRowHeight;
  const columnWidth = propColumnWidth || contextColumnWidth;
  const todayColor = propTodayColor || contextTodayColor;
  const rtl = propRtl ?? contextRtl;

  let y = 0;
  const gridRows: React.ReactNode[] = [];
  const rowLines: React.ReactNode[] = [
    <line
      key="RowLineFirst"
      x="0"
      y1={0}
      x2={svgWidth}
      y2={0}
      className={styles.gridRowLine}
    />,
  ];
  for (const task of tasks) {
    const hasChildrenOverlap =
      task.children && task.children.length > 0
        ? hasOverlappingChildren(task.children)
        : false;
    gridRows.push(
      <rect
        key={'Row' + task.id}
        x="0"
        y={y}
        width={svgWidth}
        height={rowHeight}
        className={
          hasChildrenOverlap
            ? `${styles.gridRow} ${styles.gridRowOverlap} `
            : styles.gridRow
        }
      />
    );
    rowLines.push(
      <line
        key={'RowLine' + task.id}
        x="0"
        y1={y + rowHeight}
        x2={svgWidth}
        y2={y + rowHeight}
        className={styles.gridRowLine}
      />
    );
    y += rowHeight;
  }

  const now = new Date();
  let tickX = 0;
  const ticks: React.ReactNode[] = [];
  let today: React.ReactNode = <rect />;
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    ticks.push(
      <line
        key={date.getTime()}
        x1={tickX}
        y1={0}
        x2={tickX}
        y2={y}
        className={styles.gridTick}
      />
    );
    if (
      (i + 1 !== dates.length &&
        date.getTime() < now.getTime() &&
        dates[i + 1].getTime() >= now.getTime()) ||
      // if current date is last
      (i !== 0 &&
        i + 1 === dates.length &&
        date.getTime() < now.getTime() &&
        addToDate(
          date,
          date.getTime() - dates[i - 1].getTime(),
          'millisecond'
        ).getTime() >= now.getTime())
    ) {
      today = (
        <rect
          x={tickX}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
        />
      );
    }
    // rtl for today
    if (
      rtl &&
      i + 1 !== dates.length &&
      date.getTime() >= now.getTime() &&
      dates[i + 1].getTime() < now.getTime()
    ) {
      today = (
        <rect
          x={tickX + columnWidth}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
        />
      );
    }
    tickX += columnWidth;
  }
  return (
    <g className="gridBody">
      <g className="rows">{gridRows}</g>
      <g className="rowLines">{rowLines}</g>
      <g className="ticks">{ticks}</g>
      <g className="today">{today}</g>
    </g>
  );
};
