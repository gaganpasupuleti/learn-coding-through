import { useRef } from 'react'
import { FEATURE_STORY_ITEMS } from '@/data/landingContent'
import { gsap, useGSAP } from '@/lib/gsapSetup'
import { motionAllowed } from '@/lib/motionPreference'

export function FeatureStory() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const panels = gsap.utils.toArray<HTMLElement>('[data-feature-panel]', root)

      if (!motionAllowed()) {
        gsap.set(panels, { autoAlpha: 1, y: 0 })
        return
      }

      panels.forEach((panel) => {
        const title = panel.querySelector('[data-feature-title]')
        const body = panel.querySelector('[data-feature-body]')

        gsap.set([panel, title, body], { autoAlpha: 1 })

        gsap.from(panel, {
          y: 24,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: panel,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })

        if (title) {
          gsap.from(title, {
            y: 24,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          })
        }

        if (body) {
          gsap.from(body, {
            y: 16,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          })
        }
      })
    },
    { scope: rootRef },
  )

  return (
    <section
      ref={rootRef}
      id="features"
      className="relative"
      aria-labelledby="features-heading"
    >
      <div className="sr-only">
        <h2 id="features-heading">CodeQuest capabilities</h2>
      </div>

      {FEATURE_STORY_ITEMS.map((feature, i) => (
        <article
          key={feature.id}
          data-feature-panel
          className={`landing-feature-panel ${i % 2 === 0 ? 'landing-feature-panel--light' : 'landing-feature-panel--cool'} px-4 py-20 sm:px-6 lg:px-8`}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:gap-16">
            <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
              <p className="landing-eyebrow mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.35em]">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3
                data-feature-title
                className="landing-heading max-w-xl text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-tight tracking-tight"
              >
                {feature.title}
              </h3>
            </div>
            <p
              data-feature-body
              className={`landing-body max-w-lg text-lg leading-relaxed ${i % 2 === 1 ? 'lg:order-1' : ''}`}
            >
              {feature.body}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}
