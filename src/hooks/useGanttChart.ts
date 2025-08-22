import { useState, useMemo } from 'react';
import type { Task } from '../types';
import { getMinMaxDates } from '../utils/dateUtils';

export const useGanttChart = (tasks: Task[]) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);

  const { min, max } = useMemo(() => {
    return getMinMaxDates(tasks);
  }, [tasks]);

  const totalDays = useMemo(() => {
    const timeDiff = max.getTime() - min.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }, [min, max]);

  const getTaskPosition = (task: Task) => {
    const startOffset =
      (task.start.getTime() - min.getTime()) / (1000 * 3600 * 24);
    const duration =
      (task.end.getTime() - task.start.getTime()) / (1000 * 3600 * 24);

    return {
      left: (startOffset / totalDays) * 100,
      width: (duration / totalDays) * 100,
    };
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskHover = (task: Task | null) => {
    setHoveredTask(task);
  };

  return {
    selectedTask,
    hoveredTask,
    minDate: min,
    maxDate: max,
    totalDays,
    getTaskPosition,
    handleTaskClick,
    handleTaskHover,
  };
};
