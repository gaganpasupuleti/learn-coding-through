import { PlannerMonthCalendar } from '@/components/learning-planner/PlannerMonthCalendar'
import type { MarkedDatesByType } from '@/lib/learning-planner-derive'

interface ClassCalendarProps {
  viewMonth: Date
  onViewMonthChange: (month: Date) => void
  selectedDate: string
  onSelectDate: (date: string) => void
  markedDates: Set<string>
  markedDatesByType?: MarkedDatesByType
}

export function ClassCalendar(props: ClassCalendarProps) {
  return (
    <PlannerMonthCalendar
      density="planner"
      className="h-full"
      {...props}
    />
  )
}
