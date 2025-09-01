import React, { useMemo } from 'react';
import styles from './task-list-table.module.css';
import type { Task, TableColumn } from '../../types';
import { DEFAULT_COLUMNS } from '../../types';

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
  showSubTask?: boolean;
  columns?: TableColumn[];
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
  showSubTask = false,
  columns = DEFAULT_COLUMNS,
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
    if (showSubTask) {
      if (task.hideChildren === false) {
        expanderSymbol = '▼';
      } else if (task.hideChildren === true) {
        expanderSymbol = '▶';
      }
    }

    // 计算缩进
    const indent = level * 20; // 每层缩进 20px

    // 判断是否为选中状态
    const isSelected = selectedTaskId === task.id;

    // 过滤可见的列
    const visibleColumns = columns.filter(col => col.visible !== false);

    return (
      <div
        className={`${styles.taskListTableRow} ${
          isSelected ? styles.selectedRow : ''
        }`}
        style={{ height: rowHeight }}
        key={`${task.id}row`}
        onClick={() => setSelectedTask(task.id)}
      >
        {visibleColumns.map(column => (
          <div
            key={column.key}
            className={styles.taskListCell}
            style={{
              minWidth: column.width || rowWidth,
              maxWidth: column.width || rowWidth,
              textAlign: column.align || 'left',
            }}
            title={column.key === 'name' ? task.name : undefined}
          >
            {column.key === 'name' ? (
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
            ) : (
              <div>
                &nbsp;
                {column.render
                  ? column.render(task, locale)
                  : getDefaultColumnValue(task, column.key)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  /**
   * 获取默认列值
   */
  const getDefaultColumnValue = (task: Task, key: string): string => {
    switch (key) {
      case 'start':
        return toLocaleDateString(task.start, dateTimeOptions);
      case 'end':
        return toLocaleDateString(task.end, dateTimeOptions);
      case 'progress':
        return task.progress ? `${task.progress}%` : '0%';
      case 'type':
        return task.type || 'task';
      default:
        return '';
    }
  };

  /**
   * 递归渲染任务行，支持嵌套的 children 结构
   * 只有当父任务的 hideChildren 不为 true 且 showSubTask 为 true 时才显示子任务
   */
  const renderTaskRows = (
    taskList: Task[],
    level: number = 0
  ): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];

    taskList.forEach(task => {
      // 渲染当前任务行
      rows.push(renderTaskRow(task, level));

      // 如果任务有 children 且未隐藏且 showSubTask 为 true，递归渲染子任务
      if (
        task.children &&
        task.children.length > 0 &&
        task.hideChildren !== true &&
        showSubTask
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
