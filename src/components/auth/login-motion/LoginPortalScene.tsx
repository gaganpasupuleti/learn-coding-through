import type { Ref } from 'react'
import {
  BookOpen,
  Briefcase,
  ChartNoAxesCombined,
  Code2,
  Database,
  FileText,
  Layers,
  Radar,
} from 'lucide-react'

import { LANDING_SKILLS, QUEST_JOURNEY_STEPS } from '@/data/landingContent'
import { cn } from '@/lib/utils'

import { LOGIN_FEATURE_CHIPS, LOGIN_HEADLINE_LINES } from './loginTheme'

const FEATURE_ICONS = {
  database: Database,
  code: Code2,
  'file-text': FileText,
  radar: Radar,
} as const

const JOURNEY_ICONS = {
  book: BookOpen,
  code: Code2,
  layers: Layers,
  chart: ChartNoAxesCombined,
  briefcase: Briefcase,
} as const

interface LoginPortalSceneProps {
  eyebrowRef?: Ref<HTMLSpanElement>
  headlineRef?: Ref<HTMLHeadingElement>
  copyRef?: Ref<HTMLParagraphElement>
  featureChipsRef?: Ref<HTMLDivElement>
  journeyRef?: Ref<HTMLDivElement>
  tickerRef?: Ref<HTMLDivElement>
  className?: string
}

export function LoginPortalScene({
  eyebrowRef,
  headlineRef,
  copyRef,
  featureChipsRef,
  journeyRef,
  tickerRef,
  className,
}: LoginPortalSceneProps) {
  const journey = QUEST_JOURNEY_STEPS.filter((s) => s.id !== 'prove')

  return (
    <div
      className={cn(
        'relative z-[1] flex w-full flex-col items-center text-center',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-4 h-44 w-44 -translate-x-1/2 rounded-full bg-[rgba(25,68,241,0.22)] blur-[60px]"
      />

      <p className="relative mb-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(220,229,255,0.85)]">
        <span ref={eyebrowRef}>Student coding lab</span>
      </p>

      <h1
        ref={headlineRef}
        className="relative mb-4 max-w-2xl text-[clamp(2.6rem,3vw+1rem,3.75rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-[#f7f8f4]"
      >
        {LOGIN_HEADLINE_LINES.map((line) => (
          <span key={line} className="block overflow-hidden py-0.5">
            <span data-login-line className="block">
              {line}
            </span>
          </span>
        ))}
      </h1>

      <p ref={copyRef} className="relative mb-5 max-w-lg text-lg leading-snug text-[#b8c0d4]">
        Sign in to continue learning, practice, projects, and career prep in one guided journey.
      </p>

      <div
        ref={tickerRef}
        className="login-skill-ticker relative mb-5 w-full max-w-2xl overflow-hidden rounded-full border border-white/10 bg-white/[0.04] py-2.5 mask-[linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
        aria-hidden
      >
        <div className="login-skill-track flex w-max gap-8 whitespace-nowrap px-4 will-change-transform">
          {[...LANDING_SKILLS, ...LANDING_SKILLS].map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(220,229,255,0.7)]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div
        ref={journeyRef}
        className="login-journey relative mb-5 grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-4"
      >
        {journey.map((step, index) => {
          const Icon = JOURNEY_ICONS[step.icon as keyof typeof JOURNEY_ICONS] ?? Code2
          return (
            <div
              key={step.id}
              className="login-journey-step relative rounded-2xl border border-white/10 bg-[#111936]/55 px-3.5 py-3 text-left backdrop-blur-sm"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[rgba(25,68,241,0.28)] text-[#dce5ff]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#ffef4d]/85">
                  0{index + 1}
                </span>
              </div>
              <p className="text-[15px] font-semibold text-[#f7f8f4]">{step.title}</p>
              <p className="mt-1 line-clamp-1 text-xs leading-snug text-[#b8c0d4] [@media(max-height:760px)]:hidden">
                {step.description}
              </p>
            </div>
          )
        })}
      </div>

      <div
        ref={featureChipsRef}
        className="relative flex w-full flex-wrap justify-center gap-2.5"
      >
        {LOGIN_FEATURE_CHIPS.map((chip) => {
          const Icon = FEATURE_ICONS[chip.icon]
          return (
            <span
              key={chip.id}
              className="login-feature-chip inline-flex items-center gap-2 rounded-full border border-[rgba(220,229,255,0.18)] bg-[rgba(25,68,241,0.18)] px-3.5 py-2.5"
            >
              <Icon className="h-4 w-4 text-[#dce5ff]" strokeWidth={1.75} aria-hidden />
              <span className="text-sm font-semibold text-[#f7f8f4]">{chip.label}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
