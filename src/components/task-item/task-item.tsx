import React, { useEffect, useRef, useState } from 'react';
import type { BarTask } from '../../types/bar-task';
import type { GanttContentMoveAction } from '../../types/gantt-task-actions';
import { Bar } from './bar/bar';
import { BarSmall } from './bar/bar-small';
import { Milestone } from './milestone/milestone';
import style from './task-list.module.css';
import barStyles from './bar/bar.module.css';
import { useDraggable } from '@dnd-kit/core';

export type TaskItemProps = {
  task: BarTask;
  arrowIndent: number;
  taskHeight: number;
  isProgressChangeable: boolean;
  isDateChangeable: boolean;
  isDelete: boolean;
  isSelected: boolean;
  rtl: boolean;
  /**
   * 是否显示项目分段进度条
   * 默认为 true，设置为 false 时只显示子任务段，不显示进度条
   */
  showProjectSegmentProgress?: boolean;
  onEventStart?: (
    action: GanttContentMoveAction,
    selectedTask: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => any;
};

export const TaskItem: React.FC<TaskItemProps> = props => {
  const {
    task,
    arrowIndent,
    isDelete,
    taskHeight,
    isSelected,
    rtl,
    onEventStart,
  } = {
    ...props,
  };
  const textRef = useRef<SVGTextElement>(null);
  const [isTextInside, setIsTextInside] = useState(true);

  // 添加拖拽支持 - 提升到 TaskItem 级别
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const dragStyle = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  // 计算子任务
  const renderChildTasks = () => {
    if (!task.children || task.children.length === 0) {
      return null;
    }

    return task.children.map((childTask, index) => {
      // 计算子任务的位置和宽度
      const childStart = childTask.start.getTime();
      const childEnd = childTask.end.getTime();
      const parentStart = task.start.getTime();
      const parentEnd = task.end.getTime();

      // 确保子任务的时间范围在父任务范围内
      const clampedChildStart = Math.max(childStart, parentStart);
      const clampedChildEnd = Math.min(childEnd, parentEnd);

      // 计算子任务在父任务中的相对位置
      const parentWidth = task.x2 - task.x1;
      const parentDuration = parentEnd - parentStart;
      const childDuration = clampedChildEnd - clampedChildStart;

      // 如果子任务完全超出父任务范围，跳过显示
      if (childDuration <= 0) {
        return null;
      }

      const childX1 =
        task.x1 +
        ((clampedChildStart - parentStart) / parentDuration) * parentWidth;
      const childX2 = childX1 + (childDuration / parentDuration) * parentWidth;

      // 计算子任务的进度
      const childProgress = childTask.progress || 0;
      const childProgressWidth = (childX2 - childX1) * (childProgress / 100);
      const childProgressX = childX1;

      // 为每个子任务使用不同的颜色
      const childColors = [
        '#F77879', // 红色
        '#99CBFA', // 青色
        '#D5DEE5', // 中性
      ];
      const childColor = childColors[index % childColors.length];

      // 创建子任务的 BarTask 对象
      const childBarTask: BarTask = {
        ...childTask,
        index: index,
        x1: childX1,
        x2: childX2,
        y: task.y,
        height: task.height,
        progressX: childProgressX,
        progressWidth: childProgressWidth,
        barCornerRadius: task.barCornerRadius,
        handleWidth: task.handleWidth,
        styles: {
          backgroundColor: childColor,
          backgroundSelectedColor: childColor,
          progressColor: '#ffffff',
          progressSelectedColor: '#ffffff',
        },
        barChildren: [],
        typeInternal: 'task',
      };

      return (
        <g key={`${task.id}-child-${childTask.id}`}>
          <Bar
            task={childBarTask}
            isSelected={isSelected}
            isProgressChangeable={false}
            isDateChangeable={false}
            rtl={rtl}
            onEventStart={onEventStart}
            arrowIndent={arrowIndent}
            taskHeight={taskHeight}
            isDelete={isDelete}
          />
          {/* 子任务标签 */}
          {childX2 - childX1 > 30 && (
            <text
              x={childX1 + (childX2 - childX1) / 2}
              y={task.y + task.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize="12"
              className={isDragging ? barStyles.dragging : ''}
            >
              {childTask.name}
            </text>
          )}
        </g>
      );
    });
  };

  // 渲染主任务
  const renderMainTask = () => {
    switch (task.typeInternal) {
      case 'milestone':
        return <Milestone {...props} />;
      case 'smalltask':
        return <BarSmall {...props} />;
      default:
        // 如果有子任务，不渲染主任务条，只渲染子任务
        if (task.children && task.children.length > 0) {
          return null;
        }
        return <Bar {...props} isDateChangeable={false} />;
    }
  };

  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < task.x2 - task.x1);
    }
  }, [textRef, task]);

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

  // 构建样式类名，包含拖拽状态
  const getWrapperClassName = () => {
    const baseClass = '';
    return isDragging ? `${baseClass} ${barStyles.dragging}` : baseClass;
  };

  return (
    <g
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      {...(listeners as any)}
      {...(attributes as any)}
      style={dragStyle as any}
      className={getWrapperClassName()}
      onKeyDown={e => {
        switch (e.key) {
          case 'Delete': {
            if (isDelete) onEventStart?.('delete', task, e);
            break;
          }
        }
        e.stopPropagation();
      }}
      onMouseEnter={e => {
        onEventStart?.('mouseenter', task, e);
      }}
      onMouseLeave={e => {
        onEventStart?.('mouseleave', task, e);
      }}
      onDoubleClick={e => {
        onEventStart?.('dblclick', task, e);
      }}
      onClick={e => {
        onEventStart?.('click', task, e);
      }}
      onFocus={() => {
        onEventStart?.('select', task);
      }}
    >
      {/* 渲染主任务 */}
      {renderMainTask()}

      {/* 渲染子任务 */}
      {renderChildTasks()}

      {/* 只有没有子任务的主任务才显示文本标签 */}
      {(!task.children || task.children.length === 0) &&
        task.typeInternal !== 'milestone' && (
          <text
            x={getX()}
            y={task.y + taskHeight * 0.5}
            className={
              isTextInside
                ? style.barLabel
                : style.barLabel && style.barLabelOutside
            }
            ref={textRef}
            fontSize="12"
          >
            {task.name}
          </text>
        )}
    </g>
  );
};
