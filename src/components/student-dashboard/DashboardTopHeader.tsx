import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  Flame,
  FileText,
  Map as MapIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { CQActionButton } from './cq/CQKit'

interface DashboardTopHeaderProps {
  firstName: string
  pathTitle: string
  progressPct: number
  currentStreak: number
  practicedToday: boolean
  daysRemaining: number | null
  nextLessonTitle: string | null
  loading: boolean
  onContinuePractice: () => void
  onOpenCareer: () => void
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

function StatusChip({
  icon,
  children,
  highlight = false,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold',
        highlight
          ? 'border-[#14B8A6]/40 bg-[#14B8A6]/12 text-[#0F766E]'
          : 'border-[#708090]/25 bg-[#FFF9EA] text-[#374151]',
      )}
    >
      <span className="shrink-0">{icon}</span>
      {children}
    </span>
  )
}

function QuickLink({
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
      className={cn(
        'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#FAF3E0]/25 bg-[#FAF3E0]/8 px-3 py-1.5 text-[12px] font-semibold text-[#FAF3E0] transition-colors hover:bg-[#FAF3E0]/16',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF3E0]/40',
      )}
    >
      <span className="shrink-0 text-[#FAF3E0]/80">{icon}</span>
      {label}
    </button>
  )
}

export function DashboardTopHeader({
  firstName,
  pathTitle,
  progressPct,
  currentStreak,
  practicedToday,
  daysRemaining,
  nextLessonTitle,
  loading,
  onContinuePractice,
  onOpenCareer,
  onOpenCalendar,
  onOpenResume,
  onOpenJobs,
}: DashboardTopHeaderProps) {
  const initials = firstName.slice(0, 2).toUpperCase()
  const streakLabel =
    currentStreak > 0 ? `${currentStreak}-day streak` : 'Start your streak'

  return (
    <header className="relative overflow-hidden rounded-2xl border border-[#0A1020]/15 bg-[#0A1020] px-5 py-5 text-[#FAF3E0] shadow-[0_18px_44px_-28px_rgba(10,16,32,0.8)] md:px-7 md:py-6">
      {/* soft accent glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#2563EB]/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 left-10 h-56 w-56 rounded-full bg-[#14B8A6]/15 blur-3xl"
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FAF3E0]/12 text-[12px] font-semibold text-[#FAF3E0] ring-1 ring-[#FAF3E0]/20">
              {initials}
            </span>
            <p className="text-[12px] font-medium text-[#FAF3E0]/70">
              {greeting()}, {firstName}
            </p>
          </div>

          <div className="min-w-0">
            <h1 className="font-serif text-[22px] font-semibold leading-tight tracking-tight text-[#FAF3E0] sm:text-[26px]">
              Your learning command center
            </h1>
            <p className="mt-0.5 flex items-center gap-2 text-[12px] text-[#FAF3E0]/70 sm:text-[13px]">
              <MapIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{pathTitle}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusChip
              icon={<span className="h-2 w-2 rounded-full bg-[#14B8A6]" />}
              highlight
            >
              {loading ? '…' : `${progressPct}% complete`}
            </StatusChip>
            <StatusChip icon={<Flame className="h-3.5 w-3.5" />}>
              {streakLabel}
              {practicedToday && currentStreak > 0 ? ' · today ✓' : ''}
            </StatusChip>
            {daysRemaining !== null && (
              <StatusChip icon={<CalendarDays className="h-3.5 w-3.5" />}>
                {daysRemaining} days left
              </StatusChip>
            )}
          </div>

          {nextLessonTitle && (
            <p className="flex items-start gap-2 text-[12px] text-[#FAF3E0]/75">
              <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span>
                Today&apos;s focus:{' '}
                <span className="font-semibold text-[#FAF3E0]">{nextLessonTitle}</span>
              </span>
            </p>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 lg:w-[300px]">
          <CQActionButton
            variant="ghost"
            onClick={onContinuePractice}
            className="w-full justify-between border-transparent bg-[#FAF3E0] px-4 py-2.5 text-[14px] text-[#0A1020] hover:bg-white"
          >
            Continue practice
            <ArrowRight className="h-4 w-4" />
          </CQActionButton>
          <button
            type="button"
            onClick={onOpenCareer}
            className={cn(
              'inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[#FAF3E0]/25 bg-[#FAF3E0]/5 px-4 py-2 text-[13px] font-semibold text-[#FAF3E0] transition-colors hover:bg-[#FAF3E0]/12',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF3E0]/40',
            )}
          >
            <MapIcon className="h-4 w-4" strokeWidth={1.75} />
            Open Career Map
          </button>
          <div className="grid grid-cols-3 gap-2">
            <QuickLink icon={<CalendarDays className="h-4 w-4" />} label="Calendar" onClick={onOpenCalendar} />
            <QuickLink icon={<FileText className="h-4 w-4" />} label="Resume" onClick={onOpenResume} />
            <QuickLink icon={<Briefcase className="h-4 w-4" />} label="Jobs" onClick={onOpenJobs} />
          </div>
        </div>
      </div>
    </header>
  )
}
