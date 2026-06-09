/** `sql` mistakes are tracked for Issue #30 SQL practice; excluded from Issue #29 rebuild. */
export type PracticeMistakeLanguage = 'python' | 'sql' | 'java' | 'quiz'

export interface PracticeMistake {
  id: string
  language: PracticeMistakeLanguage
  message: string
  codePreview: string
  createdAt: string
}

const STORAGE_KEY = 'codequest-practice-mistakes'
const MAX_MISTAKES = 50

function readAll(): PracticeMistake[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PracticeMistake[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(items: PracticeMistake[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_MISTAKES)))
  } catch {
    /* ignore quota errors */
  }
}

export function listPracticeMistakes(): PracticeMistake[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function logPracticeMistake(
  language: PracticeMistakeLanguage,
  message: string,
  code: string,
): void {
  const trimmed = message.trim()
  if (!trimmed) return

  const entry: PracticeMistake = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    language,
    message: trimmed.slice(0, 1200),
    codePreview: code.trim().slice(0, 600),
    createdAt: new Date().toISOString(),
  }

  const existing = readAll()
  const duplicate = existing[0]
  if (
    duplicate &&
    duplicate.language === entry.language &&
    duplicate.message === entry.message &&
    Date.now() - new Date(duplicate.createdAt).getTime() < 30_000
  ) {
    return
  }

  writeAll([entry, ...existing])
}

export function clearPracticeMistakes(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function removePracticeMistake(id: string): void {
  writeAll(readAll().filter((item) => item.id !== id))
}
