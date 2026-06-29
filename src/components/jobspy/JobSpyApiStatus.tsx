import { cn } from '@/lib/utils'
import type { JobSpyApiStatus } from '@/components/jobspy/useJobSpyJobs'

export function JobSpyApiStatusBadge({ status }: { status: JobSpyApiStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        status === 'ok' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        status === 'loading' && 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
        status === 'error' && 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'ok' && 'bg-emerald-500',
          status === 'loading' && 'bg-slate-400 animate-pulse',
          status === 'error' && 'bg-amber-500',
        )}
      />
      {status === 'ok' ? 'Job service connected' : status === 'loading' ? 'Connecting…' : 'Job service offline'}
    </span>
  )
}
