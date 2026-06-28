import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, STAT_ACCENTS, type StatAccent } from './dashboard-styles'

export interface DashboardStat {
  id: string
  label: string
  value: string
  hint?: string
  icon: ReactNode
  accent: StatAccent
  onClick?: () => void
}

function StatTile({ stat, loading }: { stat: DashboardStat; loading: boolean }) {
  const accent = STAT_ACCENTS[stat.accent]
  const interactive = Boolean(stat.onClick)

  const content = (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
          accent.chip,
          accent.ring,
        )}
      >
        {stat.icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{stat.label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-16" />
        ) : (
          <p className="text-xl font-bold leading-tight tabular-nums text-slate-900">
            {stat.value}
          </p>
        )}
        {stat.hint && !loading && (
          <p className="mt-0.5 truncate text-xs text-slate-400">{stat.hint}</p>
        )}
      </div>
    </div>
  )

  if (interactive) {
    return (
      <Card className={cn(DASHBOARD_CARD, 'transition-shadow hover:shadow-md')}>
        <button
          type="button"
          onClick={stat.onClick}
          className="w-full rounded-2xl p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          {content}
        </button>
      </Card>
    )
  }

  return (
    <Card className={cn(DASHBOARD_CARD)}>
      <div className="p-4">{content}</div>
    </Card>
  )
}

export function QuickStatsStrip({
  stats,
  loading,
}: {
  stats: DashboardStat[]
  loading: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatTile key={stat.id} stat={stat} loading={loading} />
      ))}
    </div>
  )
}
