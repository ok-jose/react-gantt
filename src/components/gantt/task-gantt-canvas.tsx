import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import type { BarTask } from '../../types/bar-task';
import type { Task } from '../../types';
import { addToDate } from '../../helpers/date-helper';
import { useGanttPerformance } from '../../hooks/useGanttPerformance';
import styles from './gantt.module.css';

export interface TaskGanttCanvasProps {
  tasks: BarTask[];
  dates: Date[];
  ganttEvent: any;
  selectedTask: BarTask | undefined;
  rowHeight: number;
  columnWidth: number;
  timeStep: number;
  svgWidth: number;
  taskHeight: number;
  arrowColor: string;
  arrowIndent: number;
  fontSize: string;
  fontFamily: string;
  rtl: boolean;
  setGanttEvent: (value: any) => void;
  setFailedTask: (value: BarTask | null) => void;
  setSelectedTask: (taskId: string) => void;
  onDateChange?: (task: BarTask, children: BarTask[]) => Promise<boolean>;
  onProgressChange?: (task: BarTask, children: BarTask[]) => Promise<boolean>;
  onDoubleClick?: (task: BarTask) => void;
  onClick?: (task: BarTask) => void;
  onDelete?: (task: BarTask) => Promise<boolean>;
  virtualizationOffset?: number;
}

/**
 * Canvas 渲染的甘特图组件
 * 适用于大数据量场景，提供高性能渲染
 */
export const TaskGanttCanvas: React.FC<TaskGanttCanvasProps> = ({
  tasks,
  dates,
  ganttEvent,
  selectedTask,
  rowHeight,
  columnWidth,
  timeStep,
  svgWidth,
  taskHeight,
  arrowColor,
  arrowIndent,
  fontSize,
  fontFamily,
  rtl,
  setGanttEvent,
  setFailedTask,
  setSelectedTask,
  onDateChange,
  onProgressChange,
  onDoubleClick,
  onClick,
  onDelete,
  virtualizationOffset = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragTask, setDragTask] = useState<BarTask | null>(null);

  // 性能监控
  const { metrics, startRender, endRender } = useGanttPerformance(
    tasks.length,
    tasks.length,
    { enabled: true }
  );

  // 计算时间步长
  const xStep = useMemo(() => {
    const dateDelta =
      dates[1].getTime() -
      dates[0].getTime() -
      dates[1].getTimezoneOffset() * 60 * 1000 +
      dates[0].getTimezoneOffset() * 60 * 1000;
    return (timeStep * columnWidth) / dateDelta;
  }, [columnWidth, dates, timeStep]);

  // 绘制网格
  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);

      // 绘制水平线
      for (let i = 0; i <= tasks.length; i++) {
        const y = i * rowHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(svgWidth, y);
        ctx.stroke();
      }

      // 绘制垂直线
      for (let i = 0; i < dates.length; i++) {
        const x = i * columnWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, tasks.length * rowHeight);
        ctx.stroke();
      }

      // 绘制今天的高亮
      const now = new Date();
      for (let i = 0; i < dates.length - 1; i++) {
        const date = dates[i];
        const nextDate = dates[i + 1];

        if (
          date.getTime() < now.getTime() &&
          nextDate.getTime() >= now.getTime()
        ) {
          const x = i * columnWidth;
          ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
          ctx.fillRect(x, 0, columnWidth, tasks.length * rowHeight);
          break;
        }
      }
    },
    [tasks.length, dates, rowHeight, columnWidth, svgWidth]
  );

  // 绘制任务条
  const drawTasks = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      tasks.forEach((task, index) => {
        const y = index * rowHeight + (rowHeight - taskHeight) / 2;
        const taskY = y + virtualizationOffset;

        // 跳过不可见的任务
        if (taskY + taskHeight < 0 || taskY > ctx.canvas.height) {
          return;
        }

        // 任务背景
        ctx.fillStyle = task.isDisabled ? '#f5f5f5' : '#4CAF50';
        ctx.fillRect(task.x1, taskY, task.x2 - task.x1, taskHeight);

        // 任务边框
        ctx.strokeStyle = task.isDisabled ? '#ccc' : '#2E7D32';
        ctx.lineWidth = 1;
        ctx.strokeRect(task.x1, taskY, task.x2 - task.x1, taskHeight);

        // 进度条
        if (task.progress && task.progress > 0) {
          const progressWidth = ((task.x2 - task.x1) * task.progress) / 100;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillRect(task.x1, taskY, progressWidth, taskHeight);
        }

        // 选中状态
        if (selectedTask && task.id === selectedTask.id) {
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            task.x1 - 1,
            taskY - 1,
            task.x2 - task.x1 + 2,
            taskHeight + 2
          );
        }

        // 任务文本
        ctx.fillStyle = task.isDisabled ? '#999' : '#fff';
        ctx.font = `${fontSize} ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textX = task.x1 + (task.x2 - task.x1) / 2;
        const textY = taskY + taskHeight / 2;

        // 文本阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillText(task.name, textX, textY);

        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      });
    },
    [
      tasks,
      selectedTask,
      rowHeight,
      taskHeight,
      fontSize,
      fontFamily,
      virtualizationOffset,
    ]
  );

  // 绘制箭头
  const drawArrows = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = arrowColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      tasks.forEach(task => {
        task.barChildren.forEach(child => {
          const childTask = tasks[child.index];
          if (!childTask) return;

          const fromX = task.x2;
          const fromY =
            tasks.indexOf(task) * rowHeight +
            rowHeight / 2 +
            virtualizationOffset;
          const toX = childTask.x1;
          const toY =
            tasks.indexOf(childTask) * rowHeight +
            rowHeight / 2 +
            virtualizationOffset;

          // 绘制箭头线
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.stroke();

          // 绘制箭头头部
          const angle = Math.atan2(toY - fromY, toX - fromX);
          const arrowLength = 10;
          const arrowAngle = Math.PI / 6;

          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(toX, toY);
          ctx.lineTo(
            toX - arrowLength * Math.cos(angle - arrowAngle),
            toY - arrowLength * Math.sin(angle - arrowAngle)
          );
          ctx.moveTo(toX, toY);
          ctx.lineTo(
            toX - arrowLength * Math.cos(angle + arrowAngle),
            toY - arrowLength * Math.sin(angle + arrowAngle)
          );
          ctx.stroke();
        });
      });
    },
    [tasks, rowHeight, arrowColor, virtualizationOffset]
  );

  // 主渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    startRender();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    drawGrid(ctx);

    // 绘制箭头
    drawArrows(ctx);

    // 绘制任务
    drawTasks(ctx);

    endRender();
  }, [drawGrid, drawArrows, drawTasks, startRender, endRender]);

  // 获取鼠标位置对应的任务
  const getTaskAtPosition = useCallback(
    (x: number, y: number): BarTask | null => {
      const adjustedY = y - virtualizationOffset;
      const taskIndex = Math.floor(adjustedY / rowHeight);

      if (taskIndex >= 0 && taskIndex < tasks.length) {
        const task = tasks[taskIndex];
        if (x >= task.x1 && x <= task.x2) {
          return task;
        }
      }

      return null;
    },
    [tasks, rowHeight, virtualizationOffset]
  );

  // 鼠标事件处理
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const task = getTaskAtPosition(x, y);
      if (task) {
        setDragTask(task);
        setDragStartPos({ x, y });
        setIsDragging(true);
        setSelectedTask(task.id);
      }
    },
    [getTaskAtPosition, setSelectedTask]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || !dragTask) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const deltaX = x - dragStartPos.x;

      // 计算新的开始时间
      const timeDelta = deltaX / xStep;
      const newStart = new Date(
        dragTask.start.getTime() + timeDelta * timeStep
      );
      const newEnd = new Date(dragTask.end.getTime() + timeDelta * timeStep);

      // 更新任务位置
      const updatedTask = {
        ...dragTask,
        start: newStart,
        end: newEnd,
        x1: dragTask.x1 + deltaX,
        x2: dragTask.x2 + deltaX,
      };

      setGanttEvent({ action: 'move', changedTask: updatedTask });
    },
    [isDragging, dragTask, dragStartPos, xStep, timeStep, setGanttEvent]
  );

  const handleMouseUp = useCallback(async () => {
    if (!isDragging || !dragTask) return;

    setIsDragging(false);
    setDragTask(null);

    // 调用回调函数
    if (onDateChange) {
      try {
        const success = await onDateChange(dragTask, dragTask.barChildren);
        if (!success) {
          setFailedTask(dragTask);
        }
      } catch (error) {
        setFailedTask(dragTask);
      }
    }

    setGanttEvent({ action: '' });
  }, [isDragging, dragTask, onDateChange, setFailedTask, setGanttEvent]);

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const task = getTaskAtPosition(x, y);
      if (task && onDoubleClick) {
        onDoubleClick(task);
      }
    },
    [getTaskAtPosition, onDoubleClick]
  );

  // 渲染效果
  useEffect(() => {
    render();
  }, [render]);

  // 设置 Canvas 尺寸
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = svgWidth;
    canvas.height = tasks.length * rowHeight;
  }, [svgWidth, tasks.length, rowHeight]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />

      {/* 性能监控显示 */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 1000,
        }}
      >
        <div>Canvas 渲染</div>
        <div>渲染时间: {metrics.renderTime.toFixed(2)}ms</div>
        <div>任务数量: {metrics.taskCount}</div>
        <div>FPS: {metrics.fps}</div>
      </div>
    </div>
  );
};
