import { CalendarDays, Flame, GraduationCap, Sparkles } from 'lucide-react'

import { CQProgressBar, CQStatCard, CQWeeklyChart } from './cq/CQKit'

export interface DashboardSkillRow {
  label: string
  value: number
}

interface DashboardStatsRowProps {
  loading: boolean
  todayValue: string
  todayDetail: string
  courseBars: DashboardSkillRow[]
  progressPct: number
  masteryDetail: string
  weeklyHeights: number[]
  skills: DashboardSkillRow[]
  currentStreak: number
  bestStreak: number
  mistakesTotal: number
  practiceSessions: number
  onOpenCalendar: () => void
  onOpenProgress: () => void
}

export function DashboardStatsRow({
  loading,
  todayValue,
  todayDetail,
  courseBars,
  progressPct,
  masteryDetail,
  weeklyHeights,
  skills,
  currentStreak,
  bestStreak,
  mistakesTotal,
  practiceSessions,
  onOpenCalendar,
  onOpenProgress,
}: DashboardStatsRowProps) {
  return (
    <section className="grid w-full min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
      <CQStatCard
        tone="yellow"
        label="Today's plan"
        value={loading ? '…' : todayValue}
        detail={todayDetail}
        icon={<CalendarDays className="h-4 w-4" strokeWidth={1.75} />}
        onClick={onOpenCalendar}
        footer={
          <div className="space-y-1.5">
            {courseBars.map((bar) => (
              <CQProgressBar key={bar.label} label={bar.label} value={bar.value} />
            ))}
          </div>
        }
      />

      <CQStatCard
        tone="pink"
        label="Course mastery"
        value={loading ? '…' : `${progressPct}%`}
        detail={masteryDetail}
        icon={<GraduationCap className="h-4 w-4" strokeWidth={1.75} />}
        onClick={onOpenProgress}
        footer={
          <>
            <CQWeeklyChart heights={weeklyHeights} />
            <p className="mt-1 text-[12px] font-medium text-[#0F766E]">
              Career roadmap progress
            </p>
          </>
        }
      />

      <CQStatCard
        tone="sage"
        label="Skill progress"
        icon={<Sparkles className="h-4 w-4" strokeWidth={1.75} />}
        onClick={onOpenProgress}
        footer={
          <div className="mt-1 flex-1 space-y-1.5">
            {skills.map((skill) => (
              <div
                key={skill.label}
                className="flex items-center justify-between text-[13px] font-medium text-[#111827]"
              >
                <span>{skill.label}</span>
                <span className="tabular-nums">{loading ? '…' : `${skill.value}%`}</span>
              </div>
            ))}
          </div>
        }
      />

      <CQStatCard
        tone="blue"
        label="Practice log"
        value={loading ? '…' : currentStreak > 0 ? `${currentStreak}-day streak` : 'No streak yet'}
        icon={<Flame className="h-4 w-4" strokeWidth={1.75} />}
        onClick={onOpenProgress}
        footer={
          <div className="flex-1 space-y-1 text-[13px] text-[#4B5563]">
            <p>{practiceSessions} typing sessions logged</p>
            <p>Best streak · {bestStreak} days</p>
            <p>
              {mistakesTotal > 0
                ? `${mistakesTotal} mistakes to review`
                : 'No mistakes to revisit'}
            </p>
          </div>
        }
      />
    </section>
  )
}
