import { useEffect, useMemo, useState } from 'react'
import { Maximize2 } from 'lucide-react'

import { fetchCalendarEvents, type UpcomingSession } from '@/lib/api'
import { collectEventDates, monthDateRange, toIsoDate } from '@/lib/calendar-events'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

interface CompactCalendarWidgetProps {
  sessions: UpcomingSession[]
  onExpand: () => void
}

export function CompactCalendarWidget({ sessions, onExpand }: CompactCalendarWidgetProps) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [calendarDates, setCalendarDates] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const { startDate, endDate } = monthDateRange(viewDate)
    let cancelled = false
    void fetchCalendarEvents({ startDate, endDate })
      .then((res) => {
        if (cancelled) return
        setCalendarDates(collectEventDates(res.events))
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('[Calendar] month fetch failed:', err)
        setCalendarDates(new Set())
      })
    return () => {
      cancelled = true
    }
  }, [viewDate])

  const eventDates = useMemo(() => {
    const set = new Set(calendarDates)
    for (const s of sessions) {
      set.add(s.session_date)
    }
    return set
  }, [calendarDates, sessions])

  const { year, month, cells } = useMemo(() => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
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
    while (grid.length < 35) {
      const day = grid.length - startPad - daysInMonth + 1
      const d = new Date(y, m + 1, day)
      grid.push({ iso: toIsoDate(d), day, inMonth: false })
    }
    return { year: y, month: m, cells: grid.slice(0, 35) }
  }, [viewDate])

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <Card className={cn(DASHBOARD_CARD)}>
      <div className={cn(DASHBOARD_CARD_BODY, 'pb-4 pt-5')}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-700">Calendar</h2>
          <button
            type="button"
            onClick={onExpand}
            className="shrink-0 text-slate-400 transition-colors hover:text-slate-900"
            aria-label="Expand calendar"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          >
            Prev
          </button>
          <span className="text-xs font-semibold text-slate-800">{monthLabel}</span>
          <button
            type="button"
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS.map((wd) => (
            <span key={wd} className="py-0.5 text-[9px] font-medium uppercase text-slate-400">
              {wd}
            </span>
          ))}
          {cells.map((cell, idx) => {
            const hasEvent = eventDates.has(cell.iso)
            const selected = selectedDay === cell.iso
            return (
              <button
                key={`${cell.iso}-${idx}`}
                type="button"
                onClick={() => setSelectedDay((prev) => (prev === cell.iso ? null : cell.iso))}
                className={cn(
                  'mx-auto flex aspect-square w-full max-w-[1.75rem] flex-col items-center justify-center gap-0.5 rounded text-[10px] tabular-nums leading-none',
                  !cell.inMonth && 'text-slate-300',
                  cell.inMonth && 'text-slate-700',
                  selected && 'bg-blue-50 ring-1 ring-blue-400',
                )}
              >
                <span className="flex h-3.5 items-center justify-center">{cell.day}</span>
                <span className="flex h-1 w-full items-center justify-center" aria-hidden>
                  {hasEvent ? (
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
