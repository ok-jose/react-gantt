export enum ViewMode {
  Hour = 'Hour',
  HalfHour = 'Half Hour',
  QuarterDay = 'Quarter Day',
  HalfDay = 'Half Day',
  Day = 'Day',
  /** ISO-8601 week */
  Week = 'Week',
  Month = 'Month',
  QuarterYear = 'QuarterYear',
  Year = 'Year',
}
export type TaskType = 'task' | 'milestone' | 'project';
export type Task = {
  id: string;
  type: TaskType;
  name: string;
  start: Date;
  end: Date;
  /**
   * From 0 to 100
   */
  progress?: number;
  styles?: {
    backgroundColor?: string;
    backgroundSelectedColor?: string;
    progressColor?: string;
    progressSelectedColor?: string;
  };
  isDisabled?: boolean;
  dependencies?: string[];
  hideChildren?: boolean;
  children?: Task[];
  /**
   * 所属项目ID（向后兼容，推荐使用 children 结构）
   */
  project?: string;
  /**
   * 显示顺序
   */
  displayOrder?: number;
};

export interface EventOption {
  /**
   * Time step value for date changes.
   */
  timeStep?: number;
  /**
   * Invokes on bar select on unselect.
   */
  onSelect?: (task: Task, isSelected: boolean) => void;
  /**
   * Invokes on bar double click.
   */
  onDoubleClick?: (task: Task) => void;
  /**
   * Invokes on bar click.
   */
  onClick?: (task: Task) => void;
  /**
   * Invokes on end and start time change. Chart undoes operation if method return false or error.
   */
  onDateChange?: (
    changedTask: Task,
    allTasks: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on progress change. Chart undoes operation if method return false or error.
   */
  onProgressChange?: (
    task: Task,
    allTasks: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on delete selected task. Chart undoes operation if method return false or error.
   */
  onDelete?: (task: Task) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on expander on task list
   */
  onExpanderClick?: (task: Task) => void;
}

export interface DisplayOption {
  viewMode?: ViewMode;
  viewDate?: Date;
  preStepsCount?: number;
  /**
   * Specifies the month name language. Able formats: ISO 639-2, Java Locale
   */
  locale?: string;
  rtl?: boolean;
  /**
   * 可选的日历范围，如果不提供则基于任务时间自动计算
   */
  calendarRange?: [Date, Date];
}

export interface StylingOption {
  headerHeight?: number;
  columnWidth?: number;
  listCellWidth?: string;
  rowHeight?: number;
  ganttHeight?: number;
  barCornerRadius?: number;
  handleWidth?: number;
  fontFamily?: string;
  fontSize?: string;
  /**
   * How many of row width can be taken by task.
   * From 0 to 100
   */
  barFill?: number;
  barProgressColor?: string;
  barProgressSelectedColor?: string;
  barBackgroundColor?: string;
  barBackgroundSelectedColor?: string;
  projectProgressColor?: string;
  projectProgressSelectedColor?: string;
  projectBackgroundColor?: string;
  projectBackgroundSelectedColor?: string;
  milestoneBackgroundColor?: string;
  milestoneBackgroundSelectedColor?: string;
  arrowColor?: string;
  arrowIndent?: number;
  todayColor?: string;
  /**
   * 是否显示项目分段进度条
   * 默认为 true，设置为 false 时只显示子任务段，不显示进度条
   */
  showProjectSegmentProgress?: boolean;
  /**
   * 是否显示子任务，左侧 table 不展示嵌套表，右边 gantt 不展示子任务行
   * 默认为 false，设置为 true 时显示子任务
   */
  showSubTask?: boolean;
  isDateChangeable?: boolean | ['start', 'end', 'move'];
  TooltipContent?: React.FC<{
    task: Task;
    fontSize: string;
    fontFamily: string;
  }>;
  TaskListHeader?: React.FC<{
    headerHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    columns?: TableColumn[];
  }>;
  TaskListTable?: React.FC<{
    rowHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    locale: string;
    tasks: Task[];
    selectedTaskId: string;
    /**
     * Sets selected task by id
     */
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: Task) => void;
    showSubTask?: boolean;
    columns?: TableColumn[];
  }>;
  /**
   * 表格列配置
   */
  columns?: TableColumn[];
}

export interface GanttProps extends EventOption, DisplayOption, StylingOption {
  tasks: Task[];
}

/**
 * 表格列配置接口
 */
export interface TableColumn {
  /** 列的唯一标识符 */
  key: string;
  /** 列标题 */
  title: string;
  /** 列宽度，可以是固定像素值或百分比 */
  width?: string;
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 列的对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 自定义渲染函数 */
  render?: (task: Task, locale: string) => React.ReactNode;
  /** 是否显示此列 */
  visible?: boolean;
}

/**
 * 默认列配置
 */
export const DEFAULT_COLUMNS: TableColumn[] = [
  {
    key: 'name',
    title: 'Name',
    width: '40%',
    align: 'left',
    visible: true,
  },
  {
    key: 'start',
    title: 'From',
    width: '30%',
    align: 'left',
    visible: true,
    render: (task: Task, locale: string) => {
      const dateTimeOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return task.start.toLocaleDateString(locale, dateTimeOptions);
    },
  },
  {
    key: 'end',
    title: 'To',
    width: '30%',
    align: 'left',
    visible: true,
    render: (task: Task, locale: string) => {
      const dateTimeOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return task.end.toLocaleDateString(locale, dateTimeOptions);
    },
  },
];
