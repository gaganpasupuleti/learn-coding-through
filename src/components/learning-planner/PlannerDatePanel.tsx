import { Clock, Target } from 'lucide-react'

import { Card } from '@/components/ui/card'
import type { DayLearningPlan, ProgramAnchor, RoadmapProgress } from '@/lib/learning-planner-derive'
import { cn } from '@/lib/utils'

import { PLANNER_BODY, PLANNER_CARD } from './planner-styles'

interface PlannerDatePanelProps {
  selectedDate: string
  dayPlan: DayLearningPlan
  roadmapProgress: RoadmapProgress
  anchor: ProgramAnchor
  loading: boolean
  onSetProgramStart?: () => void
}

function formatDisplayDate(iso: string): { day: string; weekday: string; monthYear: string } {
  const d = new Date(iso + 'T00:00:00')
  return {
    day: String(d.getDate()),
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    monthYear: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  }
}

export function PlannerDatePanel({
  selectedDate,
  dayPlan,
  roadmapProgress,
  anchor,
  loading,
  onSetProgramStart,
}: PlannerDatePanelProps) {
  const { day, weekday, monthYear } = formatDisplayDate(selectedDate)

  return (
    <Card className={cn(PLANNER_CARD, 'h-full')}>
      <div className={PLANNER_BODY}>
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">{weekday}</p>
          <div className="mt-1 flex items-end gap-3">
            <span className="text-5xl font-bold tabular-nums text-slate-900">{day}</span>
            <span className="pb-1 text-lg text-slate-600">{monthYear}</span>
          </div>
        </div>

        {anchor.source === 'today' && onSetProgramStart && (
          <button
            type="button"
            onClick={onSetProgramStart}
            className="mb-4 w-full rounded-lg border border-dashed border-blue-300 bg-blue-50/50 px-3 py-2 text-left text-xs text-blue-700 hover:bg-blue-50"
          >
            Set program start date to anchor your learning journey
          </button>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              {roadmapProgress.stageLabel}
            </p>
            <p className="text-sm text-slate-600">
              Month {roadmapProgress.month} · Week {roadmapProgress.week}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="mb-1 flex items-center gap-2 text-blue-700">
              <Target className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Daily objective</span>
            </div>
            <p className="text-sm font-medium text-slate-900">
              {loading ? 'Loading…' : dayPlan.dailyObjective}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>
              Est. study time:{' '}
              <span className="font-semibold text-slate-900">
                {loading ? '—' : `${dayPlan.estimatedMinutes} min`}
              </span>
            </span>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-slate-600">Day progress</span>
              <span className="font-semibold tabular-nums text-slate-900">
                {loading ? '—' : `${dayPlan.progressPct}%`}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                style={{ width: loading ? '0%' : `${dayPlan.progressPct}%` }}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today&apos;s focus
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {loading ? '…' : dayPlan.topic}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
