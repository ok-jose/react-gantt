# Debug 调试指南

本项目使用 [debug](https://www.npmjs.com/package/debug) 包来替代 `console.log` 进行调试。这种方式提供了更好的调试体验和更灵活的控制。

## 安装和配置

debug 包已经作为项目依赖安装，无需额外配置。

## 使用方法

### 1. 导入调试器

```typescript
import {
  ganttDebug,
  taskItemDebug,
  dragDebug,
  timeDebug,
  hierarchyDebug,
  eventDebug,
} from '../utils/debug';
```

### 2. 使用调试器

```typescript
// 替代 console.log
ganttDebug('甘特图组件初始化');
dragDebug('拖拽开始:', { taskId: task.id, position: { x, y } });
timeDebug('时间计算:', { start: newStart, end: newEnd });
hierarchyDebug('层级变化:', { movedTask: task.name, newParent: parent?.name });
```

### 3. 启用调试

#### 在开发环境中

```bash
# 启用所有调试日志
DEBUG=react-gantt:* npm run dev

# 只启用特定模块的调试
DEBUG=react-gantt:gantt npm run dev
DEBUG=react-gantt:drag npm run dev
DEBUG=react-gantt:time npm run dev

# 启用多个模块
DEBUG=react-gantt:gantt,react-gantt:drag npm run dev

# 排除特定模块
DEBUG=react-gantt:*,-react-gantt:stories npm run dev
```

#### 在浏览器中

```javascript
// 在浏览器控制台中启用调试
localStorage.debug = 'react-gantt:*';

// 或者只启用特定模块
localStorage.debug = 'react-gantt:gantt,react-gantt:drag';

// 然后刷新页面
```

### 4. 可用的调试命名空间

- `react-gantt:gantt` - 甘特图主组件
- `react-gantt:task-item` - 任务项组件
- `react-gantt:task-gantt-content` - 任务甘特内容
- `react-gantt:task-list` - 任务列表
- `react-gantt:calendar` - 日历组件
- `react-gantt:grid` - 网格组件
- `react-gantt:drag` - 拖拽功能
- `react-gantt:time` - 时间计算
- `react-gantt:hierarchy` - 层级关系
- `react-gantt:events` - 事件处理
- `react-gantt:stories` - 故事书示例
- `react-gantt:general` - 通用调试

### 5. 环境变量配置

项目会自动根据环境配置调试：

- **开发环境** (`NODE_ENV=development`): 自动启用所有调试日志
- **生产环境** (`NODE_ENV=production`): 自动禁用所有调试日志

### 6. 手动控制调试

```typescript
import { enableAllDebug, disableAllDebug } from '../utils/debug';

// 启用所有调试
enableAllDebug();

// 禁用所有调试
disableAllDebug();
```

## 优势

1. **性能优化**: 在生产环境中自动禁用，不会影响性能
2. **灵活控制**: 可以精确控制哪些模块输出调试信息
3. **颜色区分**: 不同命名空间有不同的颜色，便于识别
4. **时间戳**: 显示毫秒级时间差，便于性能分析
5. **格式化输出**: 支持对象格式化输出

## 迁移指南

### 从 console.log 迁移

**之前:**

```typescript
console.log('任务更新:', task);
console.log('拖拽开始:', { x, y });
```

**之后:**

```typescript
import { eventDebug, dragDebug } from '../utils/debug';

eventDebug('任务更新:', task);
dragDebug('拖拽开始:', { x, y });
```

### 条件调试

**之前:**

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('调试信息:', data);
}
```

**之后:**

```typescript
import { generalDebug } from '../utils/debug';

generalDebug('调试信息:', data); // 自动根据环境控制
```

## 最佳实践

1. **使用合适的命名空间**: 根据功能选择对应的调试器
2. **提供有意义的上下文**: 调试信息应该包含足够的上下文
3. **避免敏感信息**: 不要在调试信息中包含密码、token 等敏感数据
4. **结构化数据**: 使用对象而不是字符串拼接来传递复杂数据

```typescript
// 好的做法
dragDebug('拖拽操作:', {
  taskId: task.id,
  taskName: task.name,
  fromPosition: { x: startX, y: startY },
  toPosition: { x: endX, y: endY },
});

// 避免的做法
dragDebug(
  '拖拽任务 ' +
    task.name +
    ' 从 ' +
    startX +
    ',' +
    startY +
    ' 到 ' +
    endX +
    ',' +
    endY
);
```
