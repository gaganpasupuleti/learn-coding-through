export const ROUTES = {
  dashboard: '/dashboard',
  classes: '/classes',
  practiceStudio: '/practice-studio',
  materials: '/materials',
  assignments: '/assignments',
  resumeLab: '/resume-lab',
  progress: '/progress',
  settings: '/settings',
  pythonLab: '/python-lab',
  sqlStudio: '/sql-studio',
  aptitude: '/aptitude',
  mockTests: '/mock-tests',
};

export const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', path: ROUTES.dashboard, icon: 'LayoutDashboard' },
  { key: 'classes', label: 'Live Classes', path: ROUTES.classes, icon: 'GraduationCap' },
  { key: 'practice-studio', label: 'Practice Studio', path: ROUTES.practiceStudio, icon: 'Code2' },
  { key: 'materials', label: 'Study Materials', path: ROUTES.materials, icon: 'BookOpen' },
  { key: 'assignments', label: 'Assignments', path: ROUTES.assignments, icon: 'ClipboardList' },
  { key: 'resume-lab', label: 'Resume Lab', path: ROUTES.resumeLab, icon: 'FileText' },
  { key: 'progress', label: 'Progress', path: ROUTES.progress, icon: 'TrendingUp' },
  { key: 'settings', label: 'Settings', path: ROUTES.settings, icon: 'Settings' },
];

export const TOOL_ITEMS = [
  { key: 'python-lab', label: 'Python Lab', path: ROUTES.pythonLab, icon: 'Braces' },
  { key: 'sql-studio', label: 'SQL Studio', path: ROUTES.sqlStudio, icon: 'Database' },
  { key: 'aptitude', label: 'Aptitude Trainer', path: ROUTES.aptitude, icon: 'Brain' },
  { key: 'mock-tests', label: 'Mock Tests', path: ROUTES.mockTests, icon: 'Target' },
];
