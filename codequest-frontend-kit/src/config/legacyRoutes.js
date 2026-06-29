/**
 * Routes for the existing Code Quest app (main repo root SPA).
 * Practice paths are proxied through the sandbox dev server (see vite.config.js).
 * Other pages use ?page= deep links on the legacy app origin.
 */
export const LEGACY_PRACTICE = {
  codeWorkbench: '/practice/code',
  sqlPractice: '/practice/sql',
  typingPractice: '/practice/typing',
  powerBiPractice: '/practice/powerbi',
};

export const LEGACY_PAGES = {
  dashboard: 'dashboard',
  calendar: 'calendar',
  progress: 'progress',
  learningPlanner: 'learning-planner',
  projects: 'projects',
  hub: 'hub',
  quiz: 'quiz',
  flowRoadmap: 'flow-roadmap',
  jobspy: 'jobspy',
  careerMap: 'roadmapper',
  resume: 'resume',
};
