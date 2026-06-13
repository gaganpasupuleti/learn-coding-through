import type {
  SqlDatabaseId,
  SqlMistakeRecord,
  SqlPracticeDifficulty,
  SqlPracticeQuestion,
  SqlPracticeTopic,
  SqlQuestionProgressRecord,
} from '../types/sqlPractice.types'
import { getQuestionProgressStatus, type SqlProgressStore } from './sqlPracticeProgress'
import { sanitizeProgressStore } from './sqlPracticeDataSafety'

export type SqlReviewMode =
  | 'failed'
  | 'mistakes'
  | 'unattempted'
  | 'weak_topics'
  | 'topic'
  | 'difficulty'

export interface SqlDetailedProgressSummary {
  total: number
  passed: number
  failed: number
  unattempted: number
  inProgress: number
  hintsUsedTotal: number
  solutionsRevealedCount: number
  questionsWithHints: number
}

export interface SqlTopicAnalyticsRow {
  topic: SqlPracticeTopic
  total: number
  passed: number
  failed: number
  unattempted: number
  attempted: number
  passRate: number
  isWeak: boolean
}

export interface SqlDifficultyAnalyticsRow {
  difficulty: SqlPracticeDifficulty
  total: number
  passed: number
  failed: number
  unattempted: number
  attempted: number
  passRate: number
  isWeak: boolean
}

export type SuggestedQuestionReason =
  | 'failed'
  | 'weak_topic_unattempted'
  | 'unattempted'
  | 'same_topic'
  | 'any_unattempted'
  | 'all_caught_up'

export interface SuggestedQuestionResult {
  question: SqlPracticeQuestion | null
  reason: SuggestedQuestionReason
  message: string
}

const WEAK_PASS_RATE_THRESHOLD = 0.6

function getRecord(progress: SqlProgressStore, questionId: string): SqlQuestionProgressRecord | undefined {
  return sanitizeProgressStore(progress)[questionId]
}

function isFailedNotPassed(progress: SqlProgressStore, questionId: string): boolean {
  const status = getQuestionProgressStatus(getRecord(progress, questionId))
  return status === 'needs_review'
}

function isUnattempted(progress: SqlProgressStore, questionId: string): boolean {
  return getQuestionProgressStatus(getRecord(progress, questionId)) === 'not_started'
}

export function isTopicWeak(attempted: number, passed: number, failed: number): boolean {
  if (attempted === 0) return false
  if (failed > passed) return true
  return passed / attempted < WEAK_PASS_RATE_THRESHOLD
}

export function getQuestionProgressSummary(
  questions: SqlPracticeQuestion[],
  progress: SqlProgressStore,
): SqlDetailedProgressSummary {
  const safeProgress = sanitizeProgressStore(progress)
  let passed = 0
  let failed = 0
  let unattempted = 0
  let inProgress = 0
  let hintsUsedTotal = 0
  let solutionsRevealedCount = 0
  let questionsWithHints = 0

  for (const q of questions) {
    const record = getRecord(safeProgress, q.id)
    const status = getQuestionProgressStatus(record)
    if (status === 'passed') passed += 1
    else if (status === 'needs_review') failed += 1
    else if (status === 'not_started') unattempted += 1
    else inProgress += 1

    const hints = record?.hintsUsedCount ?? 0
    if (hints > 0) {
      questionsWithHints += 1
      hintsUsedTotal += hints
    }
    if (record?.solutionRevealed) solutionsRevealedCount += 1
  }

  return {
    total: questions.length,
    passed,
    failed,
    unattempted,
    inProgress,
    hintsUsedTotal,
    solutionsRevealedCount,
    questionsWithHints,
  }
}

export function getDatabaseAnalyticsSummary(
  databaseId: SqlDatabaseId,
  questions: SqlPracticeQuestion[],
  progress: SqlProgressStore,
): SqlDetailedProgressSummary {
  const scoped = questions.filter((q) => q.databaseId === databaseId)
  return getQuestionProgressSummary(scoped, progress)
}

export function getTopicProgressSummary(
  databaseId: SqlDatabaseId,
  questions: SqlPracticeQuestion[],
  progress: SqlProgressStore,
): SqlTopicAnalyticsRow[] {
  const scoped = questions.filter((q) => q.databaseId === databaseId)
  const byTopic = new Map<SqlPracticeTopic, SqlTopicAnalyticsRow & { attemptPasses: number; attemptFails: number }>()

  for (const q of scoped) {
    const record = getRecord(progress, q.id)
    const status = getQuestionProgressStatus(record)
    const row = byTopic.get(q.topic) ?? {
      topic: q.topic,
      total: 0,
      passed: 0,
      failed: 0,
      unattempted: 0,
      attempted: 0,
      passRate: 0,
      isWeak: false,
      attemptPasses: 0,
      attemptFails: 0,
    }
    row.total += 1
    if (status === 'passed') row.passed += 1
    else if (status === 'needs_review') row.failed += 1
    else if (status === 'not_started') row.unattempted += 1
    if ((record?.attemptsCount ?? 0) > 0) row.attempted += 1
    row.attemptPasses += record?.passedCount ?? 0
    row.attemptFails += record?.failedCount ?? 0
    byTopic.set(q.topic, row)
  }

  return Array.from(byTopic.values()).map(({ attemptPasses, attemptFails, ...row }) => {
    const passRate = row.attempted > 0 ? row.passed / row.attempted : 0
    return {
      ...row,
      passRate,
      isWeak: isTopicWeak(row.attempted, attemptPasses, attemptFails),
    }
  })
}

export function getDifficultyProgressSummary(
  databaseId: SqlDatabaseId,
  questions: SqlPracticeQuestion[],
  progress: SqlProgressStore,
): SqlDifficultyAnalyticsRow[] {
  const scoped = questions.filter((q) => q.databaseId === databaseId)
  const order: SqlPracticeDifficulty[] = ['easy', 'medium', 'hard']
  const byDiff = new Map<SqlPracticeDifficulty, SqlDifficultyAnalyticsRow & { attemptPasses: number; attemptFails: number }>()

  for (const q of scoped) {
    const record = getRecord(progress, q.id)
    const status = getQuestionProgressStatus(record)
    const row = byDiff.get(q.difficulty) ?? {
      difficulty: q.difficulty,
      total: 0,
      passed: 0,
      failed: 0,
      unattempted: 0,
      attempted: 0,
      passRate: 0,
      isWeak: false,
      attemptPasses: 0,
      attemptFails: 0,
    }
    row.total += 1
    if (status === 'passed') row.passed += 1
    else if (status === 'needs_review') row.failed += 1
    else if (status === 'not_started') row.unattempted += 1
    if ((record?.attemptsCount ?? 0) > 0) row.attempted += 1
    row.attemptPasses += record?.passedCount ?? 0
    row.attemptFails += record?.failedCount ?? 0
    byDiff.set(q.difficulty, row)
  }

  return order
    .filter((d) => byDiff.has(d))
    .map((difficulty) => {
      const { attemptPasses, attemptFails, ...row } = byDiff.get(difficulty)!
      const passRate = row.attempted > 0 ? row.passed / row.attempted : 0
      return {
        ...row,
        passRate,
        isWeak: isTopicWeak(row.attempted, attemptPasses, attemptFails),
      }
    })
}

export function getWeakTopics(
  databaseId: SqlDatabaseId,
  questions: SqlPracticeQuestion[],
  progress: SqlProgressStore,
): SqlTopicAnalyticsRow[] {
  return getTopicProgressSummary(databaseId, questions, progress)
    .filter((row) => row.isWeak)
    .sort((a, b) => a.passRate - b.passRate)
}

export function getWeakestTopic(
  databaseId: SqlDatabaseId,
  questions: SqlPracticeQuestion[],
  progress: SqlProgressStore,
): SqlTopicAnalyticsRow | null {
  const weak = getWeakTopics(databaseId, questions, progress)
  return weak[0] ?? null
}

export function getWeakestDifficulty(
  databaseId: SqlDatabaseId,
  questions: SqlPracticeQuestion[],
  progress: SqlProgressStore,
): SqlDifficultyAnalyticsRow | null {
  const weak = getDifficultyProgressSummary(databaseId, questions, progress)
    .filter((row) => row.isWeak)
    .sort((a, b) => a.passRate - b.passRate)
  return weak[0] ?? null
}

function uniqueMistakeQuestionIds(mistakes: SqlMistakeRecord[], databaseId?: SqlDatabaseId): string[] {
  const seen = new Set<string>()
  const ids: string[] = []
  for (const m of mistakes) {
    if (databaseId && m.databaseId !== databaseId) continue
    if (seen.has(m.questionId)) continue
    seen.add(m.questionId)
    ids.push(m.questionId)
  }
  return ids
}

export function getReviewQueue(
  mode: SqlReviewMode,
  databaseId: SqlDatabaseId,
  questions: SqlPracticeQuestion[],
  progress: SqlProgressStore,
  mistakes: SqlMistakeRecord[],
  options?: { topic?: SqlPracticeTopic; difficulty?: SqlPracticeDifficulty },
): SqlPracticeQuestion[] {
  const safeProgress = sanitizeProgressStore(progress)
  const scoped = questions.filter((q) => q.databaseId === databaseId)
  const knownIds = new Set(scoped.map((q) => q.id))

  switch (mode) {
    case 'failed':
      return scoped.filter((q) => isFailedNotPassed(safeProgress, q.id))
    case 'mistakes': {
      const mistakeIds = new Set(
        uniqueMistakeQuestionIds(mistakes, databaseId).filter((id) => knownIds.has(id)),
      )
      return scoped.filter(
        (q) => mistakeIds.has(q.id) && !getRecord(safeProgress, q.id)?.firstPassedAt,
      )
    }
    case 'unattempted':
      return scoped.filter((q) => isUnattempted(safeProgress, q.id))
    case 'weak_topics': {
      const weakTopicSet = new Set(getWeakTopics(databaseId, questions, safeProgress).map((t) => t.topic))
      return scoped.filter((q) => {
        if (!weakTopicSet.has(q.topic)) return false
        const status = getQuestionProgressStatus(getRecord(safeProgress, q.id))
        return status === 'not_started' || status === 'needs_review'
      })
    }
    case 'topic':
      if (!options?.topic) return []
      return scoped.filter((q) => q.topic === options.topic)
    case 'difficulty':
      if (!options?.difficulty) return []
      return scoped.filter((q) => q.difficulty === options.difficulty)
    default:
      return []
  }
}

export function getSuggestedNextQuestion(
  databaseId: SqlDatabaseId,
  questions: SqlPracticeQuestion[],
  progress: SqlProgressStore,
  mistakes: SqlMistakeRecord[],
  currentQuestionId?: string,
): SuggestedQuestionResult {
  const safeProgress = sanitizeProgressStore(progress)
  const scoped = questions.filter((q) => q.databaseId === databaseId)
  const current = currentQuestionId ? scoped.find((q) => q.id === currentQuestionId) : undefined

  const failedQueue = scoped.filter((q) => isFailedNotPassed(safeProgress, q.id))
  if (failedQueue.length > 0) {
    const pick = failedQueue.find((q) => q.id !== currentQuestionId) ?? failedQueue[0]
    return {
      question: pick,
      reason: 'failed',
      message: 'Retry a question that still needs review.',
    }
  }

  const weakTopics = getWeakTopics(databaseId, questions, safeProgress)
  for (const weak of weakTopics) {
    const candidate = scoped.find(
      (q) => q.topic === weak.topic && isUnattempted(safeProgress, q.id) && q.id !== currentQuestionId,
    )
    if (candidate) {
      return {
        question: candidate,
        reason: 'weak_topic_unattempted',
        message: `Practice an unattempted question in weak topic: ${weak.topic}.`,
      }
    }
  }

  const unattemptedInDb = scoped.filter((q) => isUnattempted(safeProgress, q.id))
  if (unattemptedInDb.length > 0) {
    const pick = unattemptedInDb.find((q) => q.id !== currentQuestionId) ?? unattemptedInDb[0]
    return {
      question: pick,
      reason: 'unattempted',
      message: 'Continue with an unattempted question in this database.',
    }
  }

  if (current) {
    const sameTopic = scoped.find(
      (q) => q.topic === current.topic && isUnattempted(safeProgress, q.id) && q.id !== current.id,
    )
    if (sameTopic) {
      return {
        question: sameTopic,
        reason: 'same_topic',
        message: `Next unattempted question in topic: ${current.topic}.`,
      }
    }
  }

  const anyUnattempted = questions.filter((q) => isUnattempted(safeProgress, q.id))
  if (anyUnattempted.length > 0) {
    const pick = anyUnattempted[0]
    return {
      question: pick,
      reason: 'any_unattempted',
      message: 'Try an unattempted question from another database.',
    }
  }

  return {
    question: null,
    reason: 'all_caught_up',
    message: 'All caught up — every question is passed!',
  }
}

export const TOPIC_LABELS: Record<SqlPracticeTopic, string> = {
  select: 'SELECT',
  filtering: 'Filtering',
  joins: 'JOINs',
  aggregates: 'Aggregates',
  subqueries: 'Subqueries',
}

export const DIFFICULTY_LABELS: Record<SqlPracticeDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export function formatPassRate(passed: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((passed / total) * 100)}%`
}
