import React, { useState } from 'react';
import { Gantt } from '../components/gantt/gantt';
import { ViewMode } from '../types';
import type { Task } from '../types';

/**
 * 使用 Context 系统的 Gantt 组件示例
 *
 * 这个示例展示了如何使用新的 Context 系统来简化 props 传递。
 * 主要的改进包括：
 *
 * 1. 样式配置通过 Context 传递，无需层层透传
 * 2. 事件处理函数通过 Context 传递，子组件可以直接访问
 * 3. 状态管理通过 Context 传递，避免 props drilling
 * 4. 子组件可以通过 useGanttContext Hook 直接访问配置
 */
const ContextUsageExample: React.FC = () => {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      name: '项目规划',
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 15),
      progress: 100,
      type: 'project',
      children: [
        {
          id: '1-1',
          name: '需求分析',
          start: new Date(2024, 0, 1),
          end: new Date(2024, 0, 5),
          progress: 100,
          type: 'task',
        },
        {
          id: '1-2',
          name: '技术选型',
          start: new Date(2024, 0, 6),
          end: new Date(2024, 0, 10),
          progress: 80,
          type: 'task',
        },
        {
          id: '1-3',
          name: '架构设计',
          start: new Date(2024, 0, 11),
          end: new Date(2024, 0, 15),
          progress: 60,
          type: 'task',
        },
      ],
    },
    {
      id: '2',
      name: '开发阶段',
      start: new Date(2024, 0, 16),
      end: new Date(2024, 1, 15),
      progress: 40,
      type: 'project',
      children: [
        {
          id: '2-1',
          name: '前端开发',
          start: new Date(2024, 0, 16),
          end: new Date(2024, 0, 31),
          progress: 70,
          type: 'task',
        },
        {
          id: '2-2',
          name: '后端开发',
          start: new Date(2024, 1, 1),
          end: new Date(2024, 1, 15),
          progress: 30,
          type: 'task',
        },
      ],
    },
    {
      id: '3',
      name: '里程碑：项目启动',
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 1),
      progress: 100,
      type: 'milestone',
    },
  ]);

  // 事件处理函数
  const handleDateChange = (task: Task, _allTasks: Task[]) => {
    console.log('日期变更:', task.name, task.start, task.end);
    // 这里可以更新任务状态
    return true;
  };

  const handleProgressChange = (task: Task, _allTasks: Task[]) => {
    console.log('进度变更:', task.name, task.progress);
    // 这里可以更新任务进度
    return true;
  };

  const handleTaskSelect = (task: Task, isSelected: boolean) => {
    console.log('任务选择:', task.name, isSelected);
  };

  const handleTaskClick = (task: Task) => {
    console.log('任务点击:', task.name);
  };

  const handleTaskDoubleClick = (task: Task) => {
    console.log('任务双击:', task.name);
  };

  const handleTaskDelete = (task: Task) => {
    console.log('任务删除:', task.name);
    // 这里可以删除任务
    return true;
  };

  const handleExpanderClick = (task: Task) => {
    console.log('展开器点击:', task.name);
    // 这里可以切换任务的展开/折叠状态
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gantt 组件 Context 使用示例</h1>
      <p>
        这个示例展示了如何使用新的 Context 系统来简化 props 传递。
        所有的样式配置、事件处理函数和状态管理都通过 Context 传递，
        子组件可以通过 useGanttContext Hook 直接访问这些配置。
      </p>

      <div style={{ marginBottom: '20px' }}>
        <h3>主要改进：</h3>
        <ul>
          <li>✅ 样式配置通过 Context 传递，无需层层透传</li>
          <li>✅ 事件处理函数通过 Context 传递，子组件可以直接访问</li>
          <li>✅ 状态管理通过 Context 传递，避免 props drilling</li>
          <li>✅ 子组件可以通过 useGanttContext Hook 直接访问配置</li>
        </ul>
      </div>

      <Gantt
        tasks={tasks}
        viewMode={ViewMode.Day}
        headerHeight={60}
        columnWidth={80}
        listCellWidth="200px"
        rowHeight={50}
        ganttHeight={400}
        barFill={70}
        barCornerRadius={4}
        barProgressColor="#4CAF50"
        barProgressSelectedColor="#45a049"
        barBackgroundColor="#e0e0e0"
        barBackgroundSelectedColor="#d0d0d0"
        projectProgressColor="#2196F3"
        projectProgressSelectedColor="#1976D2"
        projectBackgroundColor="#FF9800"
        projectBackgroundSelectedColor="#F57C00"
        milestoneBackgroundColor="#9C27B0"
        milestoneBackgroundSelectedColor="#7B1FA2"
        arrowColor="#666"
        arrowIndent={25}
        todayColor="rgba(255, 193, 7, 0.3)"
        showProjectSegmentProgress={true}
        onDateChange={handleDateChange}
        onProgressChange={handleProgressChange}
        onSelect={handleTaskSelect}
        onClick={handleTaskClick}
        onDoubleClick={handleTaskDoubleClick}
        onDelete={handleTaskDelete}
        onExpanderClick={handleExpanderClick}
      />
    </div>
  );
};

export default ContextUsageExample;
