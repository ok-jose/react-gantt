import { ViewMode } from '../types';

/**
 * 计算两个时间戳之间的天数
 * @param start 开始时间戳（毫秒）
 * @param end 结束时间戳（毫秒）
 * @returns 天数
 */
export const getDaysBetween = (start: number, end: number): number => {
  const timeDiff = end - start;
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * 计算两个时间戳之间的周数
 * @param start 开始时间戳（毫秒）
 * @param end 结束时间戳（毫秒）
 * @returns 周数
 */
export const getWeeksBetween = (start: number, end: number): number => {
  const timeDiff = end - start;
  return Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
};

/**
 * 计算两个时间戳之间的月数
 * @param start 开始时间戳（毫秒）
 * @param end 结束时间戳（毫秒）
 * @returns 月数
 */
export const getMonthsBetween = (start: number, end: number): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  );
};

/**
 * 格式化时间戳为日期字符串
 * @param timestamp 时间戳（毫秒）
 * @param format 格式类型
 * @returns 格式化的日期字符串
 */
export const formatDate = (
  timestamp: number,
  format: 'short' | 'long' = 'short'
): string => {
  const date = new Date(timestamp);
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * 获取任务列表中的最小和最大时间戳
 * @param tasks 任务列表
 * @returns 包含最小和最大时间戳的对象
 */
export const getMinMaxDates = (
  tasks: Array<{ start: Date; end: Date }>
): {
  min: number;
  max: number;
} => {
  if (tasks.length === 0) {
    const now = Date.now();
    return { min: now, max: now };
  }

  const timestamps = tasks.flatMap(task => [
    task.start.getTime(),
    task.end.getTime(),
  ]);
  const min = Math.min(...timestamps);
  const max = Math.max(...timestamps);

  return { min, max };
};

/**
 * 根据viewMode格式化时间显示
 * @param start 开始时间戳
 * @param end 结束时间戳
 * @param viewMode 视图模式
 * @returns 格式化后的时间字符串
 */
export const formatTimeByViewMode = (
  start: number,
  end: number,
  viewMode: ViewMode
): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // 对于Hour和HalfHour模式，只显示时间
  if (viewMode === ViewMode.Hour || viewMode === ViewMode.HalfHour) {
    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    return `${formatTime(startDate)} ~ ${formatTime(endDate)}`;
  }

  // 其他模式显示日期
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};
