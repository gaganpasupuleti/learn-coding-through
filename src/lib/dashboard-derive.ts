import type {
  MySubmittedProject,
  StageProgressRecord,
  TypingAttempt,
  UpcomingDeadlines,
} from '@/lib/api'

export interface DeadlineItem {
  key: string
  title: string
  due: string
  done: boolean
}

export interface ReadinessBreakdown {
  overall: number
  resume: number
  skill: number
  interview: number
  ats: number
}

export interface DeadlineBuckets {
  today: DeadlineItem[]
  thisWeek: DeadlineItem[]
  completed: DeadlineItem[]
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatSessionDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = (d.getTime() - today.getTime()) / 86400000
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function mergeDeadlines(deadlines: UpcomingDeadlines): DeadlineItem[] {
  const all: DeadlineItem[] = []
  for (const q of deadlines.quizzes) {
    all.push({ key: `q-${q.quiz_id}`, title: q.title, due: q.due_date, done: q.passed })
  }
  for (const s of deadlines.stages) {
    all.push({ key: `s-${s.stage_id}`, title: s.title, due: s.due_date, done: s.unlocked })
  }
  all.sort((a, b) => a.due.localeCompare(b.due))
  return all
}

export function computeDaysRemaining(deadlines: UpcomingDeadlines): number | null {
  const dates = mergeDeadlines(deadlines)
    .map((d) => d.due)
    .filter(Boolean)
  if (dates.length === 0) return null
  const latest = dates.sort().at(-1)!
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(latest + 'T00:00:00')
  return Math.max(0, Math.ceil((due.getTime() - today.getTime()) / 86400000))
}

export function bucketDeadlines(items: DeadlineItem[]): DeadlineBuckets {
  const today = toIsoDate(new Date())
  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndIso = toIsoDate(weekEnd)

  const buckets: DeadlineBuckets = { today: [], thisWeek: [], completed: [] }
  for (const item of items) {
    if (item.done) {
      buckets.completed.push(item)
    } else if (item.due === today) {
      buckets.today.push(item)
    } else if (item.due > today && item.due <= weekEndIso) {
      buckets.thisWeek.push(item)
    }
  }
  return buckets
}

function computeQuizAvg(stageRows: StageProgressRecord[]): number | null {
  const rows = stageRows.filter((r) => r.total_lessons > 0)
  if (rows.length === 0) return null
  return Math.round(rows.reduce((s, r) => s + r.latest_quiz_score, 0) / rows.length)
}

function computeTypingAvg(attempts: TypingAttempt[]): number | null {
  if (attempts.length === 0) return null
  return Math.round(attempts.reduce((s, a) => s + a.wpm, 0) / attempts.length)
}

function computeStageLessonPct(stageRows: StageProgressRecord[]): number {
  const rows = stageRows.filter((r) => r.total_lessons > 0)
  if (rows.length === 0) return 0
  const total = rows.reduce((s, r) => s + r.total_lessons, 0)
  const done = rows.reduce((s, r) => s + r.lessons_completed, 0)
  return Math.round((done / total) * 100)
}

function typingToScore(wpm: number | null): number {
  if (wpm === null) return 0
  return Math.min(100, Math.round((wpm / 80) * 100))
}

function catalogToScore(steps: number | null): number {
  if (!steps || steps <= 0) return 0
  return Math.min(100, steps * 10)
}

export function computeReadinessBreakdown(snapshot: {
  submittedProjects: MySubmittedProject[]
  careerPct: number | null
  stageRows: StageProgressRecord[] | null
  typingAttempts: TypingAttempt[]
  catalogSteps: number | null
}): ReadinessBreakdown {
  const stages = snapshot.stageRows ?? []
  const approved = snapshot.submittedProjects.filter((p) => p.status === 'approved').length
  const totalSubmitted = Math.max(1, snapshot.submittedProjects.length)
  const projectPct = Math.round((approved / totalSubmitted) * 100)
  const careerPct = snapshot.careerPct ?? 0
  const resume = Math.round((projectPct + careerPct) / 2)

  const skill =
    careerPct > 0 ? careerPct : stages.length > 0 ? computeStageLessonPct(stages) : 0

  const quizAvg = computeQuizAvg(stages)
  const interview = quizAvg ?? 0

  const typingScore = typingToScore(computeTypingAvg(snapshot.typingAttempts))
  const catalogScore = catalogToScore(snapshot.catalogSteps)
  const ats = Math.round((typingScore + catalogScore) / 2)

  const overall = Math.round((resume + skill + interview + ats) / 4)
  return { overall, resume, skill, interview, ats }
}

export function deriveStageJourneyFallback(stageRows: StageProgressRecord[]): {
  currentStageLabel: string
  completedTopics: string[]
  remainingTopics: string[]
  nextLessonTitle: string | null
  progressPct: number
} | null {
  if (stageRows.length === 0) return null

  const inProgress = stageRows.find(
    (r) => r.unlocked && r.total_lessons > 0 && r.lessons_completed < r.total_lessons,
  )
  const current = inProgress ?? stageRows.find((r) => !r.unlocked) ?? stageRows[0]

  const completed = stageRows.filter(
    (r) => r.total_lessons > 0 && r.lessons_completed >= r.total_lessons,
  )
  const remaining = stageRows.filter(
    (r) => r.total_lessons > 0 && r.lessons_completed < r.total_lessons,
  )

  const totalLessons = stageRows.reduce((s, r) => s + r.total_lessons, 0)
  const doneLessons = stageRows.reduce((s, r) => s + r.lessons_completed, 0)
  const progressPct =
    totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0

  return {
    currentStageLabel: `Stage ${current.stage_id}`,
    completedTopics: completed.map((r) => `Stage ${r.stage_id} lessons`),
    remainingTopics: remaining.slice(0, 4).map((r) => `Stage ${r.stage_id} lessons`),
    nextLessonTitle: inProgress ? `Stage ${inProgress.stage_id} lessons` : null,
    progressPct,
  }
}
