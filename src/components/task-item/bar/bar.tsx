import React from 'react';
import type { TaskItemProps } from '../task-item';
import styles from './bar.module.css';
import { useGanttContext } from '../../../contexts/GanttContext';

export const Bar: React.FC<TaskItemProps> = ({ task }) => {
  const { onDateChange } = useGanttContext();
  return (
    <g className={styles.barWrapper} tabIndex={0}>
      <rect
        x={task.x1}
        y={task.y}
        width={task.x2 - task.x1}
        height={task.height}
        ry={task.barCornerRadius}
        rx={task.barCornerRadius}
        fill={task.styles.backgroundColor}
        className={styles.barBackground}
      />
    </g>
  );
};
