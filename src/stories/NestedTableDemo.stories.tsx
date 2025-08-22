import React, { useState } from 'react';
import { Gantt } from '../components/gantt/gantt';
import {
  initNestedTableDemoData,
  initMultiLevelProjectData,
} from './data-helper';
import type { Task } from '../types';

export default {
  title: 'Gantt/Nested Table Demo',
  component: Gantt,
  parameters: {
    layout: 'fullscreen',
  },
};

/**
 * 基础嵌套表示例
 * 展示项目下任务的展开/收起功能
 */
export const BasicNestedTable = () => {
  const [tasks, setTasks] = useState<Task[]>(() =>
    initNestedTableDemoData(3, 5)
  );

  const handleExpanderClick = (task: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
      )
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>基础嵌套表示例</h2>
      <p>点击项目前的展开/收起按钮来显示或隐藏子任务</p>
      <Gantt
        tasks={tasks}
        listCellWidth="250px"
        ganttHeight={500}
        rowHeight={50}
        columnWidth={60}
        onExpanderClick={handleExpanderClick}
        enableScrollSync={true}
        enableVirtualization={true}
        useVirtualizedCanvas={true}
        enablePerformanceMonitoring={true}
      />
    </div>
  );
};

/**
 * 多级嵌套表示例
 * 展示主项目 → 子项目 → 任务的层级结构
 */
export const MultiLevelNestedTable = () => {
  const [tasks, setTasks] = useState<Task[]>(() =>
    initMultiLevelProjectData(2, 2, 3)
  );

  const handleExpanderClick = (task: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
      )
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>多级嵌套表示例</h2>
      <p>展示主项目 → 子项目 → 任务的层级结构</p>
      <Gantt
        tasks={tasks}
        listCellWidth="280px"
        ganttHeight={600}
        rowHeight={45}
        columnWidth={60}
        onExpanderClick={handleExpanderClick}
        enableScrollSync={true}
        enableVirtualization={true}
        useVirtualizedCanvas={true}
        enablePerformanceMonitoring={true}
      />
    </div>
  );
};

/**
 * 大量数据嵌套表示例
 * 展示虚拟化渲染的性能
 */
export const LargeDataNestedTable = () => {
  const [tasks, setTasks] = useState<Task[]>(() =>
    initNestedTableDemoData(10, 8)
  );

  const handleExpanderClick = (task: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
      )
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>大量数据嵌套表示例</h2>
      <p>展示 10 个项目，每个项目 8 个任务，共 90 个任务项</p>
      <Gantt
        tasks={tasks}
        listCellWidth="250px"
        ganttHeight={700}
        rowHeight={40}
        columnWidth={60}
        onExpanderClick={handleExpanderClick}
        enableScrollSync={true}
        enableVirtualization={true}
        useVirtualizedCanvas={true}
        enablePerformanceMonitoring={true}
      />
    </div>
  );
};

/**
 * 交互式嵌套表示例
 * 展示动态添加/删除任务的功能
 */
export const InteractiveNestedTable = () => {
  const [tasks, setTasks] = useState<Task[]>(() =>
    initNestedTableDemoData(2, 3)
  );

  const handleExpanderClick = (task: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
      )
    );
  };

  const addProject = () => {
    const newProjectId = `project-${tasks.length}`;
    const currentDate = new Date();
    const projectStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1 + tasks.length * 20
    );
    const projectEnd = new Date(
      projectStart.getTime() + 15 * 24 * 60 * 60 * 1000
    );

    const newProject: Task = {
      id: newProjectId,
      name: `新项目 ${tasks.length + 1}`,
      start: projectStart,
      end: projectEnd,
      progress: Math.floor(Math.random() * 100),
      type: 'project',
      hideChildren: false,
      displayOrder: tasks.length,
    };

    // 为新项目添加任务
    const newTasks: Task[] = [newProject];
    for (let i = 0; i < 3; i++) {
      const taskDuration = (projectEnd.getTime() - projectStart.getTime()) / 3;
      const taskStart = new Date(projectStart.getTime() + i * taskDuration);
      const taskEnd = new Date(taskStart.getTime() + taskDuration * 0.8);

      newTasks.push({
        id: `task-${tasks.length}-${i}`,
        name: `新任务 ${tasks.length + 1}-${i + 1}`,
        start: taskStart,
        end: taskEnd,
        progress: Math.floor(Math.random() * 100),
        type: 'task',
        project: newProjectId,
        hideChildren: false,
        displayOrder: i,
      });
    }

    setTasks(prev => [...prev, ...newTasks]);
  };

  const removeLastProject = () => {
    if (tasks.length > 0) {
      const lastProject = tasks.find(t => t.type === 'project' && !t.project);
      if (lastProject) {
        const projectTasks = tasks.filter(t => t.project === lastProject.id);
        setTasks(prev =>
          prev.filter(
            t => t.id !== lastProject.id && t.project !== lastProject.id
          )
        );
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>交互式嵌套表示例</h2>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={addProject}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          添加项目
        </button>
        <button
          onClick={removeLastProject}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          删除最后一个项目
        </button>
      </div>
      <Gantt
        tasks={tasks}
        listCellWidth="250px"
        ganttHeight={500}
        rowHeight={50}
        columnWidth={60}
        onExpanderClick={handleExpanderClick}
        enableScrollSync={true}
        enableVirtualization={true}
        useVirtualizedCanvas={true}
        enablePerformanceMonitoring={true}
      />
    </div>
  );
};
