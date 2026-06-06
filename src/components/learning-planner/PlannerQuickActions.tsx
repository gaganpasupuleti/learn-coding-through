import { BookOpen, ClipboardList, FlaskConical, GraduationCap } from 'lucide-react'

import type { EventCounts } from '@/lib/learning-planner-derive'
import type { DayLearningPlan } from '@/lib/learning-planner-derive'
import type { PlannerTimelineItem } from '@/lib/learning-planner-derive'
import { cn } from '@/lib/utils'

import {
  executePlannerAction,
  resolvePlannerAction,
  type PlannerNavTarget,
} from './planner-actions'

interface PlannerQuickActionsProps {
  timeline: PlannerTimelineItem[]
  dayPlan: DayLearningPlan
  eventCounts: EventCounts
  onNavigate: (page: PlannerNavTarget) => void
}

const ACTIONS = [
  { key: 'lesson' as const, label: 'Start Lesson', icon: BookOpen, kind: 'syllabus' as const },
  { key: 'practice' as const, label: 'Practice Ground', icon: FlaskConical, kind: 'practice' as const },
  { key: 'quiz' as const, label: 'Quiz', icon: ClipboardList, kind: 'quiz' as const },
  { key: 'project' as const, label: 'Project', icon: GraduationCap, kind: 'project' as const },
]

function countForKind(counts: EventCounts, kind: PlannerTimelineItem['kind']): number {
  if (kind === 'class') return counts.classes
  if (kind === 'practice') return counts.practice
  if (kind === 'quiz') return counts.quizzes
  if (kind === 'project') return counts.projects
  return counts.syllabus
}

export function PlannerQuickActions({
  timeline,
  dayPlan,
  eventCounts,
  onNavigate,
}: PlannerQuickActionsProps) {
  const handleAction = (kind: PlannerTimelineItem['kind']) => {
    const pending = timeline.filter((t) => t.status !== 'done' && t.kind === kind)
    if (pending[0]) {
      executePlannerAction(resolvePlannerAction(pending[0]), onNavigate)
      return
    }
    if (kind === 'syllabus') {
      const lesson = dayPlan.requiredLessons.find((l) => !l.done)
      if (lesson) {
        executePlannerAction(
          { label: lesson.title, target: 'roadmapper', syllabusItemId: lesson.id, kind: 'syllabus' },
          onNavigate,
        )
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {ACTIONS.map(({ key, label, icon: Icon, kind }) => {
        const count = countForKind(eventCounts, kind)
        const disabled = count === 0
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => handleAction(kind)}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
              disabled
                ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200',
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
