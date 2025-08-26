import React from 'react';
import type { TaskItemProps } from '../task-item';
import styles from './project.module.css';

export const Project: React.FC<TaskItemProps> = ({
  task,
  isSelected,
  showProjectSegmentProgress = false,
}) => {
  const barColor = isSelected
    ? task.styles.backgroundSelectedColor
    : task.styles.backgroundColor;
  const processColor = isSelected
    ? task.styles.progressSelectedColor
    : task.styles.progressColor;

  // 如果没有子任务，显示为普通项目条
  if (!task.children || task.children.length === 0) {
    const projectWith = task.x2 - task.x1;
    const projectLeftTriangle = [
      task.x1,
      task.y + task.height / 2 - 1,
      task.x1,
      task.y + task.height,
      task.x1 + 15,
      task.y + task.height / 2 - 1,
    ].join(',');
    const projectRightTriangle = [
      task.x2,
      task.y + task.height / 2 - 1,
      task.x2,
      task.y + task.height,
      task.x2 - 15,
      task.y + task.height / 2 - 1,
    ].join(',');

    return (
      <g tabIndex={0} className={styles.projectWrapper}>
        <rect
          fill={barColor}
          x={task.x1}
          width={projectWith}
          y={task.y}
          height={task.height}
          rx={task.barCornerRadius}
          ry={task.barCornerRadius}
          className={styles.projectBackground}
        />
        {showProjectSegmentProgress && (
          <rect
            x={task.progressX}
            width={task.progressWidth}
            y={task.y}
            height={task.height}
            ry={task.barCornerRadius}
            rx={task.barCornerRadius}
            fill={processColor}
          />
        )}
        <rect
          fill={barColor}
          x={task.x1}
          width={projectWith}
          y={task.y}
          height={task.height / 2}
          rx={task.barCornerRadius}
          ry={task.barCornerRadius}
          className={styles.projectTop}
        />
        <polygon
          className={styles.projectTop}
          points={projectLeftTriangle}
          fill={barColor}
        />
        <polygon
          className={styles.projectTop}
          points={projectRightTriangle}
          fill={barColor}
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
        const childWidth = (childDuration / projectDuration) * projectWidth;

        // 计算子任务的进度
        const childProgress = childTask.progress || 0;
        const childProgressWidth = childWidth * (childProgress / 100);
        const childProgressX = childX1;

        // 为每个子任务使用不同的颜色
        const childColors = [
          '#ff6b6b', // 红色
          '#4ecdc4', // 青色
          '#45b7d1', // 蓝色
          '#96ceb4', // 绿色
          '#feca57', // 黄色
          '#ff9ff3', // 粉色
          '#54a0ff', // 蓝色
          '#5f27cd', // 紫色
        ];
        const childColor = childColors[index % childColors.length];
        const childProgressColor = isSelected ? '#ffffff' : '#ffffff';

        // 计算子任务在项目中的层级（用于处理重叠）
        const childLevel = index % 2; // 简单的交替层级
        const childY = task.y + childLevel * 2; // 轻微偏移

        return (
          <g key={`${task.id}-child-${childTask.id}`}>
            {/* 子任务背景 */}
            <rect
              fill={childColor}
              x={childX1}
              width={childWidth}
              y={childY}
              height={task.height - childLevel * 2}
              rx={task.barCornerRadius}
              ry={task.barCornerRadius}
              className={styles.projectBackground}
            />
            {/* 子任务进度 */}
            {childProgress > 0 && showProjectSegmentProgress && (
              <>
                <rect
                  x={childProgressX}
                  width={childProgressWidth}
                  y={childY}
                  height={task.height - childLevel * 2}
                  ry={task.barCornerRadius}
                  rx={task.barCornerRadius}
                  fill={childProgressColor}
                  opacity={0.7}
                />
                {/* 子任务顶部装饰 */}
                <rect
                  fill={childColor}
                  x={childX1}
                  width={childWidth}
                  y={childY}
                  height={(task.height - childLevel * 2) / 2}
                  rx={task.barCornerRadius}
                  ry={task.barCornerRadius}
                  className={styles.projectTop}
                />
              </>
            )}
            {/* 子任务标签 */}
            {childWidth > 30 && ( // 只有当宽度足够时才显示标签
              <text
                x={childX1 + childWidth / 2}
                y={childY + (task.height - childLevel * 2) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.childTaskLabel}
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
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
