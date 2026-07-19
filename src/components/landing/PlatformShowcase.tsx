import { useRef } from 'react'
import { DASHBOARD_WIDGETS } from '@/data/landingContent'
import { gsap, useGSAP } from '@/lib/gsapSetup'
import { motionAllowed } from '@/lib/motionPreference'

function widgetValueClass(id: string, xp: string): string {
  if (id === 'xp' || xp.includes('XP')) return 'landing-dash-value-xp'
  if (id === 'streak') return 'landing-dash-value-success'
  return 'landing-dash-value-action'
}

export function PlatformShowcase() {
  const rootRef = useRef<HTMLElement>(null)
  const dashRef = useRef<HTMLDivElement>(null)
  const layerBackRef = useRef<HTMLDivElement>(null)
  const layerFrontRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const dash = dashRef.current
      const layerBack = layerBackRef.current
      const layerFront = layerFrontRef.current
      if (!root || !dash || !layerBack || !layerFront) return

      const widgets = gsap.utils.toArray<HTMLElement>('[data-dash-widget]', root)

      if (!motionAllowed()) {
        gsap.set([dash, widgets], { autoAlpha: 1, y: 0 })
        return
      }

      gsap.set([dash, widgets], { autoAlpha: 1 })

      gsap.from(dash, {
        y: 40,
        scale: 0.98,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: root,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })

      gsap.from(widgets, {
        y: 20,
        stagger: 0.06,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: dash,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })

      gsap.to(layerBack, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to(layerFront, {
        y: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    },
    { scope: rootRef },
  )

  return (
    <section
      ref={rootRef}
      id="platform-showcase"
      className="landing-section-showcase relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
      aria-labelledby="showcase-heading"
    >
      <div ref={layerBackRef} className="landing-showcase-glow pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="landing-showcase-blob pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full opacity-60"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <p className="landing-eyebrow-dark mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.35em]">
          Platform showcase
        </p>
        <h2
          id="showcase-heading"
          className="landing-heading-dark mb-4 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.05]"
        >
          One dashboard.
          <br />
          Every step of your career.
        </h2>
        <p className="landing-body-dark mb-12 max-w-xl">
          A cinematic mock of the CodeQuest student hub — quests, streaks, classes, and jobs in one
          place.
        </p>

        <div ref={dashRef} className="landing-dash-surface relative overflow-hidden rounded-3xl p-4 sm:p-6">
          <div
            ref={layerFrontRef}
            className="mb-4 flex items-center justify-between border-b border-[color:var(--landing-dash-card-border)] pb-4"
          >
            <div>
              <p className="landing-dash-label font-mono text-[9px] uppercase tracking-[0.25em]">
                Student dashboard
              </p>
              <p className="landing-dash-meta text-lg font-bold">Good evening, Quest Runner</p>
            </div>
            <span className="landing-dash-level rounded-full px-3 py-1 text-xs font-bold">L12</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DASHBOARD_WIDGETS.map((widget) => (
              <div key={widget.id} data-dash-widget className="landing-dash-card rounded-xl p-4">
                <p className="landing-dash-label mb-1 font-mono text-[8px] uppercase tracking-[0.2em]">
                  {widget.title}
                </p>
                <p className="landing-dash-meta mb-2 text-sm font-semibold leading-tight">
                  {widget.meta}
                </p>
                <p className={`text-xs font-medium ${widgetValueClass(widget.id, widget.xp)}`}>
                  {widget.xp}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
