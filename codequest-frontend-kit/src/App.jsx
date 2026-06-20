import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LiveClassesPage from './pages/LiveClassesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/classes" element={<LiveClassesPage />} />
        <Route path="*" element={<Navigate to="/progress" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
