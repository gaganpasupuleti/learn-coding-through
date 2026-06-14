import { Flame } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { getPracticeStreakSummary } from '@/lib/practice-progress-summary'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY, DASHBOARD_CARD_BODY_COMPACT } from './dashboard-styles'

interface PracticeStreakCardProps {
  compact?: boolean
}

export function PracticeStreakCard({ compact = false }: PracticeStreakCardProps) {
  const streak = getPracticeStreakSummary()

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={compact ? DASHBOARD_CARD_BODY_COMPACT : DASHBOARD_CARD_BODY}>
        <div className={cn('mb-4 flex items-center gap-2', compact && 'mb-3')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
            <Flame className="h-5 w-5 text-orange-600" aria-hidden />
          </div>
          <div>
            <h2 className={cn('font-semibold text-slate-900', compact ? 'text-sm' : 'text-lg')}>
              Practice Streak
            </h2>
            {!compact && <p className="text-xs text-slate-500">SQL, code, or typing</p>}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tabular-nums text-slate-900">{streak.currentStreak}</span>
          <span className="pb-1 text-sm text-slate-500">
            day{streak.currentStreak === 1 ? '' : 's'}
          </span>
        </div>

        <div className={cn('mt-4 grid grid-cols-2 gap-2 text-sm', compact && 'mt-3')}>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Best</p>
            <p className="font-semibold tabular-nums text-slate-900">{streak.bestStreak}d</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Today</p>
            <p className={cn('font-semibold', streak.practicedToday ? 'text-emerald-600' : 'text-slate-900')}>
              {streak.practicedToday ? 'Done' : 'Not yet'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
