import type { AdminActivityLog, AdminBatch, AdminStudent, AdminUserActivity } from '@/lib/api'

import { inLocalDateRange } from './chartSeries'

export type QuarterSlice = 'full' | 1 | 2 | 3 | 4

export function calendarQuarterRange(year: number, quarter: 1 | 2 | 3 | 4): { start: Date; end: Date } {
  const m0 = (quarter - 1) * 3
  const start = new Date(year, m0, 1, 0, 0, 0, 0)
  const end = new Date(year, m0 + 3, 0, 23, 59, 59, 999)
  return { start, end }
}

export function calendarYearRange(year: number): { start: Date; end: Date } {
  const start = new Date(year, 0, 1, 0, 0, 0, 0)
  const end = new Date(year, 11, 31, 23, 59, 59, 999)
  return { start, end }
}

export function resolveDateRange(year: number, quarter: QuarterSlice): { start: Date; end: Date } {
  if (quarter === 'full') return calendarYearRange(year)
  return calendarQuarterRange(year, quarter)
}

export function uniqueMentorNames(batches: AdminBatch[]): string[] {
  const s = new Set<string>()
  for (const b of batches) {
    const m = (b.mentor_name ?? '').trim()
    if (m) s.add(m)
  }
  return [...s].sort((a, b) => a.localeCompare(b))
}

/** When null, do not filter admin/user activity by user id. */
export function computeScopedUserIds(opts: {
  students: AdminStudent[]
  batches: AdminBatch[]
  mentorName: string | null
  batchId: number | null
  studentId: number | null
}): Set<number> | null {
  const { students, batches, mentorName, batchId, studentId } = opts

  if (studentId != null) {
    return new Set([studentId])
  }

  let pool = students
  if (mentorName) {
    const names = new Set(batches.filter((b) => (b.mentor_name ?? '').trim() === mentorName).map((b) => b.name))
    pool = pool.filter((s) => s.batch_name != null && names.has(s.batch_name))
  }
  if (batchId != null) {
    const batch = batches.find((b) => b.id === batchId)
    if (!batch) return new Set()
    pool = pool.filter((s) => s.batch_name === batch.name)
  }

  if (!mentorName && batchId == null) return null
  return new Set(pool.map((s) => s.id))
}

export function filterActivityLogs(
  logs: AdminActivityLog[],
  rangeStart: Date,
  rangeEnd: Date,
  scopedUserIds: Set<number> | null,
): AdminActivityLog[] {
  return logs.filter((log) => {
    if (!inLocalDateRange(log.created_at, rangeStart, rangeEnd)) return false
    if (scopedUserIds === null) return true
    if (log.target_user_id == null) return false
    return scopedUserIds.has(log.target_user_id)
  })
}

export function filterUserActivity(
  entries: AdminUserActivity[],
  rangeStart: Date,
  rangeEnd: Date,
  scopedUserIds: Set<number> | null,
): AdminUserActivity[] {
  return entries.filter((row) => {
    if (!inLocalDateRange(row.occurred_at, rangeStart, rangeEnd)) return false
    if (scopedUserIds === null) return true
    if (row.user_id == null) return false
    return scopedUserIds.has(row.user_id)
  })
}

export function formatSlicerSummary(opts: {
  year: number
  quarter: QuarterSlice
  batch: AdminBatch | null
  student: AdminStudent | null
  mentor: string | null
}): string {
  const q =
    opts.quarter === 'full'
      ? `Year ${opts.year}`
      : `${opts.year} · Q${opts.quarter}`
  const parts = [q]
  if (opts.mentor) parts.push(`Mentor: ${opts.mentor}`)
  if (opts.batch) parts.push(`Batch: ${opts.batch.name}`)
  if (opts.student) parts.push(`Student: ${opts.student.full_name}`)
  return parts.join(' · ')
}
