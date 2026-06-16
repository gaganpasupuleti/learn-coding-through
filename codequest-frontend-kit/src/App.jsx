import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ClassesPage from './pages/ClassesPage';
import PracticeStudioPage from './pages/PracticeStudioPage';
import MaterialsPage from './pages/MaterialsPage';
import AssignmentsPage from './pages/AssignmentsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/practice-studio" element={<PracticeStudioPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="*" element={<Navigate to="/progress" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
