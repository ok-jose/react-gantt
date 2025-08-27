import React from 'react';
import { Gantt } from '../components/gantt/gantt';
import { ViewMode, type Task } from '../types';
import { ViewSwitcher } from './view-switcher';
import { initNestedTasks } from './data-helper';

// Init
const GanttChart = () => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = React.useState<Task[]>(initNestedTasks());
  const [isChecked, setIsChecked] = React.useState(true);

  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  /**
   * 递归更新任务及其子任务
   * @param taskList 任务列表
   * @param updatedTask 要更新的任务
   * @returns 更新后的任务列表
   */
  const updateTaskRecursively = (
    taskList: Task[],
    updatedTask: Task
  ): Task[] => {
    return taskList.map(task => {
      if (task.id === updatedTask.id) {
        // 找到要更新的任务
        if (
          task.type === 'project' &&
          task.children &&
          task.children.length > 0
        ) {
          // 如果是项目任务，需要重新计算项目的时间范围以覆盖所有子任务
          const updatedChildren = task.children.map(child => ({
            ...child,
            start: updatedTask.start,
            end: updatedTask.end,
            progress: updatedTask.progress,
          }));

          return {
            ...updatedTask,
            children: updatedChildren,
          };
        } else if (task.children && task.children.length > 0) {
          // 如果是普通任务但有子任务，同步更新子任务
          const updatedChildren = task.children.map(child => ({
            ...child,
            start: updatedTask.start,
            end: updatedTask.end,
            progress: updatedTask.progress,
          }));

          return {
            ...updatedTask,
            children: updatedChildren,
          };
        } else {
          // 普通任务，直接返回更新后的任务
          return updatedTask;
        }
      } else if (task.children && task.children.length > 0) {
        // 如果有子任务，递归更新子任务
        const updatedChildren = updateTaskRecursively(
          task.children,
          updatedTask
        );

        // 检查是否需要更新当前任务的时间范围（如果是项目任务）
        if (task.type === 'project' && updatedChildren.length > 0) {
          // 计算所有子任务的时间范围
          const childStarts = updatedChildren.map(child =>
            child.start.getTime()
          );
          const childEnds = updatedChildren.map(child => child.end.getTime());

          const projectStart = new Date(Math.min(...childStarts));
          const projectEnd = new Date(Math.max(...childEnds));

          // 计算项目的总体进度（基于子任务进度的平均值）
          const totalProgress = updatedChildren.reduce(
            (sum, child) => sum + (child.progress || 0),
            0
          );
          const averageProgress = Math.round(
            totalProgress / updatedChildren.length
          );

          return {
            ...task,
            start: projectStart,
            end: projectEnd,
            progress: averageProgress,
            children: updatedChildren,
          };
        }

        return {
          ...task,
          children: updatedChildren,
        };
      }
      // 其他任务保持不变
      return task;
    });
  };

  /**
   * 处理任务变化
   * @param task 变化的任务
   */
  const handleTaskChange = (task: Task) => {
    console.log(
      'Task changed:',
      task.name,
      'Start:',
      task.start,
      'End:',
      task.end,
      'Progress:',
      task.progress
    );

    // 递归更新任务，允许子任务独立扩展，但项目任务需要同步覆盖所有子任务
    const newTasks = updateTaskRecursively(tasks, task);
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm('Are you sure about ' + task.name + ' ?');
    if (conf) {
      setTasks(tasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log('On progress change Id:' + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert('On Double Click event Id:' + task.id);
  };

  const handleClick = (task: Task) => {
    console.log('On Click event Id:' + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + ' has ' + (isSelected ? 'selected' : 'unselected'));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log('On expander click Id:' + task.id);
  };

  return (
    <div className="Wrapper">
      <ViewSwitcher
        onViewModeChange={viewMode => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
      <h3>Gantt With Limited Height</h3>
      <Gantt
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? '155px' : ''}
        ganttHeight={600}
        columnWidth={columnWidth}
      />
    </div>
  );
};

export default GanttChart;
