const SESSION_KEY = 'codequest_jobboard_session_id'
const SAVED_KEY = 'codequest_jobboard_saved_jobs'

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getJobSpySessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = randomId()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function getSavedJobIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(String).filter(Boolean)
  } catch {
    return []
  }
}

export function addSavedJobId(id: string): void {
  const saved = getSavedJobIds()
  if (!saved.includes(id)) {
    saved.unshift(id)
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
  }
}

export function removeSavedJobId(id: string): void {
  const saved = getSavedJobIds().filter((x) => x !== id)
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
}
