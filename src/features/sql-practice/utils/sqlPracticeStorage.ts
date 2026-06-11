import type { SqlAttemptRecord, SqlMistakeRecord } from '../types/sqlPractice.types'

const ATTEMPTS_KEY = 'sql-practice-attempt-history'
const MISTAKES_KEY = 'sql-practice-mistakes'
const HINTS_KEY = 'sql-practice-revealed-hints'

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
  return readJson<SqlAttemptRecord[]>(ATTEMPTS_KEY, [])
}

export function saveSqlAttempts(records: SqlAttemptRecord[]): void {
  writeJson(ATTEMPTS_KEY, records)
}

export function loadSqlMistakes(): SqlMistakeRecord[] {
  return readJson<SqlMistakeRecord[]>(MISTAKES_KEY, [])
}

export function saveSqlMistakes(records: SqlMistakeRecord[]): void {
  writeJson(MISTAKES_KEY, records)
}

export function loadRevealedHintCounts(): Record<string, number> {
  return readJson<Record<string, number>>(HINTS_KEY, {})
}

export function saveRevealedHintCount(questionId: string, count: number): void {
  const all = loadRevealedHintCounts()
  all[questionId] = count
  writeJson(HINTS_KEY, all)
}

const MAX_ATTEMPTS = 50

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
