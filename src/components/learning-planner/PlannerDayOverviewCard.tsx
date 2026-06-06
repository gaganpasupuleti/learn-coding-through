import { Clock } from 'lucide-react'

import { Card } from '@/components/ui/card'
import type {
  DayLearningPlan,
  EventCounts,
  ProgramAnchor,
  RoadmapProgress,
} from '@/lib/learning-planner-derive'
import type { PlannerTimelineItem } from '@/lib/learning-planner-derive'
import { cn } from '@/lib/utils'

import { PlannerQuickActions } from './PlannerQuickActions'
import type { PlannerNavTarget } from './planner-actions'
import { COUNT_CHIP, PLANNER_BODY, PLANNER_CARD, PLANNER_STAT_CHIP } from './planner-styles'

interface PlannerDayOverviewCardProps {
  selectedDate: string
  dayPlan: DayLearningPlan
  roadmapProgress: RoadmapProgress
  eventCounts: EventCounts
  timeline: PlannerTimelineItem[]
  anchor: ProgramAnchor
  loading: boolean
  onNavigate: (page: PlannerNavTarget) => void
  onSetProgramStart?: () => void
}

function formatDateLine(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const COUNT_LABELS: { key: keyof EventCounts; label: string; chip: string }[] = [
  { key: 'classes', label: 'Classes', chip: COUNT_CHIP.class },
  { key: 'practice', label: 'Practice Ground', chip: COUNT_CHIP.practice },
  { key: 'quizzes', label: 'Quizzes', chip: COUNT_CHIP.quiz },
  { key: 'projects', label: 'Projects', chip: COUNT_CHIP.project },
]

export function PlannerDayOverviewCard({
  selectedDate,
  dayPlan,
  roadmapProgress,
  eventCounts,
  timeline,
  anchor,
  loading,
  onNavigate,
  onSetProgramStart,
}: PlannerDayOverviewCardProps) {
  return (
    <Card className={cn(PLANNER_CARD, 'flex h-full flex-col overflow-hidden')}>
      <div className={cn(PLANNER_BODY, 'flex min-h-0 flex-1 flex-col gap-2')}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tabular-nums text-slate-900">
              {formatDateLine(selectedDate)}
            </h2>
            <p className="text-xs text-slate-500">
              {roadmapProgress.stageLabel} · M{roadmapProgress.month} W{roadmapProgress.week}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs font-semibold tabular-nums text-blue-600">
              {loading ? '—' : `${dayPlan.progressPct}%`}
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: loading ? '0%' : `${dayPlan.progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {anchor.source === 'today' && onSetProgramStart && (
          <button
            type="button"
            onClick={onSetProgramStart}
            className="rounded-md border border-dashed border-blue-300 bg-blue-50/50 px-2 py-1 text-left text-[10px] text-blue-700 hover:bg-blue-50"
          >
            Set program start date to anchor your journey
          </button>
        )}

        <p className="line-clamp-2 text-sm text-slate-700">
          <span className="font-medium text-slate-500">Objective: </span>
          {loading ? 'Loading…' : dayPlan.dailyObjective}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            {loading ? '—' : `${dayPlan.estimatedMinutes} min`}
          </span>
          <span>
            Focus:{' '}
            <span className="font-medium text-slate-800">{loading ? '…' : dayPlan.topic}</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {COUNT_LABELS.map(({ key, label, chip }) => {
            const n = eventCounts[key]
            if (typeof n !== 'number' || n === 0) return null
            return (
              <span key={key} className={cn(PLANNER_STAT_CHIP, chip)}>
                {n} {label}
              </span>
            )
          })}
          {eventCounts.syllabus > 0 && (
            <span className={cn(PLANNER_STAT_CHIP, COUNT_CHIP.syllabus)}>
              {eventCounts.syllabus} Lessons
            </span>
          )}
        </div>

        <div className="mt-auto pt-1">
          <PlannerQuickActions
            timeline={timeline}
            dayPlan={dayPlan}
            eventCounts={eventCounts}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </Card>
  )
}
