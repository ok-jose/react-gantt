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
