import { useState, useMemo } from 'react';
import { GanttTask } from '../types';
import { getMinMaxDates } from '../utils/dateUtils';

export const useGanttChart = (tasks: GanttTask[]) => {
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [hoveredTask, setHoveredTask] = useState<GanttTask | null>(null);

  const { minDate, maxDate } = useMemo(() => {
    return getMinMaxDates(tasks);
  }, [tasks]);

  const totalDays = useMemo(() => {
    const timeDiff = maxDate.getTime() - minDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }, [minDate, maxDate]);

  const getTaskPosition = (task: GanttTask) => {
    const startOffset =
      (task.start.getTime() - minDate.getTime()) / (1000 * 3600 * 24);
    const duration =
      (task.end.getTime() - task.start.getTime()) / (1000 * 3600 * 24);

    return {
      left: (startOffset / totalDays) * 100,
      width: (duration / totalDays) * 100,
    };
  };

  const handleTaskClick = (task: GanttTask) => {
    setSelectedTask(task);
  };

  const handleTaskHover = (task: GanttTask | null) => {
    setHoveredTask(task);
  };

  return {
    selectedTask,
    hoveredTask,
    minDate,
    maxDate,
    totalDays,
    getTaskPosition,
    handleTaskClick,
    handleTaskHover,
  };
};
