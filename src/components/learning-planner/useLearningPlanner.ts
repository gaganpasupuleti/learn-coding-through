import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  fetchCalendarEvents,
  fetchMyEnrollment,
  fetchMyStageProgress,
  fetchUpcomingDeadlines,
  fetchUpcomingSchedule,
  type CalendarEvent,
  type EnrollmentMe,
  type StageProgressRecord,
  type UpcomingDeadlines,
  type UpcomingSession,
} from '@/lib/api'
import { readCareerJourneySummary, type CareerJourneySummary } from '@/lib/career-local-summary'
import { collectEventDates, monthDateRange } from '@/lib/calendar-events'
import {
  buildDayLearningPlan,
  buildMarkedDatesByType,
  buildProgramAnchor,
  buildRoadmapProgress,
  collectStudyDatesForMonth,
  computeEventCounts,
  getInitialSelectedDate,
  isoToViewMonth,
  mergeTimelineForDate,
  storePlannerStart,
  type DayLearningPlan,
  type EventCounts,
  type MarkedDatesByType,
  type PlannerTimelineItem,
  type ProgramAnchor,
  type RoadmapProgress,
} from '@/lib/learning-planner-derive'
import {
  blendStudentScheduleDummyIfNeeded,
  shouldBlendStudentDashboardDummy,
} from '@/lib/student-dashboard-dummy'
import type { AuthUser } from '@/lib/auth'
import {
  getPrimaryLearningAction,
  type PlannerAction,
} from '@/components/learning-planner/planner-actions'

export interface LearningPlannerState {
  selectedDate: string
  setSelectedDate: (date: string) => void
  viewMonth: Date
  setViewMonth: (month: Date) => void
  markedDates: Set<string>
  markedDatesByType: MarkedDatesByType
  eventCounts: EventCounts
  primaryAction: PlannerAction | null
  careerJourney: CareerJourneySummary | null
  enrollment: EnrollmentMe | null
  anchor: ProgramAnchor
  dayPlan: DayLearningPlan
  timeline: PlannerTimelineItem[]
  roadmapProgress: RoadmapProgress
  loading: boolean
  setProgramStart: (iso: string) => void
  reload: () => Promise<void>
}

export function useLearningPlanner(user: AuthUser): LearningPlannerState {
  const [selectedDate, setSelectedDateState] = useState(getInitialSelectedDate)
  const [viewMonth, setViewMonth] = useState(() => isoToViewMonth(getInitialSelectedDate()))
  const [careerJourney, setCareerJourney] = useState<CareerJourneySummary | null>(null)
  const [enrollment, setEnrollment] = useState<EnrollmentMe | null>(null)
  const [sessions, setSessions] = useState<UpcomingSession[]>([])
  const [deadlines, setDeadlines] = useState<UpcomingDeadlines>({ quizzes: [], stages: [] })
  const [stageRows, setStageRows] = useState<StageProgressRecord[] | null>(null)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [anchorOverride, setAnchorOverride] = useState<string | null>(null)

  const setSelectedDate = useCallback((date: string) => {
    setSelectedDateState(date)
    setViewMonth(isoToViewMonth(date))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setCareerJourney(readCareerJourneySummary())
    try {
      const warn = (label: string) => (err: unknown) => {
        console.warn(`[Planner] ${label} failed:`, err)
        return undefined
      }
      const [enr, sched, dl, stages] = await Promise.all([
        fetchMyEnrollment().catch(warn('enrollment')),
        fetchUpcomingSchedule(10).catch(warn('schedule')),
        fetchUpcomingDeadlines().catch(warn('deadlines')),
        fetchMyStageProgress().catch(warn('stages')),
      ])
      setEnrollment(enr ?? { attendance_pct: null, batch_names: [], batch_start_date: null, selected_role_id: null })
      setStageRows(stages ?? [])
      const scheduleBlend = blendStudentScheduleDummyIfNeeded(
        user,
        sched ?? [],
        dl ?? { quizzes: [], stages: [] },
      )
      setSessions(scheduleBlend.sessions)
      setDeadlines(scheduleBlend.deadlines)
    } catch {
      toast.error('Could not load planner data.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const anchor = useMemo(() => {
    if (anchorOverride) {
      return { startDate: anchorOverride, source: 'local' as const }
    }
    return buildProgramAnchor(enrollment, sessions, careerJourney?.roleId ?? null)
  }, [anchorOverride, enrollment, sessions, careerJourney?.roleId])

  useEffect(() => {
    let cancelled = false
    const { startDate, endDate } = monthDateRange(viewMonth)

    void fetchCalendarEvents({ startDate, endDate })
      .then((res) => {
        if (!cancelled) setCalendarEvents(res.events)
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('[Planner] calendar fetch failed:', err)
          setCalendarEvents([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [viewMonth])

  const markedDatesByType = useMemo(
    () => buildMarkedDatesByType(calendarEvents, viewMonth, careerJourney, anchor),
    [calendarEvents, viewMonth, careerJourney, anchor],
  )

  const markedDates = useMemo(() => {
    const dates = collectEventDates(calendarEvents)
    for (const d of collectStudyDatesForMonth(viewMonth, careerJourney, anchor)) {
      dates.add(d)
    }
    for (const s of sessions) {
      dates.add(s.session_date)
    }
    return dates
  }, [calendarEvents, viewMonth, careerJourney, anchor, sessions])

  const dayPlan = useMemo(
    () =>
      buildDayLearningPlan(
        selectedDate,
        careerJourney,
        anchor,
        calendarEvents,
        deadlines,
        stageRows,
      ),
    [selectedDate, careerJourney, anchor, calendarEvents, deadlines, stageRows],
  )

  const timeline = useMemo(
    () =>
      mergeTimelineForDate(
        selectedDate,
        careerJourney,
        anchor,
        calendarEvents,
        deadlines,
        stageRows,
      ),
    [selectedDate, careerJourney, anchor, calendarEvents, deadlines, stageRows],
  )

  const roadmapProgress = useMemo(
    () => buildRoadmapProgress(selectedDate, anchor, careerJourney),
    [selectedDate, anchor, careerJourney],
  )

  const eventCounts = useMemo(() => computeEventCounts(timeline), [timeline])
  const primaryAction = useMemo(
    () => getPrimaryLearningAction(timeline, dayPlan),
    [timeline, dayPlan],
  )

  const setProgramStart = useCallback(
    (iso: string) => {
      if (careerJourney?.roleId) storePlannerStart(careerJourney.roleId, iso)
      setAnchorOverride(iso)
    },
    [careerJourney?.roleId],
  )

  return {
    selectedDate,
    setSelectedDate,
    viewMonth,
    setViewMonth,
    markedDates,
    markedDatesByType,
    eventCounts,
    primaryAction,
    careerJourney,
    enrollment,
    anchor,
    dayPlan,
    timeline,
    roadmapProgress,
    loading,
    setProgramStart,
    reload: load,
  }
}

export function usePlannerDemoBanner(user: AuthUser): boolean {
  return shouldBlendStudentDashboardDummy(user)
}
