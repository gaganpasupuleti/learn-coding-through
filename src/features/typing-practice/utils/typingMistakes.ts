import type {
  TypingCharacterMistake,
  TypingCodeLanguage,
  TypingSessionMistake,
  TypingSessionRecord,
} from '../types/typingPractice.types'

const MISTAKES_KEY = 'codequest-typing-practice-mistakes'
const SESSIONS_KEY = 'codequest-typing-practice-sessions'
const MAX_MISTAKES = 120
const MAX_SESSIONS = 40

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function readJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeJson<T>(key: string, items: T[], max: number) {
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(0, max)))
  } catch {
    /* ignore quota */
  }
}

export function readTypingMistakes(): TypingCharacterMistake[] {
  return readJson<TypingCharacterMistake>(MISTAKES_KEY)
}

export function recordTypingMistakes(
  mistakes: Array<{
    snippetId: string
    language: TypingCodeLanguage | 'text'
    expectedChar: string
    typedChar: string
    position: number
  }>,
): TypingCharacterMistake[] {
  if (mistakes.length === 0) return readTypingMistakes()

  const existing = readTypingMistakes()
  const created = mistakes.map((mistake) => ({
    id: newId(),
    snippetId: mistake.snippetId,
    language: mistake.language,
    expectedChar: mistake.expectedChar,
    typedChar: mistake.typedChar,
    position: mistake.position,
    timestamp: new Date().toISOString(),
  }))

  writeJson(MISTAKES_KEY, [...created, ...existing], MAX_MISTAKES)
  return [...created, ...existing].slice(0, MAX_MISTAKES)
}

export function clearTypingMistakes(): void {
  try {
    localStorage.removeItem(MISTAKES_KEY)
  } catch {
    /* ignore */
  }
}

export function getRecentTypingMistakes(limit = 20): TypingCharacterMistake[] {
  return readTypingMistakes().slice(0, limit)
}

export function getRetryMistakeGroups(limit = 8): TypingSessionMistake[] {
  const mistakes = readTypingMistakes()
  const seen = new Set<string>()
  const groups: TypingSessionMistake[] = []

  for (const mistake of mistakes) {
    const key = `${mistake.snippetId}:${mistake.position}`
    if (seen.has(key)) continue
    seen.add(key)
    groups.push({
      ...mistake,
      snippetText: '',
    })
    if (groups.length >= limit) break
  }

  return groups
}

export function filterMistakesForSnippet(snippetId: string): TypingCharacterMistake[] {
  return readTypingMistakes().filter((mistake) => mistake.snippetId === snippetId)
}

export function readTypingSessions(): TypingSessionRecord[] {
  return readJson<TypingSessionRecord>(SESSIONS_KEY)
}

export function recordTypingSession(record: Omit<TypingSessionRecord, 'id' | 'completedAt'>): TypingSessionRecord {
  const next: TypingSessionRecord = {
    ...record,
    id: newId(),
    completedAt: new Date().toISOString(),
  }
  const existing = readTypingSessions()
  writeJson(SESSIONS_KEY, [next, ...existing], MAX_SESSIONS)
  return next
}

export function getRecentTypingSessions(limit = 10): TypingSessionRecord[] {
  return readTypingSessions().slice(0, limit)
}
