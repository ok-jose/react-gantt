import React, { useRef, useEffect, useCallback } from 'react';
import type { BarTask } from '../../types/bar-task';

export interface TaskGanttCanvasDebugProps {
  tasks: BarTask[];
  dates: Date[];
  rowHeight: number;
  columnWidth: number;
  svgWidth: number;
  taskHeight: number;
  fontSize: string;
  fontFamily: string;
}

/**
 * 调试版本的 Canvas 甘特图组件
 * 用于诊断渲染问题
 */
export const TaskGanttCanvasDebug: React.FC<TaskGanttCanvasDebugProps> = ({
  tasks,
  dates,
  rowHeight,
  columnWidth,
  svgWidth,
  taskHeight,
  fontSize,
  fontFamily,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 简化的渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Canvas context not found');
      return;
    }

    // 设置 Canvas 尺寸
    canvas.width = svgWidth;
    canvas.height = tasks.length * rowHeight;

    console.log('Debug render:', {
      width: canvas.width,
      height: canvas.height,
      tasksCount: tasks.length,
      svgWidth,
      rowHeight,
    });

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // 水平线
    for (let i = 0; i <= tasks.length; i++) {
      const y = i * rowHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(svgWidth, y);
      ctx.stroke();
    }

    // 垂直线
    for (let i = 0; i < dates.length; i++) {
      const x = i * columnWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, tasks.length * rowHeight);
      ctx.stroke();
    }

    // 绘制任务
    console.log('Drawing tasks:', tasks.length);
    tasks.forEach((task, index) => {
      const y = index * rowHeight + (rowHeight - taskHeight) / 2;

      console.log(`Task ${index}:`, {
        name: task.name,
        x1: task.x1,
        x2: task.x2,
        y: y,
        width: task.x2 - task.x1,
        height: taskHeight,
        start: task.start,
        end: task.end,
      });

      // 检查任务坐标
      if (task.x1 === undefined || task.x2 === undefined) {
        console.warn(`Task ${index} missing coordinates:`, task);
        return;
      }

      if (task.x1 >= task.x2) {
        console.warn(
          `Task ${index} invalid coordinates: x1=${task.x1}, x2=${task.x2}`
        );
        return;
      }

      // 绘制任务条
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(task.x1, y, task.x2 - task.x1, taskHeight);

      // 绘制边框
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 1;
      ctx.strokeRect(task.x1, y, task.x2 - task.x1, taskHeight);

      // 绘制文本
      ctx.fillStyle = '#fff';
      ctx.font = `${fontSize} ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textX = task.x1 + (task.x2 - task.x1) / 2;
      const textY = y + taskHeight / 2;

      ctx.fillText(task.name, textX, textY);

      // 绘制坐标信息
      ctx.fillStyle = '#000';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`x1:${task.x1} x2:${task.x2}`, 5, y + 15);
    });

    console.log('Render completed');
  }, [
    tasks,
    dates,
    rowHeight,
    columnWidth,
    svgWidth,
    taskHeight,
    fontSize,
    fontFamily,
  ]);

  // 监听任务数据变化
  useEffect(() => {
    console.log('Tasks changed:', tasks.length);
    render();
  }, [tasks, render]);

  // 监听其他属性变化
  useEffect(() => {
    render();
  }, [
    dates,
    rowHeight,
    columnWidth,
    svgWidth,
    taskHeight,
    fontSize,
    fontFamily,
    render,
  ]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          border: '1px solid #ccc',
        }}
      />

      {/* 调试信息 */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 1000,
        }}
      >
        <div>调试模式</div>
        <div>任务数量: {tasks.length}</div>
        <div>
          Canvas 尺寸: {svgWidth} x {tasks.length * rowHeight}
        </div>
        <div>行高: {rowHeight}</div>
        <div>任务高度: {taskHeight}</div>
        {tasks.length > 0 && (
          <div>
            第一个任务: {tasks[0].name} (x1:{tasks[0].x1}, x2:{tasks[0].x2})
          </div>
        )}
      </div>
    </div>
  );
};
