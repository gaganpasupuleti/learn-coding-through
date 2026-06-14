import { Card } from '@/components/ui/card'
import type {
  SkillNavTarget,
  SkillProgressItem,
} from '@/components/student-progress/skill-progress-items'
import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from '@/components/student-dashboard/dashboard-styles'
import { cn } from '@/lib/utils'

interface SkillProgressGridProps {
  items: SkillProgressItem[]
  onNavigate?: (page: SkillNavTarget) => void
}

const ACCENT: Record<string, string> = {
  sql: 'bg-blue-600',
  code: 'bg-violet-600',
  typing: 'bg-teal-600',
  projects: 'bg-slate-700',
  resume: 'bg-slate-600',
  job: 'bg-emerald-600',
}

export function SkillProgressGrid({ items, onNavigate }: SkillProgressGridProps) {
  return (
    <Card className={cn(DASHBOARD_CARD)}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{item.label}</h3>
                {onNavigate && item.href && (
                  <button
                    type="button"
                    onClick={() => onNavigate(item.href!)}
                    className="rounded text-xs font-medium text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  >
                    {item.actionLabel ?? 'Open'}
                  </button>
                )}
              </div>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{item.pct}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn('h-full rounded-full', ACCENT[item.id] ?? 'bg-slate-500')}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
