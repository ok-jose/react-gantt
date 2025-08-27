import React from 'react';
import { Gantt } from './components/gantt/gantt';
import { ViewMode } from './types';
import type { Task } from './types';

/**
 * 测试 showSubTask 功能的示例
 */
export const TestShowSubTask: React.FC = () => {
  const currentDate = new Date();

  const tasks: Task[] = [
    {
      id: 'Project1',
      name: '项目1',
      type: 'project',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
      progress: 30,
      hideChildren: false,
      children: [
        {
          id: 'Task1',
          name: '任务1',
          type: 'task',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
          progress: 100,
          children: [
            {
              id: 'SubTask1',
              name: '子任务1',
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
              id: 'SubTask2',
              name: '子任务2',
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
            },
          ],
        },
        {
          id: 'Task2',
          name: '任务2',
          type: 'task',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
          progress: 50,
        },
      ],
    },
    {
      id: 'Project2',
      name: '项目2',
      type: 'project',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25),
      progress: 20,
      hideChildren: false,
      children: [
        {
          id: 'Task3',
          name: '任务3',
          type: 'task',
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            10
          ),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
          progress: 30,
        },
        {
          id: 'Task4',
          name: '任务4',
          type: 'task',
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            15
          ),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
          progress: 10,
        },
      ],
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
      <h2>showSubTask 功能测试</h2>
      <p>这个示例展示了 showSubTask 属性的效果。</p>

      <h3>显示子任务（showSubTask=true）</h3>
      <p>左侧表格显示嵌套结构，右侧甘特图显示所有子任务行</p>
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.Day}
        onDateChange={handleTaskChange}
        onExpanderClick={handleExpanderClick}
        listCellWidth="200px"
        columnWidth={65}
        rowHeight={50}
        ganttHeight={300}
        locale="zh-CN"
        showProjectSegmentProgress={true}
        showSubTask={true}
      />

      <h3>隐藏子任务（showSubTask=false，默认）</h3>
      <p>左侧表格不显示嵌套结构，右侧甘特图不显示子任务行</p>
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.Day}
        onDateChange={handleTaskChange}
        onExpanderClick={handleExpanderClick}
        listCellWidth="200px"
        columnWidth={65}
        rowHeight={50}
        ganttHeight={300}
        locale="zh-CN"
        showProjectSegmentProgress={true}
        showSubTask={false}
      />
    </div>
  );
};

export default TestShowSubTask;
