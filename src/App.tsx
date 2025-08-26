import React from 'react';
import NestedStructureExample from './example-nested-structure';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Gantt Chart - 重叠检测功能演示</h1>
        <p>这个示例展示了项目子任务重叠检测功能</p>
      </header>
      <main>
        <NestedStructureExample />
      </main>
    </div>
  );
}

export default App;
