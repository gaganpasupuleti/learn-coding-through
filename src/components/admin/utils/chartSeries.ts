import { parseUtcDate } from '@/lib/formatDateTimeIST'

function localDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Last `dayCount` calendar days including today; counts events whose ISO timestamp falls on that local day. */
export function bucketIsoDatesByDay(
  isos: (string | undefined | null)[],
  dayCount: number,
): { day: string; label: string; count: number }[] {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - (dayCount - 1))

  const buckets = new Map<string, number>()
  for (let i = 0; i < dayCount; i++) {
    const cursor = new Date(start)
    cursor.setDate(cursor.getDate() + i)
    buckets.set(localDayKey(cursor), 0)
  }

  for (const iso of isos) {
    if (!iso) continue
    const t = parseUtcDate(iso)
    if (Number.isNaN(t.getTime())) continue
    const k = localDayKey(t)
    if (buckets.has(k)) {
      buckets.set(k, (buckets.get(k) ?? 0) + 1)
    }
  }

  return [...buckets.entries()].map(([day, count]) => ({
    day,
    label: day.slice(5),
    count,
  }))
}

function startOfIsoWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  const dow = copy.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  copy.setDate(copy.getDate() + diff)
  return copy
}

/** Bucket job `created_at` into ISO-week starts (Monday), last `weekCount` weeks. */
export function bucketJobsByWeek(
  jobs: { created_at: string }[],
  weekCount: number,
): { week: string; label: string; count: number }[] {
  const endWeek = startOfIsoWeek(new Date())
  const startWeek = new Date(endWeek)
  startWeek.setDate(startWeek.getDate() - (weekCount - 1) * 7)

  const keys: string[] = []
  for (let i = 0; i < weekCount; i++) {
    const w = new Date(startWeek)
    w.setDate(w.getDate() + i * 7)
    keys.push(localDayKey(w))
  }

  const buckets = new Map<string, number>()
  for (const k of keys) buckets.set(k, 0)

  for (const job of jobs) {
    if (!job.created_at) continue
    const t = parseUtcDate(job.created_at)
    if (Number.isNaN(t.getTime())) continue
    const weekStart = startOfIsoWeek(t)
    const k = localDayKey(weekStart)
    if (buckets.has(k)) {
      buckets.set(k, (buckets.get(k) ?? 0) + 1)
    }
  }

  return keys.map((week) => ({
    week,
    label: week.slice(5),
    count: buckets.get(week) ?? 0,
  }))
}

function cloneDate(d: Date): Date {
  return new Date(d.getTime())
}

export function inLocalDateRange(iso: string | null | undefined, start: Date, end: Date): boolean {
  if (!iso) return false
  const t = new Date(iso)
  if (Number.isNaN(t.getTime())) return false
  return t >= start && t <= end
}

/** Every local calendar day from `rangeStart` through `rangeEnd` (inclusive), with counts. */
export function bucketIsoDatesInRange(
  isos: (string | undefined | null)[],
  rangeStart: Date,
  rangeEnd: Date,
): { day: string; label: string; count: number }[] {
  const start = cloneDate(rangeStart)
  start.setHours(0, 0, 0, 0)
  const end = cloneDate(rangeEnd)
  end.setHours(23, 59, 59, 999)

  const buckets = new Map<string, number>()
  for (let cursor = cloneDate(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    buckets.set(localDayKey(cursor), 0)
  }

  for (const iso of isos) {
    if (!iso) continue
    const t = parseUtcDate(iso)
    if (Number.isNaN(t.getTime())) continue
    if (t < start || t > end) continue
    const k = localDayKey(t)
    if (buckets.has(k)) {
      buckets.set(k, (buckets.get(k) ?? 0) + 1)
    }
  }

  return [...buckets.entries()].map(([day, count]) => ({
    day,
    label: day.slice(5),
    count,
  }))
}

/** ISO-week buckets (Monday start) overlapping [rangeStart, rangeEnd]. */
export function bucketJobsByWeekInRange(
  jobs: { created_at: string }[],
  rangeStart: Date,
  rangeEnd: Date,
): { week: string; label: string; count: number }[] {
  const start = cloneDate(rangeStart)
  start.setHours(0, 0, 0, 0)
  const end = cloneDate(rangeEnd)
  end.setHours(23, 59, 59, 999)

  let weekCursor = startOfIsoWeek(start)
  const keys: string[] = []
  const maxWeeks = 60
  for (let i = 0; i < maxWeeks && weekCursor <= end; i++) {
    keys.push(localDayKey(weekCursor))
    const next = cloneDate(weekCursor)
    next.setDate(next.getDate() + 7)
    weekCursor = next
  }

  const buckets = new Map<string, number>()
  for (const k of keys) buckets.set(k, 0)

  for (const job of jobs) {
    if (!job.created_at) continue
    const t = parseUtcDate(job.created_at)
    if (Number.isNaN(t.getTime()) || t < start || t > end) continue
    const weekStart = startOfIsoWeek(t)
    const k = localDayKey(weekStart)
    if (buckets.has(k)) {
      buckets.set(k, (buckets.get(k) ?? 0) + 1)
    }
  }

  return keys.map((week) => ({
    week,
    label: week.slice(5),
    count: buckets.get(week) ?? 0,
  }))
}
