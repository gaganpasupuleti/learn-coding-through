import { Card } from '@/components/ui/card'
import type { SkillProgressItem } from '@/components/student-progress/skill-progress-items'
import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from '@/components/student-dashboard/dashboard-styles'
import { cn } from '@/lib/utils'

type SkillItem = SkillProgressItem

interface SkillProgressGridProps {
  items: SkillItem[]
  onNavigate?: (page: SkillItem['href']) => void
}

const ACCENT: Record<string, string> = {
  sql: 'bg-blue-600',
  code: 'bg-violet-600',
  typing: 'bg-teal-600',
}

export function SkillProgressGrid({ items, onNavigate }: SkillProgressGridProps) {
  return (
    <Card className={cn(DASHBOARD_CARD)}>
      <div className={DASHBOARD_CARD_BODY}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Skill practice</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{item.label}</h3>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate(item.href)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Practice
                  </button>
                )}
              </div>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{item.pct}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={cn('h-full rounded-full', ACCENT[item.id])}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
