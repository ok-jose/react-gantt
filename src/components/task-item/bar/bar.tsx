import React, { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { getProgressPoint } from '../../../helpers';
import { BarDisplay } from './bar-display';
import { BarDateHandle } from './bar-date-handle';
import { BarProgressHandle } from './bar-progress-handle';
import type { TaskItemProps } from '../task-item';
import styles from './bar.module.css';

export const Bar: React.FC<TaskItemProps> = ({
  task,
  isProgressChangeable = false,
  isDateChangeable = false,
  rtl,
  onEventStart,
  isSelected,
  taskHeight,
  arrowIndent,
}) => {
  // 使 Bar 可拖拽
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        type: 'task',
        task,
      },
    });

  const progressPoint = getProgressPoint(
    +!rtl * task.progressWidth + task.progressX,
    task.y,
    task.height
  );
  const handleHeight = task.height - 2;
  const textRef = useRef<SVGTextElement>(null);
  const [isTextInside, setIsTextInside] = useState(true);

  // 计算文字位置
  const getX = () => {
    const width = task.x2 - task.x1;
    const hasChild = task.barChildren.length > 0;
    if (isTextInside) {
      return task.x1 + width * 0.5;
    }
    if (rtl && textRef.current) {
      return (
        task.x1 -
        textRef.current.getBBox().width -
        arrowIndent * +hasChild -
        arrowIndent * 0.2
      );
    } else {
      return task.x1 + width + arrowIndent * +hasChild + arrowIndent * 0.2;
    }
  };

  // 检查文字是否在任务条内部
  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < task.x2 - task.x1);
    }
  }, [textRef, task]);

  // 拖拽时的样式
  const dragStyle = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  return (
    <g
      className={styles.barWrapper}
      tabIndex={0}
      ref={setNodeRef as any}
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

      {/* 任务文字标签 */}
      <text
        x={getX()}
        y={task.y + taskHeight * 0.5}
        className={
          isTextInside
            ? styles.barLabel
            : styles.barLabel && styles.barLabelOutside
        }
        ref={textRef}
        fill="#ffffff"
        fontSize="12"
        // 确保文字在拖拽时也跟随移动
        style={isDragging ? { pointerEvents: 'none' } : undefined}
      >
        {task.name}
      </text>
    </g>
  );
};
