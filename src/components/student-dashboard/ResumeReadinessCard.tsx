import { FileText } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { CircularProgress } from '@/components/ui/circular-progress'
import { computeResumeReadinessScore } from '@/lib/resume-score'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface ResumeReadinessCardProps {
  onOpenResume?: () => void
}

export function ResumeReadinessCard({ onOpenResume }: ResumeReadinessCardProps) {
  const score = computeResumeReadinessScore()

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <FileText className="h-5 w-5 text-slate-700" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Resume Readiness</h2>
            <p className="text-xs text-slate-500">Local draft · ATS-friendly template</p>
          </div>
        </div>

        <div className="flex justify-center">
          <CircularProgress value={score.overall} size={112} strokeWidth={8} label="Ready" />
        </div>

        <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
          {score.checklist.slice(0, 4).map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <span className={item.done ? 'text-emerald-700' : ''}>{item.label}</span>
              <span className="font-medium text-slate-900">{item.done ? '✓' : '—'}</span>
            </li>
          ))}
        </ul>

        {onOpenResume && (
          <button
            type="button"
            onClick={onOpenResume}
            className="mt-4 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Open Resume Builder
          </button>
        )}
      </div>
    </Card>
  )
}
