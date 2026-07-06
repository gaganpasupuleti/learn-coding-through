import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { LoginCircuitOrb } from './LoginCircuitOrb'
import { LoginMatrixBackdrop } from './LoginMatrixBackdrop'
import { LoginPortalScene } from './LoginPortalScene'
import { LOGIN_PAGE_BG } from './loginTheme'
import { useLoginBootMotion } from './useLoginBootMotion'

interface LoginBootPortalProps {
  children: ReactNode
  className?: string
}

export function LoginBootPortal({ children, className }: LoginBootPortalProps) {
  const {
    portalTiltRef,
    portalGlowRef,
    circuitRef,
    logoRef,
    logoGlowRef,
    taglineRef,
    bootRef,
    featureChipsRef,
    statsRef,
    cardRef,
  } = useLoginBootMotion()

  return (
    <main className={cn(LOGIN_PAGE_BG, className)} aria-label="Sign in to CodeQuest">
      <LoginMatrixBackdrop />
      <div className="relative z-[1] grid min-h-screen lg:grid-cols-[55fr_45fr]">
        <section className="login-portal-side relative flex items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:px-10 lg:py-12">
          <div ref={portalTiltRef} className="w-full max-w-xl [transform-style:preserve-3d] lg:max-w-2xl">
            <LoginPortalScene
              portalGlowRef={portalGlowRef}
              taglineRef={taglineRef}
              bootRef={bootRef}
              featureChipsRef={featureChipsRef}
              statsRef={statsRef}
            />
          </div>
          <div ref={circuitRef} className="relative mb-2 flex h-[min(64vw,280px)] w-[min(64vw,280px)] items-center justify-center lg:h-[280px] lg:w-[280px]">
            <LoginCircuitOrb />
            <div ref={logoRef} className="relative z-[1]">
              <div
                ref={logoGlowRef}
                aria-hidden
                className="pointer-events-none absolute -inset-8 rounded-full bg-[#22FF88]/22 blur-2xl"
              />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] border border-[#22FF88]/35 bg-[#0A1020]/85 text-[#22FF88] shadow-[0_0_40px_-10px_rgba(34,255,136,0.7)] sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                <span className="font-serif text-5xl font-bold tracking-tight sm:text-[56px] lg:text-[60px]">CQ</span>
              </div>
            </div>
          </div>
        </section>

        <section className="login-form-side flex items-center justify-center px-4 py-8 sm:px-6 lg:min-h-screen lg:border-l lg:border-[#22FF88]/10 lg:px-8 lg:py-10">
          <div ref={cardRef} className="login-motion-card flex w-full max-w-md flex-col gap-4">
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
