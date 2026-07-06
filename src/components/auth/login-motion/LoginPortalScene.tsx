import type { Ref } from 'react'
import { Code2, Database, FileText, Radar, Terminal } from 'lucide-react'

import { cn } from '@/lib/utils'

import { LoginStatsStrip } from './LoginStatsStrip'
import { LOGIN_BOOT_LINES, LOGIN_FEATURE_CHIPS, LOGIN_TAGLINE_WORDS } from './loginTheme'

const FEATURE_ICONS = {
  database: Database,
  code: Code2,
  'file-text': FileText,
  radar: Radar,
} as const

interface LoginPortalSceneProps {
  portalGlowRef?: Ref<HTMLDivElement>
  taglineRef?: Ref<HTMLParagraphElement>
  bootRef?: Ref<HTMLDivElement>
  featureChipsRef?: Ref<HTMLDivElement>
  statsRef?: Ref<HTMLDivElement>
  className?: string
}

export function LoginPortalScene({
  portalGlowRef,
  taglineRef,
  bootRef,
  featureChipsRef,
  statsRef,
  className,
}: LoginPortalSceneProps) {
  return (
    <div className={cn('relative flex w-full flex-col items-center gap-5 text-center lg:items-start lg:text-left', className)}>
      <div
        ref={portalGlowRef}
        aria-hidden
        className="login-portal-glow pointer-events-none absolute left-1/2 top-[24%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22FF88]/14 blur-3xl lg:left-[36%]"
      />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center lg:mx-0 lg:max-w-none lg:items-start">
        <div className="w-full space-y-2">
          <p className="flex items-center justify-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#22FF88]/75 lg:justify-start">
            <Terminal className="h-3 w-3" strokeWidth={2} />
            CodeQuest Auth Portal
          </p>
          <h1 className="font-serif text-[26px] font-semibold tracking-tight text-[#FAF3E0] sm:text-[32px] lg:text-[34px]">
            Enter the learning command center
          </h1>
          <p
            ref={taglineRef}
            className="font-serif text-[15px] font-medium text-[#FAF3E0]/75 sm:text-[17px] [&_.login-tagline-word:last-child]:mr-0"
            aria-label="Learn. Build. Quest."
          >
            {LOGIN_TAGLINE_WORDS.join(' ')}
          </p>
        </div>

        <LoginStatsStrip statsRef={statsRef} className="login-portal-stats mt-4 w-full max-w-md lg:max-w-lg" />

        <div
          ref={bootRef}
          className="login-boot-strip mt-4 w-full max-w-md rounded-lg border border-[#22FF88]/12 bg-black/30 px-3 py-2.5 text-left font-mono text-[11px] leading-relaxed text-[#22FF88]/75 lg:max-w-lg"
          aria-hidden
        >
          {LOGIN_BOOT_LINES.map((line) => (
            <p key={line} className="login-boot-line">
              {line}
            </p>
          ))}
        </div>

        <div
          ref={featureChipsRef}
          className="login-feature-grid mt-4 grid w-full max-w-md grid-cols-2 gap-2 sm:gap-2.5 lg:max-w-lg"
        >
          {LOGIN_FEATURE_CHIPS.map((chip) => {
            const Icon = FEATURE_ICONS[chip.icon]
            return (
              <div
                key={chip.id}
                className="login-feature-chip flex items-center gap-2 rounded-xl border border-[#22FF88]/12 bg-[#0A1020]/50 px-3 py-2.5 text-left"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#22FF88]/75" strokeWidth={1.75} aria-hidden />
                <span className="text-[12px] font-medium text-[#FAF3E0]/80">{chip.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
