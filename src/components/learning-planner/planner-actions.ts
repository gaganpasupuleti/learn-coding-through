import type { PlannerTimelineItem, DayLearningPlan } from '@/lib/learning-planner-derive'
import { storeHighlightItem } from '@/lib/learning-planner-derive'

export type PlannerNavTarget = 'roadmapper' | 'projects' | 'quiz' | 'hub' | 'practice'

export interface PlannerAction {
  label: string
  target: PlannerNavTarget
  syllabusItemId?: string
  kind?: PlannerTimelineItem['kind']
}

export function resolvePlannerAction(item: PlannerTimelineItem): PlannerAction {
  if (item.syllabusItemId) {
    return { label: item.title, target: 'roadmapper', syllabusItemId: item.syllabusItemId, kind: item.kind }
  }
  if (item.kind === 'quiz') {
    return { label: item.title, target: 'quiz', kind: 'quiz' }
  }
  if (item.kind === 'project') {
    return { label: item.title, target: 'projects', kind: 'project' }
  }
  if (item.kind === 'class') {
    return { label: item.title, target: 'hub', kind: 'class' }
  }
  if (item.kind === 'practice') {
    return { label: item.title, target: 'practice', kind: 'practice' }
  }
  return { label: item.title, target: 'roadmapper', kind: item.kind }
}

export function executePlannerAction(
  action: PlannerAction,
  onNavigate: (page: PlannerNavTarget) => void,
): void {
  if (action.syllabusItemId) {
    storeHighlightItem(action.syllabusItemId)
  }
  onNavigate(action.target)
}

export function getPrimaryLearningAction(
  timeline: PlannerTimelineItem[],
  dayPlan: DayLearningPlan,
): PlannerAction | null {
  const pending = timeline.filter((t) => t.status !== 'done')
  const syllabus = pending.find((t) => t.kind === 'syllabus')
  if (syllabus) return resolvePlannerAction(syllabus)
  const lesson = dayPlan.requiredLessons.find((l) => !l.done)
  if (lesson) {
    return { label: lesson.title, target: 'roadmapper', syllabusItemId: lesson.id, kind: 'syllabus' }
  }
  const next = pending[0]
  if (next) return resolvePlannerAction(next)
  if (dayPlan.topic) {
    return { label: dayPlan.topic, target: 'roadmapper', kind: 'syllabus' }
  }
  return null
}
