import { useRef } from 'react'
import { CAREER_MAP_STEPS, CAREER_PROGRESS_DEMO } from '@/data/landingContent'
import { gsap, useGSAP } from '@/lib/gsapSetup'
import { motionAllowed } from '@/lib/motionPreference'

const CAREER_CARD_CLASS: Record<string, string> = {
  Python: 'landing-career-card--python',
  SQL: 'landing-career-card--sql',
  'Resume Readiness': 'landing-career-card--resume',
  'Career Path': 'landing-career-card--path',
}

const CAREER_BAR_CLASS: Record<string, string> = {
  Python: 'landing-career-bar--blue',
  SQL: 'landing-career-bar--mint',
  'Resume Readiness': 'landing-career-bar--peach',
  'Career Path': 'landing-career-bar--path',
}

export function CareerMap() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const bars = gsap.utils.toArray<HTMLElement>('[data-progress-bar]', root)
      const steps = gsap.utils.toArray<HTMLElement>('[data-map-step]', root)

      if (!motionAllowed()) {
        gsap.set(steps, { autoAlpha: 1, y: 0 })
        return
      }

      bars.forEach((bar) => {
        const target = Number(bar.dataset.progress ?? 0)
        gsap.set(bar, { width: '0%' })
        gsap.to(bar, {
          width: `${target}%`,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bar.parentElement,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      gsap.from(steps, {
        y: 20,
        autoAlpha: 0,
        stagger: 0.08,
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      })
    },
    { scope: rootRef },
  )

  return (
    <section
      ref={rootRef}
      id="career-map"
      className="landing-section-career px-4 py-24 sm:px-6 lg:px-8"
      aria-labelledby="career-map-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="landing-eyebrow mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.35em]">
          Career map
        </p>
        <h2
          id="career-map-heading"
          className="landing-heading mb-4 max-w-2xl text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-tight"
        >
          See your path from skills to offers.
        </h2>
        <p className="landing-body mb-3 max-w-xl text-sm">
          Example student progress shown below — illustrative demo, not live user data.
        </p>

        <div className="landing-map-path mb-12 flex flex-wrap gap-2 sm:gap-3">
          {CAREER_MAP_STEPS.map((step, i) => (
            <span
              key={step}
              data-map-step
              className="landing-map-chip flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
            >
              <span className="landing-map-chip-num">{i + 1}</span>
              {step}
              {i < CAREER_MAP_STEPS.length - 1 && (
                <span className="landing-body hidden sm:inline" aria-hidden>
                  →
                </span>
              )}
            </span>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {CAREER_PROGRESS_DEMO.map((item) => (
            <div
              key={item.label}
              className={`landing-career-card rounded-2xl p-6 ${CAREER_CARD_CLASS[item.label] ?? ''}`}
            >
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="landing-heading text-sm font-semibold">{item.label}</p>
                  {'caption' in item && item.caption && (
                    <p className="landing-body text-xs">{item.caption}</p>
                  )}
                </div>
                <span className="landing-career-pct font-mono text-lg font-bold">{item.value}%</span>
              </div>
              <div className="landing-career-track h-2 overflow-hidden rounded-full">
                <div
                  data-progress-bar
                  data-progress={item.value}
                  className={`career-progress-bar h-full rounded-full ${CAREER_BAR_CLASS[item.label] ?? 'landing-career-bar--blue'}`}
                  style={{ width: `${item.value}%` }}
                  role="progressbar"
                  aria-valuenow={item.value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.label} progress`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
