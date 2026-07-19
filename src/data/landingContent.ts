export const LANDING_SKILLS = [
  'Python',
  'SQL',
  'Data Analytics',
  'Power BI',
  'DSA',
  'Aptitude',
  'AI Tools',
  'Career Skills',
] as const

export const HERO_FLOAT_LABELS = [
  'Python',
  'SQL',
  'Analytics',
  'DSA',
  'AI',
] as const

export const QUEST_JOURNEY_STEPS = [
  {
    id: 'learn',
    title: 'Learn',
    description: 'Follow guided paths with lessons, live classes, and curated study materials.',
    icon: 'book',
  },
  {
    id: 'practice',
    title: 'Practice',
    description: 'Sharpen skills in sandboxes, arenas, and daily quests built for real outcomes.',
    icon: 'code',
  },
  {
    id: 'build',
    title: 'Build',
    description: 'Ship portfolio projects that prove you can solve problems end to end.',
    icon: 'layers',
  },
  {
    id: 'prove',
    title: 'Prove',
    description: 'Track XP, streaks, and readiness scores that show measurable progress.',
    icon: 'chart',
  },
  {
    id: 'hired',
    title: 'Get Hired',
    description: 'Polish your resume, prep for ATS, and discover roles matched to your path.',
    icon: 'briefcase',
  },
] as const

export const QUEST_ARENAS = [
  {
    id: 'python',
    title: 'Python Lab',
    tag: 'Core track',
    description: 'Write, run, and debug Python with instant feedback and quest-based challenges.',
    accent: '#1944F1',
  },
  {
    id: 'sql',
    title: 'SQL Arena',
    tag: 'Data skills',
    description: 'Query real datasets, climb difficulty tiers, and master analytics SQL.',
    accent: '#82D173',
  },
  {
    id: 'analytics',
    title: 'Data Analytics',
    tag: 'Insights',
    description: 'Explore dashboards, metrics, and storytelling with hands-on analytics labs.',
    accent: '#FFEF4D',
  },
  {
    id: 'dsa',
    title: 'DSA Practice',
    tag: 'Interview prep',
    description: 'Train patterns, time complexity, and problem-solving under pressure.',
    accent: '#1944F1',
  },
  {
    id: 'aptitude',
    title: 'Aptitude Hub',
    tag: 'Placement',
    description: 'Build logical reasoning and quantitative skills for campus placements.',
    accent: '#82D173',
  },
  {
    id: 'ai',
    title: 'AI Tools',
    tag: 'Future ready',
    description: 'Learn practical AI workflows for coding, research, and career tasks.',
    accent: '#FFEF4D',
  },
] as const

/** Demo progress — not real user data. */
export const CAREER_PROGRESS_DEMO = [
  { label: 'Python', value: 78, color: '#1944F1' },
  { label: 'SQL', value: 64, color: '#82D173' },
  { label: 'Resume Readiness', value: 72, color: '#FFEF4D' },
  { label: 'Career Path', value: 85, color: '#1944F1', caption: 'Data Analyst' },
] as const

export const CAREER_MAP_STEPS = [
  'Skills',
  'Practice',
  'Projects',
  'Resume',
  'Readiness',
  'Jobs',
] as const

export const DASHBOARD_WIDGETS = [
  { id: 'daily', title: 'Daily Quest', meta: 'Complete 3 SQL drills', xp: '+120 XP' },
  { id: 'xp', title: 'XP Progress', meta: 'Level 12 · 2,480 XP', xp: '68% to L13' },
  { id: 'streak', title: 'Learning Streak', meta: '14 days active', xp: 'Keep it going' },
  { id: 'class', title: 'Upcoming Class', meta: 'Data Viz · Today 5 PM', xp: 'Join live' },
  { id: 'sql', title: 'SQL Arena', meta: 'JOIN mastery set', xp: '2/5 done' },
  { id: 'resume', title: 'Resume Quest', meta: 'ATS scan pending', xp: 'Review' },
  { id: 'map', title: 'Career Map', meta: 'Data Analyst track', xp: 'Step 4/6' },
  { id: 'jobs', title: 'Recommended Jobs', meta: '3 new matches', xp: 'View' },
] as const

export const FEATURE_STORY_ITEMS = [
  {
    id: 'paths',
    title: 'Guided learning paths',
    body: 'Structured journeys from fundamentals to job-ready skills — no guesswork about what to learn next.',
    tone: 'light' as const,
  },
  {
    id: 'sandboxes',
    title: 'Coding sandboxes',
    body: 'Practice in-browser with instant feedback across Python, SQL, and analytics environments.',
    tone: 'dark' as const,
  },
  {
    id: 'resume',
    title: 'Resume & ATS preparation',
    body: 'Build, scan, and refine resumes tuned for applicant tracking systems and recruiter review.',
    tone: 'light' as const,
  },
  {
    id: 'jobs',
    title: 'Job discovery',
    body: 'Explore roles aligned with your skills, readiness score, and chosen career path.',
    tone: 'dark' as const,
  },
  {
    id: 'progress',
    title: 'Progress & readiness tracking',
    body: 'XP, streaks, and readiness indicators show where you stand — and what to tackle next.',
    tone: 'light' as const,
  },
  {
    id: 'live',
    title: 'Live classes & assignments',
    body: 'Attend sessions, submit work, and stay accountable with instructor-led milestones.',
    tone: 'dark' as const,
  },
  {
    id: 'materials',
    title: 'Books, articles & study materials',
    body: 'Curated resources woven into your quest so learning stays focused and contextual.',
    tone: 'light' as const,
  },
] as const
