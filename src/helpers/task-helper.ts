import type { Task, BarTask } from '../types';
import { ViewMode } from '../types';

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
 * 根据拖拽的方向与位移，对任务列表进行级联时间偏移。
 * 规则：
 * - 当 deltaMs > 0（向后/未来拖动）时：将位于 draggedTask 之后的任务整体向后偏移 deltaMs。
 * - 当 deltaMs < 0（向前/过去拖动）时：将位于 draggedTask 之前的任务整体向前偏移 deltaMs。
 * - draggedTask 自身应用 deltaMs。
 * 顺序依据传入的 tasks 数组顺序。
 */
/**
 * 递归查找任务，支持在嵌套的 children 中查找
 * @param tasks 任务列表
 * @param taskId 要查找的任务ID
 * @returns 找到的任务和其父任务，如果没找到则返回 undefined
 */
export const findTaskRecursively = (
  tasks: Task[],
  taskId: string
): { task: Task; parentTask?: Task } | undefined => {
  for (const task of tasks) {
    if (task.id === taskId) {
      return { task };
    }

    if (task.children && task.children.length > 0) {
      const found = findTaskRecursively(task.children, taskId);
      if (found) {
        return { task: found.task, parentTask: task };
      }
    }
  }

  return undefined;
};

export const applyCascadeShift = (
  tasks: Task[],
  draggedTaskId: string,
  deltaMs: number
): Task[] => {
  if (!deltaMs) return tasks.slice();

  const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
  if (draggedIndex === -1) return tasks.slice();

  const shiftTaskDeep = (task: Task, ms: number): Task => {
    const shifted: Task = {
      ...task,
      start: new Date(task.start.getTime() + ms),
      end: new Date(task.end.getTime() + ms),
    };
    if (task.children && task.children.length > 0) {
      shifted.children = task.children.map(child => shiftTaskDeep(child, ms));
    }
    return shifted;
  };

  return tasks.map((task, index) => {
    // 被拖拽的任务本身不应该被级联偏移，它已经在 handleDragEnd 中更新了
    if (index === draggedIndex) {
      return task; // 直接返回原任务，不进行级联偏移
    }
    // 向前拖拽 (deltaMs < 0)：只有被拖拽任务之前的任务才偏移
    if (deltaMs < 0 && index < draggedIndex) {
      return shiftTaskDeep(task, deltaMs);
    }
    // 向后拖拽 (deltaMs > 0)：只有被拖拽任务之后的任务才偏移
    if (deltaMs > 0 && index > draggedIndex) {
      return shiftTaskDeep(task, deltaMs);
    }
    return task;
  });
};
export const calculateTimeStep = (viewMode: ViewMode): number => {
  switch (viewMode) {
    case ViewMode.Hour:
      return 60 * 60 * 1000; // 1小时 = 60 * 60 * 1000 毫秒
    case ViewMode.HalfHour:
      return 30 * 60 * 1000; // 30分钟 = 30 * 60 * 1000 毫秒
    case ViewMode.QuarterDay:
      return 6 * 60 * 60 * 1000; // 6小时 = 6 * 60 * 60 * 1000 毫秒
    case ViewMode.HalfDay:
      return 12 * 60 * 60 * 1000; // 12小时 = 12 * 60 * 60 * 1000 毫秒
    case ViewMode.Day:
      return 24 * 60 * 60 * 1000; // 1天 = 24 * 60 * 60 * 1000 毫秒
    case ViewMode.Week:
      return 7 * 24 * 60 * 60 * 1000; // 1周 = 7 * 24 * 60 * 60 * 1000 毫秒
    case ViewMode.Month:
      return 30 * 24 * 60 * 60 * 1000; // 1月 ≈ 30 * 24 * 60 * 60 * 1000 毫秒
    case ViewMode.QuarterYear:
      return 3 * 30 * 24 * 60 * 60 * 1000; // 1季度 ≈ 3 * 30 * 24 * 60 * 60 * 1000 毫秒
    case ViewMode.Year:
      return 365 * 24 * 60 * 60 * 1000; // 1年 ≈ 365 * 24 * 60 * 60 * 1000 毫秒
    default:
      return 24 * 60 * 60 * 1000; // 默认1天
  }
};
