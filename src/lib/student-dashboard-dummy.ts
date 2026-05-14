import type { AuthUser } from '@/lib/auth'
import type {
  EnrollmentMe,
  MySubmittedProject,
  StageProgressRecord,
  StudentJobApplicationsMe,
  TypingAttempt,
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

export const DUMMY_STUDENT_APPLICATIONS: StudentJobApplicationsMe = {
  count: 1,
  items: [
    {
      job_id: 9001,
      title: '[KPI demo seed] Junior Backend Engineer',
      company_name: 'CodeQuest Demo Labs',
      status: 'applied',
      created_at: isoMinutesAgo(120),
    },
  ],
}

export const DUMMY_STUDENT_ENROLLMENT: EnrollmentMe = {
  attendance_pct: 88,
  batch_names: ['[KPI demo seed] Spring cohort'],
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

export function shouldBlendStudentDashboardDummy(user: AuthUser): boolean {
  if (import.meta.env.VITE_DUMMY_STUDENT_DASHBOARD === 'true') {
    return true
  }
  return user.email?.toLowerCase() === 'demo@student.com'
}

export function isStudentDashboardSnapshotEmpty(
  stageRows: StageProgressRecord[],
  catalogSteps: number,
  typingAttempts: TypingAttempt[],
  applications: StudentJobApplicationsMe,
  enrollment: EnrollmentMe | null,
  submittedProjects: MySubmittedProject[],
): boolean {
  const noEnrollment =
    !enrollment || (enrollment.batch_names.length === 0 && enrollment.attendance_pct === null)
  return (
    stageRows.length === 0 &&
    catalogSteps === 0 &&
    typingAttempts.length === 0 &&
    applications.count === 0 &&
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
    applications: StudentJobApplicationsMe
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
      snapshot.applications,
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
    applications: DUMMY_STUDENT_APPLICATIONS,
    enrollment: DUMMY_STUDENT_ENROLLMENT,
    submittedProjects: DUMMY_STUDENT_PROJECTS,
  }
}
