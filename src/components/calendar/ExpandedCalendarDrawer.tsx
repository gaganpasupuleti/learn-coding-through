import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'

import { fetchCalendarEvents } from '@/lib/api'
import {
  mapCalendarToGridEvents,
  toIsoDate,
  weekDateRange,
  type ScheduleGridEvent,
} from '@/lib/calendar-events'
import { cn } from '@/lib/utils'

/* ───────────────────────────── Constants ───────────────────────────── */

const HOUR_START = 8
const HOUR_END = 18
const ROW_HEIGHT_PX = 64
const GRID_HEIGHT_PX = (HOUR_END - HOUR_START) * ROW_HEIGHT_PX

const SCROLL_BODY =
  'overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(203_213_225)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300'

const WEEKDAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const
const WEEKDAYS_HEADER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const MASTER_GRID = 'grid grid-cols-[60px_repeat(7,1fr)]'
const HOUR_ROW_COUNT = HOUR_END - HOUR_START

/* ───────────────────────────── Types ───────────────────────────── */

export type EventType = 'class' | 'quiz' | 'project'

export interface ExpandedCalendarDrawerProps {
  open: boolean
  onClose: () => void
}

export interface EventBlockProps {
  title: string
  time: string
  type: EventType
  style?: React.CSSProperties
}

interface CalendarCell {
  iso: string
  day: number
  inMonth: boolean
}

interface ScheduleEvent extends ScheduleGridEvent {}

interface EventFilters {
  classes: boolean
  quizzes: boolean
  projects: boolean
}

const EVENT_TYPE_STYLES: Record<EventType, string> = {
  class: 'bg-indigo-100 text-indigo-900',
  quiz: 'bg-amber-100 text-amber-900',
  project: 'bg-emerald-100 text-emerald-900',
}

/* ───────────────────────────── Helpers ───────────────────────────── */

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function buildMonthGrid(viewDate: Date): { year: number; month: number; cells: CalendarCell[] } {
  const y = viewDate.getFullYear()
  const m = viewDate.getMonth()
  const first = new Date(y, m, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const grid: CalendarCell[] = []

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
}

function formatHourLabel(hour: number): string {
  if (hour === 12) return '12 PM'
  if (hour > 12) return `${hour - 12} PM`
  return `${hour} AM`
}

function getEventStyle(dayIndex: number, startMinutes: number, endMinutes: number): React.CSSProperties {
  const gridStartMinutes = HOUR_START * 60
  const top = ((startMinutes - gridStartMinutes) / 60) * ROW_HEIGHT_PX
  const height = ((endMinutes - startMinutes) / 60) * ROW_HEIGHT_PX
  const colWidth = 100 / 7
  return {
    top: `${top}px`,
    height: `${Math.max(height, 28)}px`,
    left: `calc(${dayIndex} * ${colWidth}% + 4px)`,
    width: `calc(${colWidth}% - 8px)`,
  }
}

function eventVisible(type: EventType, filters: EventFilters): boolean {
  if (type === 'class') return filters.classes
  if (type === 'quiz') return filters.quizzes
  return filters.projects
}

/* ───────────────────────────── EventBlock ───────────────────────────── */

export function EventBlock({ title, time, type, style }: EventBlockProps) {
  return (
    <div
      className={cn(
        'absolute overflow-hidden rounded-2xl p-2.5 shadow-sm',
        EVENT_TYPE_STYLES[type],
      )}
      style={style}
    >
      <p className="line-clamp-2 break-words text-[11px] font-semibold leading-tight">{title}</p>
      <p className="mt-0.5 line-clamp-1 text-[10px] leading-tight font-medium opacity-80">{time}</p>
    </div>
  )
}

/* ───────────────────────────── Mini calendar ───────────────────────────── */

function MiniCalendarNav({
  viewDate,
  selectedDay,
  onViewDateChange,
  onSelectDay,
}: {
  viewDate: Date
  selectedDay: string
  onViewDateChange: (d: Date) => void
  onSelectDay: (iso: string) => void
}) {
  const { year, month, cells } = useMemo(() => buildMonthGrid(viewDate), [viewDate])

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const todayIso = toIsoDate(new Date())

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
          onClick={() => onViewDateChange(new Date(year, month - 1, 1))}
        >
          Prev
        </button>
        <span className="text-sm font-semibold text-gray-800">{monthLabel}</span>
        <button
          type="button"
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
          onClick={() => onViewDateChange(new Date(year, month + 1, 1))}
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS_SHORT.map((wd) => (
          <span key={wd} className="py-1 text-[10px] font-medium uppercase text-gray-400">
            {wd}
          </span>
        ))}
        {cells.map((cell, idx) => {
          const selected = selectedDay === cell.iso
          const isToday = cell.iso === todayIso
          return (
            <button
              key={`${cell.iso}-${idx}`}
              type="button"
              onClick={() => onSelectDay(cell.iso)}
              className={cn(
                'mx-auto flex aspect-square w-full max-w-[2.75rem] flex-col items-center justify-center gap-1 rounded-lg text-sm tabular-nums leading-none',
                !cell.inMonth && 'text-gray-300',
                cell.inMonth && 'text-gray-700 hover:bg-gray-50',
                selected && 'bg-teal-50 ring-1 ring-teal-400',
                isToday && !selected && cell.inMonth && 'font-semibold text-teal-700',
              )}
            >
              <span className="flex h-5 items-center justify-center">{cell.day}</span>
              {isToday && cell.inMonth ? (
                <span className="flex h-1.5 w-full items-center justify-center" aria-hidden>
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                </span>
              ) : (
                <span className="h-1.5" aria-hidden />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ───────────────────────────── Filters ───────────────────────────── */

function ScheduleFilters({
  filters,
  onChange,
}: {
  filters: EventFilters
  onChange: (next: EventFilters) => void
}) {
  const items: { key: keyof EventFilters; label: string }[] = [
    { key: 'classes', label: 'Classes' },
    { key: 'quizzes', label: 'Quizzes' },
    { key: 'projects', label: 'Projects' },
  ]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Filter</h3>
      <ul className="space-y-2.5">
        {items.map(({ key, label }) => (
          <li key={key}>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={(e) => onChange({ ...filters, [key]: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ───────────────────────────── Week time grid ───────────────────────────── */

function WeekTimeGrid({
  weekStart,
  events,
  filters,
  loading,
}: {
  weekStart: Date
  events: ScheduleEvent[]
  filters: EventFilters
  loading?: boolean
}) {
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    })
  }, [weekStart])

  const visibleEvents = events.filter((e) => eventVisible(e.type, filters))

  const hourRows = useMemo(
    () =>
      Array.from({ length: HOUR_ROW_COUNT }, (_, rowIdx) => ({
        rowIdx,
        hour: HOUR_START + rowIdx,
      })),
    [],
  )

  return (
    <div className="relative flex min-h-0 w-[70%] min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 text-sm text-gray-500">
          Loading schedule…
        </div>
      ) : null}
      <div className={cn(MASTER_GRID, 'shrink-0')}>
        <div aria-hidden />
        {weekDays.map((d, i) => (
          <div
            key={d.toISOString()}
            className="flex flex-col items-center justify-center border-b border-l border-gray-200 py-4"
          >
            <span className="text-xs font-semibold uppercase text-gray-500">
              {WEEKDAYS_HEADER[i]}
            </span>
            <span className="text-lg font-normal text-gray-900">
              {String(d.getDate()).padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>

      <div className={cn('relative min-h-0 flex-1', SCROLL_BODY)}>
        <div
          className={MASTER_GRID}
          style={{ gridTemplateRows: `repeat(${HOUR_ROW_COUNT}, ${ROW_HEIGHT_PX}px)` }}
        >
          {hourRows.map(({ rowIdx, hour }) => (
            <Fragment key={`row-${rowIdx}`}>
              <div className="relative border-t border-gray-100">
                {rowIdx % 2 === 0 ? (
                  <span className="absolute top-0 right-0 -translate-y-1/2 pr-3 text-right text-[11px] font-medium text-gray-400">
                    {formatHourLabel(hour)}
                  </span>
                ) : null}
              </div>
              {Array.from({ length: 7 }, (_, dayIdx) => (
                <div
                  key={`cell-${rowIdx}-${dayIdx}`}
                  className="border-t border-l border-gray-100"
                />
              ))}
            </Fragment>
          ))}
        </div>

        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0"
          style={{ left: 60, minHeight: GRID_HEIGHT_PX }}
        >
          <div className="relative h-full w-full">
            {visibleEvents.map((event) => (
              <EventBlock
                key={event.id}
                title={event.title}
                time={event.time}
                type={event.type}
                style={getEventStyle(event.dayIndex, event.startMinutes, event.endMinutes)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────── Main drawer ───────────────────────────── */

/**
 * Expanded week calendar drawer — loads events from GET /api/v1/schedule/calendar.
 */
export function ExpandedCalendarDrawer({ open, onClose }: ExpandedCalendarDrawerProps) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(() => toIsoDate(new Date()))
  const [filters, setFilters] = useState<EventFilters>({
    classes: true,
    quizzes: true,
    projects: true,
  })
  const [events, setEvents] = useState<ScheduleGridEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  const weekStart = useMemo(
    () => getMondayOfWeek(parseIsoDate(selectedDay)),
    [selectedDay],
  )

  useEffect(() => {
    if (!open) return
    const { startDate, endDate } = weekDateRange(weekStart)
    let cancelled = false
    setLoadingEvents(true)
    void fetchCalendarEvents({
      startDate,
      endDate,
      includeClasses: filters.classes,
      includeQuizzes: filters.quizzes,
      includeProjects: filters.projects,
    })
      .then((res) => {
        if (cancelled) return
        setEvents(mapCalendarToGridEvents(res.events, weekStart))
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('[Calendar] fetch failed:', err)
        setEvents([])
      })
      .finally(() => {
        if (!cancelled) setLoadingEvents(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, weekStart, filters.classes, filters.quizzes, filters.projects])

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleEscape)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = prev
    }
  }, [open, handleEscape])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Expanded calendar schedule"
        className="fixed top-0 right-0 z-50 flex h-full w-[75vw] gap-6 bg-slate-50 p-6 shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
          aria-label="Close calendar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex w-[30%] min-w-0 flex-col gap-5">
          <MiniCalendarNav
            viewDate={viewDate}
            selectedDay={selectedDay}
            onViewDateChange={setViewDate}
            onSelectDay={setSelectedDay}
          />
          <ScheduleFilters filters={filters} onChange={setFilters} />
        </div>

        <WeekTimeGrid
          weekStart={weekStart}
          events={events}
          filters={filters}
          loading={loadingEvents}
        />
      </div>
    </>
  )
}
