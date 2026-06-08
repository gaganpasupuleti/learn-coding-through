import type { AuthUser } from '@/lib/auth'
import type {
  EnrollmentMe,
  MySubmittedProject,
  StageProgressRecord,
  TypingAttempt,
  UpcomingDeadlines,
  UpcomingSession,
} from '@/lib/api'

const now = new Date()

function isoMinutesAgo(minutes: number): string {
  return new Date(now.getTime() - minutes * 60_000).toISOString()
}

/** Mirrors backend KPI seed shape so charts and KPI tiles render without a live API. */
export const DUMMY_STUDENT_STAGE_ROWS: StageProgressRecord[] = [
  { stage_id: 1, lessons_completed: 6, total_lessons: 12, exercises_completed_pct: 72, latest_quiz_score: 78, unlocked: true },
  { stage_id: 2, lessons_completed: 7, total_lessons: 12, exercises_completed_pct: 76, latest_quiz_score: 84, unlocked: true },
  { stage_id: 3, lessons_completed: 5, total_lessons: 10, exercises_completed_pct: 68, latest_quiz_score: 72, unlocked: true },
  { stage_id: 4, lessons_completed: 11, total_lessons: 12, exercises_completed_pct: 82, latest_quiz_score: 91, unlocked: true },
]

export const DUMMY_STUDENT_TYPING: TypingAttempt[] = [38, 44, 41, 52, 48, 61, 55, 67].map((wpm, i) => ({
  id: 9000 + i,
  mode: 'sentence' as const,
  test_type: 'timed' as const,
  test_option: '60',
  language: 'en',
  wpm,
  raw_wpm: wpm + 3,
  accuracy: 96.5,
  error_count: 1,
  elapsed_seconds: 60,
  created_at: isoMinutesAgo(20 * (i + 1)),
}))

export const DUMMY_STUDENT_ENROLLMENT: EnrollmentMe = {
  attendance_pct: 88,
  batch_names: ['[KPI demo seed] Spring cohort'],
  batch_start_date: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
  selected_role_id: 1,
}

export const DUMMY_STUDENT_PROJECTS: MySubmittedProject[] = [
  {
    id: 9101,
    stage_id: 1,
    title: '[KPI demo seed] Portfolio A (approved)',
    status: 'approved',
    github_link: 'https://github.com/example/demo-portfolio',
  },
  {
    id: 9102,
    stage_id: 1,
    title: '[KPI demo seed] Portfolio B (submitted)',
    status: 'submitted',
    github_link: 'https://github.com/example/demo-portfolio',
  },
]

export const DUMMY_CATALOG_STEP_COUNT = 3

const KPI_DEMO_EMAILS = new Set(['demo@student.com', 'kundetiriya@gmail.com'])

function addDaysIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const DUMMY_UPCOMING_SESSIONS: UpcomingSession[] = [
  {
    id: 9001,
    batch_name: '[KPI demo seed] Spring cohort',
    title: 'Session 1: HTML & CSS Basics',
    topic: 'Box model, selectors, flexbox',
    session_date: addDaysIso(1),
    start_time: '10:00:00',
    end_time: '13:00:00',
    status: 'scheduled',
  },
  {
    id: 9002,
    batch_name: '[KPI demo seed] Spring cohort',
    title: 'Session 2: JavaScript Fundamentals',
    topic: 'Variables, functions, DOM manipulation',
    session_date: addDaysIso(3),
    start_time: '10:00:00',
    end_time: '13:00:00',
    status: 'scheduled',
  },
  {
    id: 9003,
    batch_name: '[KPI demo seed] Spring cohort',
    title: 'Session 3: React Introduction',
    topic: 'Components, JSX, props and state',
    session_date: addDaysIso(5),
    start_time: '10:00:00',
    end_time: '13:00:00',
    status: 'scheduled',
  },
]

export const DUMMY_UPCOMING_DEADLINES: UpcomingDeadlines = {
  quizzes: [
    { quiz_id: 9001, title: 'Stage 1 quiz', due_date: addDaysIso(5), passed: false },
    { quiz_id: 9002, title: 'Stage 2 quiz', due_date: addDaysIso(12), passed: false },
  ],
  stages: [
    { stage_id: 1, title: 'Stage 1', due_date: addDaysIso(7), unlocked: true },
    { stage_id: 2, title: 'Stage 2', due_date: addDaysIso(14), unlocked: true },
  ],
}

export function shouldBlendStudentDashboardDummy(user: AuthUser): boolean {
  if (import.meta.env.VITE_DUMMY_STUDENT_DASHBOARD === 'true') {
    return true
  }
  const email = user.email?.toLowerCase() ?? ''
  return KPI_DEMO_EMAILS.has(email)
}

export function isStudentDashboardSnapshotEmpty(
  stageRows: StageProgressRecord[],
  catalogSteps: number,
  typingAttempts: TypingAttempt[],
  enrollment: EnrollmentMe | null,
  submittedProjects: MySubmittedProject[],
): boolean {
  const noEnrollment =
    !enrollment || (enrollment.batch_names.length === 0 && enrollment.attendance_pct === null)
  return (
    stageRows.length === 0 &&
    catalogSteps === 0 &&
    typingAttempts.length === 0 &&
    submittedProjects.length === 0 &&
    noEnrollment
  )
}

export function blendStudentDashboardDummyIfNeeded(
  user: AuthUser,
  snapshot: {
    stageRows: StageProgressRecord[]
    catalogSteps: number
    typingAttempts: TypingAttempt[]
    enrollment: EnrollmentMe | null
    submittedProjects: MySubmittedProject[]
  },
): typeof snapshot {
  if (!shouldBlendStudentDashboardDummy(user)) {
    return snapshot
  }
  if (
    !isStudentDashboardSnapshotEmpty(
      snapshot.stageRows,
      snapshot.catalogSteps,
      snapshot.typingAttempts,
      snapshot.enrollment,
      snapshot.submittedProjects,
    )
  ) {
    return snapshot
  }
  return {
    stageRows: DUMMY_STUDENT_STAGE_ROWS,
    catalogSteps: DUMMY_CATALOG_STEP_COUNT,
    typingAttempts: DUMMY_STUDENT_TYPING,
    enrollment: DUMMY_STUDENT_ENROLLMENT,
    submittedProjects: DUMMY_STUDENT_PROJECTS,
  }
}

export function blendStudentScheduleDummyIfNeeded(
  user: AuthUser,
  sessions: UpcomingSession[],
  deadlines: UpcomingDeadlines,
): { sessions: UpcomingSession[]; deadlines: UpcomingDeadlines } {
  if (!shouldBlendStudentDashboardDummy(user)) {
    return { sessions, deadlines }
  }
  return {
    sessions: sessions.length > 0 ? sessions : DUMMY_UPCOMING_SESSIONS,
    deadlines:
      deadlines.quizzes.length > 0 || deadlines.stages.length > 0
        ? deadlines
        : DUMMY_UPCOMING_DEADLINES,
  }
}
