import React, {
  useState,
  type SyntheticEvent,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { ViewMode } from '../../types';
import { type GridProps } from '../grid/grid';
import type { CalendarProps } from '../calendar/calendar';
import type { TaskGanttContentProps } from './task-gantt-content';
import { TaskListHeaderDefault } from '../task-list/task-list-header';
import { TaskListTableDefault } from '../task-list/task-list-table';
import { Tooltip } from '../other/tooltip';
import { VerticalScroll } from '../other/vertical-scroll';
import { type TaskListProps, TaskList } from '../task-list/task-list';
import { TaskGantt } from './task-gantt';
import type {
  GanttEvent,
  BarTask,
  DateSetup,
  GanttProps,
  Task,
} from '../../types';
import { HorizontalScroll } from '../other/horizontal-scroll';
import {
  ganttDateRange,
  seedDates,
  convertToBarTasks,
  calculateTimeStep,
} from '../../helpers';
import styles from './gantt.module.css';
import { GanttProvider, useGanttContext } from '../../contexts/GanttContext';

/**
 * Gantt 组件的内部实现
 */
const GanttInternal: React.FunctionComponent = () => {
  const { styling, display, events, state, timeStep, tasks, TooltipContent } =
    useGanttContext();

  const {
    headerHeight,
    columnWidth,
    listCellWidth,
    rowHeight,
    ganttHeight,
    barCornerRadius,
    handleWidth,
    fontFamily,
    fontSize,
    barFill,
    barProgressColor,
    barProgressSelectedColor,
    barBackgroundColor,
    barBackgroundSelectedColor,
    milestoneBackgroundColor,
    milestoneBackgroundSelectedColor,
    arrowColor,
    arrowIndent,
    todayColor,
    showProjectSegmentProgress,
    showSubTask,
  } = styling;

  const { viewMode, viewDate, preStepsCount, locale, rtl, calendarRange } =
    display;
  const {
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
    onSelect,
    onExpanderClick,
  } = events;
  const { selectedTask, ganttEvent, setSelectedTask, setGanttEvent } = state;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [dateSetup, setDateSetup] = useState<DateSetup>(() => {
    // 优先使用外部传入的 calendarRange，如果没有则基于任务计算
    let startDate: number, endDate: number;
    if (calendarRange && calendarRange[0] && calendarRange[1]) {
      [startDate, endDate] = calendarRange;
    } else {
      [startDate, endDate] = ganttDateRange(
        tasks,
        viewMode,
        preStepsCount,
        calendarRange
      );
    }
    return { viewMode, dates: seedDates(startDate, endDate, viewMode) };
  });
  const [currentViewDate, setCurrentViewDate] = useState<number | undefined>(
    undefined
  );

  const [taskListWidth, setTaskListWidth] = useState(0);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);
  const [svgContainerHeight, setSvgContainerHeight] = useState(ganttHeight);
  const [barTasks, setBarTasks] = useState<BarTask[]>([]);
  const taskHeight = useMemo(
    () => (rowHeight * barFill) / 100,
    [rowHeight, barFill]
  );
  const [failedTask, setFailedTask] = useState<BarTask | null>(null);

  const svgWidth = dateSetup.dates.length * columnWidth;
  const ganttFullHeight = barTasks.length * rowHeight;

  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(-1);
  const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false);

  // task change events
  useEffect(() => {
    // 保持原始任务顺序，不进行排序
    const filteredTasks = tasks;

    // 优先使用外部传入的 calendarRange，如果没有则基于任务计算
    let startDate: number, endDate: number;
    if (calendarRange && calendarRange[0] && calendarRange[1]) {
      [startDate, endDate] = calendarRange;
    } else {
      [startDate, endDate] = ganttDateRange(
        filteredTasks,
        viewMode,
        preStepsCount,
        calendarRange
      );
    }
    let newDates = seedDates(startDate, endDate, viewMode);
    if (rtl) {
      newDates = newDates.reverse();
      if (scrollX === -1) {
        setScrollX(newDates.length * columnWidth);
      }
    }
    setDateSetup({ dates: newDates, viewMode });
    setBarTasks(
      convertToBarTasks(
        filteredTasks,
        newDates,
        columnWidth,
        rowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        barProgressColor,
        barProgressSelectedColor,
        barBackgroundColor,
        barBackgroundSelectedColor,
        milestoneBackgroundColor,
        milestoneBackgroundSelectedColor,
        showSubTask,
        calendarRange
      )
    );
  }, [
    tasks,
    viewMode,
    preStepsCount,
    calendarRange,
    rowHeight,
    barCornerRadius,
    columnWidth,
    taskHeight,
    handleWidth,
    barProgressColor,
    barProgressSelectedColor,
    barBackgroundColor,
    barBackgroundSelectedColor,
    milestoneBackgroundColor,
    milestoneBackgroundSelectedColor,
    rtl,
    scrollX,
    showSubTask,
  ]);

  useEffect(() => {
    if (
      viewMode === dateSetup.viewMode &&
      ((viewDate && !currentViewDate) ||
        (viewDate && currentViewDate?.valueOf() !== viewDate.valueOf()))
    ) {
      const dates = dateSetup.dates;
      const index = dates.findIndex(
        (d, i) =>
          viewDate.valueOf() >= d.valueOf() &&
          i + 1 !== dates.length &&
          viewDate.valueOf() < dates[i + 1].valueOf()
      );
      if (index === -1) {
        return;
      }
      setCurrentViewDate(viewDate);
      setScrollX(columnWidth * index);
    }
  }, [
    viewDate,
    columnWidth,
    dateSetup.dates,
    dateSetup.viewMode,
    viewMode,
    currentViewDate,
    setCurrentViewDate,
  ]);

  useEffect(() => {
    const { changedTask, action } = ganttEvent;
    if (changedTask) {
      if (action === 'delete') {
        setGanttEvent({ action: '' });
        setBarTasks(barTasks.filter(t => t.id !== changedTask.id));
      } else if (
        action === 'move' ||
        action === 'end' ||
        action === 'start' ||
        action === 'progress'
      ) {
        const prevStateTask = barTasks.find(t => t.id === changedTask.id);
        if (
          prevStateTask &&
          (prevStateTask.start !== changedTask.start ||
            prevStateTask.end !== changedTask.end ||
            prevStateTask.progress !== changedTask.progress)
        ) {
          // actions for change
          const newTaskList = barTasks.map(t =>
            t.id === changedTask.id ? changedTask : t
          );
          setBarTasks(newTaskList);
        }
      }
    }
  }, [ganttEvent, barTasks, setGanttEvent]);

  useEffect(() => {
    if (failedTask) {
      setBarTasks(barTasks.map(t => (t.id !== failedTask.id ? t : failedTask)));
      setFailedTask(null);
    }
  }, [failedTask, barTasks]);

  useEffect(() => {
    if (!listCellWidth) {
      setTaskListWidth(0);
    }
    if (taskListRef.current) {
      setTaskListWidth(taskListRef.current.offsetWidth);
    }
  }, [taskListRef, listCellWidth]);

  useEffect(() => {
    if (wrapperRef.current) {
      setSvgContainerWidth(wrapperRef.current.offsetWidth - taskListWidth);
    }
  }, [wrapperRef, taskListWidth]);

  useEffect(() => {
    if (ganttHeight) {
      setSvgContainerHeight(ganttHeight + headerHeight);
    } else {
      setSvgContainerHeight(tasks.length * rowHeight + headerHeight);
    }
  }, [ganttHeight, tasks, headerHeight, rowHeight]);

  // scroll events
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.shiftKey || event.deltaX) {
        const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
        let newScrollX = scrollX + scrollMove;
        if (newScrollX < 0) {
          newScrollX = 0;
        } else if (newScrollX > svgWidth) {
          newScrollX = svgWidth;
        }
        setScrollX(newScrollX);
        event.preventDefault();
      } else if (ganttHeight) {
        let newScrollY = scrollY + event.deltaY;
        if (newScrollY < 0) {
          newScrollY = 0;
        } else if (newScrollY > ganttFullHeight - ganttHeight) {
          newScrollY = ganttFullHeight - ganttHeight;
        }
        if (newScrollY !== scrollY) {
          setScrollY(newScrollY);
          event.preventDefault();
        }
      }

      setIgnoreScrollEvent(true);
    };

    // subscribe if scroll is necessary
    wrapperRef.current?.addEventListener('wheel', handleWheel, {
      passive: false,
    });
    return () => {
      wrapperRef.current?.removeEventListener('wheel', handleWheel);
    };
  }, [
    wrapperRef,
    scrollY,
    scrollX,
    ganttHeight,
    svgWidth,
    rtl,
    ganttFullHeight,
  ]);

  const handleScrollY = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent) {
      setScrollY(event.currentTarget.scrollTop);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  const handleScrollX = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollX !== event.currentTarget.scrollLeft && !ignoreScrollEvent) {
      setScrollX(event.currentTarget.scrollLeft);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  /**
   * Handles arrow keys events and transform it to new scroll
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    let newScrollY = scrollY;
    let newScrollX = scrollX;
    let isX = true;
    switch (event.key) {
      case 'Down': // IE/Edge specific value
      case 'ArrowDown':
        newScrollY += rowHeight;
        isX = false;
        break;
      case 'Up': // IE/Edge specific value
      case 'ArrowUp':
        newScrollY -= rowHeight;
        isX = false;
        break;
      case 'Left':
      case 'ArrowLeft':
        newScrollX -= columnWidth;
        break;
      case 'Right': // IE/Edge specific value
      case 'ArrowRight':
        newScrollX += columnWidth;
        break;
    }
    if (isX) {
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }
      setScrollX(newScrollX);
    } else {
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - ganttHeight) {
        newScrollY = ganttFullHeight - ganttHeight;
      }
      setScrollY(newScrollY);
    }
    setIgnoreScrollEvent(true);
  };

  /**
   * Task select event
   */
  const handleSelectedTask = (taskId: string) => {
    const newSelectedTask = barTasks.find(t => t.id === taskId);
    const oldSelectedTask = barTasks.find(
      t => !!selectedTask && t.id === selectedTask.id
    );
    if (onSelect) {
      if (oldSelectedTask) {
        onSelect(oldSelectedTask, false);
      }
      if (newSelectedTask) {
        onSelect(newSelectedTask, true);
      }
    }
    setSelectedTask(newSelectedTask);
  };

  const handleExpanderClick = (task: Task) => {
    if (onExpanderClick && task.hideChildren !== undefined) {
      onExpanderClick({ ...task, hideChildren: !task.hideChildren });
    }
  };

  const gridProps: GridProps = {
    columnWidth,
    svgWidth,
    tasks: barTasks,
    rowHeight,
    dates: dateSetup.dates,
    todayColor,
    rtl,
  };

  const calendarProps: CalendarProps = {
    dateSetup,
    locale,
    viewMode,
    headerHeight,
    columnWidth,
    fontFamily,
    fontSize,
    rtl,
  };

  const barProps: TaskGanttContentProps = {
    tasks: barTasks,
    dates: dateSetup.dates,
    ganttEvent,
    selectedTask,
    rowHeight,
    taskHeight,
    columnWidth,
    arrowColor,
    timeStep,
    fontFamily,
    fontSize,
    arrowIndent,
    svgWidth,
    rtl,
    setGanttEvent,
    setFailedTask,
    setSelectedTask: handleSelectedTask,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
    showProjectSegmentProgress,
  };

  const tableProps: TaskListProps = {
    scrollY,
    selectedTask,
    setSelectedTask: handleSelectedTask,
    onExpanderClick: handleExpanderClick,
    taskListRef,
    horizontalContainerClass: styles.horizontalContainer,
  };

  return (
    <div>
      <div
        className={styles.wrapper}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={wrapperRef}
      >
        {listCellWidth && <TaskList {...tableProps} />}
        <TaskGantt
          gridProps={gridProps}
          calendarProps={calendarProps}
          barProps={barProps}
          ganttHeight={ganttHeight}
          scrollY={scrollY}
          scrollX={scrollX}
        />
        {ganttEvent.changedTask && (
          <Tooltip
            arrowIndent={arrowIndent}
            rowHeight={rowHeight}
            svgContainerHeight={svgContainerHeight}
            svgContainerWidth={svgContainerWidth}
            fontFamily={fontFamily}
            fontSize={fontSize}
            scrollX={scrollX}
            scrollY={scrollY}
            task={ganttEvent.changedTask}
            headerHeight={headerHeight}
            taskListWidth={taskListWidth}
            TooltipContent={TooltipContent}
            rtl={rtl}
            svgWidth={svgWidth}
          />
        )}
        <VerticalScroll
          ganttFullHeight={ganttFullHeight}
          ganttHeight={ganttHeight}
          headerHeight={headerHeight}
          scroll={scrollY}
          onScroll={handleScrollY}
          rtl={rtl}
        />
      </div>
      <HorizontalScroll
        svgWidth={svgWidth}
        taskListWidth={taskListWidth}
        scroll={scrollX}
        rtl={rtl}
        onScroll={handleScrollX}
      />
    </div>
  );
};

/**
 * Gantt 组件的主入口
 */
export const Gantt: React.FunctionComponent<GanttProps> = props => {
  const {
    tasks,
    headerHeight = 50,
    columnWidth = 60,
    columns,
    listCellWidth = '155px',
    rowHeight = 50,
    ganttHeight = 0,
    viewMode = ViewMode.Day,
    preStepsCount = 1,
    locale = 'en-GB',
    barFill = 60,
    barCornerRadius = 3,
    barProgressColor = '#a3a3ff',
    barProgressSelectedColor = '#8282f5',
    barBackgroundColor = '#b8c2cc',
    barBackgroundSelectedColor = '#aeb8c2',
    milestoneBackgroundColor = '#f1c453',
    milestoneBackgroundSelectedColor = '#f29e4c',
    rtl = false,
    handleWidth = 8,
    arrowColor = 'grey',
    fontFamily,
    fontSize = '14px',
    arrowIndent = 20,
    todayColor = 'rgba(252, 248, 227, 0.5)',
    showProjectSegmentProgress = false,
    showSubTask = false,
    isDateChangeable,
    readonly = false,
    viewDate,
    calendarRange,
    TooltipContent,
    TaskListHeader = TaskListHeaderDefault,
    TaskListTable = TaskListTableDefault,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
    onSelect,
    onExpanderClick,
    onHierarchyChange,
  } = props;
  const timeStep = calculateTimeStep(viewMode);
  const [selectedTask, setSelectedTask] = useState<BarTask>();
  const [ganttEvent, setGanttEvent] = useState<GanttEvent>({
    action: '',
  });

  const contextValue = {
    styling: {
      headerHeight,
      columnWidth,
      columns,
      listCellWidth,
      rowHeight,
      ganttHeight,
      barCornerRadius,
      handleWidth,
      fontFamily,
      fontSize,
      barFill,
      barProgressColor,
      barProgressSelectedColor,
      barBackgroundColor,
      barBackgroundSelectedColor,
      milestoneBackgroundColor,
      milestoneBackgroundSelectedColor,
      arrowColor,
      arrowIndent,
      todayColor,
      showProjectSegmentProgress,
      showSubTask,
    },
    display: {
      viewMode,
      viewDate,
      preStepsCount,
      locale,
      rtl,
      calendarRange,
    },
    events: {
      onDateChange,
      onProgressChange,
      onDoubleClick,
      onClick,
      onDelete,
      onSelect,
      onExpanderClick,
      onHierarchyChange,
    },
    state: {
      selectedTask,
      ganttEvent,
      setSelectedTask,
      setGanttEvent,
    },
    timeStep,
    tasks,
    isDateChangeable,
    readonly,
    TooltipContent,
    TaskListHeader,
    TaskListTable,
  };

  return (
    <GanttProvider value={contextValue}>
      <GanttInternal />
    </GanttProvider>
  );
};
