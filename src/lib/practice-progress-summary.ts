import { listCodePracticeMistakes } from '@/features/code-practice/utils/codePracticeMistakes'
import { SQL_PRACTICE_QUESTIONS } from '@/features/sql-practice/data/sqlQuestions'
import { getQuestionProgressSummary } from '@/features/sql-practice/utils/sqlPracticeAnalytics'
import { loadSqlProgress } from '@/features/sql-practice/utils/sqlPracticeProgress'
import { loadSqlAttempts, loadSqlMistakes } from '@/features/sql-practice/utils/sqlPracticeStorage'
import {
  getRecentTypingSessions,
  readTypingMistakes,
} from '@/features/typing-practice/utils/typingMistakes'
import { toIsoDate } from '@/lib/dashboard-derive'

const CODE_ATTEMPTS_KEY = 'codequest-code-practice-attempts'

export interface PracticeAreaSummary {
  label: string
  completed: number
  total: number
  pct: number
  detail: string
}

export interface PracticeStreakSummary {
  currentStreak: number
  bestStreak: number
  practicedToday: boolean
  lastPracticeDate: string | null
}

export interface MistakesSummary {
  sql: number
  code: number
  typing: number
  total: number
}

function readCodeAttempts(): { createdAt: string; passed?: boolean }[] {
  try {
    const raw = localStorage.getItem(CODE_ATTEMPTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { createdAt?: string; attemptedAt?: string; passed?: boolean }[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => ({
      createdAt: item.createdAt ?? item.attemptedAt ?? new Date().toISOString(),
      passed: item.passed,
    }))
  } catch {
    return []
  }
}

function collectPracticeDates(): Set<string> {
  const dates = new Set<string>()

  for (const attempt of loadSqlAttempts()) {
    if (attempt.ranAt) dates.add(toIsoDate(new Date(attempt.ranAt)))
  }
  for (const attempt of readCodeAttempts()) {
    dates.add(toIsoDate(new Date(attempt.createdAt)))
  }
  for (const session of getRecentTypingSessions(40)) {
    dates.add(toIsoDate(new Date(session.completedAt)))
  }

  return dates
}

function computeStreakFromDates(sortedDatesDesc: string[]): { current: number; best: number } {
  if (sortedDatesDesc.length === 0) return { current: 0, best: 0 }

  const unique = [...new Set(sortedDatesDesc)].sort((a, b) => b.localeCompare(a))
  const today = toIsoDate(new Date())
  const yesterday = toIsoDate(new Date(Date.now() - 86400000))

  let current = 0
  if (unique[0] === today || unique[0] === yesterday) {
    let cursor = unique[0] === today ? today : yesterday
    for (const date of unique) {
      if (date === cursor) {
        current += 1
        const prev = new Date(cursor + 'T12:00:00')
        prev.setDate(prev.getDate() - 1)
        cursor = toIsoDate(prev)
      } else if (date < cursor) {
        break
      }
    }
  }

  let best = 0
  let run = 0
  const asc = [...unique].sort((a, b) => a.localeCompare(b))
  for (let i = 0; i < asc.length; i++) {
    if (i === 0) {
      run = 1
    } else {
      const prev = new Date(asc[i - 1] + 'T12:00:00')
      prev.setDate(prev.getDate() + 1)
      run = asc[i] === toIsoDate(prev) ? run + 1 : 1
    }
    best = Math.max(best, run)
  }

  return { current, best }
}

export function getPracticeStreakSummary(): PracticeStreakSummary {
  const dates = collectPracticeDates()
  const sorted = [...dates].sort((a, b) => b.localeCompare(a))
  const { current, best } = computeStreakFromDates(sorted)
  const today = toIsoDate(new Date())

  return {
    currentStreak: current,
    bestStreak: best,
    practicedToday: dates.has(today),
    lastPracticeDate: sorted[0] ?? null,
  }
}

export function getSqlPracticeSummary(): PracticeAreaSummary {
  const progress = loadSqlProgress()
  const summary = getQuestionProgressSummary(SQL_PRACTICE_QUESTIONS, progress)
  const pct = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0

  return {
    label: 'SQL Practice',
    completed: summary.passed,
    total: summary.total,
    pct,
    detail: `${summary.failed} need review · ${summary.unattempted} not started`,
  }
}

export function getCodePracticeSummary(): PracticeAreaSummary {
  const attempts = readCodeAttempts()
  const mistakes = listCodePracticeMistakes()
  const passedCount = attempts.filter((a) => a.passed).length
  const pct =
    attempts.length > 0 ? Math.round((passedCount / attempts.length) * 100) : 0

  return {
    label: 'Code Workbench',
    completed: passedCount,
    total: Math.max(attempts.length, 1),
    pct: attempts.length > 0 ? pct : 0,
    detail:
      attempts.length === 0
        ? 'No attempts yet — open Code Workbench'
        : `${mistakes.length} mistakes saved locally`,
  }
}

export function getTypingPracticeSummary(typingAttemptsWpm: number | null): PracticeAreaSummary {
  const sessions = getRecentTypingSessions(20)
  const avgWpm =
    sessions.length > 0
      ? Math.round(sessions.reduce((s, r) => s + r.wpm, 0) / sessions.length)
      : typingAttemptsWpm

  const pct = avgWpm ? Math.min(100, Math.round((avgWpm / 80) * 100)) : 0

  return {
    label: 'Typing Practice',
    completed: sessions.length,
    total: Math.max(sessions.length, 10),
    pct,
    detail: avgWpm ? `Avg ${avgWpm} WPM · ${sessions.length} sessions` : 'Complete a typing session',
  }
}

export function getMistakesSummary(): MistakesSummary {
  const sql = loadSqlMistakes().length
  const code = listCodePracticeMistakes().length
  const typing = readTypingMistakes().length

  return { sql, code, typing, total: sql + code + typing }
}
