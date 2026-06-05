import { ArrowRight, CalendarDays } from 'lucide-react'

import { PlannerMonthCalendar } from '@/components/learning-planner/PlannerMonthCalendar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { DayLearningPlan } from '@/lib/learning-planner-derive'
import { cn } from '@/lib/utils'

import { PLANNER_BODY, PLANNER_CARD } from '@/components/learning-planner/planner-styles'

interface PlannerPreviewWidgetProps {
  dayPlan: DayLearningPlan | null
  viewMonth: Date
  onViewMonthChange: (month: Date) => void
  selectedDate: string
  markedDates: Set<string>
  loading: boolean
  onOpenPlanner: () => void
  onSelectDate: (date: string) => void
}

export function PlannerPreviewWidget({
  dayPlan,
  viewMonth,
  onViewMonthChange,
  selectedDate,
  markedDates,
  loading,
  onOpenPlanner,
  onSelectDate,
}: PlannerPreviewWidgetProps) {
  return (
    <Card className={cn(PLANNER_CARD)}>
      <div className={PLANNER_BODY}>
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-800">Learning Planner</h2>
        </div>

        <PlannerMonthCalendar
          density="dashboard"
          viewMonth={viewMonth}
          onViewMonthChange={onViewMonthChange}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          markedDates={markedDates}
        />

        <div className="mt-4 rounded-xl bg-blue-50/60 p-3">
          <p className="text-xs font-semibold uppercase text-blue-600">Selected day focus</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {loading ? 'Loading…' : dayPlan?.topic ?? 'Select a date to preview'}
          </p>
          {dayPlan && !loading && (
            <p className="mt-1 text-xs text-slate-500">{dayPlan.estimatedMinutes} min estimated</p>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={onOpenPlanner}
        >
          Open full planner
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  )
}
