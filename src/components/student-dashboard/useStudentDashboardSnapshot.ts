import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  fetchMyEnrollment,
  fetchMyStageProgress,
  fetchMySubmittedProjects,
  fetchTypingAttempts,
  fetchUpcomingDeadlines,
  fetchUpcomingSchedule,
  fetchUserProgress,
  type EnrollmentMe,
  type MySubmittedProject,
  type StageProgressRecord,
  type TypingAttempt,
  type UpcomingDeadlines,
  type UpcomingSession,
} from '@/lib/api'
import { readCareerJourneySummary, type CareerJourneySummary } from '@/lib/career-local-summary'
import {
  blendStudentDashboardDummyIfNeeded,
  blendStudentScheduleDummyIfNeeded,
} from '@/lib/student-dashboard-dummy'
import type { AuthUser } from '@/lib/auth'

export interface StudentDashboardSnapshot {
  stageRows: StageProgressRecord[] | null
  catalogSteps: number | null
  careerJourney: CareerJourneySummary | null
  typingAttempts: TypingAttempt[]
  enrollment: EnrollmentMe | null
  submittedProjects: MySubmittedProject[]
  upcomingSessions: UpcomingSession[]
  deadlines: UpcomingDeadlines
  loading: boolean
  reload: () => Promise<void>
}

export function useStudentDashboardSnapshot(user: AuthUser): StudentDashboardSnapshot {
  const [stageRows, setStageRows] = useState<StageProgressRecord[] | null>(null)
  const [catalogSteps, setCatalogSteps] = useState<number | null>(null)
  const [careerJourney, setCareerJourney] = useState<CareerJourneySummary | null>(null)
  const [typingAttempts, setTypingAttempts] = useState<TypingAttempt[]>([])
  const [enrollment, setEnrollment] = useState<EnrollmentMe | null>(null)
  const [submittedProjects, setSubmittedProjects] = useState<MySubmittedProject[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [deadlines, setDeadlines] = useState<UpcomingDeadlines>({ quizzes: [], stages: [] })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setCareerJourney(readCareerJourneySummary())
    try {
      const warn = (label: string) => (err: unknown) => {
        console.warn(`[Dashboard] ${label} failed:`, err)
        return undefined
      }
      const [stages, catalog, typing, enr, projs, sessions, dl] = await Promise.all([
        fetchMyStageProgress().catch(warn('stageProgress')),
        fetchUserProgress().catch(warn('catalogProgress')),
        fetchTypingAttempts(30).catch(warn('typing')),
        fetchMyEnrollment().catch(warn('enrollment')),
        fetchMySubmittedProjects().catch(warn('projects')),
        fetchUpcomingSchedule(5).catch(warn('schedule')),
        fetchUpcomingDeadlines().catch(warn('deadlines')),
      ])
      const catalogCount = catalog?.completedSteps?.length ?? 0
      const blended = blendStudentDashboardDummyIfNeeded(user, {
        stageRows: stages ?? [],
        catalogSteps: catalogCount,
        typingAttempts: typing ?? [],
        enrollment: enr ?? { attendance_pct: null, batch_names: [], batch_start_date: null, selected_role_id: null },
        submittedProjects: projs ?? [],
      })
      setStageRows(blended.stageRows)
      setCatalogSteps(blended.catalogSteps)
      setTypingAttempts(blended.typingAttempts)
      setEnrollment(blended.enrollment)
      setSubmittedProjects(blended.submittedProjects)
      const scheduleBlend = blendStudentScheduleDummyIfNeeded(
        user,
        sessions ?? [],
        dl ?? { quizzes: [], stages: [] },
      )
      setUpcomingSessions(scheduleBlend.sessions)
      setDeadlines(scheduleBlend.deadlines)
      const failCount = [stages, catalog, typing, enr, projs, sessions, dl].filter(
        (v) => v === undefined,
      ).length
      const hasCoreData =
        blended.stageRows.length > 0 ||
        blended.catalogSteps > 0 ||
        blended.typingAttempts.length > 0
      if (failCount > 0 && !hasCoreData) {
        toast.error(
          'Could not load dashboard data. Check that the API is running and you are signed in.',
        )
      } else if (failCount > 0) {
        console.warn(`[Dashboard] ${failCount} request(s) failed; showing available data.`)
      }
    } catch {
      toast.error('Could not load dashboard data. Is the API running?')
      const blended = blendStudentDashboardDummyIfNeeded(user, {
        stageRows: [],
        catalogSteps: 0,
        typingAttempts: [],
        enrollment: { attendance_pct: null, batch_names: [], batch_start_date: null, selected_role_id: null },
        submittedProjects: [],
      })
      setStageRows(blended.stageRows)
      setCatalogSteps(blended.catalogSteps)
      setTypingAttempts(blended.typingAttempts)
      setEnrollment(blended.enrollment)
      setSubmittedProjects(blended.submittedProjects)
      const scheduleBlend = blendStudentScheduleDummyIfNeeded(user, [], {
        quizzes: [],
        stages: [],
      })
      setUpcomingSessions(scheduleBlend.sessions)
      setDeadlines(scheduleBlend.deadlines)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  return {
    stageRows,
    catalogSteps,
    careerJourney,
    typingAttempts,
    enrollment,
    submittedProjects,
    upcomingSessions,
    deadlines,
    loading,
    reload: load,
  }
}
