import type { CareerRole, SyllabusItem } from '@/types/career'

const SELECTED_ROLE_KEY = 'career-mapper-selected-role'

export interface CareerJourneySummary {
  roleId: string
  slug: string
  title: string
  pct: number
  nextLessonTitle: string | null
  currentStageLabel: string | null
  completedTopics: string[]
  remainingTopics: string[]
  skills: string[]
  syllabus: SyllabusItem[]
  completedItems: Record<string, boolean>
}

/** Best-effort syllabus % from localStorage (same keys as Career Map / useKV). */
export function readCareerMapLocalSummary(): { title: string; pct: number } | null {
  const journey = readCareerJourneySummary()
  if (!journey) return null
  return { title: journey.title, pct: journey.pct }
}

export function readCareerJourneySummary(): CareerJourneySummary | null {
  try {
    const raw = localStorage.getItem(SELECTED_ROLE_KEY)
    if (!raw) return null
    const role = JSON.parse(raw) as CareerRole
    const syllabus = [...(role.syllabus ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
    const total = syllabus.length

    const progressRaw = localStorage.getItem(`career-progress-${role.id}`)
    const completedItems: Record<string, boolean> = progressRaw
      ? ((JSON.parse(progressRaw) as { completedItems?: Record<string, boolean> })
          .completedItems ?? {})
      : {}

    const completedTopics: string[] = []
    const remainingTopics: string[] = []
    let nextLessonTitle: string | null = null
    let currentStageLabel: string | null = null

    for (const item of syllabus) {
      const done = Boolean(completedItems[item.id])
      if (done) {
        completedTopics.push(item.title)
      } else {
        remainingTopics.push(item.title)
        if (!nextLessonTitle) {
          nextLessonTitle = item.title
          currentStageLabel = `Month ${item.month} · Week ${item.week}`
        }
      }
    }

    const doneCount = Object.values(completedItems).filter(Boolean).length
    const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100)

    return {
      roleId: role.id,
      slug: role.slug,
      title: role.title,
      pct,
      nextLessonTitle,
      currentStageLabel,
      completedTopics,
      remainingTopics,
      skills: role.skills ?? [],
      syllabus,
      completedItems,
    }
  } catch {
    return null
  }
}
