import React from 'react';
import { Gantt } from './components/gantt/gantt';
import { ViewMode } from './types';
import type { Task } from './types';

/**
 * 示例：使用新的嵌套 children 结构
 */
export const NestedStructureExample: React.FC = () => {
  const currentDate = new Date();

  const tasks: Task[] = [
    {
      id: 'SoftwareProject',
      name: '软件开发项目',
      type: 'project',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
      progress: 30,
      hideChildren: false,
      children: [
        {
          id: 'Planning',
          name: '项目规划',
          type: 'task',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
          progress: 100,
          children: [
            {
              id: 'Requirements',
              name: '需求分析',
              type: 'task',
              start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
              ),
              end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                3
              ),
              progress: 100,
            },
            {
              id: 'Design',
              name: '系统设计',
              type: 'task',
              start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                3
              ),
              end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                5
              ),
              progress: 80,
              dependencies: ['Requirements'],
            },
          ],
        },
        {
          id: 'Development',
          name: '开发阶段',
          type: 'project',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
          progress: 20,
          hideChildren: false,
          children: [
            {
              id: 'Frontend',
              name: '前端开发',
              type: 'task',
              start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                5
              ),
              end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                12
              ),
              progress: 30,
              dependencies: ['Design'],
            },
            {
              id: 'Backend',
              name: '后端开发',
              type: 'task',
              start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                7
              ),
              end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                15
              ),
              progress: 15,
              dependencies: ['Design'],
            },
          ],
        },
        {
          id: 'Testing',
          name: '测试阶段',
          type: 'task',
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            15
          ),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
          progress: 0,
          dependencies: ['Frontend', 'Backend'],
        },
      ],
    },
    {
      id: 'OverlappingProject',
      name: '重叠任务项目（测试）',
      type: 'project',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      progress: 40,
      hideChildren: false,
      children: [
        {
          id: 'Task1',
          name: '任务1',
          type: 'task',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
          progress: 60,
        },
        {
          id: 'Task2',
          name: '任务2',
          type: 'task',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 6),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12),
          progress: 30,
        },
        {
          id: 'Task3',
          name: '任务3',
          type: 'task',
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            10
          ),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 14),
          progress: 20,
        },
      ],
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25),
      name: '文档编写',
      id: 'Documentation',
      progress: 0,
      type: 'task',
    },
  ];

  const handleTaskChange = (task: Task) => {
    console.log('任务变更:', task);
  };

  const handleExpanderClick = (task: Task) => {
    console.log('展开/折叠任务:', task);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>嵌套结构示例</h2>
      <p>这个示例展示了如何使用新的嵌套 children 结构来组织任务。</p>
      <p style={{ color: 'red', fontWeight: 'bold' }}>
        注意：包含重叠子任务的项目会显示红色背景标识
      </p>

      <h3>显示项目分段进度条（默认）</h3>
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.Day}
        onDateChange={handleTaskChange}
        onExpanderClick={handleExpanderClick}
        listCellWidth="200px"
        columnWidth={65}
        rowHeight={50}
        ganttHeight={400}
        locale="zh-CN"
        showProjectSegmentProgress={true}
      />

      <h3>隐藏项目分段进度条</h3>
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.Day}
        onDateChange={handleTaskChange}
        onExpanderClick={handleExpanderClick}
        listCellWidth="200px"
        columnWidth={65}
        rowHeight={50}
        ganttHeight={400}
        locale="zh-CN"
        showProjectSegmentProgress={false}
      />
    </div>
  );
};

export default NestedStructureExample;
