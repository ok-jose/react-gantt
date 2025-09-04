import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type {
  Task,
  BarTask,
  GanttEvent,
  ViewMode,
  EventOption,
  StylingOption,
} from '../types';

/**
 * Gantt 组件的上下文接口
 */
interface GanttContextValue {
  // 样式相关配置
  styling: {
    headerHeight: number;
    columnWidth: number;
    listCellWidth: string;
    rowHeight: number;
    ganttHeight: number;
    barCornerRadius: number;
    handleWidth: number;
    fontFamily: string;
    fontSize: string;
    barFill: number;
    barProgressColor: string;
    barProgressSelectedColor: string;
    barBackgroundColor: string;
    barBackgroundSelectedColor: string;
    projectProgressColor: string;
    projectProgressSelectedColor: string;
    projectBackgroundColor: string;
    projectBackgroundSelectedColor: string;
    milestoneBackgroundColor: string;
    milestoneBackgroundSelectedColor: string;
    arrowColor: string;
    arrowIndent: number;
    todayColor: string;
    showProjectSegmentProgress: boolean;
    showSubTask: boolean;
    columns?: StylingOption['columns'];
  };

  // 显示相关配置
  display: {
    viewMode: ViewMode;
    viewDate?: Date;
    preStepsCount: number;
    locale: string;
    rtl: boolean;
    calendarRange?: [Date, Date];
  };

  // 事件处理函数
  events: {
    onDateChange?: EventOption['onDateChange'];
    onProgressChange?: EventOption['onProgressChange'];
    onDoubleClick?: EventOption['onDoubleClick'];
    onClick?: EventOption['onClick'];
    onDelete?: EventOption['onDelete'];
    onSelect?: EventOption['onSelect'];
    onExpanderClick?: EventOption['onExpanderClick'];
    onHierarchyChange?: EventOption['onHierarchyChange'];
  };

  // 状态管理
  state: {
    selectedTask?: BarTask;
    ganttEvent: GanttEvent;
    setSelectedTask: (task: BarTask | undefined) => void;
    setGanttEvent: (event: GanttEvent) => void;
  };

  // 其他配置
  timeStep: number;
  tasks: Task[];
  isDateChangeable?: boolean | ['start', 'end', 'move'];
  readonly?: boolean;
  TooltipContent?: StylingOption['TooltipContent'];
  TaskListHeader?: StylingOption['TaskListHeader'];
  TaskListTable?: StylingOption['TaskListTable'];
}

/**
 * 创建 Gantt 上下文
 */
const GanttContext = createContext<GanttContextValue | undefined>(undefined);

/**
 * Gantt 上下文 Provider 的 Props
 */
interface GanttProviderProps {
  children: ReactNode;
  value: GanttContextValue;
}

/**
 * Gantt 上下文 Provider 组件
 */
export const GanttProvider: React.FC<GanttProviderProps> = ({
  children,
  value,
}) => {
  return (
    <GanttContext.Provider value={value}>{children}</GanttContext.Provider>
  );
};

/**
 * 使用 Gantt 上下文的 Hook
 * @returns Gantt 上下文值
 * @throws 如果在 Provider 外部使用会抛出错误
 */
export const useGanttContext = (): GanttContextValue => {
  const context = useContext(GanttContext);
  if (context === undefined) {
    throw new Error('useGanttContext 必须在 GanttProvider 内部使用');
  }
  return context;
};

/**
 * 使用 Gantt 样式配置的 Hook
 * @returns 样式配置对象
 */
export const useGanttStyling = () => {
  const { styling } = useGanttContext();
  return styling;
};

/**
 * 使用 Gantt 显示配置的 Hook
 * @returns 显示配置对象
 */
export const useGanttDisplay = () => {
  const { display } = useGanttContext();
  return display;
};

/**
 * 使用 Gantt 事件处理函数的 Hook
 * @returns 事件处理函数对象
 */
export const useGanttEvents = () => {
  const { events } = useGanttContext();
  return events;
};

/**
 * 使用 Gantt 状态的 Hook
 * @returns 状态管理对象
 */
export const useGanttState = () => {
  const { state } = useGanttContext();
  return state;
};

/**
 * 使用 Gantt 只读状态的 Hook
 * @returns 是否处于只读模式
 */
export const useGanttReadonly = () => {
  const { readonly = false } = useGanttContext();
  return readonly;
};
