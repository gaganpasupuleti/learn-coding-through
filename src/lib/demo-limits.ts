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

// Add a new utility object for tracking code execution limits

const DEMO_CODE_EXECUTION_KEY = 'demo-code-executions'
const DEMO_CODE_EXECUTION_LIMIT = 1000

export const DemoLimits = {
  /** Check if the user is under the execution limit */
  canExecuteCode: (): boolean => {
    const executions = DemoLimits.getExecutionCount()
    return executions < DEMO_CODE_EXECUTION_LIMIT
  },

  /** Increment the execution counter by 1 */
  incrementExecutionCount: (): void => {
    const executions = DemoLimits.getExecutionCount()
    localStorage.setItem(DEMO_CODE_EXECUTION_KEY, JSON.stringify(executions + 1))
  },

  /** Get the remaining number of executions */
  getRemainingExecutions: (): number => {
    const executions = DemoLimits.getExecutionCount()
    return DEMO_CODE_EXECUTION_LIMIT - executions
  },

  /** Trigger a toast error when the limit is reached */
  triggerLimitReachedError: (): void => {
    // Assuming `sonner` is already set up in the project
    import('sonner').then(({ toast }) => {
      toast.error('Interactive Demo Limit Reached. Full course unlocks unlimited sandboxes.')
    })
  },

  /** Helper to get the current execution count */
  getExecutionCount: (): number => {
    try {
      const raw = localStorage.getItem(DEMO_CODE_EXECUTION_KEY)
      return raw ? JSON.parse(raw) : 0
    } catch {
      return 0
    }
  },
}

/**
 * Legacy compatibility wrapper used by older callsites.
 * Mirrors canStartDemoProject behavior.
 */
export function isProjectUnlocked(projectId: string): boolean {
  return canStartDemoProject(projectId)
}

/**
 * Trigger a toast error for locked projects.
 */
export function triggerProjectLockedError(): void {
  import('sonner').then(({ toast }) => {
    toast.error('Demo limit reached. You can start any 2 projects in demo mode.')
  })
}

export function triggerQuizLockedError(): void {
  import('sonner').then(({ toast }) => {
    toast.error('Demo limit reached. You can attempt any 2 quizzes in demo mode.')
  })
}
