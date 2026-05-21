import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Demo from './pages/Demo';
import Inspector from './pages/Inspector';

function App() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/inspect" element={<Inspector />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
