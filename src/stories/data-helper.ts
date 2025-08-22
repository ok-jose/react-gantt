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
    const projectStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1 + i * 5
    );
    const projectEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      15 + i * 5
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

    // 为每个项目生成子任务
    for (let j = 0; j < tasksPerProject; j++) {
      const taskStart = new Date(
        projectStart.getTime() + j * 0.1 * 24 * 60 * 60 * 1000
      ); // 每个任务间隔0.1天
      const taskEnd = new Date(taskStart.getTime() + 0.5 * 24 * 60 * 60 * 1000); // 每个任务持续0.5天

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
    const projectStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1 + i * 10
    );
    const projectEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      20 + i * 10
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

    // 为每个项目生成子任务
    for (let j = 0; j < tasksPerProject; j++) {
      const taskStart = new Date(
        projectStart.getTime() + j * 3 * 24 * 60 * 60 * 1000
      );
      const taskEnd = new Date(taskStart.getTime() + 4 * 24 * 60 * 60 * 1000);

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

    // 为每个项目生成里程碑
    for (let k = 0; k < milestoneCount; k++) {
      const milestoneDate = new Date(
        projectStart.getTime() + (k + 1) * 5 * 24 * 60 * 60 * 1000
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
