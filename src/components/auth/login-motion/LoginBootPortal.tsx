import type { ReactNode } from 'react'

import { CQLogo } from '@/components/landing/shared/CQLogo'
import { HERO_FLOAT_LABELS } from '@/data/landingContent'
import { cn } from '@/lib/utils'

import { LoginMatrixBackdrop } from './LoginMatrixBackdrop'
import { LoginPortalScene } from './LoginPortalScene'
import { LOGIN_PAGE_BG } from './loginTheme'
import { useLoginBootMotion } from './useLoginBootMotion'

interface LoginBootPortalProps {
  children: ReactNode
  className?: string
  onHome?: () => void
}

export function LoginBootPortal({ children, className, onHome }: LoginBootPortalProps) {
  const {
    rootRef,
    portalTiltRef,
    eyebrowRef,
    headlineRef,
    logoWrapRef,
    logoMotionRef,
    copyRef,
    featureChipsRef,
    journeyRef,
    tickerRef,
    cardRef,
  } = useLoginBootMotion()

  return (
    <main ref={rootRef} className={cn(LOGIN_PAGE_BG, className)} aria-label="Sign in to CodeQuest">
      <LoginMatrixBackdrop />

      {HERO_FLOAT_LABELS.map((label, i) => (
        <span
          key={label}
          data-float-label
          className="pointer-events-none absolute hidden font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[rgba(247,248,244,0.38)] lg:block"
          style={{
            top: `${12 + i * 15}%`,
            left: i % 2 === 0 ? `${3 + i * 1.5}%` : undefined,
            right: i % 2 === 1 ? `${3 + i * 1.2}%` : undefined,
          }}
        >
          {label}
        </span>
      ))}

      {[...Array(6)].map((_, i) => (
        <span
          key={`node-${i}`}
          data-glow-node
          className="absolute h-1 w-1 rounded-full bg-[rgba(255,239,77,0.55)] shadow-[0_0_6px_rgba(255,239,77,0.35)]"
          style={{
            top: `${18 + (i * 12) % 62}%`,
            left: `${10 + (i * 15) % 72}%`,
          }}
          aria-hidden
        />
      ))}

      <div className="relative z-[1] flex min-h-dvh w-full items-center justify-center px-4 py-4 sm:px-6 lg:h-dvh lg:px-10 lg:py-6">
        <div className="grid w-full max-w-[1360px] gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:gap-12 xl:gap-16">
          <section
            ref={portalTiltRef}
            className="relative mx-auto flex w-full max-w-[700px] flex-col justify-center lg:mx-auto"
          >
            <div className="mb-5 flex max-w-full flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 lg:mb-6">
              <div ref={logoWrapRef} className="relative shrink-0">
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(25,68,241,0.4)] blur-2xl sm:h-24 sm:w-24"
                />
                <div ref={logoMotionRef} className="relative inline-flex scale-90 will-change-transform sm:scale-100">
                  <CQLogo size="lg" />
                </div>
              </div>
              <button
                type="button"
                onClick={onHome}
                className="text-[clamp(1.05rem,4vw,1.25rem)] font-bold tracking-tight text-[#f7f8f4] transition-opacity hover:opacity-90"
              >
                CodeQuest
              </button>
            </div>

            <LoginPortalScene
              eyebrowRef={eyebrowRef}
              headlineRef={headlineRef}
              copyRef={copyRef}
              featureChipsRef={featureChipsRef}
              journeyRef={journeyRef}
              tickerRef={tickerRef}
            />
          </section>

          <section className="flex w-full items-center justify-center lg:justify-end">
            <div ref={cardRef} className="login-motion-card w-full max-w-lg lg:ml-auto">
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
