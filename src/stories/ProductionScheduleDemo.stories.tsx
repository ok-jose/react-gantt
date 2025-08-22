import React, { useState, useCallback } from 'react';
import { Gantt } from '../components/gantt/gantt';
import {
  initProductionScheduleData,
  initDraggableProductionData,
} from './data-helper';
import { ProductionTooltip } from '../components/other/production-tooltip';
import type { Task } from '../types';

export default {
  title: 'Gantt/Production Schedule Demo',
  component: Gantt,
  parameters: {
    layout: 'fullscreen',
  },
};

/**
 * 生产调度甘特图演示
 * 模拟硫化缸生产线的任务调度
 */
export const ProductionSchedule = () => {
  const [tasks, setTasks] = useState<Task[]>(() =>
    initProductionScheduleData(2, 4)
  );

  const handleExpanderClick = useCallback((task: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
      )
    );
  }, []);

  const handleDateChange = useCallback(async (task: Task, children: Task[]) => {
    console.log('任务时间变更:', {
      taskId: task.id,
      taskName: task.name,
      newStart: task.start,
      newEnd: task.end,
      duration: (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60), // 小时
    });

    // 更新任务数据
    setTasks(prevTasks => prevTasks.map(t => (t.id === task.id ? task : t)));

    return true; // 允许变更
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    console.log('点击任务:', task.name);
  }, []);

  const handleTaskDoubleClick = useCallback((task: Task) => {
    console.log('双击任务:', task.name);
    // 这里可以打开任务详情对话框
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>生产调度甘特图</h2>
        <p>硫化缸生产线任务调度 - 支持拖拽调整任务时间</p>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <strong>操作说明：</strong>
          <ul>
            <li>点击项目前的 ▼/▶ 按钮展开/收起子任务</li>
            <li>拖拽任务条边缘调整任务时间</li>
            <li>点击任务查看详情</li>
            <li>双击任务编辑</li>
          </ul>
        </div>
      </div>

      <Gantt
        tasks={tasks}
        listCellWidth="200px"
        ganttHeight={400}
        rowHeight={50}
        columnWidth={60}
        viewMode="Hour"
        preStepsCount={1}
        onExpanderClick={handleExpanderClick}
        onDateChange={handleDateChange}
        onClick={handleTaskClick}
        onDoubleClick={handleTaskDoubleClick}
        TooltipContent={ProductionTooltip}
        enableScrollSync={true}
        enableVirtualization={true}
        useVirtualizedCanvas={true}
        enablePerformanceMonitoring={true}
        barCornerRadius={3}
        barFill={80}
        fontFamily="Arial, sans-serif"
        fontSize="12px"
        headerHeight={50}
        rtl={false}
        handleWidth={8}
        timeStep={3600000} // 1小时
        arrowColor="grey"
        arrowIndent={20}
        todayColor="rgba(252, 248, 227, 0.5)"
      />
    </div>
  );
};

/**
 * 可拖拽的生产调度演示
 * 支持实时时间调整
 */
export const DraggableProductionSchedule = () => {
  const [tasks, setTasks] = useState<Task[]>(() =>
    initDraggableProductionData(2, 4)
  );

  const handleExpanderClick = useCallback((task: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
      )
    );
  }, []);

  const handleDateChange = useCallback(async (task: Task, children: Task[]) => {
    const duration =
      (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60);

    console.log('任务时间调整:', {
      taskId: task.id,
      taskName: task.name,
      startTime: task.start.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      endTime: task.end.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: `${duration.toFixed(1)}小时`,
    });

    // 更新任务数据
    setTasks(prevTasks => prevTasks.map(t => (t.id === task.id ? task : t)));

    return true;
  }, []);

  const resetSchedule = useCallback(() => {
    setTasks(initDraggableProductionData(2, 4));
  }, []);

  const addNewTask = useCallback(() => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: `OP-${Math.floor(Math.random() * 10) + 1}`,
      start: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        14
      ),
      end: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        16
      ),
      progress: 100,
      type: 'task',
      project: '硫化缸01',
      hideChildren: false,
      displayOrder: 999,
      styles: {
        backgroundColor: '#51cf66',
        backgroundSelectedColor: '#51cf66',
        progressColor: '#51cf66',
        progressSelectedColor: '#51cf66',
      },
    };

    setTasks(prev => [...prev, newTask]);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>可拖拽生产调度甘特图</h2>
        <p>支持实时拖拽调整任务时间，模拟生产调度优化</p>

        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={resetSchedule}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            重置调度
          </button>
          <button
            onClick={addNewTask}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            添加新任务
          </button>
        </div>

        <div style={{ fontSize: '14px', color: '#666' }}>
          <strong>功能特性：</strong>
          <ul>
            <li>🖱️ 拖拽任务条边缘调整开始/结束时间</li>
            <li>📊 实时显示任务时长</li>
            <li>🎨 不同颜色区分任务类型</li>
            <li>📱 响应式布局，支持缩放</li>
            <li>⚡ 高性能渲染，支持大量任务</li>
          </ul>
        </div>
      </div>

      <Gantt
        tasks={tasks}
        listCellWidth="220px"
        ganttHeight={450}
        rowHeight={55}
        columnWidth={80}
        viewMode="Hour"
        preStepsCount={1}
        onExpanderClick={handleExpanderClick}
        onDateChange={handleDateChange}
        TooltipContent={ProductionTooltip}
        enableScrollSync={true}
        enableVirtualization={true}
        useVirtualizedCanvas={true}
        enablePerformanceMonitoring={true}
        barCornerRadius={4}
        barFill={85}
        fontFamily="Arial, sans-serif"
        fontSize="13px"
        headerHeight={60}
        rtl={false}
        handleWidth={10}
        timeStep={3600000} // 1小时
        arrowColor="#495057"
        arrowIndent={25}
        todayColor="rgba(255, 193, 7, 0.3)"
      />
    </div>
  );
};

/**
 * 多硫化缸生产调度演示
 * 展示复杂的生产线调度
 */
export const MultiProductionLines = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const baseTasks = initProductionScheduleData(2, 4);

    // 添加更多硫化缸
    const additionalTasks = initProductionScheduleData(3, 3);
    const moreTasks = additionalTasks.map(task => ({
      ...task,
      id: task.id.replace('硫化缸', '硫化缸'),
      name: task.name.replace('硫化缸', '硫化缸'),
    }));

    return [...baseTasks, ...moreTasks];
  });

  const handleExpanderClick = useCallback((task: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t
      )
    );
  }, []);

  const handleDateChange = useCallback(async (task: Task, children: Task[]) => {
    const duration =
      (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60);

    console.log('生产线调度调整:', {
      taskId: task.id,
      taskName: task.name,
      duration: `${duration.toFixed(1)}小时`,
      startTime: task.start.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      endTime: task.end.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    setTasks(prevTasks => prevTasks.map(t => (t.id === task.id ? task : t)));

    return true;
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>多生产线调度甘特图</h2>
        <p>多条硫化缸生产线的综合调度管理</p>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <strong>调度特点：</strong>
          <ul>
            <li>🏭 多条生产线并行调度</li>
            <li>⏰ 精确到小时的时间管理</li>
            <li>🎯 任务依赖关系可视化</li>
            <li>📈 生产效率实时监控</li>
          </ul>
        </div>
      </div>

      <Gantt
        tasks={tasks}
        listCellWidth="250px"
        ganttHeight={600}
        rowHeight={45}
        columnWidth={70}
        viewMode="Hour"
        preStepsCount={1}
        onExpanderClick={handleExpanderClick}
        onDateChange={handleDateChange}
        TooltipContent={ProductionTooltip}
        enableScrollSync={true}
        enableVirtualization={true}
        useVirtualizedCanvas={true}
        enablePerformanceMonitoring={true}
        barCornerRadius={3}
        barFill={80}
        fontFamily="Arial, sans-serif"
        fontSize="12px"
        headerHeight={50}
        rtl={false}
        handleWidth={8}
        timeStep={3600000} // 1小时
        arrowColor="grey"
        arrowIndent={20}
        todayColor="rgba(252, 248, 227, 0.5)"
      />
    </div>
  );
};
