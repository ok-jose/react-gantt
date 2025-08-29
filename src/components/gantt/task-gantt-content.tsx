import React from 'react';
import type { EventOption } from '../../types';
import type { BarTask } from '../../types/bar-task';
import { Arrow } from '../other/arrow';
import { TaskItem } from '../task-item/task-item';
import { type GanttEvent } from '../../types/gantt-task-actions';

export type TaskGanttContentProps = {
  tasks: BarTask[];
  dates: Date[];
  ganttEvent: GanttEvent;
  selectedTask: BarTask | undefined;
  rowHeight: number;
  columnWidth: number;
  timeStep: number;
  svg?: React.RefObject<SVGSVGElement | null>;
  svgWidth: number;
  taskHeight: number;
  arrowColor: string;
  arrowIndent: number;
  fontSize: string;
  fontFamily: string;
  rtl: boolean;
  setGanttEvent: (value: GanttEvent) => void;
  setFailedTask: (value: BarTask | null) => void;
  setSelectedTask: (taskId: string) => void;
  /**
   * 是否显示项目分段进度条
   * 默认为 true，设置为 false 时只显示子任务段，不显示进度条
   */
  showProjectSegmentProgress?: boolean;
} & EventOption;

export const TaskGanttContent: React.FC<TaskGanttContentProps> = ({
  tasks,
  selectedTask,
  rowHeight,
  taskHeight,
  arrowColor,
  arrowIndent,
  fontFamily,
  fontSize,
  rtl,
  showProjectSegmentProgress = false,
}) => {
  // 使用 Context 中的事件处理函数，如果没有传入 props 的话
  /**
   * Method is Start point of task change
   */

  return (
    <g className="content">
      <g className="arrows" fill={arrowColor} stroke={arrowColor}>
        {tasks.map(task => {
          return task.barChildren.map(child => {
            return (
              <Arrow
                key={`Arrow from ${task.id} to ${tasks[child.index].id}`}
                taskFrom={task}
                taskTo={tasks[child.index]}
                rowHeight={rowHeight}
                taskHeight={taskHeight}
                arrowIndent={arrowIndent}
                rtl={rtl}
              />
            );
          });
        })}
      </g>
      <g className="bar" fontFamily={fontFamily} fontSize={fontSize}>
        {tasks.map(task => {
          return (
            <TaskItem
              task={task}
              arrowIndent={arrowIndent}
              taskHeight={taskHeight}
              key={task.id}
              isSelected={!!selectedTask && task.id === selectedTask.id}
              rtl={rtl}
              showProjectSegmentProgress={showProjectSegmentProgress}
            />
          );
        })}
      </g>
    </g>
  );
};
