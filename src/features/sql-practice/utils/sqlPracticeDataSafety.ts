import { getQuestionById } from '../data/sqlQuestions'
import type {
  SqlDatabaseId,
  SqlMistakeRecord,
  SqlPracticeQuestion,
  SqlQuestionProgressRecord,
} from '../types/sqlPractice.types'
import { TOPIC_LABELS } from './sqlPracticeAnalytics'
import type { SqlProgressStore } from './sqlPracticeProgress'

const VALID_DATABASE_IDS: SqlDatabaseId[] = [
  'university_system',
  'hospital_management',
  'shipping_logistics',
]

export function isValidDatabaseId(value: unknown): value is SqlDatabaseId {
  return typeof value === 'string' && VALID_DATABASE_IDS.includes(value as SqlDatabaseId)
}

export function isValidProgressRecord(value: unknown): value is SqlQuestionProgressRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as SqlQuestionProgressRecord
  return (
    typeof record.questionId === 'string' &&
    isValidDatabaseId(record.databaseId) &&
    typeof record.attemptsCount === 'number' &&
    Number.isFinite(record.attemptsCount) &&
    typeof record.passedCount === 'number' &&
    Number.isFinite(record.passedCount) &&
    typeof record.failedCount === 'number' &&
    Number.isFinite(record.failedCount) &&
    typeof record.solutionRevealed === 'boolean' &&
    typeof record.hintsUsedCount === 'number' &&
    Number.isFinite(record.hintsUsedCount)
  )
}

export function sanitizeProgressStore(store: unknown): SqlProgressStore {
  if (!store || typeof store !== 'object') return {}
  const safe: SqlProgressStore = {}
  for (const [key, value] of Object.entries(store)) {
    if (isValidProgressRecord(value)) safe[key] = value
  }
  return safe
}

export function sanitizeMistakeRecords(records: unknown): SqlMistakeRecord[] {
  if (!Array.isArray(records)) return []
  return records.filter((record): record is SqlMistakeRecord => {
    if (!record || typeof record !== 'object') return false
    const m = record as SqlMistakeRecord
    return (
      typeof m.id === 'string' &&
      typeof m.questionId === 'string' &&
      isValidDatabaseId(m.databaseId) &&
      typeof m.sql === 'string' &&
      typeof m.recordedAt === 'string'
    )
  })
}

export function filterQuestionsToKnownIds(
  questions: SqlPracticeQuestion[],
  ids: string[],
): SqlPracticeQuestion[] {
  const known = new Set(questions.map((q) => q.id))
  const idSet = new Set(ids.filter((id) => known.has(id)))
  return questions.filter((q) => idSet.has(q.id))
}

export function resolveQuestionDisplayMeta(questionId: string): {
  title: string
  topicLabel: string
  found: boolean
} {
  const question = getQuestionById(questionId)
  if (!question) {
    return {
      title: questionId,
      topicLabel: 'Unknown topic',
      found: false,
    }
  }
  return {
    title: question.title,
    topicLabel: TOPIC_LABELS[question.topic],
    found: true,
  }
}
