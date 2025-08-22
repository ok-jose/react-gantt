import React, { useMemo } from 'react';
import styles from './task-list-table.module.css';
import type { Task, BarTask } from '../../types';

const localeDateStringCache: any = {};
const toLocaleDateStringFactory =
  (locale: string) =>
  (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = date.toString();
    let lds = localeDateStringCache[key];
    if (!lds) {
      lds = date.toLocaleDateString(locale, dateTimeOptions);
      localeDateStringCache[key] = lds;
    }
    return lds;
  };
const dateTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

interface TaskRowProps {
  task: Task;
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  level: number;
  onExpanderClick: (task: Task) => void;
  toLocaleDateString: (
    date: Date,
    options: Intl.DateTimeFormatOptions
  ) => string;
}

/**
 * 单个任务行组件
 */
const TaskRow: React.FC<TaskRowProps> = ({
  task,
  rowHeight,
  rowWidth,
  fontFamily,
  fontSize,
  locale,
  level,
  onExpanderClick,
  toLocaleDateString,
}) => {
  const isProject = task.type === 'project';
  const hasChildren = task.hideChildren !== undefined;

  let expanderSymbol = '';
  if (hasChildren) {
    if (task.hideChildren === false) {
      expanderSymbol = '▼';
    } else if (task.hideChildren === true) {
      expanderSymbol = '▶';
    }
  }

  return (
    <div
      className={`${styles.taskListTableRow} ${
        isProject ? styles.projectRow : styles.taskRow
      }`}
      style={{
        height: rowHeight,
        paddingLeft: `${level * 20}px`, // 缩进层级
      }}
    >
      <div
        className={styles.taskListCell}
        style={{
          minWidth: rowWidth,
          maxWidth: rowWidth,
        }}
        title={task.name}
      >
        <div className={styles.taskListNameWrapper}>
          <div
            className={
              expanderSymbol
                ? styles.taskListExpander
                : styles.taskListEmptyExpander
            }
            onClick={() => onExpanderClick(task)}
          >
            {expanderSymbol}
          </div>
          <div className={isProject ? styles.projectName : styles.taskName}>
            {task.name}
          </div>
        </div>
      </div>
      <div
        className={styles.taskListCell}
        style={{
          minWidth: rowWidth,
          maxWidth: rowWidth,
        }}
      >
        &nbsp;{toLocaleDateString(task.start, dateTimeOptions)}
      </div>
      <div
        className={styles.taskListCell}
        style={{
          minWidth: rowWidth,
          maxWidth: rowWidth,
        }}
      >
        &nbsp;{toLocaleDateString(task.end, dateTimeOptions)}
      </div>
    </div>
  );
};

/**
 * 递归渲染任务树
 */
const renderTaskTree = (
  tasks: Task[],
  level: number,
  props: Omit<TaskRowProps, 'task' | 'level'>,
  getTaskChildren?: (taskId: string) => Task[]
): React.ReactNode[] => {
  const result: React.ReactNode[] = [];

  tasks.forEach(task => {
    // 渲染当前任务
    result.push(
      <TaskRow key={`${task.id}row`} task={task} level={level} {...props} />
    );

    // 如果有子任务且未隐藏，递归渲染
    if (task.hideChildren === false && getTaskChildren) {
      const children = getTaskChildren(task.id);
      if (children && children.length > 0) {
        const childNodes = renderTaskTree(
          children,
          level + 1,
          props,
          getTaskChildren
        );
        result.push(...childNodes);
      }
    }
  });

  return result;
};

export const TaskListTableDefault: React.FC<{
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
  /**
   * 获取任务的子任务
   */
  getTaskChildren?: (taskId: string) => Task[];
}> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  locale,
  onExpanderClick,
  getTaskChildren,
}) => {
  const toLocaleDateString = useMemo(
    () => toLocaleDateStringFactory(locale),
    [locale]
  );

  // 渲染任务树
  const taskTree = renderTaskTree(
    tasks,
    0,
    {
      rowHeight,
      rowWidth,
      fontFamily,
      fontSize,
      locale,
      onExpanderClick,
      toLocaleDateString,
    },
    getTaskChildren
  );

  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {taskTree}
    </div>
  );
};
