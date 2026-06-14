import { useCallback, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { AUTH_CAROUSEL_INTERVAL_MS, AUTH_PROMO_SLIDES } from './auth-promo-slides'
import { AuthLaptopFrame } from './AuthDashboardPreview'

export function AuthPromoPanel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((index: number) => {
    setActiveIndex(index % AUTH_PROMO_SLIDES.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % AUTH_PROMO_SLIDES.length)
    }, AUTH_CAROUSEL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [paused])

  const slide = AUTH_PROMO_SLIDES[activeIndex]

  return (
    <aside
      className="relative hidden min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-900 px-10 py-12 text-white lg:flex"
      aria-label="CodeQuest product preview"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8">
        <AuthLaptopFrame variant={slide.variant} />

        <div className="min-h-[5.5rem] text-center">
          <h2 className="text-2xl font-bold tracking-tight">{slide.headline}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{slide.subtext}</p>
        </div>

        <div className="flex items-center gap-2" role="tablist" aria-label="Product highlights">
          {AUTH_PROMO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={s.headline}
              onClick={() => goTo(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                i === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60',
              )}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
