import type { CalendarEvent, CalendarEventType } from '@/lib/api'

export interface ScheduleGridEvent {
  id: string
  title: string
  time: string
  type: CalendarEventType
  dayIndex: number
  startMinutes: number
  endMinutes: number
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function monthDateRange(viewDate: Date): { startDate: string; endDate: string } {
  const y = viewDate.getFullYear()
  const m = viewDate.getMonth()
  return {
    startDate: toIsoDate(new Date(y, m, 1)),
    endDate: toIsoDate(new Date(y, m + 1, 0)),
  }
}

export function weekDateRange(weekStart: Date): { startDate: string; endDate: string } {
  const end = new Date(weekStart)
  end.setDate(weekStart.getDate() + 6)
  return { startDate: toIsoDate(weekStart), endDate: toIsoDate(end) }
}

function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

function formatClock(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${ampm}`
}

function formatTimeRange(start: string, end: string): string {
  return `${formatClock(start)} - ${formatClock(end)}`
}

/** Map API calendar events into week-grid positions (Mon=0 … Sun=6). */
export function mapCalendarToGridEvents(
  events: CalendarEvent[],
  weekStart: Date,
): ScheduleGridEvent[] {
  const weekStartMs = weekStart.getTime()
  const mapped: ScheduleGridEvent[] = []

  for (const event of events) {
    const [y, mo, d] = event.event_date.split('-').map(Number)
    const eventDate = new Date(y, mo - 1, d)
    const dayIndex = Math.round((eventDate.getTime() - weekStartMs) / 86400000)
    if (dayIndex < 0 || dayIndex > 6) continue

    mapped.push({
      id: event.id,
      title: event.title,
      time: formatTimeRange(event.start_time, event.end_time),
      type: event.event_type,
      dayIndex,
      startMinutes: parseTimeToMinutes(event.start_time),
      endMinutes: parseTimeToMinutes(event.end_time),
    })
  }

  return mapped
}

export function collectEventDates(events: CalendarEvent[]): Set<string> {
  return new Set(events.map((e) => e.event_date))
}
