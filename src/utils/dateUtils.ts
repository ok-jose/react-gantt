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
