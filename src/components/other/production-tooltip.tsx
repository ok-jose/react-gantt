import React from 'react';
import type { BarTask } from '../../types/bar-task';

interface ProductionTooltipProps {
  task: BarTask;
  fontSize: string;
  fontFamily: string;
}

/**
 * 生产调度专用工具提示组件
 * 显示任务时长、开始时间、结束时间等信息
 */
export const ProductionTooltip: React.FC<ProductionTooltipProps> = ({
  task,
  fontSize,
  fontFamily,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  const calculateDuration = () => {
    const durationMs = task.end.getTime() - task.start.getTime();
    const hours = durationMs / (1000 * 60 * 60);

    if (hours < 1) {
      const minutes = durationMs / (1000 * 60);
      return `${minutes.toFixed(0)}分钟`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)}小时`;
    } else {
      const days = hours / 24;
      return `${days.toFixed(1)}天`;
    }
  };

  const getTaskTypeColor = () => {
    if (task.type === 'project') {
      return '#495057';
    } else if (task.name.includes('OP-1')) {
      return '#ff6b6b';
    } else if (
      task.name.includes('OP-2') ||
      task.name.includes('OP-3') ||
      task.name.includes('OP-4') ||
      task.name.includes('OP-8')
    ) {
      return '#74c0fc';
    } else {
      return '#adb5bd';
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '12px',
        fontSize: fontSize,
        fontFamily: fontFamily,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '200px',
        maxWidth: '300px',
      }}
    >
      {/* 任务名称 */}
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '14px',
          marginBottom: '8px',
          color: getTaskTypeColor(),
          borderBottom: '1px solid #e9ecef',
          paddingBottom: '4px',
        }}
      >
        {task.name}
      </div>

      {/* 任务类型 */}
      <div style={{ marginBottom: '6px', fontSize: '12px', color: '#6c757d' }}>
        <span style={{ fontWeight: 'bold' }}>类型:</span>{' '}
        {task.type === 'project' ? '生产线' : '操作任务'}
      </div>

      {/* 时间信息 */}
      <div style={{ marginBottom: '6px', fontSize: '12px' }}>
        <span style={{ fontWeight: 'bold', color: '#495057' }}>开始:</span>{' '}
        {formatDate(task.start)} {formatTime(task.start)}
      </div>

      <div style={{ marginBottom: '6px', fontSize: '12px' }}>
        <span style={{ fontWeight: 'bold', color: '#495057' }}>结束:</span>{' '}
        {formatDate(task.end)} {formatTime(task.end)}
      </div>

      {/* 持续时间 */}
      <div style={{ marginBottom: '8px', fontSize: '12px' }}>
        <span style={{ fontWeight: 'bold', color: '#495057' }}>持续时间:</span>{' '}
        <span style={{ color: '#28a745', fontWeight: 'bold' }}>
          {calculateDuration()}
        </span>
      </div>

      {/* 进度信息 */}
      {task.type === 'task' && (
        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <span style={{ fontWeight: 'bold', color: '#495057' }}>进度:</span>{' '}
          <span style={{ color: '#007bff', fontWeight: 'bold' }}>
            {task.progress}%
          </span>
        </div>
      )}

      {/* 状态指示器 */}
      <div
        style={{
          marginTop: '8px',
          paddingTop: '6px',
          borderTop: '1px solid #e9ecef',
        }}
      >
        <div style={{ fontSize: '11px', color: '#6c757d' }}>
          {task.type === 'project' ? '🏭 生产线' : '⚙️ 操作任务'}
        </div>
      </div>
    </div>
  );
};
