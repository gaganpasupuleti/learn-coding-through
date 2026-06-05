import { ArrowDown, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { executePlannerAction, type PlannerAction, type PlannerNavTarget } from './planner-actions'

interface PlannerStickyCTAProps {
  action: PlannerAction | null
  onNavigate: (page: PlannerNavTarget) => void
  onScrollToTimeline?: () => void
}

export function PlannerStickyCTA({ action, onNavigate, onScrollToTimeline }: PlannerStickyCTAProps) {
  const handleStart = () => {
    if (action) executePlannerAction(action, onNavigate)
  }

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 px-3 py-2 backdrop-blur-md',
        'md:px-4',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={onScrollToTimeline}
          className="hidden items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 sm:inline-flex"
        >
          View timeline
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            disabled={!action}
            onClick={handleStart}
          >
            Start Learning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
