import { useState, useMemo } from 'react';
import type { Task } from '../types';
import { getMinMaxDates } from '../utils/dateUtils';

export const useGanttChart = (tasks: Task[]) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);

  const { min, max } = useMemo(() => {
    // 将 Task[] 转换为 getMinMaxDates 期望的格式
    const tasksWithDates = tasks.map(task => ({
      start: new Date(task.start),
      end: new Date(task.end),
    }));
    return getMinMaxDates(tasksWithDates);
  }, [tasks]);

  const totalDays = useMemo(() => {
    const timeDiff = max - min; // 时间戳直接相减
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }, [min, max]);

  const getTaskPosition = (task: Task) => {
    const startOffset = (task.start - min) / (1000 * 3600 * 24); // 时间戳直接相减
    const duration = (task.end - task.start) / (1000 * 3600 * 24); // 时间戳直接相减

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
