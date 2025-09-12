import React, { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { getProgressPoint } from '../../../helpers';
import { BarDisplay } from './bar-display';
import { BarDateHandle } from './bar-date-handle';
import { BarProgressHandle } from './bar-progress-handle';
import { useGanttReadonly } from '../../../contexts/GanttContext';
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
}) => {
  const readonly = useGanttReadonly();

  // 使 Bar 可拖拽，但在 readonly 模式下禁用
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        type: 'task',
        task,
      },
      disabled: readonly, // 在 readonly 模式下禁用拖拽
    });

  const progressPoint = getProgressPoint(
    +!rtl * task.progressWidth + task.progressX,
    task.y,
    task.height
  );
  const handleHeight = task.height - 2;
  const textRef = useRef<SVGTextElement>(null);
  const [displayText, setDisplayText] = useState(task.name);

  // 计算文字位置 - 统一居中显示
  const getX = () => {
    const width = task.x2 - task.x1;
    return task.x1 + width * 0.5;
  };

  // 处理文本截断
  useEffect(() => {
    if (textRef.current) {
      const textElement = textRef.current;
      const taskWidth = task.x2 - task.x1;
      const maxWidth = taskWidth * 0.9; // 留10%的边距

      // 如果文本宽度超过任务条宽度，进行截断
      if (textElement.getBBox().width > maxWidth) {
        let truncatedText = task.name;
        while (
          textElement.getBBox().width > maxWidth &&
          truncatedText.length > 0
        ) {
          truncatedText = truncatedText.slice(0, -1);
          textElement.textContent = truncatedText + '...';
        }
        setDisplayText(truncatedText + '...');
      } else {
        setDisplayText(task.name);
      }
    }
  }, [task.name, task.x1, task.x2]);

  // 拖拽时的样式
  const dragStyle = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  return (
    <g
      className={`${styles.barWrapper} ${task?.adjusted ? styles.unadjusted : ''}`}
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
        className={styles.barLabel}
        ref={textRef}
        // 确保文字在拖拽时也跟随移动
        style={isDragging ? { pointerEvents: 'none' } : undefined}
      >
        {displayText}
      </text>
    </g>
  );
};
