import { type Task, ViewMode } from '../types';

type DateHelperScales =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

const intlDTCache: Record<string, Intl.DateTimeFormat> = {};
export const getCachedDateTimeFormat = (
  locString: string | string[],
  opts: Intl.DateTimeFormatOptions = {}
): Intl.DateTimeFormat => {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache[key];
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }
  return dtf;
};

/**
 * 向时间戳添加指定的时间量
 * @param timestamp 时间戳（毫秒）
 * @param quantity 要添加的数量
 * @param scale 时间单位
 * @returns 新的时间戳
 */
export const addToDate = (
  timestamp: number,
  quantity: number,
  scale: DateHelperScales
): number => {
  const date = new Date(timestamp);
  const newDate = new Date(
    date.getFullYear() + (scale === 'year' ? quantity : 0),
    date.getMonth() + (scale === 'month' ? quantity : 0),
    date.getDate() + (scale === 'day' ? quantity : 0),
    date.getHours() + (scale === 'hour' ? quantity : 0),
    date.getMinutes() + (scale === 'minute' ? quantity : 0),
    date.getSeconds() + (scale === 'second' ? quantity : 0),
    date.getMilliseconds() + (scale === 'millisecond' ? quantity : 0)
  );
  return newDate.getTime();
};

/**
 * 获取时间戳在指定时间单位的开始时间
 * @param timestamp 时间戳（毫秒）
 * @param scale 时间单位
 * @returns 新的时间戳
 */
export const startOfDate = (
  timestamp: number,
  scale: DateHelperScales
): number => {
  const date = new Date(timestamp);
  const scores = [
    'millisecond',
    'second',
    'minute',
    'hour',
    'day',
    'month',
    'year',
  ];

  const shouldReset = (_scale: DateHelperScales) => {
    const maxScore = scores.indexOf(scale);
    return scores.indexOf(_scale) <= maxScore;
  };
  const newDate = new Date(
    date.getFullYear(),
    shouldReset('year') ? 0 : date.getMonth(),
    shouldReset('month') ? 1 : date.getDate(),
    shouldReset('day') ? 0 : date.getHours(),
    shouldReset('hour') ? 0 : date.getMinutes(),
    shouldReset('minute') ? 0 : date.getSeconds(),
    shouldReset('second') ? 0 : date.getMilliseconds()
  );
  return newDate.getTime();
};

/**
 * 计算甘特图的日期范围
 * @param tasks 任务列表
 * @param viewMode 视图模式
 * @param preStepsCount 前置步骤数量
 * @param calendarRange 可选的日历范围（时间戳数组）
 * @returns 日期范围（时间戳数组）
 */
export const ganttDateRange = (
  tasks: Task[],
  viewMode: ViewMode,
  preStepsCount: number,
  calendarRange?: [number, number]
): [number, number] => {
  let newStartDate: number;
  let newEndDate: number;

  // 优先使用外部传入的 calendarRange
  if (calendarRange && calendarRange[0] && calendarRange[1]) {
    [newStartDate, newEndDate] = calendarRange;
  } else {
    // 如果没有 calendarRange，则从任务中计算
    newStartDate = tasks[0].start;
    newEndDate = tasks[0].start;
    for (const task of tasks) {
      if (task.start < newStartDate) {
        newStartDate = task.start;
      }
      if (task.end > newEndDate) {
        newEndDate = task.end;
      }
    }
  }
  switch (viewMode) {
    case ViewMode.Year:
      newStartDate = addToDate(newStartDate, -1, 'year');
      newStartDate = startOfDate(newStartDate, 'year');
      newEndDate = addToDate(newEndDate, 1, 'year');
      newEndDate = startOfDate(newEndDate, 'year');
      break;
    case ViewMode.QuarterYear:
      newStartDate = addToDate(newStartDate, -3, 'month');
      newStartDate = startOfDate(newStartDate, 'month');
      newEndDate = addToDate(newEndDate, 3, 'year');
      newEndDate = startOfDate(newEndDate, 'year');
      break;
    case ViewMode.Month:
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'month');
      newStartDate = startOfDate(newStartDate, 'month');
      newEndDate = addToDate(newEndDate, 1, 'year');
      newEndDate = startOfDate(newEndDate, 'year');
      break;
    case ViewMode.Week:
      newStartDate = startOfDate(newStartDate, 'day');
      newStartDate = addToDate(
        getMonday(newStartDate),
        -7 * preStepsCount,
        'day'
      );
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 1.5, 'month');
      break;
    case ViewMode.Day:
      newStartDate = startOfDate(newStartDate, 'day');
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'day');
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 19, 'day');
      break;
    case ViewMode.QuarterDay:
      newStartDate = startOfDate(newStartDate, 'day');
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'day');
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 66, 'hour'); // 24(1 day)*3 - 6
      break;
    case ViewMode.HalfDay:
      newStartDate = startOfDate(newStartDate, 'day');
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'day');
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 108, 'hour'); // 24(1 day)*5 - 12
      break;
    case ViewMode.HalfHour:
      newStartDate = startOfDate(newStartDate, 'hour');
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'hour');
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 1, 'day');
      break;
    case ViewMode.Hour:
      newStartDate = startOfDate(newStartDate, 'hour');
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'hour');
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 1, 'day');
      break;
  }
  return [newStartDate, newEndDate];
};

/**
 * 生成日期序列
 * @param startDate 开始时间戳
 * @param endDate 结束时间戳
 * @param viewMode 视图模式
 * @returns 时间戳数组
 */
export const seedDates = (
  startDate: number,
  endDate: number,
  viewMode: ViewMode
): number[] => {
  let currentDate: number = startDate;
  const dates: number[] = [currentDate];
  while (currentDate < endDate) {
    switch (viewMode) {
      case ViewMode.Year:
        currentDate = addToDate(currentDate, 1, 'year');
        break;
      case ViewMode.QuarterYear:
        currentDate = addToDate(currentDate, 3, 'month');
        break;
      case ViewMode.Month:
        currentDate = addToDate(currentDate, 1, 'month');
        break;
      case ViewMode.Week:
        currentDate = addToDate(currentDate, 7, 'day');
        break;
      case ViewMode.Day:
        currentDate = addToDate(currentDate, 1, 'day');
        break;
      case ViewMode.HalfDay:
        currentDate = addToDate(currentDate, 12, 'hour');
        break;
      case ViewMode.QuarterDay:
        currentDate = addToDate(currentDate, 6, 'hour');
        break;
      case ViewMode.HalfHour:
        currentDate = addToDate(currentDate, 30, 'minute');
        break;
      case ViewMode.Hour:
        currentDate = addToDate(currentDate, 1, 'hour');
        break;
    }
    dates.push(currentDate);
  }
  return dates;
};

/**
 * 获取本地化的月份名称
 * @param timestamp 时间戳（毫秒）
 * @param locale 语言环境
 * @returns 本地化的月份名称
 */
export const getLocaleMonth = (timestamp: number, locale: string): string => {
  const date = new Date(timestamp);
  let bottomValue = getCachedDateTimeFormat(locale, {
    month: 'long',
  }).format(date);
  bottomValue = bottomValue.replace(
    bottomValue[0],
    bottomValue[0].toLocaleUpperCase()
  );
  return bottomValue;
};

/**
 * 获取本地化的星期名称
 * @param timestamp 时间戳（毫秒）
 * @param locale 语言环境
 * @param format 格式类型
 * @returns 本地化的星期名称
 */
export const getLocalDayOfWeek = (
  timestamp: number,
  locale: string,
  format?: 'long' | 'short' | 'narrow' | undefined
): string => {
  const date = new Date(timestamp);
  let bottomValue = getCachedDateTimeFormat(locale, {
    weekday: format,
  }).format(date);
  bottomValue = bottomValue.replace(
    bottomValue[0],
    bottomValue[0].toLocaleUpperCase()
  );
  return bottomValue;
};

/**
 * 获取当前周的周一
 * @param timestamp 时间戳（毫秒）
 * @returns 周一的时间戳
 */
const getMonday = (timestamp: number): number => {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const mondayDate = new Date(date);
  mondayDate.setDate(diff);
  return mondayDate.getTime();
};

/**
 * 获取ISO 8601标准的周数
 * @param timestamp 时间戳（毫秒）
 * @returns 周数字符串
 */
export const getWeekNumberISO8601 = (timestamp: number): string => {
  const tmpDate = new Date(timestamp);
  const dayNumber = (tmpDate.getDay() + 6) % 7;
  tmpDate.setDate(tmpDate.getDate() - dayNumber + 3);
  const firstThursday = tmpDate.valueOf();
  tmpDate.setMonth(0, 1);
  if (tmpDate.getDay() !== 4) {
    tmpDate.setMonth(0, 1 + ((4 - tmpDate.getDay() + 7) % 7));
  }
  const weekNumber = (
    1 + Math.ceil((firstThursday - tmpDate.valueOf()) / 604800000)
  ).toString();

  if (weekNumber.length === 1) {
    return `0${weekNumber}`;
  } else {
    return weekNumber;
  }
};

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};
