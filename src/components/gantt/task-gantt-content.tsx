import React, { useEffect, useMemo, useState } from 'react';
import type { EventOption, Task } from '../../types';
import type { BarTask } from '../../types/bar-task';
import { Arrow } from '../other/arrow';
import { isKeyboardEvent } from '../../helpers';
import { TaskItem } from '../task-item/task-item';
import {
  type GanttContentMoveAction,
  type GanttEvent,
} from '../../types/gantt-task-actions';
import { useGanttContext } from '../../contexts/GanttContext';
import { dragDebug, timeDebug, hierarchyDebug } from '../../utils/debug';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  createSnapModifier,
} from '@dnd-kit/modifiers';

export type TaskGanttContentProps = {
  tasks: BarTask[];
  dates: number[]; // 时间戳数组
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
  /**
   * 是否允许跨行拖拽（改变任务层级关系）
   */
  isHierarchyChangeable?: boolean;
  /**
   * 任务层级关系变化的回调
   */
  onHierarchyChange?: (
    movedTask: BarTask,
    newParentTask: BarTask | null,
    allTasks: BarTask[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
} & EventOption;

export const TaskGanttContent: React.FC<TaskGanttContentProps> = ({
  tasks,
  ganttEvent,
  selectedTask,
  rowHeight,
  columnWidth,
  taskHeight,
  arrowColor,
  arrowIndent,
  fontFamily,
  fontSize,
  rtl,
  setGanttEvent,
  setSelectedTask,
  showProjectSegmentProgress = false,
  isHierarchyChangeable = false,
  onDateChange,
  onDoubleClick,
  onClick,
  onDelete,
  timeStep,
}) => {
  const { events, tasks: currentTasks, readonly = false } = useGanttContext();
  const {
    onDateChange: contextOnDateChange,
    onDoubleClick: contextOnDoubleClick,
    onClick: contextOnClick,
    onDelete: contextOnDelete,
    onHierarchyChange,
  } = events;

  // 使用 Context 中的事件处理函数，如果没有传入 props 的话
  const finalOnDateChange = onDateChange || contextOnDateChange;
  const finalOnDoubleClick = onDoubleClick || contextOnDoubleClick;
  const finalOnClick = onClick || contextOnClick;
  const finalOnDelete = onDelete || contextOnDelete;
  const finalOnHierarchyChange = onHierarchyChange;

  const [xStep, setXStep] = useState(0);
  const [draggedTask, setDraggedTask] = useState<BarTask | null>(null);
  const [dragOverTask, setDragOverTask] = useState<BarTask | null>(null);

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
    if (isHierarchyChangeable) {
      // 允许垂直移动，但水平方向仍然按网格对齐
      return [createSnapModifier(xStep || 1)];
    } else {
      // 只允许水平移动（时间调整）
      return [restrictToHorizontalAxis, createSnapModifier(xStep || 1)];
    }
  }, [xStep, isHierarchyChangeable]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const currentBarTask = active.data.current?.task;
    if (currentBarTask) {
      setDraggedTask(currentBarTask);
      setGanttEvent({ action: 'move' });
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;

    // 计算拖拽任务当前的位置
    const currentBarTask = active.data.current?.task;
    if (!currentBarTask) return;

    // 检查是否拖拽到了其他任务上
    if (over && over.data.current?.task) {
      const overTask = over.data.current.task;
      // 不能拖拽到自己或自己的子任务上
      if (
        overTask.id !== currentBarTask.id &&
        !isDescendant(currentBarTask, overTask)
      ) {
        setDragOverTask(overTask);
      } else {
        setDragOverTask(null);
      }
    } else {
      // 如果没有 over 目标，尝试根据拖拽位置计算目标行
      if (isHierarchyChangeable && draggedTask) {
        const targetRow = calculateTargetRow(event, currentBarTask);
        if (targetRow !== null && targetRow.id !== currentBarTask.id) {
          setDragOverTask(targetRow);
        } else {
          setDragOverTask(null);
        }
      } else {
        setDragOverTask(null);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta, over } = event;
    if (!active) return;

    // 直接从 event 中获取 currentBarTask 和位移
    const currentBarTask = active.data.current?.task;
    if (!currentBarTask) return;

    // 检查是否有垂直移动（跨行拖拽）
    const deltaY = delta.y || 0;
    const deltaX = delta.x || 0;

    try {
      // 检查是否有垂直移动（跨行拖拽）
      if (Math.abs(deltaY) > 10) {
        // 有垂直移动，处理层级变化
        let targetOver = over;
        if (!targetOver && isHierarchyChangeable) {
          const targetRow = calculateTargetRow(event, currentBarTask);
          if (targetRow) {
            // 创建一个模拟的 over 对象
            targetOver = {
              data: { current: { task: targetRow } },
            } as any;
          }
        }
        // 将位移信息传递给 handleHierarchyChange，让它同时处理层级变化和位置调整
        await handleHierarchyChange(currentBarTask, targetOver, deltaX, deltaY);
      } else if (Math.abs(deltaX) > 1) {
        // 只有水平移动，处理时间变化
        await handleTimeChange(currentBarTask, deltaX);
      }
    } catch (error) {
      console.error('Error during drag end:', error);
    } finally {
      // 确保在所有情况下都清理拖拽状态
      dragDebug('清理拖拽状态:', {
        draggedTask: draggedTask?.name,
        dragOverTask: dragOverTask?.name,
        action: ganttEvent.action,
      });
      setGanttEvent({ action: '' });
      setDraggedTask(null);
      setDragOverTask(null);
    }
  };

  // 计算水平移动后的新时间
  const calculateNewTime = (task: BarTask, deltaX: number) => {
    // 计算拖拽了多少个格子
    const deltaGrids = deltaX / xStep;
    // 转换为毫秒
    const deltaMs = deltaGrids * timeStep;

    // 计算新的开始和结束时间
    const newStartTime = task.start + deltaMs;
    const newEndTime = task.end + deltaMs;

    timeDebug('时间计算:', {
      taskId: task.id,
      taskName: task.name,
      deltaX,
      xStep,
      timeStep,
      deltaGrids,
      deltaMs,
      originalStart: task.start,
      originalEnd: task.end,
      newStartTime,
      newEndTime,
      duration: newEndTime - newStartTime,
      originalDuration: task.end - task.start,
    });

    return { newStartTime, newEndTime, deltaMs };
  };

  // 处理时间变化
  const handleTimeChange = async (currentBarTask: BarTask, deltaX: number) => {
    // 使用公用函数计算新时间
    const { newStartTime, newEndTime } = calculateNewTime(
      currentBarTask,
      deltaX
    );

    // 创建更新后的任务
    const changedTask = {
      ...currentBarTask,
      start: newStartTime,
      end: newEndTime,
    };

    if (!finalOnDateChange) return;

    try {
      // 只更新当前拖拽的任务，不考虑其他任务的影响
      const updatedTasks = currentTasks.map(task => {
        // 检查这个任务是否包含被拖拽的子任务
        if (
          task.children &&
          task.children.some(child => child.id === changedTask.id)
        ) {
          // 更新子任务
          const updatedChildren = task.children.map(child => {
            if (child.id === changedTask.id) {
              // 使用 changedTask 的时间信息更新子任务
              return {
                ...child,
                start: changedTask.start,
                end: changedTask.end,
              };
            }
            return child;
          });

          return {
            ...task,
            children: updatedChildren,
          };
        }
        return task;
      });

      // 将 BarTask 转换为 Task 类型
      const taskForCallback: Task = {
        id: changedTask.id,
        type: changedTask.type,
        name: changedTask.name,
        start: changedTask.start,
        end: changedTask.end,
        progress: changedTask.progress,
        styles: changedTask.styles,
        isDisabled: changedTask.isDisabled,
        dependencies: changedTask.dependencies,
        hideChildren: changedTask.hideChildren,
        children: changedTask.children,
        displayOrder: changedTask.displayOrder,
      };

      // 回调返回更新后的 tasks（先不考虑级联影响）
      await finalOnDateChange(taskForCallback, updatedTasks);
    } catch (error) {
      console.error('Error updating dragged task:', error);
    }
  };

  // 根据拖拽位置计算目标行
  const calculateTargetRow = (
    event: DragMoveEvent,
    currentTask: BarTask
  ): BarTask | null => {
    if (!draggedTask) return null;

    // 计算拖拽任务当前的实际位置
    const currentY = draggedTask.y + (event.delta.y || 0);

    // 根据 Y 坐标计算行索引
    const rowIndex = Math.round(currentY / rowHeight);

    // 确保行索引在有效范围内
    if (rowIndex >= 0 && rowIndex < tasks.length) {
      const targetTask = tasks[rowIndex];

      // 检查是否可以成为父任务
      if (
        targetTask &&
        targetTask.id !== currentTask.id &&
        !isDescendant(currentTask, targetTask)
      ) {
        return targetTask;
      }
    }

    return null;
  };

  // 模拟任务移动后的新状态
  const simulateTaskMove = (
    movedTask: BarTask,
    newParentTask: BarTask | null,
    allTasks: BarTask[]
  ): BarTask[] => {
    // 深拷贝任务数组
    const updatedTasks = [...allTasks];

    // 从所有任务中移除被移动的任务
    const removeTaskFromChildren = (
      tasks: BarTask[],
      taskId: string
    ): BarTask[] => {
      return tasks
        .map(task => ({
          ...task,
          children: task.children
            ? removeTaskFromChildren(task.children as BarTask[], taskId)
            : undefined,
        }))
        .filter(task => task.id !== taskId);
    };

    // 将任务添加到新的父任务下
    const addTaskToParent = (
      tasks: BarTask[],
      parentId: string | null,
      taskToAdd: BarTask
    ): BarTask[] => {
      if (!parentId) {
        // 添加到根级别
        return [...tasks, taskToAdd];
      }

      return tasks.map(task => {
        if (task.id === parentId) {
          return {
            ...task,
            children: [...(task.children || []), taskToAdd],
          };
        }

        if (task.children) {
          return {
            ...task,
            children: addTaskToParent(
              task.children as BarTask[],
              parentId,
              taskToAdd
            ),
          };
        }

        return task;
      });
    };

    // 1. 从原位置移除任务
    let result = removeTaskFromChildren(updatedTasks, movedTask.id);

    // 2. 添加到新位置
    const taskToMove = { ...movedTask, children: movedTask.children || [] };
    result = addTaskToParent(result, newParentTask?.id || null, taskToMove);

    hierarchyDebug('模拟任务移动:', {
      movedTask: movedTask.name,
      newParent: newParentTask?.name || '根级别',
      updatedTasksCount: result.length,
    });

    return result;
  };

  // 检查任务是否为另一个任务的子任务
  const isDescendant = (parent: BarTask, child: BarTask): boolean => {
    if (!parent.children) return false;

    for (const directChild of parent.children) {
      if (directChild.id === child.id) return true;
      // 递归调用时，将 Task 转换为 BarTask
      const directChildBarTask = tasks.find(t => t.id === directChild.id);
      if (directChildBarTask && isDescendant(directChildBarTask, child))
        return true;
    }

    return false;
  };

  // 处理层级变化和位置调整
  const handleHierarchyChange = async (
    movedTask: BarTask,
    over: any,
    deltaX: number = 0,
    deltaY: number = 0
  ) => {
    if (!isHierarchyChangeable || !finalOnHierarchyChange) return;

    let newParentTask: BarTask | null = null;

    if (over && over.data.current?.task) {
      const overTask = over.data.current.task;
      // 检查是否可以成为父任务
      if (overTask.id !== movedTask.id && !isDescendant(movedTask, overTask)) {
        newParentTask = overTask;
      }
    }

    try {
      // 将更新后的任务转换为 BarTask[] 类型
      const barTasks = tasks.filter(task =>
        currentTasks.some(ct => ct.id === task.id)
      );
      // 模拟任务移动后的新状态
      const updatedTasks = simulateTaskMove(movedTask, newParentTask, barTasks);

      hierarchyDebug('updatedTasks', updatedTasks);

      hierarchyDebug('层级变化调试信息:', {
        movedTask: movedTask.name,
        newParent: newParentTask?.name || '根级别',
        overTask: over?.data?.current?.task?.name || '无',
        updatedTasksCount: updatedTasks.length,
        deltaX,
        deltaY,
      });

      // 如果同时有水平移动，在层级变化的基础上调整时间
      if (Math.abs(deltaX) > 1) {
        timeDebug('同时处理时间调整:', { deltaX, deltaY });

        // 使用公用函数计算水平移动后的新时间
        const { newStartTime, newEndTime } = calculateNewTime(
          movedTask,
          deltaX
        );

        // 更新移动任务的时间
        movedTask.start = newStartTime;
        movedTask.end = newEndTime;

        // 同时更新 updatedTasks 中对应任务的时间
        const updateTaskTime = (
          tasks: BarTask[],
          taskId: string
        ): BarTask[] => {
          return tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                start: newStartTime,
                end: newEndTime,
              };
            }

            if (task.children) {
              return {
                ...task,
                children: updateTaskTime(task.children as BarTask[], taskId),
              };
            }

            return task;
          });
        };

        // 更新 updatedTasks 中的时间
        const updatedTasksWithTime = updateTaskTime(updatedTasks, movedTask.id);

        // 将 BarTask 转换为 Task 类型
        const movedTaskForCallback: Task = {
          id: movedTask.id,
          type: movedTask.type,
          name: movedTask.name,
          start: movedTask.start,
          end: movedTask.end,
          progress: movedTask.progress,
          styles: movedTask.styles,
          isDisabled: movedTask.isDisabled,
          dependencies: movedTask.dependencies,
          hideChildren: movedTask.hideChildren,
          children: movedTask.children,
          displayOrder: movedTask.displayOrder,
        };

        const newParentTaskForCallback: Task | null = newParentTask
          ? {
              id: newParentTask.id,
              type: newParentTask.type,
              name: newParentTask.name,
              start: newParentTask.start,
              end: newParentTask.end,
              progress: newParentTask.progress,
              styles: newParentTask.styles,
              isDisabled: newParentTask.isDisabled,
              dependencies: newParentTask.dependencies,
              hideChildren: newParentTask.hideChildren,
              children: newParentTask.children,
              displayOrder: newParentTask.displayOrder,
            }
          : null;

        // 将时间调整后的任务传递给回调
        const result = await finalOnHierarchyChange(
          movedTaskForCallback,
          newParentTaskForCallback,
          updatedTasksWithTime
        );

        if (result !== false) {
          hierarchyDebug('任务层级关系和时间已更新:', {
            movedTask: movedTask.name,
            newParent: newParentTask?.name || '根级别',
            newStartTime,
            newEndTime,
          });

          setGanttEvent({
            action: 'hierarchy-changed',
            changedTask: movedTask,
          });
        } else {
          hierarchyDebug('层级变化和时间调整被拒绝');
        }

        return; // 已经处理了回调，直接返回
      }

      // 将 BarTask 转换为 Task 类型
      const movedTaskForCallback: Task = {
        id: movedTask.id,
        type: movedTask.type,
        name: movedTask.name,
        start: movedTask.start,
        end: movedTask.end,
        progress: movedTask.progress,
        styles: movedTask.styles,
        isDisabled: movedTask.isDisabled,
        dependencies: movedTask.dependencies,
        hideChildren: movedTask.hideChildren,
        children: movedTask.children,
        displayOrder: movedTask.displayOrder,
      };

      const newParentTaskForCallback: Task | null = newParentTask
        ? {
            id: newParentTask.id,
            type: newParentTask.type,
            name: newParentTask.name,
            start: newParentTask.start,
            end: newParentTask.end,
            progress: newParentTask.progress,
            styles: newParentTask.styles,
            isDisabled: newParentTask.isDisabled,
            dependencies: newParentTask.dependencies,
            hideChildren: newParentTask.hideChildren,
            children: newParentTask.children,
            displayOrder: newParentTask.displayOrder,
          }
        : null;

      const result = await finalOnHierarchyChange(
        movedTaskForCallback,
        newParentTaskForCallback,
        updatedTasks
      );

      if (result !== false) {
        hierarchyDebug('任务层级关系已更新:', {
          movedTask: movedTask.name,
          newParent: newParentTask?.name || '根级别',
        });

        // 如果回调成功，触发重新渲染
        // 这里可以添加一个状态更新来强制重新渲染
        setGanttEvent({ action: 'hierarchy-changed', changedTask: movedTask });
      } else {
        hierarchyDebug('层级变化被拒绝');
      }
    } catch (error) {
      console.error('Error updating task hierarchy:', error);
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
    // 在 readonly 模式下，只允许选择操作，禁用其他所有操作
    if (
      readonly &&
      action !== 'select' &&
      action !== 'click' &&
      action !== 'dblclick' &&
      action !== 'mouseenter' &&
      action !== 'mouseleave'
    ) {
      return;
    }

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
                isHierarchyChangeable={isHierarchyChangeable}
                isDragOver={dragOverTask?.id === task.id}
              />
            );
          })}
        </g>
      </g>

      {/* 拖拽预览层 */}
      <DragOverlay>
        {draggedTask ? (
          <g className="drag-overlay">
            <rect
              x={draggedTask.x1}
              y={draggedTask.y}
              width={draggedTask.x2 - draggedTask.x1}
              height={draggedTask.height}
              fill={draggedTask.styles.backgroundColor}
              stroke="#666"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.8"
            />
            <text
              x={draggedTask.x1 + (draggedTask.x2 - draggedTask.x1) / 2}
              y={draggedTask.y + draggedTask.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
            >
              {draggedTask.name}
            </text>
          </g>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
