import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { toIsoDate } from '@/lib/calendar-events'
import type { MarkedDatesByType, PlannerTimelineKind } from '@/lib/learning-planner-derive'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { EVENT_DOT, PLANNER_BODY, PLANNER_CARD } from './planner-styles'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

const DOT_ORDER: PlannerTimelineKind[] = ['class', 'quiz', 'project', 'syllabus', 'practice']

interface PlannerMonthCalendarProps {
  viewMonth: Date
  onViewMonthChange: (month: Date) => void
  selectedDate: string
  onSelectDate: (date: string) => void
  markedDates?: Set<string>
  markedDatesByType?: MarkedDatesByType
  density?: 'dashboard' | 'planner'
  className?: string
}

export function PlannerMonthCalendar({
  viewMonth,
  onViewMonthChange,
  selectedDate,
  onSelectDate,
  markedDates,
  markedDatesByType,
  density = 'planner',
  className,
}: PlannerMonthCalendarProps) {
  const todayIso = toIsoDate(new Date())
  const isPlanner = density === 'planner'

  const { year, month, cells } = useMemo(() => {
    const y = viewMonth.getFullYear()
    const m = viewMonth.getMonth()
    const first = new Date(y, m, 1)
    const startPad = first.getDay()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const grid: { iso: string; day: number; inMonth: boolean }[] = []

    const prevMonthDays = new Date(y, m, 0).getDate()
    for (let i = startPad - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      const d = new Date(y, m - 1, day)
      grid.push({ iso: toIsoDate(d), day, inMonth: false })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(y, m, day)
      grid.push({ iso: toIsoDate(d), day, inMonth: true })
    }
    while (grid.length % 7 !== 0 || grid.length < 35) {
      const day = grid.length - startPad - daysInMonth + 1
      const d = new Date(y, m + 1, day)
      grid.push({ iso: toIsoDate(d), day, inMonth: false })
    }
    return { year: y, month: m, cells: grid }
  }, [viewMonth])

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const body = (
    <>
      <div className={cn('flex items-center justify-between gap-2', isPlanner ? 'mb-2' : 'mb-3')}>
        <button
          type="button"
          aria-label="Previous month"
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          onClick={() =>
            onViewMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
          }
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <h2 className={cn('font-semibold text-slate-900', isPlanner ? 'text-xs' : 'text-sm')}>
          {monthLabel}
        </h2>
        <button
          type="button"
          aria-label="Next month"
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          onClick={() =>
            onViewMonthChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
          }
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px text-center">
        {WEEKDAYS.map((wd) => (
          <span
            key={wd}
            className={cn(
              'font-medium uppercase text-slate-400',
              isPlanner ? 'py-0.5 text-[9px]' : 'py-1 text-[10px]',
            )}
          >
            {wd}
          </span>
        ))}
        {cells.map((cell, idx) => {
          const types = markedDatesByType?.get(cell.iso)
          const hasActivity = types?.size || markedDates?.has(cell.iso)
          const isSelected = selectedDate === cell.iso
          const isToday = todayIso === cell.iso
          const dots = types
            ? DOT_ORDER.filter((k) => types.has(k)).slice(0, 3)
            : hasActivity
              ? (['syllabus'] as PlannerTimelineKind[])
              : []

          return (
            <button
              key={`${cell.iso}-${idx}`}
              type="button"
              onClick={() => onSelectDate(cell.iso)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded tabular-nums transition-colors',
                isPlanner ? 'min-h-[1.5rem] text-[11px] py-0.5' : 'aspect-square max-w-[2rem] text-xs py-1',
                !cell.inMonth && 'text-slate-300',
                cell.inMonth && !isSelected && 'text-slate-800 hover:bg-slate-50',
                isSelected && 'bg-blue-600 font-semibold text-white',
                isToday && !isSelected && 'ring-1 ring-blue-400 ring-offset-1',
              )}
            >
              <span>{cell.day}</span>
              {dots.length > 0 && (
                <span className="mt-0.5 flex h-1 gap-px" aria-hidden>
                  {dots.map((kind) => (
                    <span
                      key={kind}
                      className={cn(
                        'rounded-full',
                        isPlanner ? 'h-1 w-1' : 'h-1 w-1',
                        isSelected ? 'bg-white/90' : EVENT_DOT[kind],
                      )}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )

  if (density === 'dashboard') {
    return <div className={className}>{body}</div>
  }

  return (
    <Card className={cn(PLANNER_CARD, 'h-full overflow-hidden', className)}>
      <div className={cn(PLANNER_BODY, 'h-full')}>{body}</div>
    </Card>
  )
}
