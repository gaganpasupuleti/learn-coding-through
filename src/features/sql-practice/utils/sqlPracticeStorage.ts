import type { SqlAttemptRecord, SqlMistakeRecord, SqlMistakeErrorType } from '../types/sqlPractice.types'
import { sanitizeMistakeRecords } from './sqlPracticeDataSafety'

const ATTEMPTS_KEY = 'sql-practice-attempt-history'
const MISTAKES_KEY = 'sql-practice-mistakes'
const HINTS_KEY = 'sql-practice-revealed-hints'
const SOLUTION_REVEALED_KEY = 'sql-practice-solution-revealed'

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function loadSqlAttempts(): SqlAttemptRecord[] {
  const records = readJson<SqlAttemptRecord[]>(ATTEMPTS_KEY, [])
  return records.map((record) => ({
    action: 'run',
    ...record,
  }))
}

export function saveSqlAttempts(records: SqlAttemptRecord[]): void {
  writeJson(ATTEMPTS_KEY, records)
}

export function loadSqlMistakes(): SqlMistakeRecord[] {
  const records = sanitizeMistakeRecords(readJson<SqlMistakeRecord[]>(MISTAKES_KEY, []))
  return records.map((record) => ({
    errorType: 'other',
    feedback: record.message,
    databaseId: 'university_system',
    ...record,
  }))
}

export function saveSqlMistakes(records: SqlMistakeRecord[]): void {
  writeJson(MISTAKES_KEY, records)
}

/** Remove mistake records for questions that are now passed. Returns count removed. */
export function clearResolvedMistakes(isPassed: (questionId: string) => boolean): number {
  const before = loadSqlMistakes()
  const after = before.filter((m) => !isPassed(m.questionId))
  const removed = before.length - after.length
  if (removed > 0) saveSqlMistakes(after)
  return removed
}

export function loadRevealedHintCounts(): Record<string, number> {
  return readJson<Record<string, number>>(HINTS_KEY, {})
}

export function saveRevealedHintCount(questionId: string, count: number): void {
  const all = loadRevealedHintCounts()
  all[questionId] = count
  writeJson(HINTS_KEY, all)
}

export function loadRevealedSolutionIds(): Record<string, boolean> {
  return readJson<Record<string, boolean>>(SOLUTION_REVEALED_KEY, {})
}

export function saveSolutionRevealed(questionId: string): void {
  const all = loadRevealedSolutionIds()
  all[questionId] = true
  writeJson(SOLUTION_REVEALED_KEY, all)
}

const MAX_ATTEMPTS = 50
const MAX_MISTAKES = 50

export function appendSqlAttempt(
  record: Omit<SqlAttemptRecord, 'id'>,
): SqlAttemptRecord {
  const entry: SqlAttemptRecord = {
    ...record,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `att-${Date.now()}`,
  }
  const attempts = loadSqlAttempts()
  saveSqlAttempts([entry, ...attempts].slice(0, MAX_ATTEMPTS))
  return entry
}

export function appendSqlMistake(
  record: Omit<SqlMistakeRecord, 'id' | 'recordedAt' | 'message'> & { message?: string },
): SqlMistakeRecord {
  const entry: SqlMistakeRecord = {
    ...record,
    message: record.feedback,
    recordedAt: new Date().toISOString(),
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mis-${Date.now()}`,
  }
  const mistakes = loadSqlMistakes()
  saveSqlMistakes([entry, ...mistakes].slice(0, MAX_MISTAKES))
  return entry
}

export function formatAttemptActionLabel(action: SqlAttemptRecord['action'], status: SqlAttemptRecord['status']): string {
  if (action === 'check') {
    if (status === 'passed') return 'Checked · Passed'
    if (status === 'failed') return 'Checked · Failed'
    if (status === 'blocked') return 'Checked · Blocked'
    if (status === 'error') return 'Checked · Error'
    return 'Checked'
  }
  if (status === 'blocked') return 'Ran · Blocked'
  if (status === 'error') return 'Ran · Error'
  return 'Ran · Success'
}

export type { SqlMistakeErrorType }
