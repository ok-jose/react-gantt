import React from 'react';
import styles from './task-list-header.module.css';
import type { TableColumn } from '../../types';
import { DEFAULT_COLUMNS } from '../../types';

export const TaskListHeaderDefault: React.FC<{
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  columns?: TableColumn[];
}> = ({
  headerHeight,
  fontFamily,
  fontSize,
  rowWidth,
  columns = DEFAULT_COLUMNS,
}) => {
  // 过滤可见的列
  const visibleColumns = columns.filter(col => col.visible !== false);

  return (
    <div
      className={styles.ganttTable}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      <div
        className={styles.ganttTable_Header}
        style={{
          height: headerHeight - 2,
        }}
      >
        {visibleColumns.map(column => (
          <div
            key={column.key}
            className={styles.ganttTable_HeaderItem}
            style={{
              minWidth: column.width || rowWidth,
              maxWidth: column.width || rowWidth,
              textAlign: column.align || 'left',
            }}
          >
            &nbsp;{column.title}
          </div>
        ))}
      </div>
    </div>
  );
};
