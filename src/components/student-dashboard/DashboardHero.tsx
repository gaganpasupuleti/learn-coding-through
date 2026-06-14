import { ArrowRight, BookOpen, CalendarDays } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { CareerJourneySummary } from '@/lib/career-local-summary'
import type { UpcomingSession } from '@/lib/api'
import { cn } from '@/lib/utils'

import { DASHBOARD_CARD, DASHBOARD_CARD_BODY } from './dashboard-styles'

interface DashboardHeroProps {
  firstName: string
  careerJourney: CareerJourneySummary | null
  nextLessonTitle: string | null
  daysRemaining: number | null
  loading: boolean
  onContinueLearning: () => void
}

export function DashboardHero({
  firstName,
  careerJourney,
  nextLessonTitle,
  daysRemaining,
  loading,
  onContinueLearning,
}: DashboardHeroProps) {
  const pathTitle = careerJourney?.title ?? 'Choose your career path'
  const progressPct = careerJourney?.pct ?? 0

  return (
    <Card
      className={cn(
        DASHBOARD_CARD,
        'overflow-hidden border-slate-800 bg-slate-900 text-white shadow-md',
      )}
    >
      <div className={DASHBOARD_CARD_BODY}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-[32px]">
                Welcome back, {firstName}
              </h1>
              <p className="mt-1 text-base text-slate-300 md:text-lg">{pathTitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {loading ? '…' : `${progressPct}% complete`}
              </span>
              {daysRemaining !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {daysRemaining} days left in program
                </span>
              )}
            </div>

            {nextLessonTitle && (
              <div className="flex items-start gap-2 text-sm text-slate-300">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Next up: <span className="font-medium text-white">{nextLessonTitle}</span>
                </span>
              </div>
            )}
          </div>

          <Button
            type="button"
            size="lg"
            onClick={onContinueLearning}
            className="shrink-0 bg-white text-slate-900 shadow-sm hover:bg-slate-100"
          >
            Continue Learning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function resolveNextLessonTitle(
  careerJourney: CareerJourneySummary | null,
  sessions: UpcomingSession[],
): string | null {
  if (careerJourney?.nextLessonTitle) return careerJourney.nextLessonTitle
  const inProgress = sessions.find((s) => s.topic)
  return inProgress?.topic ?? inProgress?.title ?? null
}
