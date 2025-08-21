export const getDaysBetween = (start: Date, end: Date): number => {
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const getWeeksBetween = (start: Date, end: Date): number => {
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
};

export const getMonthsBetween = (start: Date, end: Date): number => {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
};

export const formatDate = (
  date: Date,
  format: 'short' | 'long' = 'short'
): string => {
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

export const getMinMaxDates = (
  tasks: Array<{ start: Date; end: Date }>
): {
  min: Date;
  max: Date;
} => {
  if (tasks.length === 0) {
    const now = new Date();
    return { min: now, max: now };
  }

  const dates = tasks.flatMap(task => [task.start, task.end]);
  const min = new Date(Math.min(...dates.map(d => d.getTime())));
  const max = new Date(Math.max(...dates.map(d => d.getTime())));

  return { min, max };
};
