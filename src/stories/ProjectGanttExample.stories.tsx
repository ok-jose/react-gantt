import type { Meta, StoryObj } from '@storybook/react';
import ProjectGanttExample from './ProjectGanttExample';

const meta: Meta<typeof ProjectGanttExample> = {
  title: 'Examples/Project Gantt',
  component: ProjectGanttExample,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## 项目甘特图示例

这个示例展示了如何在甘特图中使用层级结构，包含：

- **项目 (Project)**: 顶层容器，可以包含多个任务
- **任务 (Task)**: 具体的执行项目，属于某个项目
- **里程碑 (Milestone)**: 重要的时间节点，通常进度为100%

### 功能特性

- 支持项目层级结构
- 自动计算项目时间范围（基于子任务）
- 支持展开/收起项目
- 支持任务拖拽和进度调整
- 支持多种视图模式（日、周、月、年）

### 数据结构

\`\`\`typescript
interface Task {
  id: string;
  type: 'task' | 'milestone' | 'project';
  name: string;
  start: Date;
  end: Date;
  progress: number;
  project?: string; // 关联到父项目的ID
  hideChildren?: boolean;
  displayOrder?: number;
}
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 默认项目甘特图示例
 */
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: '默认显示包含3个项目，每个项目4个任务的简单层级结构。',
      },
    },
  },
};

/**
 * 复杂项目结构示例
 */
export const ComplexStructure: Story = {
  render: () => {
    const ComplexExample = () => {
      const React = require('react');
      const { Gantt } = require('../components/gantt/gantt');
      const { ViewMode } = require('../types');
      const { ViewSwitcher } = require('./view-switcher');
      const { initComplexProjectTasks } = require('./data-helper');

      const [view, setView] = React.useState(ViewMode.Day);
      const [tasks, setTasks] = React.useState(
        initComplexProjectTasks(2, 3, 2)
      );
      const [isChecked, setIsChecked] = React.useState(true);

      let columnWidth = 65;
      if (view === ViewMode.Year) {
        columnWidth = 350;
      } else if (view === ViewMode.Month) {
        columnWidth = 300;
      } else if (view === ViewMode.Week) {
        columnWidth = 250;
      }

      return (
        <div className="Wrapper">
          <ViewSwitcher
            onViewModeChange={viewMode => setView(viewMode)}
            onViewListChange={setIsChecked}
            isChecked={isChecked}
          />

          <div style={{ marginBottom: '20px' }}>
            <h3>复杂项目结构示例</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>
              包含2个项目，每个项目3个任务和2个里程碑
            </p>
          </div>

          <Gantt
            tasks={tasks}
            viewMode={view}
            listCellWidth={isChecked ? '155px' : ''}
            ganttHeight={600}
            columnWidth={columnWidth}
            locale="zh-CN"
          />
        </div>
      );
    };

    return <ComplexExample />;
  },
  parameters: {
    docs: {
      description: {
        story:
          '展示包含项目、任务和里程碑的复杂层级结构。每个项目包含3个任务和2个里程碑。',
      },
    },
  },
};
