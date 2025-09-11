import type { Meta, StoryObj } from '@storybook/react-vite';
import GanttBasic from './GanttBasic';

const meta: Meta<typeof GanttBasic> = {
  title: 'Components/Gantt',
  component: GanttBasic,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '一个功能完整的 Gantt 图表组件，支持任务管理、进度跟踪、依赖关系等功能。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: { type: 'number' },
      description: 'Gantt 图表的高度',
    },
    width: {
      control: { type: 'text' },
      description: 'Gantt 图表的宽度',
    },
    showProgress: {
      control: { type: 'boolean' },
      description: '是否显示任务进度',
    },
    showDependencies: {
      control: { type: 'boolean' },
      description: '是否显示任务依赖关系',
    },
    viewMode: {
      control: { type: 'select' },
      options: ['Day', 'HalfDay', 'QuarterDay', 'Hour', 'HalfHour'],
      description: '时间视图模式',
    },
    locale: {
      control: { type: 'select' },
      options: ['zh-CN', 'en-GB', 'en-US'],
      description: '本地化设置',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否为只读模式',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本 Gantt 图表示例
 * 展示了一个简单的项目时间线，包含多个任务和子任务
 */
export const Basic: Story = {
  args: {
    height: 400,
    width: '100%',
    showProgress: true,
    showDependencies: true,
    viewMode: 'Day',
    locale: 'zh-CN',
    readonly: false,
  },
};

/**
 * 复杂项目示例
 * 展示了一个包含多个阶段、里程碑和依赖关系的复杂项目
 */
export const ComplexProject: Story = {
  args: {
    height: 600,
    width: '100%',
    showProgress: true,
    showDependencies: true,
    viewMode: 'Day',
    locale: 'zh-CN',
    readonly: false,
    projectType: 'complex',
  },
};

/**
 * 小时视图示例
 * 展示了一个以小时为单位的详细时间安排
 */
export const HourlyView: Story = {
  args: {
    height: 500,
    width: '100%',
    showProgress: true,
    showDependencies: true,
    viewMode: 'Hour',
    locale: 'zh-CN',
    readonly: false,
    projectType: 'hourly',
  },
};

/**
 * 只读模式示例
 * 展示了一个只读的 Gantt 图表，用户无法编辑任务
 */
export const ReadOnly: Story = {
  args: {
    height: 400,
    width: '100%',
    showProgress: true,
    showDependencies: true,
    viewMode: 'HalfHour',
    locale: 'zh-CN',
    readonly: true,
  },
};

/**
 * 英文界面示例
 * 展示了英文界面的 Gantt 图表
 */
export const EnglishLocale: Story = {
  args: {
    height: 400,
    width: '100%',
    showProgress: true,
    showDependencies: true,
    viewMode: 'HalfHour',
    locale: 'en-GB',
    readonly: false,
  },
};

/**
 * 自定义样式示例
 * 展示了自定义颜色和样式的 Gantt 图表
 */
export const CustomStyling: Story = {
  args: {
    height: 400,
    width: '100%',
    showProgress: true,
    showDependencies: true,
    viewMode: 'HalfHour',
    locale: 'zh-CN',
    readonly: false,
    customColors: true,
  },
};
