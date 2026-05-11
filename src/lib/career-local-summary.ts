import type { CareerRole } from '@/types/career'

const SELECTED_ROLE_KEY = 'career-mapper-selected-role'

/** Best-effort syllabus % from localStorage (same keys as Career Map / useKV). */
export function readCareerMapLocalSummary(): { title: string; pct: number } | null {
  try {
    const raw = localStorage.getItem(SELECTED_ROLE_KEY)
    if (!raw) return null
    const role = JSON.parse(raw) as CareerRole
    const total = role.syllabus?.length ?? 0
    if (total === 0) return { title: role.title, pct: 0 }
    const progressRaw = localStorage.getItem(`career-progress-${role.id}`)
    if (!progressRaw) return { title: role.title, pct: 0 }
    const parsed = JSON.parse(progressRaw) as { completedItems?: Record<string, boolean> }
    const done = Object.values(parsed.completedItems ?? {}).filter(Boolean).length
    return { title: role.title, pct: Math.round((done / total) * 100) }
  } catch {
    return null
  }
}
