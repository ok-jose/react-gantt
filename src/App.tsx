import { ConfigurableColumnsExample } from './examples/ConfigurableColumnsExample';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Gantt Chart - 可配置列功能演示</h1>
        <p>这个示例展示了可配置列的功能</p>
      </header>
      <main>
        <ConfigurableColumnsExample />
      </main>
    </div>
  );
}

export default App;
