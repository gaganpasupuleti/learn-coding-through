import { Loader2 } from 'lucide-react'

import { formatDateTimeISTShort } from '@/lib/formatDateTimeIST'
import type { JobBoardOverview } from '@/lib/jobspy-api'
import { cn } from '@/lib/utils'

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cn('text-xl font-bold mt-0.5 tabular-nums', accent ?? 'text-slate-900')}>{value}</p>
    </div>
  )
}

interface JobSpyOverviewPanelProps {
  overview: JobBoardOverview | null
  loading: boolean
  selectedProfile: string
  onSelectProfile: (profile: string) => void
}

export function JobSpyOverviewPanel({
  overview,
  loading,
  selectedProfile,
  onSelectProfile,
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

  const topRoles = [...(overview.enrichmentRoleSummary ?? [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

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

      {(overview.profileBreakdown?.length ?? 0) > 0 && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-blue-950">Jobs by category</h3>
            <p className="text-xs text-blue-800 mt-0.5">Tap a category to filter browse results</p>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {overview.profileBreakdown.map((item) => (
              <button
                key={item.profile}
                type="button"
                onClick={() => onSelectProfile(selectedProfile === item.profile ? '' : item.profile)}
                className={cn(
                  'rounded-xl border p-3 text-left transition shadow-sm',
                  item.count === 0 && 'opacity-55',
                  selectedProfile === item.profile
                    ? 'border-blue-600 bg-white ring-2 ring-blue-500/30'
                    : 'border-blue-100 bg-white hover:border-blue-300',
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate" title={item.label}>
                  {item.label}
                </p>
                <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">{item.count.toLocaleString('en-IN')}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {topRoles.length > 0 && (
        <section className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-violet-950">Top role families</h3>
          <div className="flex flex-wrap gap-2">
            {topRoles.map((item) => (
              <span
                key={item.roleId}
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3 py-1 text-xs text-violet-950"
              >
                <span className="font-medium truncate max-w-[140px]" title={item.roleName}>{item.roleName}</span>
                <span className="tabular-nums font-bold text-violet-700">{item.count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {(overview.sourceBreakdown?.length ?? 0) > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">By source:</span>
            {overview.sourceBreakdown.map((item) => (
              <span key={item.source} className="tabular-nums">
                <span className="capitalize font-medium text-slate-700">{item.source}</span>{' '}
                {item.count.toLocaleString('en-IN')}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
