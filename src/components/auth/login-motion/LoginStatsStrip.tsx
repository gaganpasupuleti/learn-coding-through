import type { Ref } from 'react'
import { BookOpen, Briefcase, FolderKanban, HelpCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

import { formatLoginStat, LOGIN_PLATFORM_STATS } from './loginTheme'

const STAT_ICONS = {
  jobs: Briefcase,
  modules: BookOpen,
  questions: HelpCircle,
  projects: FolderKanban,
} as const

interface LoginStatsStripProps {
  statsRef?: Ref<HTMLDivElement>
  className?: string
}

export function LoginStatsStrip({ statsRef, className }: LoginStatsStripProps) {
  return (
    <div ref={statsRef} className={cn('login-stats-strip w-full', className)}>
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {LOGIN_PLATFORM_STATS.map((stat) => {
          const Icon = STAT_ICONS[stat.id]
          return (
            <div
              key={stat.id}
              className="login-stat-chip rounded-xl border border-[#22FF88]/12 bg-[#0A1020]/55 px-3 py-2.5 backdrop-blur-sm"
            >
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22FF88]/70" strokeWidth={1.75} aria-hidden />
                <div className="min-w-0">
                  <p
                    className="login-stat-value text-[15px] font-semibold tabular-nums leading-none text-[#22FF88] sm:text-[16px]"
                    data-stat-value={stat.value}
                    data-stat-suffix={stat.suffix}
                  >
                    {formatLoginStat(stat.value, stat.suffix)}
                  </p>
                  <p className="mt-1 text-[10px] leading-tight text-[#FAF3E0]/50">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
