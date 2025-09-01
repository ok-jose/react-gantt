import type { Meta, StoryObj } from '@storybook/react-vite';
import GanttProdSchedule from './GanttProdSchedule';

const meta: Meta<typeof GanttProdSchedule> = {
  title: 'Components/ProdSchedule',
  component: GanttProdSchedule,
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

export const ProdSchedule: Story = {
  args: {
    height: 500,
    width: '100%',
    showProgress: true,
    showDependencies: true,
    locale: 'zh-CN',
  },
};
