import React from 'react';
import { Gantt } from '../components/gantt/gantt';
import { ViewMode, type Task } from '../types';
import { ViewSwitcher } from './view-switcher';
import {
  getStartEndDateForProject,
  initProjectTasks,
  initComplexProjectTasks,
} from './data-helper';

/**
 * 项目甘特图示例组件
 * 展示包含 project 和 task 的层级结构
 */
const ProjectGanttExample: React.FC = () => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = React.useState<Task[]>(initProjectTasks(3, 4)); // 3个项目，每个项目4个任务
  const [isChecked, setIsChecked] = React.useState(true);

  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = (task: Task) => {
    console.log('任务日期变更 ID:', task.id);
    let newTasks = tasks.map(t => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project = newTasks[newTasks.findIndex(t => t.id === task.project)];
      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };
        newTasks = newTasks.map(t =>
          t.id === task.project ? changedProject : t
        );
      }
    }
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm(`确定要删除任务 "${task.name}" 吗？`);
    if (conf) {
      setTasks(tasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log('进度变更 ID:', task.id);
  };

  const handleDblClick = (task: Task) => {
    alert(`双击任务: ${task.name} (ID: ${task.id})`);
  };

  const handleClick = (task: Task) => {
    console.log('点击任务:', task.name, 'ID:', task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(`${task.name} ${isSelected ? '被选中' : '取消选中'}`);
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log('展开/收起任务:', task.name);
  };

  // 切换数据类型的函数
  const switchToSimpleProjects = () => {
    setTasks(initProjectTasks(3, 4));
  };

  const switchToComplexProjects = () => {
    setTasks(initComplexProjectTasks(2, 3, 2)); // 2个项目，每个项目3个任务，2个里程碑
  };

  return (
    <div className="Wrapper">
      <ViewSwitcher
        onViewModeChange={viewMode => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />

      <div style={{ marginBottom: '20px' }}>
        <h3>项目甘特图示例</h3>
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={switchToSimpleProjects}
            style={{ marginRight: '10px', padding: '8px 16px' }}
          >
            简单项目结构 (3个项目，每个4个任务)
          </button>
          <button
            onClick={switchToComplexProjects}
            style={{ padding: '8px 16px' }}
          >
            复杂项目结构 (2个项目，每个3个任务+2个里程碑)
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#666' }}>
          当前显示: {tasks.filter(t => t.type === 'project').length} 个项目,
          {tasks.filter(t => t.type === 'task').length} 个任务,
          {tasks.filter(t => t.type === 'milestone').length} 个里程碑
        </p>
      </div>

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
        locale="zh-CN"
      />
    </div>
  );
};

export default ProjectGanttExample;
