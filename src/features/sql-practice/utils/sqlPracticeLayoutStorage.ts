export const SQL_PRACTICE_LAYOUT_KEY = 'sql-practice-layout-v1'

export interface SqlPracticeLayoutState {
  leftWidth: number
  rightWidth: number
  bottomHeight: number
  isLeftCollapsed: boolean
  isRightCollapsed: boolean
  isBottomCollapsed: boolean
}

export const DEFAULT_SQL_PRACTICE_LAYOUT: SqlPracticeLayoutState = {
  leftWidth: 280,
  rightWidth: 340,
  bottomHeight: 220,
  isLeftCollapsed: false,
  isRightCollapsed: false,
  isBottomCollapsed: false,
}

export const SQL_LAYOUT_LIMITS = {
  left: { min: 220, max: 420, default: 280 },
  right: { min: 280, max: 520, default: 340 },
  bottom: { min: 120, default: 220, maxViewportRatio: 0.45 },
} as const

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

export function maxBottomHeightPx(viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800): number {
  return Math.max(
    SQL_LAYOUT_LIMITS.bottom.min,
    Math.floor(viewportHeight * SQL_LAYOUT_LIMITS.bottom.maxViewportRatio),
  )
}

export function clampSqlPracticeLayout(
  state: SqlPracticeLayoutState,
  viewportHeight?: number,
): SqlPracticeLayoutState {
  const maxBottom = maxBottomHeightPx(viewportHeight)
  return {
    ...state,
    leftWidth: Math.min(SQL_LAYOUT_LIMITS.left.max, Math.max(SQL_LAYOUT_LIMITS.left.min, state.leftWidth)),
    rightWidth: Math.min(SQL_LAYOUT_LIMITS.right.max, Math.max(SQL_LAYOUT_LIMITS.right.min, state.rightWidth)),
    bottomHeight: Math.min(maxBottom, Math.max(SQL_LAYOUT_LIMITS.bottom.min, state.bottomHeight)),
  }
}

export function loadSqlPracticeLayout(viewportHeight?: number): SqlPracticeLayoutState {
  const stored = readJson<Partial<SqlPracticeLayoutState>>(SQL_PRACTICE_LAYOUT_KEY, {})
  return clampSqlPracticeLayout(
    {
      ...DEFAULT_SQL_PRACTICE_LAYOUT,
      ...stored,
    },
    viewportHeight,
  )
}

export function saveSqlPracticeLayout(state: SqlPracticeLayoutState): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SQL_PRACTICE_LAYOUT_KEY, JSON.stringify(state))
}

export function resetSqlPracticeLayoutStorage(): SqlPracticeLayoutState {
  saveSqlPracticeLayout(DEFAULT_SQL_PRACTICE_LAYOUT)
  return { ...DEFAULT_SQL_PRACTICE_LAYOUT }
}
