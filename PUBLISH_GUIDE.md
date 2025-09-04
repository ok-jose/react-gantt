# NPM 发布指南

## 准备工作

### 1. 更新包名

在 `package.json` 中更新包名为你的用户名：

```json
{
  "name": "@yourusername/react-gantt"
}
```

### 2. 更新作者信息

```json
{
  "author": "Your Name <your.email@example.com>"
}
```

### 3. 更新仓库信息

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/react-gantt.git"
  },
  "homepage": "https://github.com/yourusername/react-gantt#readme",
  "bugs": {
    "url": "https://github.com/yourusername/react-gantt/issues"
  }
}
```

## 发布步骤

### 1. 登录 npm

```bash
npm login
```

### 2. 检查包内容

```bash
npm pack --dry-run
```

### 3. 发布包

```bash
npm publish --access public
```

## 包信息

- **包名**: `@yourusername/react-gantt`
- **版本**: `0.1.0`
- **大小**: ~306.5 kB
- **文件数**: 42 个文件

## 包含的文件

- `dist/index.umd.js` - UMD 格式的 JavaScript 文件
- `dist/index.es.js` - ES 模块格式的 JavaScript 文件
- `dist/index.d.ts` - TypeScript 类型定义文件
- `dist/react-gantt.css` - 样式文件
- 完整的类型定义文件结构

## 使用方式

安装：

```bash
npm install @yourusername/react-gantt
```

使用：

```tsx
import { Gantt, ViewMode } from '@yourusername/react-gantt';
import '@yourusername/react-gantt/dist/react-gantt.css';
```

## 注意事项

1. 确保包名是唯一的
2. 发布前测试构建是否正常
3. 检查所有依赖是否正确配置
4. 确保类型定义文件正确生成
