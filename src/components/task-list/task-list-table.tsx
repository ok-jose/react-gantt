import React, { useMemo } from 'react';
import styles from './task-list-table.module.css';
import type { Task } from '../../types';

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
}> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  locale,
  selectedTaskId,
  setSelectedTask,
  onExpanderClick,
}) => {
  const toLocaleDateString = useMemo(
    () => toLocaleDateStringFactory(locale),
    [locale]
  );

  /**
   * 渲染单个任务行
   */
  const renderTaskRow = (task: Task, level: number = 0): React.ReactNode => {
    let expanderSymbol = '';
    if (task.hideChildren === false) {
      expanderSymbol = '▼';
    } else if (task.hideChildren === true) {
      expanderSymbol = '▶';
    }

    // 计算缩进
    const indent = level * 20; // 每层缩进 20px

    // 判断是否为选中状态
    const isSelected = selectedTaskId === task.id;

    return (
      <div
        className={`${styles.taskListTableRow} ${
          isSelected ? styles.selectedRow : ''
        }`}
        style={{ height: rowHeight }}
        key={`${task.id}row`}
        onClick={() => setSelectedTask(task.id)}
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
              onClick={e => {
                e.stopPropagation(); // 阻止事件冒泡，避免触发行选中
                onExpanderClick(task);
              }}
              style={{ marginLeft: `${indent}px` }}
            >
              {expanderSymbol}
            </div>
            <div>{task.name}</div>
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
   * 递归渲染任务行，支持嵌套的 children 结构
   * 只有当父任务的 hideChildren 不为 true 时才显示子任务
   */
  const renderTaskRows = (
    taskList: Task[],
    level: number = 0
  ): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];

    taskList.forEach(task => {
      // 渲染当前任务行
      rows.push(renderTaskRow(task, level));

      // 如果任务有 children 且未隐藏，递归渲染子任务
      if (
        task.children &&
        task.children.length > 0 &&
        task.hideChildren !== true
      ) {
        const childRows = renderTaskRows(task.children, level + 1);
        rows.push(...childRows);
      }
    });

    return rows;
  };

  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {renderTaskRows(tasks)}
    </div>
  );
};
