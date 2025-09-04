import React from 'react';
import { ViewMode } from '../../types';
import { TopPartOfCalendar } from './top-part-of-calendar';
import {
  getCachedDateTimeFormat,
  getDaysInMonth,
  getLocalDayOfWeek,
  getLocaleMonth,
  getWeekNumberISO8601,
} from '../../helpers';
import type { DateSetup } from '../../types/date-setup';
import styles from './calendar.module.css';
import { useGanttContext } from '../../contexts/GanttContext';

export type CalendarProps = {
  dateSetup: DateSetup;
  locale?: string;
  viewMode?: ViewMode;
  rtl?: boolean;
  headerHeight?: number;
  columnWidth?: number;
  fontFamily?: string;
  fontSize?: string;
  calendarRange?: [Date, Date];
};

export const Calendar: React.FC<CalendarProps> = ({
  dateSetup,
  locale: propLocale,
  viewMode: propViewMode,
  rtl: propRtl,
  headerHeight: propHeaderHeight,
  columnWidth: propColumnWidth,
  fontFamily: propFontFamily,
  fontSize: propFontSize,
  // calendarRange 主要用于 gantt 组件的日期范围控制，当前 calendar 组件未直接使用
}) => {
  const { styling, display } = useGanttContext();
  const {
    headerHeight: contextHeaderHeight,
    columnWidth: contextColumnWidth,
    fontFamily: contextFontFamily,
    fontSize: contextFontSize,
  } = styling;
  const {
    locale: contextLocale,
    viewMode: contextViewMode,
    rtl: contextRtl,
    // calendarRange 主要用于 gantt 组件的日期范围控制，当前 calendar 组件未直接使用
  } = display;

  // 使用 props 优先，如果没有则使用 Context 中的值
  const locale = propLocale || contextLocale;
  const viewMode = propViewMode || contextViewMode;
  const rtl = propRtl ?? contextRtl;
  const headerHeight = propHeaderHeight || contextHeaderHeight;
  const columnWidth = propColumnWidth || contextColumnWidth;
  const fontFamily = propFontFamily || contextFontFamily;
  const fontSize = propFontSize || contextFontSize;
  // 注意：calendarRange 主要用于 gantt 组件的日期范围控制
  // 当前 calendar 组件主要使用 dateSetup.dates

  const getCalendarValuesForYear = () => {
    const topValues: React.ReactNode[] = [];
    const bottomValues: React.ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    for (let i = 0; i < dateSetup.dates.length; i++) {
      const date = dateSetup.dates[i];
      const bottomValue = date.getFullYear();
      bottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );
      if (
        i === 0 ||
        date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()
      ) {
        const topValue = date.getFullYear().toString();
        let xText: number;
        if (rtl) {
          xText = (6 + i + date.getFullYear() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getFullYear()) * columnWidth;
        }
        topValues.push(
          <TopPartOfCalendar
            key={topValue}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={headerHeight}
            xText={xText}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForQuarterYear = () => {
    const topValues: React.ReactNode[] = [];
    const bottomValues: React.ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    for (let i = 0; i < dateSetup.dates.length; i++) {
      const date = dateSetup.dates[i];
      // const bottomValue = getLocaleMonth(date, locale);
      const quarter = 'Q' + Math.floor((date.getMonth() + 3) / 3);
      bottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={styles.calendarBottomText}
        >
          {quarter}
        </text>
      );
      if (
        i === 0 ||
        date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()
      ) {
        const topValue = date.getFullYear().toString();
        let xText: number;
        if (rtl) {
          xText = (6 + i + date.getMonth() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getMonth()) * columnWidth;
        }
        topValues.push(
          <TopPartOfCalendar
            key={topValue}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={Math.abs(xText)}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForMonth = () => {
    const topValues: React.ReactNode[] = [];
    const bottomValues: React.ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    for (let i = 0; i < dateSetup.dates.length; i++) {
      const date = dateSetup.dates[i];
      const bottomValue = getLocaleMonth(date, locale);
      bottomValues.push(
        <text
          key={bottomValue + date.getFullYear()}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );
      if (
        i === 0 ||
        date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()
      ) {
        const topValue = date.getFullYear().toString();
        let xText: number;
        if (rtl) {
          xText = (6 + i + date.getMonth() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getMonth()) * columnWidth;
        }
        topValues.push(
          <TopPartOfCalendar
            key={topValue}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={xText}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForWeek = () => {
    const topValues: React.ReactNode[] = [];
    const bottomValues: React.ReactNode[] = [];
    let weeksCount: number = 1;
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;
    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];
      let topValue = '';
      if (i === 0 || date.getMonth() !== dates[i - 1].getMonth()) {
        // top
        topValue = `${getLocaleMonth(date, locale)}, ${date.getFullYear()}`;
      }
      // bottom
      const bottomValue = `W${getWeekNumberISO8601(date)}`;

      bottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * (i + +rtl)}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );

      if (topValue) {
        // if last day is new month
        if (i !== dates.length - 1) {
          topValues.push(
            <TopPartOfCalendar
              key={topValue}
              value={topValue}
              x1Line={columnWidth * i + weeksCount * columnWidth}
              y1Line={0}
              y2Line={topDefaultHeight}
              xText={columnWidth * i + columnWidth * weeksCount * 0.5}
              yText={topDefaultHeight * 0.9}
            />
          );
        }
        weeksCount = 0;
      }
      weeksCount++;
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForDay = () => {
    const topValues: React.ReactNode[] = [];
    const bottomValues: React.ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = `${getLocalDayOfWeek(date, locale, 'short')}, ${date
        .getDate()
        .toString()}`;

      bottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );
      if (
        i + 1 !== dates.length &&
        date.getMonth() !== dates[i + 1].getMonth()
      ) {
        const topValue = getLocaleMonth(date, locale);

        topValues.push(
          <TopPartOfCalendar
            key={topValue + date.getFullYear()}
            value={topValue}
            x1Line={columnWidth * (i + 1)}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={
              columnWidth * (i + 1) -
              getDaysInMonth(date.getMonth(), date.getFullYear()) *
                columnWidth *
                0.5
            }
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [topValues, bottomValues];
  };

  const getCalendarValuesForPartOfDay = () => {
    const topValues: React.ReactNode[] = [];
    const bottomValues: React.ReactNode[] = [];
    // QuarterDay:4, HalfDay:2, HalfHour:48
    // 注意：当前未使用，但保留作为参考
    const topDefaultHeight = headerHeight * 0.5; // 上半部分高度
    const dates = dateSetup.dates;
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue =
        viewMode === ViewMode.HalfHour
          ? getCachedDateTimeFormat(locale, {
              hour: 'numeric',
              minute: '2-digit',
              hour12: false,
            }).format(date)
          : getCachedDateTimeFormat(locale, {
              hour: 'numeric',
            }).format(date);

      // 文字标签在垂直线后面一点，给一些间距
      const xPosition = rtl
        ? columnWidth * (i + 1) - 15 // 右对齐，距离垂直线15px
        : columnWidth * i + 15; // 左对齐，距离垂直线15px

      // 下半部：垂直居中
      bottomValues.push(
        <text
          key={date.getTime()}
          y={topDefaultHeight + topDefaultHeight * 0.6}
          x={xPosition}
          className={styles.calendarBottomText}
          fontFamily={fontFamily}
        >
          {bottomValue}
        </text>
      );
      // 新的一天：在开头显示日期，紧跟在分割线后面
      if (i === 0 || date.getDate() !== dates[i - 1].getDate()) {
        const topValue = `${getLocalDayOfWeek(
          date,
          locale,
          'short'
        )}, ${date.getDate()} ${getLocaleMonth(date, locale)}`;
        const xText = columnWidth * i + 50; // 从时间轴绝对位置计算，避免重合
        topValues.push(
          <TopPartOfCalendar
            key={topValue + date.getFullYear()}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={xText}
            yText={topDefaultHeight * 0.6}
          />
        );
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForHour = () => {
    const topValues: React.ReactNode[] = [];
    const bottomValues: React.ReactNode[] = [];
    const topDefaultHeight = headerHeight * 0.5; // 上半部分高度
    const dates = dateSetup.dates;
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = getCachedDateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
      }).format(date);

      // 文字标签在垂直线后面一点，给一些间距
      const xPosition = rtl
        ? columnWidth * (i + 1) - 15 // 右对齐，距离垂直线15px
        : columnWidth * i + 15; // 左对齐，距离垂直线15px

      // 下半部：垂直居中
      bottomValues.push(
        <text
          key={date.getTime()}
          y={topDefaultHeight + topDefaultHeight * 0.6}
          x={xPosition}
          className={styles.calendarBottomText}
          fontFamily={fontFamily}
        >
          {bottomValue}
        </text>
      );
      // 新的一天：在开头显示日期，紧跟在分割线后面
      if (i === 0 || date.getDate() !== dates[i - 1].getDate()) {
        const topValue = `${getLocalDayOfWeek(
          date,
          locale,
          'long'
        )}, ${date.getDate()} ${getLocaleMonth(date, locale)}`;
        const xText = columnWidth * i + 50; // 从时间轴绝对位置计算，避免重合
        topValues.push(
          <TopPartOfCalendar
            key={topValue + date.getFullYear()}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={xText}
            yText={topDefaultHeight * 0.6}
          />
        );
      }
    }

    return [topValues, bottomValues];
  };

  let topValues: React.ReactNode[] = [];
  let bottomValues: React.ReactNode[] = [];
  switch (dateSetup.viewMode) {
    case ViewMode.Year:
      [topValues, bottomValues] = getCalendarValuesForYear();
      break;
    case ViewMode.QuarterYear:
      [topValues, bottomValues] = getCalendarValuesForQuarterYear();
      break;
    case ViewMode.Month:
      [topValues, bottomValues] = getCalendarValuesForMonth();
      break;
    case ViewMode.Week:
      [topValues, bottomValues] = getCalendarValuesForWeek();
      break;
    case ViewMode.Day:
      [topValues, bottomValues] = getCalendarValuesForDay();
      break;
    case ViewMode.QuarterDay:
    case ViewMode.HalfDay:
    case ViewMode.HalfHour:
      [topValues, bottomValues] = getCalendarValuesForPartOfDay();
      break;
    case ViewMode.Hour:
      [topValues, bottomValues] = getCalendarValuesForHour();
      break;
  }
  return (
    <g
      className={`calendar ${styles.calendarContainer}`}
      fontSize={fontSize}
      fontFamily={fontFamily}
    >
      <rect
        x={0}
        y={0}
        width={columnWidth * dateSetup.dates.length}
        height={headerHeight}
        className={styles.calendarHeader}
      />
      {/* 时间轴分隔线（每列一条，仅下半部分） */}
      {dateSetup.dates.map((_, index) => (
        <line
          key={`separator-${index}`}
          x1={columnWidth * index}
          y1={headerHeight * 0.5}
          x2={columnWidth * index}
          y2={headerHeight}
          className={styles.calendarTopTick}
        />
      ))}
      {/* 下半部分的上边框 */}
      <line
        x1={0}
        y1={headerHeight * 0.5}
        x2={columnWidth * dateSetup.dates.length}
        y2={headerHeight * 0.5}
        className={styles.calendarTopTick}
      />
      {bottomValues} {topValues}
    </g>
  );
};
