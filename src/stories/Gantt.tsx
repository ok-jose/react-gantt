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
   * 处理任务变化
   * @param task 变化的任务
   * @param allTasks 更新后的全量任务列表
   */
  const handleTaskChange = (_changedTask: Task, allTasks: Task[]) => {
    console.log('On date change Id:' + allTasks);
    // 使用更新后的全量任务列表
    setTasks(allTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm('Are you sure about ' + task.name + ' ?');
    if (conf) {
      setTasks(tasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task, allTasks: Task[]) => {
    setTasks(allTasks);
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

  /**
   * 处理任务层级关系变化
   * @param movedTask 被移动的任务
   * @param newParentTask 新的父任务（null 表示成为根任务）
   * @param allTasks 更新后的全量任务列表
   */
  const handleHierarchyChange = async (
    movedTask: Task,
    newParentTask: Task | null,
    allTasks: Task[]
  ) => {
    console.log('层级变化:', {
      movedTask: movedTask.name,
      newParent: newParentTask?.name || '根级别',
    });

    // 更新任务列表
    setTasks(allTasks);

    // 返回 true 表示接受更改
    return true;
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
        columns={[
          {
            key: 'name',
            title: '资源',
            width: '200px',
          },
        ]}
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        onHierarchyChange={handleHierarchyChange}
        isHierarchyChangeable={true}
        listCellWidth={isChecked ? '155px' : ''}
        ganttHeight={600}
        columnWidth={columnWidth}
        rowHeight={38}
        locale="zh-CN"
      />
    </div>
  );
};

export default GanttChart;
