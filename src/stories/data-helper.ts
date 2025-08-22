import { type Task } from '../types';

export function initTasks(line: number) {
  const currentDate = new Date();
  const tasks: Task[] = Array.from({ length: line }, (_, i) => ({
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    name: `Some Project-${i}`,
    id: `ProjectSample-${i}`,
    progress: 25,
    type: 'task',
    hideChildren: false,
    displayOrder: 1,
  }));
  return tasks;
}

/**
 * 生成包含 project 和 task 的层级结构任务列表
 * @param projectCount 项目数量
 * @param tasksPerProject 每个项目的任务数量
 * @returns 包含项目和任务的层级结构
 */
export function initProjectTasks(
  projectCount: number,
  tasksPerProject: number
): Task[] {
  const currentDate = new Date();
  const tasks: Task[] = [];

  // 生成项目
  for (let i = 0; i < projectCount; i++) {
    // 项目开始时间：每个项目间隔 30 天
    const projectStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1 + i * 30
    );

    // 项目结束时间：项目持续 25 天
    const projectEnd = new Date(
      projectStart.getTime() + 25 * 24 * 60 * 60 * 1000
    );

    const project: Task = {
      id: `project-${i}`,
      name: `项目 ${i + 1}`,
      start: projectStart,
      end: projectEnd,
      progress: Math.floor(Math.random() * 100),
      type: 'project',
      hideChildren: false,
      displayOrder: i,
    };

    tasks.push(project);

    // 为每个项目生成子任务，按序排列在项目时间范围内
    for (let j = 0; j < tasksPerProject; j++) {
      // 计算任务在项目时间范围内的位置
      const projectDuration = projectEnd.getTime() - projectStart.getTime();
      const taskDuration = projectDuration / tasksPerProject; // 每个任务平均分配项目时间

      // 任务开始时间：项目开始时间 + 任务序号 * 任务持续时间
      const taskStart = new Date(projectStart.getTime() + j * taskDuration);

      // 任务结束时间：开始时间 + 任务持续时间（留一些间隔）
      const taskEnd = new Date(
        taskStart.getTime() + taskDuration * 0.8 // 任务占 80% 的时间，留 20% 间隔
      );

      const task: Task = {
        id: `task-${i}-${j}`,
        name: `任务 ${i + 1}-${j + 1}`,
        start: taskStart,
        end: taskEnd,
        progress: Math.floor(Math.random() * 100),
        type: 'task',
        project: `project-${i}`, // 关联到父项目
        hideChildren: false,
        displayOrder: j,
      };

      tasks.push(task);
    }
  }

  return tasks;
}

/**
 * 生成包含里程碑的复杂项目结构
 * @param projectCount 项目数量
 * @param tasksPerProject 每个项目的任务数量
 * @param milestoneCount 里程碑数量
 * @returns 包含项目、任务和里程碑的复杂结构
 */
export function initComplexProjectTasks(
  projectCount: number,
  tasksPerProject: number,
  milestoneCount: number
): Task[] {
  const currentDate = new Date();
  const tasks: Task[] = [];

  // 生成项目
  for (let i = 0; i < projectCount; i++) {
    // 项目开始时间：每个项目间隔 40 天
    const projectStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1 + i * 40
    );

    // 项目结束时间：项目持续 35 天
    const projectEnd = new Date(
      projectStart.getTime() + 35 * 24 * 60 * 60 * 1000
    );

    const project: Task = {
      id: `project-${i}`,
      name: `复杂项目 ${i + 1}`,
      start: projectStart,
      end: projectEnd,
      progress: Math.floor(Math.random() * 100),
      type: 'project',
      hideChildren: false,
      displayOrder: i,
    };

    tasks.push(project);

    // 计算项目时间范围内的任务和里程碑分布
    const projectDuration = projectEnd.getTime() - projectStart.getTime();
    const totalItems = tasksPerProject + milestoneCount;
    const itemDuration = projectDuration / totalItems;

    // 为每个项目生成子任务，按序排列
    for (let j = 0; j < tasksPerProject; j++) {
      const itemIndex = j;
      const taskStart = new Date(
        projectStart.getTime() + itemIndex * itemDuration
      );
      const taskEnd = new Date(
        taskStart.getTime() + itemDuration * 0.7 // 任务占 70% 的时间
      );

      const task: Task = {
        id: `task-${i}-${j}`,
        name: `子任务 ${i + 1}-${j + 1}`,
        start: taskStart,
        end: taskEnd,
        progress: Math.floor(Math.random() * 100),
        type: 'task',
        project: `project-${i}`,
        hideChildren: false,
        displayOrder: j,
      };

      tasks.push(task);
    }

    // 为每个项目生成里程碑，按序排列在任务之后
    for (let k = 0; k < milestoneCount; k++) {
      const itemIndex = tasksPerProject + k;
      const milestoneDate = new Date(
        projectStart.getTime() + itemIndex * itemDuration
      );

      const milestone: Task = {
        id: `milestone-${i}-${k}`,
        name: `里程碑 ${i + 1}-${k + 1}`,
        start: milestoneDate,
        end: milestoneDate,
        progress: 100,
        type: 'milestone',
        project: `project-${i}`,
        hideChildren: false,
        displayOrder: tasksPerProject + k,
      };

      tasks.push(milestone);
    }
  }

  return tasks;
}

/**
 * 生成用于演示嵌套表功能的测试数据
 * 包含多个项目，每个项目下有多个任务，任务按时间顺序排列
 * @param projectCount 项目数量
 * @param tasksPerProject 每个项目的任务数量
 * @returns 适合嵌套表显示的任务数据
 */
export function initNestedTableDemoData(
  projectCount: number = 3,
  tasksPerProject: number = 5
): Task[] {
  const currentDate = new Date();
  const tasks: Task[] = [];

  // 生成项目
  for (let i = 0; i < projectCount; i++) {
    // 项目开始时间：每个项目间隔 20 天
    const projectStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1 + i * 20
    );

    // 项目结束时间：项目持续 15 天
    const projectEnd = new Date(
      projectStart.getTime() + 15 * 24 * 60 * 60 * 1000
    );

    const project: Task = {
      id: `project-${i}`,
      name: `项目 ${i + 1}`,
      start: projectStart,
      end: projectEnd,
      progress: Math.floor(Math.random() * 100),
      type: 'project',
      hideChildren: i === 0, // 第一个项目默认展开，其他收起
      displayOrder: i,
    };

    tasks.push(project);

    // 为每个项目生成子任务，按序排列
    for (let j = 0; j < tasksPerProject; j++) {
      // 计算任务在项目时间范围内的位置
      const projectDuration = projectEnd.getTime() - projectStart.getTime();
      const taskDuration = projectDuration / tasksPerProject;

      // 任务开始时间：项目开始时间 + 任务序号 * 任务持续时间
      const taskStart = new Date(projectStart.getTime() + j * taskDuration);

      // 任务结束时间：开始时间 + 任务持续时间（留一些间隔）
      const taskEnd = new Date(
        taskStart.getTime() + taskDuration * 0.85 // 任务占 85% 的时间，留 15% 间隔
      );

      const task: Task = {
        id: `task-${i}-${j}`,
        name: `任务 ${i + 1}-${j + 1}`,
        start: taskStart,
        end: taskEnd,
        progress: Math.floor(Math.random() * 100),
        type: 'task',
        project: `project-${i}`,
        hideChildren: false,
        displayOrder: j,
      };

      tasks.push(task);
    }
  }

  return tasks;
}

/**
 * 生成包含子项目的复杂嵌套结构
 * @param projectCount 顶级项目数量
 * @param subProjectCount 每个顶级项目的子项目数量
 * @param tasksPerSubProject 每个子项目的任务数量
 * @returns 包含多级嵌套的项目结构
 */
export function initMultiLevelProjectData(
  projectCount: number = 2,
  subProjectCount: number = 2,
  tasksPerSubProject: number = 3
): Task[] {
  const currentDate = new Date();
  const tasks: Task[] = [];

  // 生成顶级项目
  for (let i = 0; i < projectCount; i++) {
    const projectStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1 + i * 30
    );
    const projectEnd = new Date(
      projectStart.getTime() + 25 * 24 * 60 * 60 * 1000
    );

    const project: Task = {
      id: `project-${i}`,
      name: `主项目 ${i + 1}`,
      start: projectStart,
      end: projectEnd,
      progress: Math.floor(Math.random() * 100),
      type: 'project',
      hideChildren: false,
      displayOrder: i,
    };

    tasks.push(project);

    // 为每个顶级项目生成子项目
    for (let j = 0; j < subProjectCount; j++) {
      const subProjectDuration =
        (projectEnd.getTime() - projectStart.getTime()) / subProjectCount;
      const subProjectStart = new Date(
        projectStart.getTime() + j * subProjectDuration
      );
      const subProjectEnd = new Date(
        subProjectStart.getTime() + subProjectDuration * 0.9
      );

      const subProject: Task = {
        id: `subproject-${i}-${j}`,
        name: `子项目 ${i + 1}-${j + 1}`,
        start: subProjectStart,
        end: subProjectEnd,
        progress: Math.floor(Math.random() * 100),
        type: 'project',
        project: `project-${i}`,
        hideChildren: j === 0, // 第一个子项目默认展开
        displayOrder: j,
      };

      tasks.push(subProject);

      // 为每个子项目生成任务
      for (let k = 0; k < tasksPerSubProject; k++) {
        const taskDuration =
          (subProjectEnd.getTime() - subProjectStart.getTime()) /
          tasksPerSubProject;
        const taskStart = new Date(
          subProjectStart.getTime() + k * taskDuration
        );
        const taskEnd = new Date(taskStart.getTime() + taskDuration * 0.8);

        const task: Task = {
          id: `task-${i}-${j}-${k}`,
          name: `任务 ${i + 1}-${j + 1}-${k + 1}`,
          start: taskStart,
          end: taskEnd,
          progress: Math.floor(Math.random() * 100),
          type: 'task',
          project: `subproject-${i}-${j}`,
          hideChildren: false,
          displayOrder: k,
        };

        tasks.push(task);
      }
    }
  }

  return tasks;
}

export function getStartEndDateForProject(tasks: Task[], projectId: string) {
  const projectTasks = tasks.filter(t => t.project === projectId);
  let start = projectTasks[0].start;
  let end = projectTasks[0].end;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    if (start.getTime() > task.start.getTime()) {
      start = task.start;
    }
    if (end.getTime() < task.end.getTime()) {
      end = task.end;
    }
  }
  return [start, end];
}

/**
 * 生成生产调度甘特图测试数据
 * 模拟硫化缸生产线的任务调度
 * @param projectCount 项目数量（硫化缸数量）
 * @param tasksPerProject 每个项目的任务数量（OP数量）
 * @returns 生产调度任务数据
 */
export function initProductionScheduleData(
  projectCount: number = 2,
  tasksPerProject: number = 4
): Task[] {
  const currentDate = new Date();
  const tasks: Task[] = [];

  // 生成硫化缸项目
  for (let i = 0; i < projectCount; i++) {
    const projectStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      1 // 从凌晨1点开始
    );

    const projectEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      19 // 到晚上7点结束
    );

    const project: Task = {
      id: `硫化缸${String(i + 1).padStart(2, '0')}`,
      name: `${i + 1} ▼ 硫化缸${String(i + 1).padStart(2, '0')}`,
      start: projectStart,
      end: projectEnd,
      progress: 100,
      type: 'project',
      hideChildren: false, // 默认展开
      displayOrder: i,
    };

    tasks.push(project);

    // 为每个硫化缸生成OP任务
    const opTasks = [
      { name: 'OP-1', duration: 2, startHour: 1, color: '#ff6b6b' }, // 红色
      { name: 'OP-2', duration: 2, startHour: 3, color: '#74c0fc' }, // 浅蓝色
      { name: 'OP-3', duration: 2, startHour: 2, color: '#74c0fc' }, // 浅蓝色
      { name: 'OP-4', duration: 4, startHour: 4, color: '#74c0fc' }, // 浅蓝色
      { name: 'OP-5', duration: 4.5, startHour: 8, color: '#adb5bd' }, // 浅灰色
      { name: 'OP-7', duration: 11, startHour: 11.5, color: '#adb5bd' }, // 浅灰色
      { name: 'OP-8', duration: 6.5, startHour: 12, color: '#74c0fc' }, // 浅蓝色
    ];

    // 根据硫化缸选择不同的OP任务
    const selectedOps =
      i === 0
        ? [opTasks[0], opTasks[1], opTasks[4], opTasks[6]] // 硫化缸01: OP-1, OP-2, OP-5, OP-8
        : [opTasks[2], opTasks[3], opTasks[5]]; // 硫化缸02: OP-3, OP-4, OP-7

    selectedOps.forEach((op, j) => {
      const taskStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        op.startHour
      );

      const taskEnd = new Date(
        taskStart.getTime() + op.duration * 60 * 60 * 1000
      );

      const task: Task = {
        id: `${project.id}-${op.name}`,
        name: op.name,
        start: taskStart,
        end: taskEnd,
        progress: 100,
        type: 'task',
        project: project.id,
        hideChildren: false,
        displayOrder: j,
        styles: {
          backgroundColor: op.color,
          backgroundSelectedColor: op.color,
          progressColor: op.color,
          progressSelectedColor: op.color,
        },
      };

      tasks.push(task);
    });
  }

  return tasks;
}

/**
 * 生成可拖拽的生产调度数据
 * 支持任务时间调整
 * @param projectCount 项目数量
 * @param tasksPerProject 每个项目的任务数量
 * @returns 可交互的生产调度数据
 */
export function initDraggableProductionData(
  projectCount: number = 2,
  tasksPerProject: number = 4
): Task[] {
  const currentDate = new Date();
  const tasks: Task[] = [];

  // 生成硫化缸项目
  for (let i = 0; i < projectCount; i++) {
    const projectStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      1
    );

    const projectEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      19
    );

    const project: Task = {
      id: `硫化缸${String(i + 1).padStart(2, '0')}`,
      name: `${i + 1} ▼ 硫化缸${String(i + 1).padStart(2, '0')}`,
      start: projectStart,
      end: projectEnd,
      progress: 100,
      type: 'project',
      hideChildren: false,
      displayOrder: i,
    };

    tasks.push(project);

    // 生成可拖拽的OP任务
    const baseStartHours = i === 0 ? [1, 3, 8, 12] : [2, 4, 11.5];
    const durations = i === 0 ? [2, 2, 4.5, 6.5] : [2, 4, 11];
    const colors = [
      '#ff6b6b',
      '#74c0fc',
      '#74c0fc',
      '#adb5bd',
      '#adb5bd',
      '#74c0fc',
    ];

    for (let j = 0; j < baseStartHours.length; j++) {
      const taskStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        baseStartHours[j]
      );

      const taskEnd = new Date(
        taskStart.getTime() + durations[j] * 60 * 60 * 1000
      );

      const task: Task = {
        id: `${project.id}-OP-${j + 1}`,
        name: `OP-${j + 1}`,
        start: taskStart,
        end: taskEnd,
        progress: 100,
        type: 'task',
        project: project.id,
        hideChildren: false,
        displayOrder: j,
        styles: {
          backgroundColor: colors[j],
          backgroundSelectedColor: colors[j],
          progressColor: colors[j],
          progressSelectedColor: colors[j],
        },
      };

      tasks.push(task);
    }
  }

  return tasks;
}

/*
使用示例：

// 1. 基础嵌套表数据
const basicNestedData = initNestedTableDemoData(3, 5);
// 生成 3 个项目，每个项目下有 5 个任务

// 2. 复杂项目结构（包含里程碑）
const complexData = initComplexProjectTasks(2, 4, 2);
// 生成 2 个项目，每个项目有 4 个任务和 2 个里程碑

// 3. 多级嵌套结构
const multiLevelData = initMultiLevelProjectData(2, 2, 3);
// 生成 2 个主项目，每个主项目下有 2 个子项目，每个子项目有 3 个任务

// 4. 在 Storybook 中使用
export const NestedTableStory = () => {
  const tasks = initNestedTableDemoData(3, 5);
  
  return (
    <Gantt
      tasks={tasks}
      listCellWidth="250px"
      ganttHeight={400}
      // ... 其他配置
    />
  );
};
*/
