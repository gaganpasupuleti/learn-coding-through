import { getQuestionsForDatabase } from '../data/sqlQuestions'
import { sanitizeProgressStore } from './sqlPracticeDataSafety'
import type {
  SqlAttemptAction,
  SqlAttemptStatus,
  SqlDatabaseId,
  SqlDatabaseProgressSummary,
  SqlDifficultyProgressSummary,
  SqlPracticeDifficulty,
  SqlPracticeQuestion,
  SqlPracticeTopic,
  SqlQuestionProgressRecord,
  SqlQuestionProgressStatus,
  SqlTopicProgressSummary,
} from '../types/sqlPractice.types'

export const SQL_PROGRESS_STORAGE_KEY = 'sql-practice-progress-v1'

export type SqlProgressStore = Record<string, SqlQuestionProgressRecord>

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

export function loadSqlProgress(): SqlProgressStore {
  return sanitizeProgressStore(readJson<SqlProgressStore>(SQL_PROGRESS_STORAGE_KEY, {}))
}

export function saveSqlProgress(store: SqlProgressStore): void {
  writeJson(SQL_PROGRESS_STORAGE_KEY, store)
}

export function getQuestionProgressStatus(
  record: SqlQuestionProgressRecord | undefined,
): SqlQuestionProgressStatus {
  if (!record || record.attemptsCount === 0) return 'not_started'
  if (record.passedCount > 0 || record.firstPassedAt) return 'passed'
  if (record.lastStatus === 'failed' || record.failedCount > 0) return 'needs_review'
  return 'in_progress'
}

export function getQuestionProgress(questionId: string): SqlQuestionProgressRecord | undefined {
  return loadSqlProgress()[questionId]
}

function defaultRecord(questionId: string, databaseId: SqlDatabaseId): SqlQuestionProgressRecord {
  return {
    questionId,
    databaseId,
    attemptsCount: 0,
    passedCount: 0,
    failedCount: 0,
    lastStatus: 'not_started',
    solutionRevealed: false,
    hintsUsedCount: 0,
  }
}

export interface UpdateProgressInput {
  questionId: string
  databaseId: SqlDatabaseId
  action: SqlAttemptAction
  status: SqlAttemptStatus
  executionTimeMs?: number
  hintsUsedCount?: number
  solutionRevealed?: boolean
}

export function updateProgressOnAttempt(input: UpdateProgressInput): SqlQuestionProgressRecord {
  const store = loadSqlProgress()
  const existing = store[input.questionId] ?? defaultRecord(input.questionId, input.databaseId)
  const now = new Date().toISOString()

  const next: SqlQuestionProgressRecord = {
    ...existing,
    databaseId: input.databaseId,
    attemptsCount: existing.attemptsCount + 1,
    lastStatus: input.status,
    lastAttemptedAt: now,
    hintsUsedCount: input.hintsUsedCount ?? existing.hintsUsedCount,
    solutionRevealed: input.solutionRevealed ?? existing.solutionRevealed,
  }

  if (input.action === 'check' && input.status === 'passed') {
    next.passedCount = existing.passedCount + 1
    if (!next.firstPassedAt) next.firstPassedAt = now
  }

  if (input.action === 'check' && input.status === 'failed') {
    next.failedCount = existing.failedCount + 1
  }

  if (input.executionTimeMs != null && input.executionTimeMs > 0) {
    if (next.bestExecutionTimeMs == null || input.executionTimeMs < next.bestExecutionTimeMs) {
      next.bestExecutionTimeMs = input.executionTimeMs
    }
  }

  store[input.questionId] = next
  saveSqlProgress(store)
  return next
}

export function markQuestionPassed(
  questionId: string,
  databaseId: SqlDatabaseId,
  executionTimeMs?: number,
): SqlQuestionProgressRecord {
  return updateProgressOnAttempt({
    questionId,
    databaseId,
    action: 'check',
    status: 'passed',
    executionTimeMs,
  })
}

export function syncQuestionProgressMeta(
  questionId: string,
  databaseId: SqlDatabaseId,
  meta: { hintsUsedCount?: number; solutionRevealed?: boolean },
): SqlQuestionProgressRecord {
  const store = loadSqlProgress()
  const existing = store[questionId] ?? defaultRecord(questionId, databaseId)
  const next: SqlQuestionProgressRecord = {
    ...existing,
    databaseId,
    hintsUsedCount: meta.hintsUsedCount ?? existing.hintsUsedCount,
    solutionRevealed: meta.solutionRevealed ?? existing.solutionRevealed,
  }
  store[questionId] = next
  saveSqlProgress(store)
  return next
}

export function getDatabaseProgressSummary(
  databaseId: SqlDatabaseId,
  questions?: SqlPracticeQuestion[],
): SqlDatabaseProgressSummary {
  const qs = questions ?? getQuestionsForDatabase(databaseId)
  const store = loadSqlProgress()
  let passedCount = 0
  let inProgressCount = 0
  let needsReviewCount = 0
  let notStartedCount = 0

  for (const q of qs) {
    const status = getQuestionProgressStatus(store[q.id])
    if (status === 'passed') passedCount += 1
    else if (status === 'in_progress') inProgressCount += 1
    else if (status === 'needs_review') needsReviewCount += 1
    else notStartedCount += 1
  }

  const totalQuestions = qs.length
  const percentComplete = totalQuestions > 0 ? Math.round((passedCount / totalQuestions) * 100) : 0

  return {
    databaseId,
    totalQuestions,
    passedCount,
    inProgressCount,
    needsReviewCount,
    notStartedCount,
    percentComplete,
  }
}

export function getTopicProgressSummary(
  databaseId: SqlDatabaseId,
  questions?: SqlPracticeQuestion[],
): SqlTopicProgressSummary[] {
  const qs = questions ?? getQuestionsForDatabase(databaseId)
  const store = loadSqlProgress()
  const byTopic = new Map<SqlPracticeTopic, { total: number; passed: number }>()

  for (const q of qs) {
    const entry = byTopic.get(q.topic) ?? { total: 0, passed: 0 }
    entry.total += 1
    if (getQuestionProgressStatus(store[q.id]) === 'passed') entry.passed += 1
    byTopic.set(q.topic, entry)
  }

  return Array.from(byTopic.entries()).map(([topic, counts]) => ({
    topic,
    ...counts,
  }))
}

export function getDifficultyProgressSummary(
  databaseId: SqlDatabaseId,
  questions?: SqlPracticeQuestion[],
): SqlDifficultyProgressSummary[] {
  const qs = questions ?? getQuestionsForDatabase(databaseId)
  const store = loadSqlProgress()
  const byDiff = new Map<SqlPracticeDifficulty, { total: number; passed: number }>()

  for (const q of qs) {
    const entry = byDiff.get(q.difficulty) ?? { total: 0, passed: 0 }
    entry.total += 1
    if (getQuestionProgressStatus(store[q.id]) === 'passed') entry.passed += 1
    byDiff.set(q.difficulty, entry)
  }

  return Array.from(byDiff.entries()).map(([difficulty, counts]) => ({
    difficulty,
    ...counts,
  }))
}

export const PROGRESS_STATUS_LABEL: Record<SqlQuestionProgressStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  passed: 'Passed',
  needs_review: 'Needs Review',
}

export const PROGRESS_STATUS_ICON: Record<SqlQuestionProgressStatus, string> = {
  not_started: '⚪',
  in_progress: '🟡',
  passed: '✅',
  needs_review: '🔴',
}
