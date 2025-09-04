import type { BarTask, TaskTypeInternal, Task, BarMoveAction } from '../types';

export const convertToBarTasks = (
  tasks: Task[],
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  taskHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  rtl: boolean,
  barProgressColor: string,
  barProgressSelectedColor: string,
  barBackgroundColor: string,
  barBackgroundSelectedColor: string,
  milestoneBackgroundColor: string,
  milestoneBackgroundSelectedColor: string,
  showSubTask: boolean = false,
  calendarRange?: [Date, Date]
) => {
  // 扁平化嵌套的任务结构
  const flattenedTasks = flattenTasks(tasks, showSubTask, calendarRange);

  let barTasks = flattenedTasks.map((t, i) => {
    return convertToBarTask(
      t,
      i,
      dates,
      columnWidth,
      rowHeight,
      taskHeight,
      barCornerRadius,
      handleWidth,
      rtl,
      barProgressColor,
      barProgressSelectedColor,
      barBackgroundColor,
      barBackgroundSelectedColor,
      milestoneBackgroundColor,
      milestoneBackgroundSelectedColor
    );
  });

  // set dependencies
  barTasks = barTasks.map(task => {
    const dependencies = task.dependencies || [];
    for (let j = 0; j < dependencies.length; j++) {
      const dependence = barTasks.findIndex(
        value => value.id === dependencies[j]
      );
      if (dependence !== -1) barTasks[dependence].barChildren.push(task);
    }
    return task;
  });

  return barTasks;
};

/**
 * 扁平化嵌套的任务结构，将 children 中的任务提取到顶层
 * 同时保持向后兼容性（支持 project 字段）
 * 注意：只有当父任务的 hideChildren 不为 true 且 showSubTask 为 true 时才包含子任务
 * 项目任务会保留其子任务信息用于分段显示，同时子任务也会作为独立任务行显示
 */
function flattenTasks(
  tasks: Task[],
  showSubTask: boolean = false,
  calendarRange?: [Date, Date]
): Task[] {
  const flattened: Task[] = [];

  tasks.forEach(task => {
    // 如果父节点没有 start 和 end，使用 calendarRange 作为默认值
    let processedTask = { ...task };
    if (!task.start || !task.end) {
      if (calendarRange && calendarRange[0] && calendarRange[1]) {
        processedTask.start = calendarRange[0];
        processedTask.end = calendarRange[1];
      } else {
        // 如果没有 calendarRange，跳过这个任务
        return;
      }
    }

    // 添加处理后的任务
    flattened.push(processedTask);

    // 递归处理 children 中的任务
    // 只有当 hideChildren 不为 true 且 showSubTask 为 true 时才包含子任务
    if (
      task.children &&
      task.children.length > 0 &&
      task.hideChildren !== true &&
      showSubTask
    ) {
      // 统一处理子任务：保留子任务信息在父任务中，同时将子任务提取到顶层
      const childrenTasks = flattenTasks(
        task.children,
        showSubTask,
        calendarRange
      );
      flattened.push(...childrenTasks);
    }
  });

  return flattened;
}

const convertToBarTask = (
  task: Task,
  index: number,
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  taskHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  rtl: boolean,
  barProgressColor: string,
  barProgressSelectedColor: string,
  barBackgroundColor: string,
  barBackgroundSelectedColor: string,
  milestoneBackgroundColor: string,
  milestoneBackgroundSelectedColor: string
): BarTask => {
  let barTask: BarTask;
  switch (task.type) {
    case 'milestone':
      barTask = convertToMilestone(
        task,
        index,
        dates,
        columnWidth,
        rowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        milestoneBackgroundColor,
        milestoneBackgroundSelectedColor
      );
      break;
    default:
      barTask = convertToBar(
        task,
        index,
        dates,
        columnWidth,
        rowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        barProgressColor,
        barProgressSelectedColor,
        barBackgroundColor,
        barBackgroundSelectedColor
      );
      break;
  }
  return barTask;
};

const convertToBar = (
  task: Task,
  index: number,
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  taskHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  rtl: boolean,
  barProgressColor: string,
  barProgressSelectedColor: string,
  barBackgroundColor: string,
  barBackgroundSelectedColor: string
): BarTask => {
  let x1: number;
  let x2: number;
  if (rtl) {
    x2 = taskXCoordinateRTL(task.start, dates, columnWidth);
    x1 = taskXCoordinateRTL(task.end, dates, columnWidth);
  } else {
    x1 = taskXCoordinate(task.start, dates, columnWidth);
    x2 = taskXCoordinate(task.end, dates, columnWidth);
  }
  let typeInternal: TaskTypeInternal = task.type;
  if (typeInternal === 'task' && x2 - x1 < handleWidth * 2) {
    typeInternal = 'smalltask';
    x2 = x1 + handleWidth * 2;
  }

  const [progressWidth, progressX] = progressWithByParams(
    x1,
    x2,
    task.progress || 0,
    rtl
  );
  const y = taskYCoordinate(index, rowHeight, taskHeight);
  const hideChildren = task.hideChildren;

  const styles = {
    backgroundColor: barBackgroundColor,
    backgroundSelectedColor: barBackgroundSelectedColor,
    progressColor: barProgressColor,
    progressSelectedColor: barProgressSelectedColor,
    ...task.styles,
  };
  return {
    ...task,
    typeInternal,
    x1,
    x2,
    y,
    index,
    progressX,
    progressWidth,
    barCornerRadius,
    handleWidth,
    hideChildren,
    height: taskHeight,
    barChildren: [],
    styles,
  };
};

const convertToMilestone = (
  task: Task,
  index: number,
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  taskHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  milestoneBackgroundColor: string,
  milestoneBackgroundSelectedColor: string
): BarTask => {
  const x = taskXCoordinate(task.start, dates, columnWidth);
  const y = taskYCoordinate(index, rowHeight, taskHeight);

  const x1 = x - taskHeight * 0.5;
  const x2 = x + taskHeight * 0.5;

  const rotatedHeight = taskHeight / 1.414;
  const styles = {
    backgroundColor: milestoneBackgroundColor,
    backgroundSelectedColor: milestoneBackgroundSelectedColor,
    progressColor: '',
    progressSelectedColor: '',
    ...task.styles,
  };
  return {
    ...task,
    end: task.start,
    x1,
    x2,
    y,
    index,
    progressX: 0,
    progressWidth: 0,
    barCornerRadius,
    handleWidth,
    typeInternal: task.type,
    progress: 0,
    height: rotatedHeight,
    hideChildren: undefined,
    barChildren: [],
    styles,
  };
};

const taskXCoordinate = (xDate: Date, dates: Date[], columnWidth: number) => {
  // 找到第一个大于等于 xDate 的刻度索引
  const firstGE = dates.findIndex(d => d.getTime() >= xDate.getTime());

  if (firstGE === -1) {
    // 如果 xDate 超过最后一个刻度，需要计算超出部分的位置
    const lastIndex = dates.length - 1;
    const lastDate = dates[lastIndex];
    const remainderMillis = xDate.getTime() - lastDate.getTime();

    // 使用最后一个时间间隔作为参考
    const interval =
      lastIndex > 0
        ? dates[lastIndex].getTime() - dates[lastIndex - 1].getTime()
        : 30 * 60 * 1000; // 默认30分钟间隔

    const percentOfInterval = interval > 0 ? remainderMillis / interval : 0;
    // 计算超出最后一个刻度的位置
    const x = lastIndex * columnWidth + percentOfInterval * columnWidth;
    return x;
  }

  const index = Math.max(0, firstGE - 1);
  const remainderMillis = xDate.getTime() - dates[index].getTime();
  const interval = dates[index + 1].getTime() - dates[index].getTime();
  const percentOfInterval = interval > 0 ? remainderMillis / interval : 0;
  const x = index * columnWidth + percentOfInterval * columnWidth;
  return x;
};
const taskXCoordinateRTL = (
  xDate: Date,
  dates: Date[],
  columnWidth: number
) => {
  let x = taskXCoordinate(xDate, dates, columnWidth);
  x += columnWidth;
  return x;
};
const taskYCoordinate = (
  index: number,
  rowHeight: number,
  taskHeight: number
) => {
  const y = index * rowHeight + (rowHeight - taskHeight) / 2;
  return y;
};

export const progressWithByParams = (
  taskX1: number,
  taskX2: number,
  progress: number,
  rtl: boolean
) => {
  const progressWidth = (taskX2 - taskX1) * progress * 0.01;
  let progressX: number;
  if (rtl) {
    progressX = taskX2 - progressWidth;
  } else {
    progressX = taskX1;
  }
  return [progressWidth, progressX];
};

export const progressByProgressWidth = (
  progressWidth: number,
  barTask: BarTask
) => {
  const barWidth = barTask.x2 - barTask.x1;
  const progressPercent = Math.round((progressWidth * 100) / barWidth);
  if (progressPercent >= 100) return 100;
  else if (progressPercent <= 0) return 0;
  else return progressPercent;
};

const progressByX = (x: number, task: BarTask) => {
  if (x >= task.x2) return 100;
  else if (x <= task.x1) return 0;
  else {
    const barWidth = task.x2 - task.x1;
    const progressPercent = Math.round(((x - task.x1) * 100) / barWidth);
    return progressPercent;
  }
};
const progressByXRTL = (x: number, task: BarTask) => {
  if (x >= task.x2) return 0;
  else if (x <= task.x1) return 100;
  else {
    const barWidth = task.x2 - task.x1;
    const progressPercent = Math.round(((task.x2 - x) * 100) / barWidth);
    return progressPercent;
  }
};

export const getProgressPoint = (
  progressX: number,
  taskY: number,
  taskHeight: number
) => {
  const point = [
    progressX - 5,
    taskY + taskHeight,
    progressX + 5,
    taskY + taskHeight,
    progressX,
    taskY + taskHeight - 8.66,
  ];
  return point.join(',');
};

const startByX = (x: number, xStep: number, task: BarTask) => {
  if (x >= task.x2 - task.handleWidth * 2) {
    x = task.x2 - task.handleWidth * 2;
  }
  const steps = Math.round((x - task.x1) / xStep);
  const additionalXValue = steps * xStep;
  const newX = task.x1 + additionalXValue;
  return newX;
};

const endByX = (x: number, xStep: number, task: BarTask) => {
  if (x <= task.x1 + task.handleWidth * 2) {
    x = task.x1 + task.handleWidth * 2;
  }
  const steps = Math.round((x - task.x2) / xStep);
  const additionalXValue = steps * xStep;
  const newX = task.x2 + additionalXValue;
  return newX;
};

const moveByX = (x: number, xStep: number, task: BarTask) => {
  // 对于拖拽移动，需要保持任务的持续时间不变
  // x 是拖拽的目标位置，需要按网格步进对齐
  const steps = Math.round(x / xStep);
  const newX1 = steps * xStep;
  // 保持原有的宽度，确保 end - start 不变
  const taskWidth = task.x2 - task.x1;
  const newX2 = newX1 + taskWidth;
  return [newX1, newX2];
};

const dateByX = (
  x: number,
  taskX: number,
  taskDate: Date,
  xStep: number,
  timeStep: number
) => {
  let newDate = new Date(((x - taskX) / xStep) * timeStep + taskDate.getTime());
  newDate = new Date(
    newDate.getTime() +
      (newDate.getTimezoneOffset() - taskDate.getTimezoneOffset()) * 60000
  );
  return newDate;
};

/**
 * Method handles event in real time(mousemove) and on finish(mouseup)
 */
export const handleTaskBySVGMouseEvent = (
  svgX: number,
  action: BarMoveAction,
  selectedTask: BarTask,
  xStep: number,
  timeStep: number,
  initEventX1Delta: number,
  rtl: boolean
): { isChanged: boolean; changedTask: BarTask } => {
  let result: { isChanged: boolean; changedTask: BarTask };
  switch (selectedTask.type) {
    case 'milestone':
      result = handleTaskBySVGMouseEventForMilestone(
        svgX,
        action,
        selectedTask,
        xStep,
        timeStep,
        initEventX1Delta
      );
      break;
    default:
      result = handleTaskBySVGMouseEventForBar(
        svgX,
        action,
        selectedTask,
        xStep,
        timeStep,
        initEventX1Delta,
        rtl
      );
      break;
  }
  return result;
};

const handleTaskBySVGMouseEventForBar = (
  svgX: number,
  action: BarMoveAction,
  selectedTask: BarTask,
  xStep: number,
  timeStep: number,
  initEventX1Delta: number,
  rtl: boolean
): { isChanged: boolean; changedTask: BarTask } => {
  const changedTask: BarTask = { ...selectedTask };
  let isChanged = false;
  switch (action) {
    case 'progress':
      if (rtl) {
        changedTask.progress = progressByXRTL(svgX, selectedTask);
      } else {
        changedTask.progress = progressByX(svgX, selectedTask);
      }
      isChanged = changedTask.progress !== selectedTask.progress;
      if (isChanged) {
        const [progressWidth, progressX] = progressWithByParams(
          changedTask.x1,
          changedTask.x2,
          changedTask.progress || 0,
          rtl
        );
        changedTask.progressWidth = progressWidth;
        changedTask.progressX = progressX;
      }
      break;
    case 'start': {
      const newX1 = startByX(svgX, xStep, selectedTask);
      changedTask.x1 = newX1;
      isChanged = changedTask.x1 !== selectedTask.x1;
      if (isChanged) {
        if (rtl) {
          changedTask.end = dateByX(
            newX1,
            selectedTask.x1,
            selectedTask.end,
            xStep,
            timeStep
          );
        } else {
          changedTask.start = dateByX(
            newX1,
            selectedTask.x1,
            selectedTask.start,
            xStep,
            timeStep
          );
        }
        const [progressWidth, progressX] = progressWithByParams(
          changedTask.x1,
          changedTask.x2,
          changedTask.progress || 0,
          rtl
        );
        changedTask.progressWidth = progressWidth;
        changedTask.progressX = progressX;
      }
      break;
    }
    case 'end': {
      const newX2 = endByX(svgX, xStep, selectedTask);
      changedTask.x2 = newX2;
      isChanged = changedTask.x2 !== selectedTask.x2;
      if (isChanged) {
        if (rtl) {
          changedTask.start = dateByX(
            newX2,
            selectedTask.x2,
            selectedTask.start,
            xStep,
            timeStep
          );
        } else {
          changedTask.end = dateByX(
            newX2,
            selectedTask.x2,
            selectedTask.end,
            xStep,
            timeStep
          );
        }
        const [progressWidth, progressX] = progressWithByParams(
          changedTask.x1,
          changedTask.x2,
          changedTask.progress || 0,
          rtl
        );
        changedTask.progressWidth = progressWidth;
        changedTask.progressX = progressX;
      }
      break;
    }
    case 'move': {
      const [newMoveX1, newMoveX2] = moveByX(svgX, xStep, selectedTask);
      isChanged = newMoveX1 !== selectedTask.x1;
      if (isChanged) {
        // 对于拖拽移动，基于 viewMode 的格子刻度计算时间偏移
        // xStep 现在表示每个格子的像素宽度（columnWidth）
        // 拖拽的像素偏移量除以 xStep 得到格子数量
        // 再乘以 timeStep 得到毫秒偏移量

        // 计算 x 方向的偏移量（像素）
        const deltaX = newMoveX1 - selectedTask.x1;

        // 将像素偏移量转换为格子数量，再转换为时间偏移量
        const deltaGrids = deltaX / xStep; // 拖拽了多少个格子
        const deltaMs = deltaGrids * timeStep; // 转换为毫秒

        // 计算新的开始和结束时间
        const newStartTime = new Date(selectedTask.start.getTime() + deltaMs);
        const newEndTime = new Date(selectedTask.end.getTime() + deltaMs);

        changedTask.start = newStartTime;
        changedTask.end = newEndTime;
        changedTask.x1 = newMoveX1;
        changedTask.x2 = newMoveX2;

        const [progressWidth, progressX] = progressWithByParams(
          changedTask.x1,
          changedTask.x2,
          changedTask.progress || 0,
          rtl
        );
        changedTask.progressWidth = progressWidth;
        changedTask.progressX = progressX;
      }
      break;
    }
  }
  return { isChanged, changedTask };
};

const handleTaskBySVGMouseEventForMilestone = (
  svgX: number,
  action: BarMoveAction,
  selectedTask: BarTask,
  xStep: number,
  timeStep: number,
  initEventX1Delta: number
): { isChanged: boolean; changedTask: BarTask } => {
  const changedTask: BarTask = { ...selectedTask };
  let isChanged = false;
  switch (action) {
    case 'move': {
      const [newMoveX1, newMoveX2] = moveByX(
        svgX - initEventX1Delta,
        xStep,
        selectedTask
      );
      isChanged = newMoveX1 !== selectedTask.x1;
      if (isChanged) {
        changedTask.start = dateByX(
          newMoveX1,
          selectedTask.x1,
          selectedTask.start,
          xStep,
          timeStep
        );
        changedTask.end = changedTask.start;
        changedTask.x1 = newMoveX1;
        changedTask.x2 = newMoveX2;
      }
      break;
    }
  }
  return { isChanged, changedTask };
};

/**
 * 检测子任务之间是否有时间重叠
 * @param children 子任务数组
 * @returns 是否存在重叠
 */
const hasOverlappingChildren = (children: Task[]): boolean => {
  if (!children || children.length <= 1) {
    return false;
  }

  // 按开始时间排序
  const sortedChildren = [...children].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  // 检查相邻任务是否有重叠
  for (let i = 0; i < sortedChildren.length - 1; i++) {
    const currentTask = sortedChildren[i];
    const nextTask = sortedChildren[i + 1];

    // 如果当前任务的结束时间晚于下一个任务的开始时间，则存在重叠
    if (currentTask.end.getTime() > nextTask.start.getTime()) {
      return true;
    }
  }

  // 额外检查：确保没有任务完全包含在其他任务中
  for (let i = 0; i < sortedChildren.length; i++) {
    for (let j = i + 1; j < sortedChildren.length; j++) {
      const task1 = sortedChildren[i];
      const task2 = sortedChildren[j];

      // 检查是否有重叠（包括完全包含的情况）
      const start1 = task1.start.getTime();
      const end1 = task1.end.getTime();
      const start2 = task2.start.getTime();
      const end2 = task2.end.getTime();

      if (start1 < end2 && end1 > start2) {
        return true;
      }
    }
  }

  return false;
};

export { hasOverlappingChildren };
