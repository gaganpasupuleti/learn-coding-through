/**
 * Demo access rules.
 *
 * Demo users can access any project or quiz but are limited to:
 *   - 2 total distinct projects started
 *   - 2 total quizzes attempted
 *
 * Already-started items do NOT consume additional quota when revisited.
 *
 * Data is stored in localStorage. When real backend enforcement is
 * available, replace the storage calls below with API calls and keep
 * the same canStart* / record* surface area.
 */

const DEMO_PROJECTS_KEY = 'demo-started-projects'
const DEMO_QUIZZES_KEY = 'demo-attempted-quizzes'

export const DEMO_PROJECT_LIMIT = 2
export const DEMO_QUIZ_LIMIT = 2

// ---------- projects ----------

export function getDemoStartedProjects(): string[] {
  try {
    const raw = localStorage.getItem(DEMO_PROJECTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

function saveDemoStartedProjects(ids: string[]) {
  localStorage.setItem(DEMO_PROJECTS_KEY, JSON.stringify(ids))
}

/** Returns true if the user is allowed to start/open this project. */
export function canStartDemoProject(projectId: string): boolean {
  const started = getDemoStartedProjects()
  if (started.includes(projectId)) return true
  return started.length < DEMO_PROJECT_LIMIT
}

/** Record that the user has started a project. No-op if already recorded. */
export function recordDemoProjectStart(projectId: string) {
  const started = getDemoStartedProjects()
  if (!started.includes(projectId)) {
    saveDemoStartedProjects([...started, projectId])
  }
}

// ---------- quizzes ----------

export function getDemoAttemptedQuizzes(): string[] {
  try {
    const raw = localStorage.getItem(DEMO_QUIZZES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

function saveDemoAttemptedQuizzes(ids: string[]) {
  localStorage.setItem(DEMO_QUIZZES_KEY, JSON.stringify(ids))
}

/** Returns true if the user is allowed to attempt this quiz. */
export function canAttemptDemoQuiz(quizId: string): boolean {
  const attempted = getDemoAttemptedQuizzes()
  if (attempted.includes(quizId)) return true
  return attempted.length < DEMO_QUIZ_LIMIT
}

/** Record that the user has attempted a quiz. No-op if already recorded. */
export function recordDemoQuizAttempt(quizId: string) {
  const attempted = getDemoAttemptedQuizzes()
  if (!attempted.includes(quizId)) {
    saveDemoAttemptedQuizzes([...attempted, quizId])
  }
}

// ---------- reset (for testing / account upgrade) ----------

export function resetDemoLimits() {
  localStorage.removeItem(DEMO_PROJECTS_KEY)
  localStorage.removeItem(DEMO_QUIZZES_KEY)
}
