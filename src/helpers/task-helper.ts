import type { Task, BarTask } from '../types';

export function isKeyboardEvent(
  event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent
): event is React.KeyboardEvent {
  return (event as React.KeyboardEvent).key !== undefined;
}

export function isMouseEvent(
  event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent
): event is React.MouseEvent {
  return (event as React.MouseEvent).clientX !== undefined;
}

export function isBarTask(task: Task | BarTask): task is BarTask {
  return (task as BarTask).x1 !== undefined;
}

export function removeHiddenTasks(tasks: Task[]) {
  // 直接返回原始任务，让 bar-helper.ts 中的 flattenTasks 函数处理 hideChildren 逻辑
  // 这样可以避免重复的扁平化和重建过程
  return tasks;
}

export const sortTasks = (taskA: Task, taskB: Task) => {
  // 简单的字符串比较，保持任务顺序稳定
  return taskA.id.localeCompare(taskB.id);
};

/**
 * 递归更新任务列表中的指定任务
 * @param taskList 任务列表
 * @param updatedTask 要更新的任务
 * @returns 更新后的任务列表
 */
export const updateTaskRecursively = (
  taskList: Task[],
  updatedTask: Task
): Task[] => {
  return taskList.map(task => {
    if (task.id === updatedTask.id) {
      // 找到要更新的任务
      if (
        task.type === 'project' &&
        task.children &&
        task.children.length > 0
      ) {
        // 如果是项目任务，需要重新计算项目的时间范围以覆盖所有子任务
        const updatedChildren = task.children.map(child => ({
          ...child,
          start: updatedTask.start,
          end: updatedTask.end,
          progress: updatedTask.progress,
        }));

        return {
          ...updatedTask,
          children: updatedChildren,
        };
      } else if (task.children && task.children.length > 0) {
        // 如果是普通任务但有子任务，同步更新子任务
        const updatedChildren = task.children.map(child => ({
          ...child,
          start: updatedTask.start,
          end: updatedTask.end,
          progress: updatedTask.progress,
        }));

        return {
          ...updatedTask,
          children: updatedChildren,
        };
      } else {
        // 普通任务，直接返回更新后的任务
        return updatedTask;
      }
    } else if (task.children && task.children.length > 0) {
      // 如果有子任务，递归更新子任务
      const updatedChildren = updateTaskRecursively(task.children, updatedTask);

      // 检查是否需要更新当前任务的时间范围（如果是项目任务）
      if (task.type === 'project' && updatedChildren.length > 0) {
        // 计算所有子任务的时间范围
        const childStarts = updatedChildren.map(child => child.start.getTime());
        const childEnds = updatedChildren.map(child => child.end.getTime());

        const projectStart = new Date(Math.min(...childStarts));
        const projectEnd = new Date(Math.max(...childEnds));

        // 计算项目的总体进度（基于子任务进度的平均值）
        const totalProgress = updatedChildren.reduce(
          (sum, child) => sum + (child.progress || 0),
          0
        );
        const averageProgress = Math.round(
          totalProgress / updatedChildren.length
        );

        return {
          ...task,
          start: projectStart,
          end: projectEnd,
          progress: averageProgress,
          children: updatedChildren,
        };
      }

      return {
        ...task,
        children: updatedChildren,
      };
    }
    // 其他任务保持不变
    return task;
  });
};
