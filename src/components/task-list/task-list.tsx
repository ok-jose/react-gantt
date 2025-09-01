import React, { useEffect, useRef } from 'react';
import type { Task, BarTask } from '../../types';
import { useGanttContext } from '../../contexts/GanttContext';
import { TaskListHeaderDefault } from './task-list-header';
import { TaskListTableDefault } from './task-list-table';

export type TaskListProps = {
  scrollY: number;
  selectedTask: BarTask | undefined;
  setSelectedTask: (task: string) => void;
  onExpanderClick: (task: Task) => void;
  taskListRef: React.RefObject<HTMLDivElement | null>;
  horizontalContainerClass?: string;
};

export const TaskList: React.FC<TaskListProps> = ({
  scrollY,
  selectedTask,
  setSelectedTask,
  onExpanderClick,
  taskListRef,
  horizontalContainerClass,
}) => {
  const {
    styling,
    display,
    tasks,
    TaskListHeader = TaskListHeaderDefault,
    TaskListTable = TaskListTableDefault,
  } = useGanttContext();
  const { columns } = styling;
  const {
    headerHeight,
    fontFamily,
    fontSize,
    listCellWidth: rowWidth,
    rowHeight,
    ganttHeight,
    showSubTask,
  } = styling;
  const { locale } = display;

  const horizontalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  const headerProps = {
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth,
    columns,
  };

  const selectedTaskId = selectedTask ? selectedTask.id : '';
  const tableProps = {
    rowHeight,
    rowWidth,
    fontFamily,
    fontSize,
    tasks,
    locale,
    selectedTaskId: selectedTaskId,
    setSelectedTask,
    onExpanderClick,
    showSubTask,
    columns,
  };

  return (
    <div ref={taskListRef}>
      <div
        ref={horizontalContainerRef}
        className={horizontalContainerClass}
        style={ganttHeight ? { height: ganttHeight + 50 } : {}}
      >
        <div className="task-list-table-container">
          <TaskListHeader {...headerProps} />
          <TaskListTable {...tableProps} />
        </div>
      </div>
    </div>
  );
};
