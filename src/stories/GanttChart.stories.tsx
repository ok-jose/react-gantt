import type { Meta, StoryObj } from '@storybook/react-vite';
import GanttChart from './Gantt';

const meta: Meta<typeof GanttChart> = {
  title: 'Components/Gantt',
  component: GanttChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: { type: 'number' },
    },
    width: {
      control: { type: 'text' },
    },
    showProgress: {
      control: { type: 'boolean' },
    },
    showDependencies: {
      control: { type: 'boolean' },
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读模式，只读模式下不能拖拽任务条',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    height: 500,
    width: '100%',
    showProgress: true,
    showDependencies: true,
    locale: 'zh-CN',
  },
};

export const Readonly: Story = {
  args: {
    height: 500,
    width: '100%',
    showProgress: true,
    showDependencies: true,
    locale: 'zh-CN',
    readonly: true,
  },
};
