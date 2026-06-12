import type { SqlQuestionProgressStatus } from '../types/sqlPractice.types'
import { PROGRESS_STATUS_ICON, PROGRESS_STATUS_LABEL } from '../utils/sqlPracticeProgress'
import { cn } from '@/lib/utils'

interface SqlProgressBadgeProps {
  status: SqlQuestionProgressStatus
  compact?: boolean
  className?: string
}

const STATUS_STYLES: Record<SqlQuestionProgressStatus, string> = {
  not_started: 'border-slate-600/50 bg-slate-900/40 text-slate-300',
  in_progress: 'border-amber-600/50 bg-amber-950/40 text-amber-100',
  passed: 'border-emerald-600/50 bg-emerald-950/40 text-emerald-100',
  needs_review: 'border-rose-600/50 bg-rose-950/40 text-rose-100',
}

export function SqlProgressBadge({ status, compact, className }: SqlProgressBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        STATUS_STYLES[status],
        className,
      )}
      title={PROGRESS_STATUS_LABEL[status]}
    >
      <span aria-hidden>{PROGRESS_STATUS_ICON[status]}</span>
      {!compact && <span>{PROGRESS_STATUS_LABEL[status]}</span>}
    </span>
  )
}

export function SqlProgressIcon({ status }: { status: SqlQuestionProgressStatus }) {
  return (
    <span className="shrink-0 text-xs" title={PROGRESS_STATUS_LABEL[status]} aria-label={PROGRESS_STATUS_LABEL[status]}>
      {PROGRESS_STATUS_ICON[status]}
    </span>
  )
}
