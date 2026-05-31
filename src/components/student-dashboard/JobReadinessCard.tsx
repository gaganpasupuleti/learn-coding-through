import { Card } from '@/components/ui/card'
import { CircularProgress } from '@/components/ui/circular-progress'
import type { ReadinessBreakdown } from '@/lib/dashboard-derive'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface JobReadinessCardProps {
  breakdown: ReadinessBreakdown
  loading: boolean
}

const SUB_SCORES = [
  { key: 'resume' as const, label: 'Resume', color: 'text-blue-600' },
  { key: 'skill' as const, label: 'Skill Match', color: 'text-indigo-600' },
  { key: 'interview' as const, label: 'Interview', color: 'text-violet-600' },
  { key: 'ats' as const, label: 'ATS Ready', color: 'text-emerald-600' },
]

export function JobReadinessCard({ breakdown, loading }: JobReadinessCardProps) {
  const display = loading ? 0 : breakdown.overall

  return (
    <Card className={cn(DASHBOARD_CARD)}>
      <div className={DASHBOARD_CARD_BODY}>
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Job Readiness</h2>
        <p className="mb-4 text-sm text-slate-500">Your career prep snapshot</p>

        <div className="flex justify-center">
          <CircularProgress value={display} size={128} strokeWidth={9} label="Overall" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {SUB_SCORES.map(({ key, label, color }) => (
            <div
              key={key}
              className="rounded-xl bg-slate-50 px-3 py-2.5"
            >
              <p className={cn('text-xs font-semibold', color)}>{label}</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
                {loading ? '—' : `${breakdown[key]}%`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
