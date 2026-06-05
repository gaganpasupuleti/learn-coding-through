import type {
  CalendarEvent,
  EnrollmentMe,
  StageProgressRecord,
  UpcomingDeadlines,
  UpcomingSession,
} from '@/lib/api'
import type { CareerJourneySummary } from '@/lib/career-local-summary'
import { monthDateRange, toIsoDate } from '@/lib/calendar-events'
import { syllabusConfig } from '@/lib/syllabus-config'
import type { SyllabusItem } from '@/types/career'

export const PLANNER_SELECTED_DATE_KEY = 'planner-selected-date'
export const PLANNER_HIGHLIGHT_ITEM_KEY = 'planner-highlight-item'
const PLANNER_START_PREFIX = 'learning-planner-start-'

const MONTH_NAMES = ['Foundation', 'Build', 'Advanced', 'Career Ready']

export type PlannerTimelineKind =
  | 'class'
  | 'quiz'
  | 'project'
  | 'syllabus'
  | 'practice'

export type DayJourneyStatus = 'completed' | 'current' | 'upcoming' | 'rest'

export interface ProgramAnchor {
  startDate: string
  source: 'batch' | 'session' | 'local' | 'today'
}

export interface SyllabusWeekContext {
  month: number
  week: number
  weekIndex: number
  stageLabel: string
}

export interface DayLearningPlan {
  date: string
  topic: string
  objectives: string[]
  requiredLessons: { id: string; title: string; done: boolean; type: string }[]
  practiceTasks: string[]
  quizStatus: { title: string; due: string; passed: boolean } | null
  projectStatus: { title: string; due: string; complete: boolean } | null
  estimatedMinutes: number
  progressPct: number
  dailyObjective: string
}

export interface WeekDayCell {
  date: string
  weekday: string
  dayNum: number
  status: DayJourneyStatus
  topicPreview: string | null
}

export interface PlannerTimelineItem {
  id: string
  kind: PlannerTimelineKind
  title: string
  subtitle: string | null
  timeLabel: string
  description: string | null
  durationMinutes: number
  status: 'done' | 'pending' | 'overdue'
  syllabusItemId?: string
  quizId?: string
  projectId?: string
  entityId?: number
  stageId?: number | null
  eventType?: CalendarEvent['event_type']
}

export interface RoadmapProgress {
  month: number
  monthLabel: string
  week: number
  dayOfWeek: string
  dayNum: number
  stageLabel: string
  pct: number
}

export interface EventCounts {
  classes: number
  practice: number
  quizzes: number
  projects: number
  syllabus: number
  total: number
}

export type MarkedDatesByType = Map<string, Set<PlannerTimelineKind>>

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDaysIso(iso: string, days: number): string {
  const d = parseIsoDate(iso)
  d.setDate(d.getDate() + days)
  return toIsoDate(d)
}

export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function readStoredPlannerStart(roleId: string): string | null {
  try {
    return localStorage.getItem(`${PLANNER_START_PREFIX}${roleId}`)
  } catch {
    return null
  }
}

export function storePlannerStart(roleId: string, iso: string): void {
  try {
    localStorage.setItem(`${PLANNER_START_PREFIX}${roleId}`, iso)
  } catch {
    /* ignore */
  }
}

export function buildProgramAnchor(
  enrollment: EnrollmentMe | null,
  sessions: UpcomingSession[],
  roleId: string | null,
): ProgramAnchor {
  if (enrollment?.batch_start_date) {
    return { startDate: enrollment.batch_start_date, source: 'batch' }
  }
  if (sessions.length > 0) {
    const earliest = [...sessions].map((s) => s.session_date).sort()[0]
    if (earliest) return { startDate: earliest, source: 'session' }
  }
  if (roleId) {
    const stored = readStoredPlannerStart(roleId)
    if (stored) return { startDate: stored, source: 'local' }
  }
  const today = toIsoDate(new Date())
  return { startDate: toIsoDate(getMondayOfWeek(new Date())), source: 'today' }
}

export function mapDateToSyllabusWeek(date: string, anchor: ProgramAnchor): SyllabusWeekContext {
  const anchorMonday = getMondayOfWeek(parseIsoDate(anchor.startDate))
  const target = parseIsoDate(date)
  const diffDays = Math.floor((target.getTime() - anchorMonday.getTime()) / 86400000)
  const weekIndex = Math.max(0, Math.floor(diffDays / 7))
  const month = Math.min(4, Math.floor(weekIndex / 4) + 1)
  const week = (weekIndex % 4) + 1
  return {
    month,
    week,
    weekIndex,
    stageLabel: MONTH_NAMES[month - 1] ?? `Month ${month}`,
  }
}

function estimateItemMinutes(item: SyllabusItem): number {
  if (item.type === 'deliverable') return 90
  if (item.type === 'milestone') return 30
  return 45
}

export function assignItemToDate(
  item: SyllabusItem,
  allSyllabus: SyllabusItem[],
  anchor: ProgramAnchor,
): string {
  const weekIndex = (item.month - 1) * 4 + (item.week - 1)
  const anchorMonday = getMondayOfWeek(parseIsoDate(anchor.startDate))
  const weekStart = addDaysIso(toIsoDate(anchorMonday), weekIndex * 7)
  const weekItems = allSyllabus
    .filter((i) => i.month === item.month && i.week === item.week)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const idx = weekItems.findIndex((i) => i.id === item.id)
  const dayOffset = Math.min(Math.max(idx, 0), 4)
  return addDaysIso(weekStart, dayOffset)
}

export function getItemsForDate(
  date: string,
  journey: CareerJourneySummary | null,
  anchor: ProgramAnchor,
): SyllabusItem[] {
  if (!journey) return []
  return journey.syllabus.filter((item) => assignItemToDate(item, journey.syllabus, anchor) === date)
}

function practiceTasksForWeek(roleSlug: string, month: number, week: number): string[] {
  const config = syllabusConfig.find((r) => r.roleKey === roleSlug)
  const monthEntry = config?.months.find((m) => m.month === month)
  const weekEntry = monthEntry?.weeks.find((w) => w.week === week)
  return weekEntry?.activities ?? []
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function isStageComplete(row: StageProgressRecord): boolean {
  return row.total_lessons > 0 && row.lessons_completed >= row.total_lessons
}

export function buildDayLearningPlan(
  date: string,
  journey: CareerJourneySummary | null,
  anchor: ProgramAnchor,
  calendarEvents: CalendarEvent[],
  deadlines: UpcomingDeadlines,
  stageRows: StageProgressRecord[] | null,
): DayLearningPlan {
  const weekCtx = mapDateToSyllabusWeek(date, anchor)
  const items = getItemsForDate(date, journey, anchor)
  const completed = journey?.completedItems ?? {}

  const requiredLessons = items.map((item) => ({
    id: item.id,
    title: item.title,
    done: Boolean(completed[item.id]),
    type: item.type,
  }))

  const practiceTasks = journey
    ? practiceTasksForWeek(journey.slug, weekCtx.month, weekCtx.week)
    : []

  const dayEvents = calendarEvents.filter((e) => e.event_date === date)
  const quizEvent = dayEvents.find((e) => e.event_type === 'quiz')
  const projectEvent = dayEvents.find((e) => e.event_type === 'project')

  const quizDeadline = deadlines.quizzes.find((q) => q.due_date === date)
  const stageDeadline = deadlines.stages.find((s) => s.due_date === date)

  const stageRow = projectEvent
    ? stageRows?.find((r) => r.stage_id === projectEvent.stage_id)
    : stageDeadline
      ? stageRows?.find((r) => r.stage_id === stageDeadline.stage_id)
      : null

  const quizStatus = quizEvent || quizDeadline
    ? {
        title: quizEvent?.title ?? quizDeadline!.title,
        due: date,
        passed: quizEvent?.status === 'passed' || quizDeadline?.passed === true,
      }
    : null

  const projectStatus = projectEvent || stageDeadline
    ? {
        title: projectEvent?.title ?? stageDeadline!.title,
        due: date,
        complete: stageRow ? isStageComplete(stageRow) : false,
      }
    : null

  const itemMinutes = items.reduce((s, i) => s + estimateItemMinutes(i), 0)
  const eventMinutes = dayEvents.reduce((s, e) => s + (e.duration_minutes ?? 60), 0)
  const estimatedMinutes = itemMinutes + eventMinutes

  const doneCount = requiredLessons.filter((l) => l.done).length
  const progressPct =
    requiredLessons.length > 0 ? Math.round((doneCount / requiredLessons.length) * 100) : journey?.pct ?? 0

  const primaryTopic = items[0]?.title ?? journey?.nextLessonTitle ?? 'Self-directed study'
  const objectives = items.map((i) => i.description).filter(Boolean).slice(0, 3)
  if (objectives.length === 0 && items[0]) objectives.push(`Complete: ${items[0].title}`)

  const dailyObjective =
    items.length > 0
      ? `Focus on ${items.map((i) => i.title).join(' & ')}`
      : dayEvents.length > 0
        ? `Attend scheduled sessions and review materials`
        : `Review ${weekCtx.stageLabel} — Week ${weekCtx.week} materials`

  return {
    date,
    topic: primaryTopic,
    objectives,
    requiredLessons,
    practiceTasks,
    quizStatus,
    projectStatus,
    estimatedMinutes,
    progressPct,
    dailyObjective,
  }
}

export function buildWeekJourney(
  weekStartIso: string,
  journey: CareerJourneySummary | null,
  anchor: ProgramAnchor,
  calendarEvents: CalendarEvent[],
  todayIso: string,
  selectedDate: string,
): WeekDayCell[] {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDaysIso(weekStartIso, i)
    const items = getItemsForDate(date, journey, anchor)
    const hasEvents = calendarEvents.some((e) => e.event_date === date)
    const allDone =
      items.length > 0 && items.every((it) => journey?.completedItems[it.id])
    const isPast = date < todayIso
    const isToday = date === todayIso
    const isSelected = date === selectedDate

    let status: DayJourneyStatus = 'upcoming'
    if (allDone || (isPast && items.some((it) => journey?.completedItems[it.id]))) {
      status = 'completed'
    } else if (isToday || isSelected) {
      status = 'current'
    } else if (isPast && !items.length && !hasEvents) {
      status = 'rest'
    }

    return {
      date,
      weekday: weekdays[i],
      dayNum: parseIsoDate(date).getDate(),
      status,
      topicPreview: items[0]?.title ?? null,
    }
  })
}

export function mergeTimelineForDate(
  date: string,
  journey: CareerJourneySummary | null,
  anchor: ProgramAnchor,
  calendarEvents: CalendarEvent[],
  deadlines: UpcomingDeadlines,
  stageRows: StageProgressRecord[] | null,
): PlannerTimelineItem[] {
  const items: PlannerTimelineItem[] = []
  const today = toIsoDate(new Date())

  for (const item of getItemsForDate(date, journey, anchor)) {
    const done = Boolean(journey?.completedItems[item.id])
    items.push({
      id: `syllabus-${item.id}`,
      kind: 'syllabus',
      title: item.title,
      subtitle: `Month ${item.month} · Week ${item.week}`,
      timeLabel: 'Study block',
      description: item.description,
      durationMinutes: estimateItemMinutes(item),
      status: done ? 'done' : date < today ? 'overdue' : 'pending',
      syllabusItemId: item.id,
      quizId: item.quizId,
      projectId: item.projectId,
    })
  }

  const weekCtx = mapDateToSyllabusWeek(date, anchor)
  const practices = journey ? practiceTasksForWeek(journey.slug, weekCtx.month, weekCtx.week) : []
  practices.slice(0, 2).forEach((task, idx) => {
    items.push({
      id: `practice-${date}-${idx}`,
      kind: 'practice',
      title: task,
      subtitle: 'Practice task',
      timeLabel: '20 min',
      description: null,
      durationMinutes: 20,
      status: 'pending',
    })
  })

  for (const ev of calendarEvents.filter((e) => e.event_date === date)) {
    const done =
      ev.event_type === 'quiz'
        ? ev.status === 'passed'
        : ev.event_type === 'project'
          ? (stageRows?.find((r) => r.stage_id === ev.stage_id)
              ? isStageComplete(stageRows.find((r) => r.stage_id === ev.stage_id)!)
              : false)
          : ev.status === 'completed'

    items.push({
      id: ev.id,
      kind: ev.event_type,
      title: ev.title,
      subtitle: ev.subtitle,
      timeLabel: ev.all_day
        ? 'All day'
        : `${formatTime(ev.start_time)} – ${formatTime(ev.end_time)}`,
      description: ev.description,
      durationMinutes: ev.duration_minutes,
      status: done ? 'done' : date < today ? 'overdue' : 'pending',
      entityId: ev.entity_id,
      stageId: ev.stage_id,
      eventType: ev.event_type,
    })
  }

  items.sort((a, b) => {
    const order = { class: 0, syllabus: 1, practice: 2, quiz: 3, project: 4 }
    return (order[a.kind] ?? 5) - (order[b.kind] ?? 5)
  })

  return items
}

export function buildRoadmapProgress(
  date: string,
  anchor: ProgramAnchor,
  journey: CareerJourneySummary | null,
): RoadmapProgress {
  const ctx = mapDateToSyllabusWeek(date, anchor)
  const d = parseIsoDate(date)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return {
    month: ctx.month,
    monthLabel: ctx.stageLabel,
    week: ctx.week,
    dayOfWeek: dayNames[d.getDay()],
    dayNum: d.getDate(),
    stageLabel: ctx.stageLabel,
    pct: journey?.pct ?? 0,
  }
}

export function computeEventCounts(timeline: PlannerTimelineItem[]): EventCounts {
  const counts = { classes: 0, practice: 0, quizzes: 0, projects: 0, syllabus: 0, total: 0 }
  for (const item of timeline) {
    counts.total++
    if (item.kind === 'class') counts.classes++
    else if (item.kind === 'practice') counts.practice++
    else if (item.kind === 'quiz') counts.quizzes++
    else if (item.kind === 'project') counts.projects++
    else if (item.kind === 'syllabus') counts.syllabus++
  }
  return counts
}

export function buildMarkedDatesByType(
  calendarEvents: CalendarEvent[],
  viewMonth: Date,
  journey: CareerJourneySummary | null,
  anchor: ProgramAnchor,
): MarkedDatesByType {
  const map: MarkedDatesByType = new Map()
  const { startDate, endDate } = monthDateRange(viewMonth)

  const add = (iso: string, kind: PlannerTimelineKind) => {
    if (iso < startDate || iso > endDate) return
    const set = map.get(iso) ?? new Set<PlannerTimelineKind>()
    set.add(kind)
    map.set(iso, set)
  }

  for (const ev of calendarEvents) {
    add(ev.event_date, ev.event_type as PlannerTimelineKind)
  }

  if (journey) {
    for (const item of journey.syllabus) {
      add(assignItemToDate(item, journey.syllabus, anchor), 'syllabus')
    }
  }

  return map
}

export function isoToViewMonth(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, 1)
}

export function getInitialSelectedDate(): string {
  try {
    const stored = sessionStorage.getItem(PLANNER_SELECTED_DATE_KEY)
    if (stored) {
      sessionStorage.removeItem(PLANNER_SELECTED_DATE_KEY)
      return stored
    }
  } catch {
    /* ignore */
  }
  return toIsoDate(new Date())
}

export function storeSelectedDateForPlanner(date: string): void {
  try {
    sessionStorage.setItem(PLANNER_SELECTED_DATE_KEY, date)
  } catch {
    /* ignore */
  }
}

export function storeHighlightItem(itemId: string): void {
  try {
    sessionStorage.setItem(PLANNER_HIGHLIGHT_ITEM_KEY, itemId)
  } catch {
    /* ignore */
  }
}

/** Syllabus-assigned study dates visible in a month. */
export function collectStudyDatesForMonth(
  viewMonth: Date,
  journey: CareerJourneySummary | null,
  anchor: ProgramAnchor,
): Set<string> {
  if (!journey) return new Set()
  const { startDate, endDate } = monthDateRange(viewMonth)
  const dates = new Set<string>()
  for (const item of journey.syllabus) {
    const iso = assignItemToDate(item, journey.syllabus, anchor)
    if (iso >= startDate && iso <= endDate) dates.add(iso)
  }
  return dates
}
