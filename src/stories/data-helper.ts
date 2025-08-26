import { type Task } from '../types';

export function initTasks() {
  const currentDate = new Date();
  const tasks: Task[] = [
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: 'Some Project',
      id: 'ProjectSample',
      progress: 25,
      type: 'project',
      hideChildren: false,
      displayOrder: 1,
      children: [
        {
          id: 'Task 0',
          name: 'Idea',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            2,
            12,
            28
          ),
          progress: 45,
          type: 'task',
          project: 'ProjectSample',
          displayOrder: 2,
        },
        {
          id: 'Task 1',
          name: 'Research',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            4,
            0,
            0
          ),
          progress: 25,
          dependencies: ['Task 0'],
          type: 'task',
          project: 'ProjectSample',
          displayOrder: 3,
        },
        {
          id: 'Task 2',
          name: 'Discussion with team',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            8,
            0,
            0
          ),
          progress: 10,
          dependencies: ['Task 1'],
          type: 'task',
          project: 'ProjectSample',
          displayOrder: 4,
        },
        {
          id: 'Task 3',
          name: 'Developing',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            9,
            0,
            0
          ),
          progress: 2,
          dependencies: ['Task 2'],
          type: 'task',
          project: 'ProjectSample',
          displayOrder: 5,
        },
      ],
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        2,
        12,
        28
      ),
      name: 'Idea',
      id: 'ProjectCC',
      progress: 45,
      type: 'project',
      hideChildren: false,
      children: [
        {
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            4,
            0,
            0
          ),
          name: 'Research',
          id: 'Task 1',
          progress: 25,
          dependencies: ['Task 0'],
          type: 'task',
          project: 'ProjectCC',
          displayOrder: 3,
        },
        {
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            8,
            0,
            0
          ),
          name: 'Discussion with team',
          id: 'Task 2',
          progress: 10,
          dependencies: ['Task 1'],
          type: 'task',
          project: 'ProjectCC',
          displayOrder: 4,
        },
        {
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            9,
            0,
            0
          ),
          name: 'Developing',
          id: 'Task 3',
          progress: 2,
          dependencies: ['Task 2'],
          type: 'task',
          project: 'ProjectCC',
          displayOrder: 5,
        },
        {
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
          name: 'Review',
          id: 'Task 4',
          type: 'task',
          progress: 70,
          dependencies: ['Task 2'],
          project: 'ProjectCC',
          displayOrder: 6,
        },
      ],
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: 'Party Time',
      id: 'Task 9',
      progress: 0,
      isDisabled: true,
      type: 'task',
    },
  ];
  return tasks;
}

/**
 * 新的嵌套结构示例 - 展示如何使用 children 数组来组织任务
 */
export function initNestedTasks() {
  const currentDate = new Date();
  const tasks: Task[] = [
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
      name: '软件开发项目',
      id: 'SoftwareProject',
      progress: 30,
      type: 'project',
      hideChildren: false,
      children: [
        {
          id: 'Planning',
          name: '项目规划',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
          progress: 100,
          type: 'task',
        },

        {
          id: 'Frontend',
          name: '前端开发',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12),
          progress: 30,
          type: 'task',
        },
        {
          id: 'Backend',
          name: '后端开发',
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            12
          ),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
          progress: 15,
          type: 'task',
        },
        {
          id: 'Testing',
          name: '测试阶段',
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            15
          ),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
          progress: 0,
          type: 'task',
        },
      ],
    },
    // {
    //   start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
    //   end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25),
    //   name: '文档编写',
    //   id: 'Documentation',
    //   progress: 0,
    //   type: 'task',
    // },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25),
      name: '项目文档',
      id: 'ProjectDocumentation',
      progress: 0,
      type: 'project',
      hideChildren: false,
      children: [
        {
          id: 'Idea',
          name: '文档立意',
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            10
          ),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
          progress: 0,
          type: 'task',
        },
        {
          id: 'Draft',
          name: '文档初稿',
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            13
          ),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
          progress: 0,
          type: 'task',
        },
        {
          id: 'Proofreading',
          name: '文档校对',
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            20
          ),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25),
          progress: 0,
          type: 'task',
        },
      ],
    },
  ];
  return tasks;
}

export function getStartEndDateForProject(tasks: Task[], id: string) {
  const projectTasks = tasks.filter(t => t.id === id);
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
