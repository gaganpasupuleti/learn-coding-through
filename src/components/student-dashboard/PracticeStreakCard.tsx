import { Flame } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { getPracticeStreakSummary } from '@/lib/practice-progress-summary'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

export function PracticeStreakCard() {
  const streak = getPracticeStreakSummary()

  return (
    <Card className={cn(DASHBOARD_CARD, 'h-full')}>
      <div className={DASHBOARD_CARD_BODY}>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
            <Flame className="h-5 w-5 text-orange-600" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Practice Streak</h2>
            <p className="text-xs text-slate-500">SQL, code, or typing</p>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold tabular-nums text-slate-900">{streak.currentStreak}</span>
          <span className="pb-1 text-sm text-slate-500">
            day{streak.currentStreak === 1 ? '' : 's'} in a row
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Best streak</p>
            <p className="font-semibold text-slate-900">{streak.bestStreak} days</p>
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
