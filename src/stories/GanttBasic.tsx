import React, { useState } from 'react';
import { Gantt } from '../components/gantt/gantt';
import { ViewMode, type Task } from '../types';
import { storyDebug } from '../utils/debug';

const CustomTooltipContent = ({ task }: { task: Task }) => {
  return (
    <div>
      <div>{`物料名称：${task.name}`}</div>
      <div>{`物料编号：${task.materialCode}`}</div>
      <div>{`物料数量：${task.quantity}`}</div>
      <div>{`物料优先级：${task.priority}`}</div>
      <div>{`物料库存组织：${task.invOrg}`}</div>
      <div>{`物料工作中心：${task.workCenter}`}</div>
    </div>
  );
};

/**
 * 基本任务数据
 */
const BASIC_TASKS: Task[] = [
  {
    name: '硫化缸01',
    id: '硫化缸01',
    children: [
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W01',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸01',
        duration: 16200000,
        name: '物料A-01',
        uom: '根',
        start: 1757635200000,
        end: 1757651400000,
        id: 'TASK-1',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 200,
        shift: 2000001,
        woCode: 'W02',
        materialCode: 'MAT02',
        priority: '中',
        workCenter: '硫化缸01',
        duration: 3300000,
        name: '物料A-02',
        uom: '根',
        start: 1757652000000,
        end: 1757655300000,
        id: 'TASK-2',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W03',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸01',
        duration: 1800000,
        name: '物料A-03',
        uom: '根',
        start: 1757655900000,
        end: 1757657700000,
        id: 'TASK-3',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W01',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸01',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757658300000,
        end: 1757660100000,
        id: 'TASK-13',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 200,
        shift: 2000001,
        woCode: 'W02',
        materialCode: 'MAT02',
        priority: '中',
        workCenter: '硫化缸01',
        duration: 3300000,
        name: '物料A-02',
        uom: '根',
        start: 1757660700000,
        end: 1757664000000,
        id: 'TASK-14',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W03',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸01',
        duration: 1800000,
        name: '物料A-03',
        uom: '根',
        start: 1757664600000,
        end: 1757666400000,
        id: 'TASK-15',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W01',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸01',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757667000000,
        end: 1757668800000,
        id: 'TASK-25',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 200,
        shift: 2000001,
        woCode: 'W02',
        materialCode: 'MAT02',
        priority: '中',
        workCenter: '硫化缸01',
        duration: 3300000,
        name: '物料A-02',
        uom: '根',
        start: 1757669400000,
        end: 1757672700000,
        id: 'TASK-26',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W03',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸01',
        duration: 1800000,
        name: '物料A-03',
        uom: '根',
        start: 1757673300000,
        end: 1757675100000,
        id: 'TASK-27',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W01',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸01',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757675700000,
        end: 1757677500000,
        id: 'TASK-37',
        operation: '硫化',
      },
    ],
    start: 0,
    end: 0,
  },
  {
    name: '硫化缸02',
    id: '硫化缸02',
    children: [
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W04',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸02',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757635200000,
        end: 1757637000000,
        id: 'TASK-4',
        operation: '硫化',
        adjusted: true,
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 200,
        shift: 2000001,
        woCode: 'W05',
        materialCode: 'MAT02',
        priority: '中',
        workCenter: '硫化缸02',
        duration: 3300000,
        name: '物料A-02',
        uom: '根',
        start: 1757637600000,
        end: 1757640900000,
        id: 'TASK-5',
        operation: '硫化',
        adjusted: true,
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W04',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸02',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757641500000,
        end: 1757643300000,
        id: 'TASK-16',
        operation: '硫化',
        adjusted: true,
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 200,
        shift: 2000001,
        woCode: 'W05',
        materialCode: 'MAT02',
        priority: '中',
        workCenter: '硫化缸02',
        duration: 3300000,
        name: '物料A-02',
        uom: '根',
        start: 1757643900000,
        end: 1757647200000,
        id: 'TASK-17',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W04',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸02',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757647800000,
        end: 1757649600000,
        id: 'TASK-28',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 200,
        shift: 2000001,
        woCode: 'W05',
        materialCode: 'MAT02',
        priority: '中',
        workCenter: '硫化缸02',
        duration: 3300000,
        name: '物料A-02',
        uom: '根',
        start: 1757650200000,
        end: 1757653500000,
        id: 'TASK-29',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W04',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸02',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757654100000,
        end: 1757655900000,
        id: 'TASK-40',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 200,
        shift: 2000001,
        woCode: 'W05',
        materialCode: 'MAT02',
        priority: '中',
        workCenter: '硫化缸02',
        duration: 3300000,
        name: '物料A-02',
        uom: '根',
        start: 1757656500000,
        end: 1757659800000,
        id: 'TASK-41',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W04',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸02',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757660400000,
        end: 1757662200000,
        id: 'TASK-52',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 200,
        shift: 2000001,
        woCode: 'W05',
        materialCode: 'MAT02',
        priority: '中',
        workCenter: '硫化缸02',
        duration: 3300000,
        name: '物料A-02',
        uom: '根',
        start: 1757662800000,
        end: 1757666100000,
        id: 'TASK-53',
        operation: '硫化',
      },
    ],
    start: 0,
    end: 0,
  },
  {
    name: '硫化缸03',
    id: '硫化缸03',
    children: [
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W07',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸03',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757635200000,
        end: 1757637000000,
        id: 'TASK-7',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W09',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸03',
        duration: 5400000,
        name: '物料A-03',
        uom: '根',
        start: 1757637600000,
        end: 1757643000000,
        id: 'TASK-9',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W07',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸03',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757643600000,
        end: 1757645400000,
        id: 'TASK-19',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W09',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸03',
        duration: 5400000,
        name: '物料A-03',
        uom: '根',
        start: 1757646000000,
        end: 1757651400000,
        id: 'TASK-21',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W07',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸03',
        duration: 9000000,
        name: '物料A-01',
        uom: '根',
        start: 1757652000000,
        end: 1757661000000,
        id: 'TASK-31',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W09',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸03',
        duration: 5400000,
        name: '物料A-03',
        uom: '根',
        start: 1757661600000,
        end: 1757667000000,
        id: 'TASK-33',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W07',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸03',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757667600000,
        end: 1757669400000,
        id: 'TASK-43',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W09',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸03',
        duration: 5400000,
        name: '物料A-03',
        uom: '根',
        start: 1757670000000,
        end: 1757675400000,
        id: 'TASK-45',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W07',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸03',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757676000000,
        end: 1757677800000,
        id: 'TASK-55',
        operation: '硫化',
      },
    ],
    start: 0,
    end: 0,
  },
  {
    name: '硫化缸04',
    id: '硫化缸04',
    children: [
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W010',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸04',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757635200000,
        end: 1757637000000,
        id: 'TASK-10',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W012',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸04',
        duration: 5400000,
        name: '物料A-03',
        uom: '根',
        start: 1757637600000,
        end: 1757643000000,
        id: 'TASK-12',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W010',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸04',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757643600000,
        end: 1757645400000,
        id: 'TASK-22',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W012',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸04',
        duration: 5400000,
        name: '物料A-03',
        uom: '根',
        start: 1757646000000,
        end: 1757651400000,
        id: 'TASK-24',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W010',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸04',
        duration: 5400000,
        name: '物料A-01',
        uom: '根',
        start: 1757652000000,
        end: 1757657400000,
        id: 'TASK-34',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W012',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸04',
        duration: 5400000,
        name: '物料A-03',
        uom: '根',
        start: 1757658000000,
        end: 1757663400000,
        id: 'TASK-36',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W010',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸04',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757664000000,
        end: 1757665800000,
        id: 'TASK-46',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W012',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸04',
        duration: 5400000,
        name: '物料A-03',
        uom: '根',
        start: 1757666400000,
        end: 1757671800000,
        id: 'TASK-48',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W010',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸04',
        duration: 1800000,
        name: '物料A-01',
        uom: '根',
        start: 1757672400000,
        end: 1757674200000,
        id: 'TASK-58',
        operation: '硫化',
      },
    ],
    start: 0,
    end: 0,
  },
  {
    name: '冲突暂存',
    id: '冲突暂存',
    children: [
      {
        invOrg: '三力士余渚工厂',
        quantity: 200,
        shift: 2000001,
        woCode: 'W02',
        materialCode: 'MAT02',
        priority: '中',
        workCenter: '硫化缸01',
        duration: 3300000,
        name: '物料A-02',
        uom: '根',
        start: 1757635200000,
        end: 1757638500000,
        id: 'TASK-38',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W03',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸01',
        duration: 1800000,
        name: '物料A-03',
        uom: '根',
        start: 1757639100000,
        end: 1757640900000,
        id: 'TASK-39',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 300,
        shift: 2000001,
        woCode: 'W01',
        materialCode: 'MAT01',
        priority: '高',
        workCenter: '硫化缸01',
        duration: 7620000,
        name: '物料A-01',
        uom: '根',
        start: 1757641500000,
        end: 1757649120000,
        id: 'TASK-49',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 200,
        shift: 2000001,
        woCode: 'W02',
        materialCode: 'MAT02',
        priority: '中',
        workCenter: '硫化缸01',
        duration: 3300000,
        name: '物料A-02',
        uom: '根',
        start: 1757649720000,
        end: 1757653020000,
        id: 'TASK-50',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W09',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸03',
        duration: 5400000,
        name: '物料A-03',
        uom: '根',
        start: 1757653620000,
        end: 1757659020000,
        id: 'TASK-57',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W012',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸04',
        duration: 5400000,
        name: '物料A-03',
        uom: '根',
        start: 1757659620000,
        end: 1757665020000,
        id: 'TASK-60',
        operation: '硫化',
      },
      {
        invOrg: '三力士余渚工厂',
        quantity: 400,
        shift: 2000001,
        woCode: 'W03',
        materialCode: 'MAT03',
        priority: '低',
        workCenter: '硫化缸01',
        duration: 1800000,
        name: '物料A-03',
        uom: '根',
        start: 1757665620000,
        end: 1757667420000,
        id: 'TASK-51',
        operation: '硫化',
      },
    ],
    start: 0,
    end: 0,
  },
];

/**
 * 复杂项目任务数据
 */
const COMPLEX_TASKS: Task[] = [
  {
    id: 'phase-1',
    name: '第一阶段：需求与设计',
    start: new Date(2024, 0, 1).getTime(),
    end: new Date(2024, 0, 20).getTime(),
    progress: 100,
    type: 'task',
    hideChildren: false,
    children: [
      {
        id: 'req-1',
        name: '业务需求分析',
        start: new Date(2024, 0, 1).getTime(),
        end: new Date(2024, 0, 8).getTime(),
        progress: 100,
        type: 'task',
      },
      {
        id: 'req-2',
        name: '技术需求分析',
        start: new Date(2024, 0, 5).getTime(),
        end: new Date(2024, 0, 12).getTime(),
        progress: 100,
        type: 'task',
        dependencies: ['req-1'],
      },
      {
        id: 'design-1',
        name: '系统架构设计',
        start: new Date(2024, 0, 10).getTime(),
        end: new Date(2024, 0, 18).getTime(),
        progress: 100,
        type: 'task',
        dependencies: ['req-2'],
      },
      {
        id: 'design-2',
        name: 'UI/UX 设计',
        start: new Date(2024, 0, 13).getTime(),
        end: new Date(2024, 0, 20).getTime(),
        progress: 100,
        type: 'task',
        dependencies: ['req-2'],
      },
    ],
  },
  {
    id: 'phase-2',
    name: '第二阶段：核心开发',
    start: new Date(2024, 0, 21).getTime(),
    end: new Date(2024, 2, 10).getTime(),
    progress: 65,
    type: 'task',
    hideChildren: false,
    children: [
      {
        id: 'dev-1',
        name: '用户管理模块',
        start: new Date(2024, 0, 21).getTime(),
        end: new Date(2024, 1, 5).getTime(),
        progress: 90,
        type: 'task',
        dependencies: ['design-1'],
      },
      {
        id: 'dev-2',
        name: '业务逻辑模块',
        start: new Date(2024, 0, 28).getTime(),
        end: new Date(2024, 1, 15).getTime(),
        progress: 80,
        type: 'task',
        dependencies: ['design-1'],
      },
      {
        id: 'dev-3',
        name: '数据访问层',
        start: new Date(2024, 1, 1).getTime(),
        end: new Date(2024, 1, 20).getTime(),
        progress: 70,
        type: 'task',
        dependencies: ['dev-1'],
      },
      {
        id: 'dev-4',
        name: '前端界面开发',
        start: new Date(2024, 1, 10).getTime(),
        end: new Date(2024, 2, 5).getTime(),
        progress: 60,
        type: 'task',
        dependencies: ['design-2', 'dev-2'],
      },
      {
        id: 'dev-5',
        name: 'API 接口开发',
        start: new Date(2024, 1, 16).getTime(),
        end: new Date(2024, 2, 10).getTime(),
        progress: 45,
        type: 'task',
        dependencies: ['dev-3', 'dev-2'],
      },
    ],
  },
  {
    id: 'phase-3',
    name: '第三阶段：测试与优化',
    start: new Date(2024, 2, 11).getTime(),
    end: new Date(2024, 2, 30).getTime(),
    progress: 20,
    type: 'task',
    hideChildren: false,
    children: [
      {
        id: 'test-1',
        name: '功能测试',
        start: new Date(2024, 2, 11).getTime(),
        end: new Date(2024, 2, 20).getTime(),
        progress: 30,
        type: 'task',
        dependencies: ['dev-4', 'dev-5'],
      },
      {
        id: 'test-2',
        name: '性能测试',
        start: new Date(2024, 2, 18).getTime(),
        end: new Date(2024, 2, 25).getTime(),
        progress: 10,
        type: 'task',
        dependencies: ['test-1'],
      },
      {
        id: 'opt-1',
        name: '性能优化',
        start: new Date(2024, 2, 21).getTime(),
        end: new Date(2024, 2, 30).getTime(),
        progress: 5,
        type: 'task',
        dependencies: ['test-2'],
      },
    ],
  },
  {
    id: 'milestone-release',
    name: '产品发布',
    start: new Date(2024, 3, 1).getTime(),
    end: new Date(2024, 3, 1).getTime(),
    progress: 0,
    type: 'milestone',
    dependencies: ['opt-1'],
  },
];

/**
 * 小时视图任务数据
 */
const HOURLY_TASKS: Task[] = [
  {
    id: 'day-1',
    name: '第一天：项目启动',
    start: new Date(2024, 0, 1, 9, 0).getTime(),
    end: new Date(2024, 0, 1, 18, 0).getTime(),
    progress: 100,
    type: 'task',
    hideChildren: false,
    children: [
      {
        id: 'meeting-1',
        name: '项目启动会议',
        start: new Date(2024, 0, 1, 9, 0).getTime(),
        end: new Date(2024, 0, 1, 10, 30).getTime(),
        progress: 100,
        type: 'task',
      },
      {
        id: 'planning-1',
        name: '需求规划',
        start: new Date(2024, 0, 1, 11, 0).getTime(),
        end: new Date(2024, 0, 1, 12, 30).getTime(),
        progress: 100,
        type: 'task',
        dependencies: ['meeting-1'],
      },
      {
        id: 'setup-1',
        name: '开发环境搭建',
        start: new Date(2024, 0, 1, 14, 0).getTime(),
        end: new Date(2024, 0, 1, 16, 0).getTime(),
        progress: 100,
        type: 'task',
        dependencies: ['planning-1'],
      },
      {
        id: 'review-1',
        name: '代码审查',
        start: new Date(2024, 0, 1, 16, 30).getTime(),
        end: new Date(2024, 0, 1, 18, 0).getTime(),
        progress: 100,
        type: 'task',
        dependencies: ['setup-1'],
      },
    ],
  },
  {
    id: 'day-2',
    name: '第二天：核心开发',
    start: new Date(2024, 0, 2, 9, 0).getTime(),
    end: new Date(2024, 0, 2, 18, 0).getTime(),
    progress: 75,
    type: 'task',
    hideChildren: false,
    children: [
      {
        id: 'dev-1',
        name: '用户认证模块',
        start: new Date(2024, 0, 2, 9, 0).getTime(),
        end: new Date(2024, 0, 2, 11, 0).getTime(),
        progress: 90,
        type: 'task',
        dependencies: ['review-1'],
      },
      {
        id: 'dev-2',
        name: '数据模型设计',
        start: new Date(2024, 0, 2, 10, 0).getTime(),
        end: new Date(2024, 0, 2, 12, 0).getTime(),
        progress: 80,
        type: 'task',
        dependencies: ['review-1'],
      },
      {
        id: 'dev-3',
        name: 'API 接口开发',
        start: new Date(2024, 0, 2, 13, 0).getTime(),
        end: new Date(2024, 0, 2, 16, 0).getTime(),
        progress: 60,
        type: 'task',
        dependencies: ['dev-1', 'dev-2'],
      },
      {
        id: 'test-1',
        name: '单元测试',
        start: new Date(2024, 0, 2, 16, 30).getTime(),
        end: new Date(2024, 0, 2, 18, 0).getTime(),
        progress: 40,
        type: 'task',
        dependencies: ['dev-3'],
      },
    ],
  },
];

/**
 * 根据项目类型获取任务数据
 */
const getTasksByType = (projectType?: string): Task[] => {
  switch (projectType) {
    case 'complex':
      return COMPLEX_TASKS;
    case 'hourly':
      return HOURLY_TASKS;
    default:
      return BASIC_TASKS;
  }
};

/**
 * 根据视图模式获取对应的 ViewMode
 */
const getViewMode = (viewMode: string): ViewMode => {
  switch (viewMode) {
    case 'HalfDay':
      return ViewMode.HalfDay;
    case 'QuarterDay':
      return ViewMode.QuarterDay;
    case 'Hour':
      return ViewMode.Hour;
    case 'HalfHour':
      return ViewMode.HalfHour;
    default:
      return ViewMode.Day;
  }
};

/**
 * GanttBasic 组件属性接口
 */
interface GanttBasicProps {
  height?: number;
  width?: string;
  showProgress?: boolean;
  showDependencies?: boolean;
  viewMode?: string;
  locale?: string;
  readonly?: boolean;
  projectType?: string;
  customColors?: boolean;
}

/**
 * 基本 Gantt 图表示例组件
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
const GanttBasic: React.FC<GanttBasicProps> = ({
  height = 400,
  width = '100%',
  showProgress = true,
  showDependencies = true,
  viewMode = 'HalfHour',
  locale = 'zh-CN',
  readonly = false,
  projectType,
  customColors = false,
}) => {
  // 这些参数用于控制 Gantt 组件的显示和行为
  // showProgress 和 showDependencies 在 Gantt 组件内部处理
  console.log('GanttBasic props:', { showProgress, showDependencies });
  const [tasks, setTasks] = useState<Task[]>(() => getTasksByType(projectType));

  /**
   * 处理任务日期变化
   */
  const handleDateChange = (changedTask: Task, allTasks: Task[]) => {
    storyDebug('onDateChange', changedTask, allTasks);
    setTasks(allTasks);
  };

  /**
   * 处理任务进度变化
   */
  const handleProgressChange = (changedTask: Task, allTasks: Task[]) => {
    storyDebug('onProgressChange', changedTask, allTasks);
    setTasks(allTasks);
  };

  /**
   * 处理任务选择
   */
  const handleTaskSelect = (task: Task, isSelected: boolean) => {
    storyDebug('onTaskSelect', task, isSelected);
  };

  /**
   * 处理任务双击
   */
  const handleTaskDoubleClick = (task: Task) => {
    storyDebug('onTaskDoubleClick', task);
  };

  /**
   * 处理任务点击
   */
  const handleTaskClick = (task: Task) => {
    storyDebug('onTaskClick', task);
  };

  /**
   * 处理任务删除
   */
  const handleTaskDelete = (task: Task) => {
    storyDebug('onTaskDelete', task);
    const newTasks = tasks.filter(t => t.id !== task.id);
    setTasks(newTasks);
  };

  /**
   * 处理层级变化
   */
  const handleHierarchyChange = (
    movedTask: Task,
    newParentTask: Task | null,
    allTasks: Task[]
  ) => {
    storyDebug('onHierarchyChange', movedTask, newParentTask, allTasks);
    setTasks(allTasks);
    return true;
  };

  // 自定义颜色配置
  const customStyling = customColors
    ? {
        barProgressColor: '#4f46e5',
        barProgressSelectedColor: '#3730a3',
        barBackgroundColor: '#e5e7eb',
        barBackgroundSelectedColor: '#d1d5db',
        milestoneBackgroundColor: '#f59e0b',
        milestoneBackgroundSelectedColor: '#d97706',
        arrowColor: '#6b7280',
        todayColor: 'rgba(239, 68, 68, 0.1)',
      }
    : {};

  return (
    <div style={{ width, height: `${height}px` }}>
      <Gantt
        tasks={tasks}
        viewMode={getViewMode(viewMode)}
        locale={locale}
        readonly={readonly}
        ganttHeight={height}
        rowHeight={40}
        columns={[
          {
            key: 'name',
            title: locale === 'zh-CN' ? '任务名称' : 'Task Name',
            width: '200px',
          },
        ]}
        calendarRange={[1757635200000, 1757678400000]}
        onDateChange={handleDateChange}
        onProgressChange={handleProgressChange}
        onSelect={handleTaskSelect}
        onDoubleClick={handleTaskDoubleClick}
        onClick={handleTaskClick}
        onDelete={handleTaskDelete}
        onHierarchyChange={handleHierarchyChange}
        {...customStyling}
        TooltipContent={CustomTooltipContent}
      />
    </div>
  );
};

export default GanttBasic;
