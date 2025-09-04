/**
 * Debug 工具模块
 * 为不同的组件和功能模块提供调试日志功能
 */

import debug from 'debug';

/**
 * 甘特图主组件调试器
 */
export const ganttDebug = debug('react-gantt:gantt');

/**
 * 任务项组件调试器
 */
export const taskItemDebug = debug('react-gantt:task-item');

/**
 * 任务甘特内容调试器
 */
export const taskGanttContentDebug = debug('react-gantt:task-gantt-content');

/**
 * 任务列表调试器
 */
export const taskListDebug = debug('react-gantt:task-list');

/**
 * 日历组件调试器
 */
export const calendarDebug = debug('react-gantt:calendar');

/**
 * 网格组件调试器
 */
export const gridDebug = debug('react-gantt:grid');

/**
 * 拖拽功能调试器
 */
export const dragDebug = debug('react-gantt:drag');

/**
 * 时间计算调试器
 */
export const timeDebug = debug('react-gantt:time');

/**
 * 层级关系调试器
 */
export const hierarchyDebug = debug('react-gantt:hierarchy');

/**
 * 事件处理调试器
 */
export const eventDebug = debug('react-gantt:events');

/**
 * 故事书示例调试器
 */
export const storyDebug = debug('react-gantt:stories');

/**
 * 通用调试器（用于未分类的调试信息）
 */
export const generalDebug = debug('react-gantt:general');

/**
 * 启用所有调试日志
 * 在开发环境中使用
 */
export const enableAllDebug = () => {
  debug.enable('react-gantt:*');
};

/**
 * 禁用所有调试日志
 * 在生产环境中使用
 */
export const disableAllDebug = () => {
  debug.disable();
};

/**
 * 根据环境自动配置调试
 * 在开发环境中启用，在生产环境中禁用
 */
export const configureDebug = () => {
  if (process.env.NODE_ENV === 'development') {
    enableAllDebug();
  } else {
    disableAllDebug();
  }
};

// 自动配置调试
configureDebug();
