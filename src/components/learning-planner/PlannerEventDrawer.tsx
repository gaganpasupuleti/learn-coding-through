import { useCallback, useEffect } from 'react'
import { ArrowRight, BookOpen, Clock, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { PlannerTimelineItem } from '@/lib/learning-planner-derive'
import { cn } from '@/lib/utils'

import {
  executePlannerAction,
  resolvePlannerAction,
  type PlannerNavTarget,
} from './planner-actions'
import { EVENT_BADGE } from './planner-styles'

export type { PlannerNavTarget } from './planner-actions'

interface PlannerEventDrawerProps {
  item: PlannerTimelineItem | null
  onClose: () => void
  onNavigate: (page: PlannerNavTarget) => void
}

export function PlannerEventDrawer({ item, onClose, onNavigate }: PlannerEventDrawerProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!item) return
    document.addEventListener('keydown', handleEscape)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = prev
    }
  }, [item, handleEscape])

  if (!item) return null

  const handleStart = () => {
    executePlannerAction(resolvePlannerAction(item), onNavigate)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
              EVENT_BADGE[item.kind],
            )}
          >
            {item.kind}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
          {item.subtitle && <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>}

          <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {item.durationMinutes} min
            </span>
            <span className="capitalize">{item.status}</span>
          </div>

          {item.description && (
            <section className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.description}</p>
            </section>
          )}

          {item.syllabusItemId && (
            <section className="mt-6">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <BookOpen className="h-3.5 w-3.5" />
                Related lessons
              </h3>
              <p className="mt-2 text-sm text-slate-700">{item.title}</p>
            </section>
          )}
        </div>

        <div className="border-t border-slate-100 p-6">
          <Button type="button" className="w-full" onClick={handleStart}>
            Start Learning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}
