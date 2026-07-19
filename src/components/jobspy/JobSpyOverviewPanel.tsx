import { Loader2 } from 'lucide-react'

import { formatDateTimeISTShort } from '@/lib/formatDateTimeIST'
import { jobSpySiteLabel, type JobBoardOverview } from '@/lib/jobspy-api'
import { cn } from '@/lib/utils'

function StatCard({
  label,
  value,
  accent,
  onClick,
  selected,
}: {
  label: string
  value: string
  accent?: string
  onClick?: () => void
  selected?: boolean
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-left w-full transition',
        onClick && 'hover:border-blue-300 hover:shadow-md cursor-pointer',
        selected && 'border-blue-600 ring-2 ring-blue-500/30',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate" title={label}>
        {label}
      </p>
      <p className={cn('text-xl font-bold mt-0.5 tabular-nums', accent ?? 'text-slate-900')}>{value}</p>
    </Tag>
  )
}

interface JobSpyOverviewPanelProps {
  overview: JobBoardOverview | null
  loading: boolean
  selectedSource: string
  onSelectSource: (source: string) => void
}

export function JobSpyOverviewPanel({
  overview,
  loading,
  selectedSource,
  onSelectSource,
}: JobSpyOverviewPanelProps) {
  if (loading && !overview) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading job board stats…
        </div>
      </section>
    )
  }

  if (!overview) return null

  const roleFamilies = [...(overview.enrichmentRoleSummary ?? [])].sort((a, b) => b.count - a.count)
  const sources = [...(overview.sourceBreakdown ?? [])].sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Job board overview</h2>
          <span className="text-xs text-slate-500">India · updated daily</span>
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total in DB" value={overview.totalJobs.toLocaleString('en-IN')} />
          <StatCard
            label="Active listings"
            value={overview.activeJobs.toLocaleString('en-IN')}
            accent="text-emerald-700"
          />
          <StatCard label="Loaded today" value={overview.loadedToday.toLocaleString('en-IN')} />
          <StatCard label="Last 24h" value={overview.loadedLast24Hours.toLocaleString('en-IN')} />
          <StatCard label="Last 7 days" value={overview.loadedLast7Days.toLocaleString('en-IN')} />
        </div>
        <p className="text-xs text-slate-500">
          Latest loaded: {formatDateTimeISTShort(overview.latestLoadedAt)} · Last auto refresh:{' '}
          {formatDateTimeISTShort(overview.lastAutoRefreshAt)}
        </p>
      </section>

      {roleFamilies.length > 0 && (
        <section className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-violet-950">Role families</h3>
            <p className="text-xs text-violet-800 mt-0.5">Active jobs by enriched role type</p>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {roleFamilies.map((item) => (
              <StatCard
                key={item.roleId}
                label={item.roleName}
                value={item.count.toLocaleString('en-IN')}
                accent="text-violet-800"
              />
            ))}
          </div>
        </section>
      )}

      {sources.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">By source</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tap a source to filter browse results</p>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {sources.map((item) => (
              <StatCard
                key={item.source}
                label={jobSpySiteLabel(item.source)}
                value={item.count.toLocaleString('en-IN')}
                accent="text-blue-700"
                selected={selectedSource === item.source}
                onClick={() => onSelectSource(selectedSource === item.source ? '' : item.source)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
