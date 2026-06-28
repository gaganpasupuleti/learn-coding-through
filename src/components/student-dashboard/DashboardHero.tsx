import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Flame,
  Briefcase,
  FileText,
  Map,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { CareerJourneySummary } from '@/lib/career-local-summary'
import type { UpcomingSession } from '@/lib/api'
import { cn } from '@/lib/utils'

import { DASHBOARD_HERO } from './dashboard-styles'

interface DashboardHeroProps {
  firstName: string
  careerJourney: CareerJourneySummary | null
  nextLessonTitle: string | null
  daysRemaining: number | null
  currentStreak: number
  practicedToday: boolean
  loading: boolean
  onContinuePractice: () => void
  onContinueLearning: () => void
  onOpenCalendar: () => void
  onOpenResume: () => void
  onOpenJobs: () => void
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function SecondaryLink({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2 py-2.5 text-xs font-medium text-slate-100 transition-colors hover:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:min-h-0 sm:flex-row sm:gap-1.5 sm:rounded-lg sm:py-1.5 sm:text-sm"
    >
      {icon}
      {label}
    </button>
  )
}

export function DashboardHero({
  firstName,
  careerJourney,
  nextLessonTitle,
  daysRemaining,
  currentStreak,
  practicedToday,
  loading,
  onContinuePractice,
  onContinueLearning,
  onOpenCalendar,
  onOpenResume,
  onOpenJobs,
}: DashboardHeroProps) {
  const pathTitle = careerJourney?.title ?? 'Choose your career path'
  const progressPct = careerJourney?.pct ?? 0

  return (
    <section className={DASHBOARD_HERO}>
      {/* decorative accent glows — purely cosmetic */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl"
      />

      <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="min-w-0 space-y-5">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-blue-200/90">
              {greeting()}, {firstName}
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-[34px] md:leading-[1.1]">
              Your learning command center
            </h1>
            <p className="flex items-center gap-2 text-base text-slate-300">
              <Map className="h-4 w-4 shrink-0 text-blue-300" aria-hidden />
              {pathTitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium ring-1 ring-inset ring-white/15 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {loading ? '…' : `${progressPct}% complete`}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset',
                currentStreak > 0
                  ? 'bg-amber-400/15 text-amber-200 ring-amber-300/30'
                  : 'bg-white/5 text-slate-300 ring-white/10',
              )}
            >
              <Flame className="h-3.5 w-3.5" aria-hidden />
              {currentStreak > 0
                ? `${currentStreak}-day streak${practicedToday ? ' · today done' : ''}`
                : 'Start your streak'}
            </span>
            {daysRemaining !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300 ring-1 ring-inset ring-white/10">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {daysRemaining} days left
              </span>
            )}
          </div>

          {nextLessonTitle && (
            <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-200">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" aria-hidden />
              <span>
                Today&apos;s focus:{' '}
                <span className="font-semibold text-white">{nextLessonTitle}</span>
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 lg:pl-2">
          <Button
            type="button"
            size="lg"
            onClick={onContinuePractice}
            className="h-12 w-full justify-between bg-white text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
          >
            Continue practice
            <ArrowRight className="h-4 w-4" />
          </Button>
          <button
            type="button"
            onClick={onContinueLearning}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <Map className="h-4 w-4" aria-hidden />
            Open Career Map
          </button>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <SecondaryLink
              icon={<CalendarDays className="h-4 w-4" aria-hidden />}
              label="Calendar"
              onClick={onOpenCalendar}
            />
            <SecondaryLink
              icon={<FileText className="h-4 w-4" aria-hidden />}
              label="Resume"
              onClick={onOpenResume}
            />
            <SecondaryLink
              icon={<Briefcase className="h-4 w-4" aria-hidden />}
              label="Jobs"
              onClick={onOpenJobs}
            />
          </div>
        </div>
      </div>
    </section>
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
