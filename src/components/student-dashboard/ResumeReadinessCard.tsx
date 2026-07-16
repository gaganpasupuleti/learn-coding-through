import { FileText, Sparkles } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY, DASHBOARD_CARD_BODY_COMPACT } from './dashboard-styles'

interface ResumeReadinessCardProps {
  onOpenResume?: () => void
  compact?: boolean
}

const LAUNCH_FEATURES = [
  'Professional templates',
  'Live editing and preview',
  'PDF/DOCX export',
] as const

export function ResumeReadinessCard({ onOpenResume, compact = false }: ResumeReadinessCardProps) {
  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={compact ? DASHBOARD_CARD_BODY_COMPACT : DASHBOARD_CARD_BODY}>
        <div className={cn('mb-4 flex items-center gap-2', compact && 'mb-3')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <FileText className="h-5 w-5 text-slate-700" aria-hidden />
          </div>
          <div>
            <h2 className={cn('font-semibold text-slate-900', compact ? 'text-sm' : 'text-lg')}>
              Resume Lab
            </h2>
            {!compact && (
              <p className="text-xs text-slate-500">Full resume builder inside Code Quest</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden />
          <ul className="space-y-1 text-xs text-slate-600">
            {LAUNCH_FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        {onOpenResume && (
          <button
            type="button"
            onClick={onOpenResume}
            className={cn(
              'w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800',
              compact ? 'mt-3 py-2 text-xs' : 'mt-4',
            )}
          >
            Open Resume Lab
          </button>
        )}
      </div>
    </Card>
  )
}
