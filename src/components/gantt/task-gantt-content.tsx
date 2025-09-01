import React, { useEffect, useMemo, useState } from 'react';
import type { EventOption } from '../../types';
import type { BarTask } from '../../types/bar-task';
import { Arrow } from '../other/arrow';
import {
  handleTaskBySVGMouseEvent,
  isKeyboardEvent,
  updateTaskRecursively,
  applyCascadeShift,
} from '../../helpers';
import { TaskItem } from '../task-item/task-item';
import {
  type BarMoveAction,
  type GanttContentMoveAction,
  type GanttEvent,
} from '../../types/gantt-task-actions';
import { useGanttContext } from '../../contexts/GanttContext';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
  useDraggable,
} from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  createSnapModifier,
} from '@dnd-kit/modifiers';

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
  isDateChangeable?: boolean;
} & EventOption;

export const TaskGanttContent: React.FC<TaskGanttContentProps> = ({
  tasks,
  dates,
  ganttEvent,
  selectedTask,
  rowHeight,
  columnWidth,
  timeStep,
  svg,
  taskHeight,
  arrowColor,
  arrowIndent,
  fontFamily,
  fontSize,
  rtl,
  setGanttEvent,
  setFailedTask,
  setSelectedTask,
  showProjectSegmentProgress = false,
  isDateChangeable = false,
  onDateChange,
  onProgressChange,
  onDoubleClick,
  onClick,
  onDelete,
}) => {
  const { events, tasks: currentTasks } = useGanttContext();
  const {
    onDateChange: contextOnDateChange,
    onProgressChange: contextOnProgressChange,
    onDoubleClick: contextOnDoubleClick,
    onClick: contextOnClick,
    onDelete: contextOnDelete,
  } = events;

  // 使用 Context 中的事件处理函数，如果没有传入 props 的话
  const finalOnDateChange = onDateChange || contextOnDateChange;
  const finalOnProgressChange = onProgressChange || contextOnProgressChange;
  const finalOnDoubleClick = onDoubleClick || contextOnDoubleClick;
  const finalOnClick = onClick || contextOnClick;
  const finalOnDelete = onDelete || contextOnDelete;

  const [xStep, setXStep] = useState(0);

  // create xStep - 基于 viewMode 的单个格子刻度
  useEffect(() => {
    // 对于拖拽，我们需要基于 viewMode 的单个格子来计算 xStep
    // 每个格子代表一个时间单位（如 HalfHour = 30分钟）
    // xStep 应该是每个格子对应的像素宽度
    const newXStep = columnWidth; // 每个格子对应一列，宽度为 columnWidth
    setXStep(newXStep);
  }, [columnWidth]);

  // 已移除基于 SVG 的 mousemove/mouseup 拖拽监听，改用 dnd-kit 事件

  // dnd-kit 传感器与修饰器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    })
  );
  const modifiers = useMemo(() => {
    return [restrictToHorizontalAxis, createSnapModifier(xStep || 1)];
  }, [xStep]);

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const task = tasks.find(t => t.id === activeId);
    if (!task) return;
    setGanttEvent({
      action: 'move',
      changedTask: task,
      originalSelectedTask: task,
    });
  };

  const handleDragMove = (event: DragMoveEvent) => {
    // 拖拽过程中不更新任务时间，只依靠 dnd-kit 的 transform 进行视觉移动
    // 时间计算和更新留到 handleDragEnd 中进行
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { originalSelectedTask } = ganttEvent;
    if (!originalSelectedTask) return;

    setGanttEvent({ action: '' });

    // 只在有实际移动时才进行时间更新
    const deltaX = event.delta.x || 0;
    if (Math.abs(deltaX) < 1) return; // 没有有效移动

    // 计算拖拽结束后的最终位置
    // 基于 viewMode 的格子刻度来计算时间偏移
    const finalSvgX = originalSelectedTask.x1 + deltaX;

    // 确保按网格步进对齐（每个格子对应一个时间单位）
    const alignedX = Math.round(finalSvgX / xStep) * xStep;

    const { isChanged, changedTask } = handleTaskBySVGMouseEvent(
      alignedX,
      'move' as BarMoveAction,
      originalSelectedTask,
      xStep,
      timeStep,
      0, // 对于拖拽移动，不需要额外的偏移量
      rtl
    );

    if (!isChanged || !finalOnDateChange) return;

    let operationSuccess = true;
    try {
      // 计算位移量（毫秒）
      const deltaMs =
        changedTask.start.getTime() - originalSelectedTask.start.getTime();

      // 对于拖拽操作，需要正确处理子任务的时间更新
      // 如果拖拽的是父任务，需要递归更新其所有子任务的时间
      const updatedTasks = currentTasks.map(task => {
        if (task.id === changedTask.id) {
          // 检查是否有子任务需要更新
          if (task.children && task.children.length > 0) {
            // 递归更新子任务的时间
            const updatedChildren = task.children.map(child => ({
              ...child,
              start: new Date(child.start.getTime() + deltaMs),
              end: new Date(child.end.getTime() + deltaMs),
            }));

            return {
              ...changedTask,
              children: updatedChildren,
            };
          }
          return changedTask;
        }
        return task;
      });

      // 再按规则对其他任务进行级联偏移
      const cascadedTasks = applyCascadeShift(
        updatedTasks,
        changedTask.id,
        deltaMs
      );

      // 回调返回整个最新 tasks
      const result = await finalOnDateChange(changedTask, cascadedTasks);
      if (result !== undefined) {
        operationSuccess = result;
      }
    } catch (error) {
      operationSuccess = false;
    }

    if (!operationSuccess) {
      setFailedTask(originalSelectedTask);
    }
  };

  /**
   * Method is Start point of task change
   */
  const handleBarEventStart = async (
    action: GanttContentMoveAction,
    task: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => {
    if (!event) {
      if (action === 'select') {
        setSelectedTask(task.id);
      }
    }
    // Keyboard events
    else if (isKeyboardEvent(event)) {
      if (action === 'delete') {
        if (finalOnDelete) {
          try {
            const result = await finalOnDelete(task);
            if (result !== undefined && result) {
              setGanttEvent({ action, changedTask: task });
            }
          } catch (error) {
            console.error('Error on Delete. ' + error);
          }
        }
      }
    }
    // Mouse Events
    else if (action === 'mouseenter') {
      if (!ganttEvent.action) {
        setGanttEvent({
          action,
          changedTask: task,
          originalSelectedTask: task,
        });
      }
    } else if (action === 'mouseleave') {
      if (ganttEvent.action === 'mouseenter') {
        setGanttEvent({ action: '' });
      }
    } else if (action === 'dblclick') {
      !!finalOnDoubleClick && finalOnDoubleClick(task);
    } else if (action === 'click') {
      !!finalOnClick && finalOnClick(task);
    }
    // Change task event start
    else if (action === 'move') {
      // 改由 dnd-kit 触发，无需在此处理
      return;
    } else {
      setGanttEvent({
        action,
        changedTask: task,
        originalSelectedTask: task,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={modifiers}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
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
                key={task.id}
                task={task}
                arrowIndent={arrowIndent}
                taskHeight={taskHeight}
                isProgressChangeable={false}
                isDateChangeable={false}
                isDelete={!task.isDisabled}
                onEventStart={handleBarEventStart}
                isSelected={!!selectedTask && task.id === selectedTask.id}
                rtl={rtl}
                showProjectSegmentProgress={showProjectSegmentProgress}
              />
            );
          })}
        </g>
      </g>
    </DndContext>
  );
};
