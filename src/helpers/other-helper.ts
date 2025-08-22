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
