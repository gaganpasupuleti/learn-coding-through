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
        'overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-200/50',
      )}
    >
      <div className={cn(DASHBOARD_CARD_BODY, 'relative')}>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-[32px]">
                Welcome back, {firstName}
              </h1>
              <p className="mt-1 text-base text-blue-100 md:text-lg">{pathTitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {loading ? '…' : `${progressPct}% complete`}
              </span>
              {daysRemaining !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-blue-100">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {daysRemaining} days left in program
                </span>
              )}
            </div>

            {nextLessonTitle && (
              <div className="flex items-start gap-2 text-sm text-blue-100">
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
            className="shrink-0 bg-white text-blue-700 shadow-md hover:bg-blue-50"
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
