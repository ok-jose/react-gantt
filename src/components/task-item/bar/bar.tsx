import React from 'react';
import { getProgressPoint } from '../../../helpers';
import { BarDisplay } from './bar-display';
import { BarDateHandle } from './bar-date-handle';
import { BarProgressHandle } from './bar-progress-handle';
import type { TaskItemProps } from '../task-item';
import styles from './bar.module.css';
import { useDraggable } from '@dnd-kit/core';

export const Bar: React.FC<TaskItemProps> = ({
  task,
  isProgressChangeable = false,
  isDateChangeable = false,
  rtl,
  onEventStart,
  isSelected,
}) => {
  // 添加拖拽支持
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const dragStyle = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const progressPoint = getProgressPoint(
    +!rtl * task.progressWidth + task.progressX,
    task.y,
    task.height
  );
  const handleHeight = task.height - 2;
  return (
    <g
      className={styles.barWrapper}
      tabIndex={0}
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      {...(listeners as any)}
      {...(attributes as any)}
      style={dragStyle as any}
    >
      <BarDisplay
        x={task.x1}
        y={task.y}
        width={task.x2 - task.x1}
        height={task.height}
        progressX={task.progressX}
        progressWidth={task.progressWidth}
        barCornerRadius={task.barCornerRadius}
        styles={task.styles}
        isSelected={isSelected}
        // 由 dnd-kit 处理拖拽
      />
      {isDateChangeable && (
        <g className="handleGroup">
          <g>
            {/* left */}
            <BarDateHandle
              x={task.x1 + 1}
              y={task.y + 1}
              width={task.handleWidth}
              height={handleHeight}
              barCornerRadius={task.barCornerRadius}
              onMouseDown={e => {
                onEventStart?.('start', task, e);
              }}
            />
            {/* right */}
            <BarDateHandle
              x={task.x2 - task.handleWidth - 1}
              y={task.y + 1}
              width={task.handleWidth}
              height={handleHeight}
              barCornerRadius={task.barCornerRadius}
              onMouseDown={e => {
                onEventStart?.('end', task, e);
              }}
            />
          </g>
          {isProgressChangeable && (
            <BarProgressHandle
              progressPoint={progressPoint}
              onMouseDown={e => {
                onEventStart?.('progress', task, e);
              }}
            />
          )}
        </g>
      )}
    </g>
  );
};
