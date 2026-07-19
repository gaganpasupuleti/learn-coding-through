/** Parse API naive UTC timestamps and format for India (IST). */
export function parseUtcDate(value: string | Date): Date {
  if (value instanceof Date) return value
  const trimmed = value.trim()
  if (!trimmed) return new Date(Number.NaN)
  if (/[zZ]$/.test(trimmed) || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(trimmed)
  }
  return new Date(`${trimmed}Z`)
}

export function formatDateTimeIST(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = parseUtcDate(value)
  if (Number.isNaN(d.getTime())) return '—'
  return (
    d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST'
  )
}

export function formatDateTimeISTShort(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = parseUtcDate(value)
  if (Number.isNaN(d.getTime())) return '—'
  return (
    d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' IST'
  )
}
