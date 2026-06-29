import { LEGACY_PAGES, LEGACY_PRACTICE } from './legacyRoutes';
import { legacyPageHref, practiceHref } from '../lib/legacyApp';

export const ROUTES = {
  dashboard: '/dashboard',
  progress: '/progress',
  classes: legacyPageHref(LEGACY_PAGES.calendar),
  materials: legacyPageHref(LEGACY_PAGES.learningPlanner),
  assignments: legacyPageHref(LEGACY_PAGES.projects),
  resumeLab: legacyPageHref(LEGACY_PAGES.resume),
  settings: '#',
  practiceStudio: legacyPageHref(LEGACY_PAGES.hub),
  pythonLab: practiceHref(LEGACY_PRACTICE.codeWorkbench),
  sqlStudio: practiceHref(LEGACY_PRACTICE.sqlPractice),
  aptitude: legacyPageHref(LEGACY_PAGES.quiz),
  mockTests: legacyPageHref(LEGACY_PAGES.quiz),
  jobs: legacyPageHref(LEGACY_PAGES.jobspy),
  careerMap: legacyPageHref(LEGACY_PAGES.careerMap),
};

/** Sandbox pages — new Code Quest UI */
export const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', path: ROUTES.dashboard, icon: 'LayoutDashboard', external: false },
  { key: 'classes', label: 'Live Classes', path: ROUTES.classes, icon: 'GraduationCap', external: true },
  { key: 'practice-studio', label: 'Practice Studio', path: ROUTES.practiceStudio, icon: 'Code2', external: true },
  { key: 'materials', label: 'Study Materials', path: ROUTES.materials, icon: 'BookOpen', external: true },
  { key: 'assignments', label: 'Assignments', path: ROUTES.assignments, icon: 'ClipboardList', external: true },
  { key: 'resume-lab', label: 'Resume Lab', path: ROUTES.resumeLab, icon: 'FileText', external: true },
  { key: 'progress', label: 'Progress', path: ROUTES.progress, icon: 'TrendingUp', external: false },
  { key: 'settings', label: 'Settings', path: ROUTES.settings, icon: 'Settings', external: false },
];

/** Existing Code Quest practice engines (proxied /practice/* routes) */
export const PRACTICE_ITEMS = [
  { key: 'practice-code', label: 'Code Workbench', path: practiceHref(LEGACY_PRACTICE.codeWorkbench), icon: 'Code2', external: false },
  { key: 'practice-sql', label: 'SQL Practice', path: practiceHref(LEGACY_PRACTICE.sqlPractice), icon: 'Database', external: false },
  { key: 'practice-typing', label: 'Typing Practice', path: practiceHref(LEGACY_PRACTICE.typingPractice), icon: 'Keyboard', external: false },
  { key: 'practice-powerbi', label: 'Power BI Practice Ground', path: practiceHref(LEGACY_PRACTICE.powerBiPractice), icon: 'BarChart3', external: false },
  { key: 'quiz', label: 'Quiz', path: legacyPageHref(LEGACY_PAGES.quiz), icon: 'ClipboardList', external: true },
  { key: 'flow-roadmap', label: 'Flow Path', path: legacyPageHref(LEGACY_PAGES.flowRoadmap), icon: 'GitBranch', external: true },
];

export const LEARN_ITEMS = [
  { key: 'calendar', label: 'Calendar', path: legacyPageHref(LEGACY_PAGES.calendar), icon: 'CalendarDays', external: true },
  { key: 'learning-planner', label: 'Learning Planner', path: legacyPageHref(LEGACY_PAGES.learningPlanner), icon: 'BookOpen', external: true },
  { key: 'projects', label: 'Projects', path: legacyPageHref(LEGACY_PAGES.projects), icon: 'Boxes', external: true },
  { key: 'hub', label: 'Hub', path: legacyPageHref(LEGACY_PAGES.hub), icon: 'LayoutGrid', external: true },
];

export const CAREER_ITEMS = [
  { key: 'jobspy', label: 'Jobs', path: legacyPageHref(LEGACY_PAGES.jobspy), icon: 'Briefcase', external: true },
  { key: 'roadmapper', label: 'Career Map', path: legacyPageHref(LEGACY_PAGES.careerMap), icon: 'Map', external: true },
  { key: 'resume', label: 'Resume', path: legacyPageHref(LEGACY_PAGES.resume), icon: 'FileText', external: true },
];

/** @deprecated use PRACTICE_ITEMS */
export const TOOL_ITEMS = PRACTICE_ITEMS;
