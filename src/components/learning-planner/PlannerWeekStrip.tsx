import { cn } from '@/lib/utils'
import type { WeekDayCell } from '@/lib/learning-planner-derive'

interface PlannerWeekStripProps {
  days: WeekDayCell[]
  onSelectDate: (date: string) => void
}

const STATUS_RING: Record<WeekDayCell['status'], string> = {
  completed: 'ring-emerald-400 bg-emerald-50',
  current: 'ring-blue-500 bg-blue-50 shadow-md shadow-blue-100',
  upcoming: 'ring-slate-200 bg-white hover:bg-slate-50',
  rest: 'ring-slate-100 bg-slate-50/50 opacity-60',
}

export function PlannerWeekStrip({ days, onSelectDate }: PlannerWeekStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((cell) => (
        <button
          key={cell.date}
          type="button"
          onClick={() => onSelectDate(cell.date)}
          className={cn(
            'flex min-w-[4.5rem] flex-col items-center rounded-xl px-3 py-2.5 ring-2 transition-all',
            STATUS_RING[cell.status],
          )}
        >
          <span className="text-[10px] font-semibold uppercase text-slate-500">{cell.weekday}</span>
          <span className="text-lg font-bold tabular-nums text-slate-900">{cell.dayNum}</span>
          {cell.topicPreview && (
            <span className="mt-0.5 max-w-full truncate text-[9px] text-slate-500">
              {cell.topicPreview}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
