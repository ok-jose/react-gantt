import React from 'react';
import { Bar } from '../bar/bar';
import type { TaskItemProps } from '../task-item';
import type { BarTask } from '../../../types/bar-task';
import type { Task } from '../../../types';
import styles from './project.module.css';
import { useDraggable } from '@dnd-kit/core';

/**
 * Project 组件 - 使用 Bar 组件渲染项目条和子任务
 *
 * Bar 组件功能支持：
 * - ✅ 进度显示：通过 progressX 和 progressWidth 显示进度条
 * - ✅ 日期拖拽：通过 isDateChangeable 控制左右拖拽手柄
 * - ✅ 进度拖拽：通过 isProgressChangeable 控制进度拖拽手柄
 * - ✅ 整体移动：点击任务条本身可以移动整个任务
 */
export const Project: React.FC<TaskItemProps> = ({
  task,
  isSelected,
  isProgressChangeable,
  isDateChangeable,
  rtl,
  onEventStart,
  arrowIndent,
  taskHeight,
  isDelete,
}) => {
  // 如果没有子任务，显示为普通项目条
  if (!task.children || task.children.length === 0) {
    return (
      <g tabIndex={0} className={styles.projectWrapper}>
        <Bar
          task={task}
          isSelected={isSelected}
          isProgressChangeable={isProgressChangeable}
          isDateChangeable={isDateChangeable}
          rtl={rtl}
          onEventStart={onEventStart}
          arrowIndent={arrowIndent}
          taskHeight={taskHeight}
          isDelete={isDelete}
        />
      </g>
    );
  }

  // 有子任务时，按子任务分段显示
  return (
    <g tabIndex={0} className={styles.projectWrapper}>
      {task.children?.map((childTask, index) => {
        // 计算子任务的位置和宽度
        const childStart = childTask.start.getTime();
        const childEnd = childTask.end.getTime();
        const projectStart = task.start.getTime();
        const projectEnd = task.end.getTime();

        // 确保子任务的时间范围在项目范围内
        const clampedChildStart = Math.max(childStart, projectStart);
        const clampedChildEnd = Math.min(childEnd, projectEnd);

        // 计算子任务在项目中的相对位置
        const projectWidth = task.x2 - task.x1;
        const projectDuration = projectEnd - projectStart;
        const childDuration = clampedChildEnd - clampedChildStart;

        // 如果子任务完全超出项目范围，跳过显示
        if (childDuration <= 0) {
          return null;
        }

        const childX1 =
          task.x1 +
          ((clampedChildStart - projectStart) / projectDuration) * projectWidth;
        const childX2 =
          childX1 + (childDuration / projectDuration) * projectWidth;

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

        // 所有子任务使用相同的高度，不进行偏移
        const childY = task.y;

        // 创建子任务的 BarTask 对象
        const childBarTask: BarTask = {
          ...childTask,
          index: index,
          x1: childX1,
          x2: childX2,
          y: childY,
          height: task.height, // 使用与项目相同的高度
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
              isProgressChangeable={isProgressChangeable}
              isDateChangeable={isDateChangeable}
              rtl={rtl}
              onEventStart={onEventStart}
              arrowIndent={arrowIndent}
              taskHeight={taskHeight}
              isDelete={isDelete}
            />
            {/* 子任务标签 */}
            {childX2 - childX1 > 30 && ( // 只有当宽度足够时才显示标签
              <text
                x={childX1 + (childX2 - childX1) / 2}
                y={childY + task.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                // className={styles.childTaskLabel}
                fill="#ffffff"
                fontSize="12"
              >
                {childTask.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};
