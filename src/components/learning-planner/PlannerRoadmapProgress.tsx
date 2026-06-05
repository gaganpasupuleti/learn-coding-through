import { ChevronRight } from 'lucide-react'

import type { RoadmapProgress } from '@/lib/learning-planner-derive'
import { storeHighlightItem } from '@/lib/learning-planner-derive'
import { cn } from '@/lib/utils'

import type { PlannerNavTarget } from './planner-actions'

interface PlannerRoadmapProgressProps {
  progress: RoadmapProgress
  onNavigate?: (page: PlannerNavTarget) => void
}

export function PlannerRoadmapProgress({ progress, onNavigate }: PlannerRoadmapProgressProps) {
  const handleCrumbClick = (type: 'month' | 'week' | 'stage') => {
    if (!onNavigate) return
    if (type === 'month') {
      try {
        sessionStorage.setItem('planner-highlight-month', String(progress.month))
      } catch {
        /* ignore */
      }
    } else if (type === 'week') {
      try {
        sessionStorage.setItem('planner-highlight-week', String(progress.week))
      } catch {
        /* ignore */
      }
    } else {
      storeHighlightItem(`stage-${progress.stageLabel}`)
    }
    onNavigate('roadmapper')
  }

  const crumbs: { label: string; clickable: boolean; onClick?: () => void }[] = [
    { label: `Month ${progress.month}`, clickable: true, onClick: () => handleCrumbClick('month') },
    { label: `Week ${progress.week}`, clickable: true, onClick: () => handleCrumbClick('week') },
    { label: `Day ${progress.dayNum}`, clickable: false },
    { label: progress.stageLabel, clickable: true, onClick: () => handleCrumbClick('stage') },
  ]

  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm">
      <div className="flex min-w-0 flex-wrap items-center gap-0.5 text-xs sm:text-sm">
        {crumbs.map((c, i) => (
          <span key={c.label} className="flex items-center gap-0.5">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />}
            {c.clickable && onNavigate ? (
              <button
                type="button"
                onClick={c.onClick}
                className="rounded-md px-1.5 py-0.5 font-medium text-slate-800 hover:bg-slate-100 hover:text-blue-700"
              >
                {c.label}
              </button>
            ) : (
              <span className="rounded-md px-1.5 py-0.5 font-medium text-slate-600">{c.label}</span>
            )}
          </span>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs font-semibold tabular-nums text-blue-600">{progress.pct}%</span>
        <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:block">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500')}
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
