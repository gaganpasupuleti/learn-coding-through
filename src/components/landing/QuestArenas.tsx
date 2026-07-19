import { useRef } from 'react'
import { QUEST_ARENAS } from '@/data/landingContent'
import { gsap, useGSAP } from '@/lib/gsapSetup'
import { motionAllowed } from '@/lib/motionPreference'

export function QuestArenas() {
  const rootRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackWrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const pin = pinRef.current
      const trackWrap = trackWrapRef.current
      const track = trackRef.current
      if (!root || !pin || !trackWrap || !track) return

      const cards = gsap.utils.toArray<HTMLElement>('[data-arena-card]', root)

      if (!motionAllowed()) {
        gsap.set(cards, { autoAlpha: 1, y: 0, x: 0 })
        return
      }

      const mm = gsap.matchMedia()
      mm.add(
        {
          isDesktop: '(min-width: 1024px)',
          isMobile: '(max-width: 1023px)',
        },
        (context) => {
          const isDesktop = Boolean(context.conditions?.isDesktop)

          if (isDesktop) {
            const getScrollDistance = () => Math.max(0, track.scrollWidth - trackWrap.offsetWidth)

            const tween = gsap.to(track, {
              x: () => -getScrollDistance(),
              ease: 'none',
              scrollTrigger: {
                trigger: pin,
                start: 'top top',
                end: () => `+=${getScrollDistance()}`,
                pin,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })

            cards.forEach((card) => {
              gsap.from(card, {
                y: 24,
                autoAlpha: 0,
                scrollTrigger: {
                  containerAnimation: tween,
                  trigger: card,
                  start: 'left 85%',
                  toggleActions: 'play none none reverse',
                },
              })
            })
          } else {
            gsap.set(track, { x: 0 })
            gsap.set(cards, { autoAlpha: 1 })
            cards.forEach((card) => {
              gsap.from(card, {
                y: 20,
                scrollTrigger: {
                  trigger: card,
                  start: 'top 92%',
                  toggleActions: 'play none none reverse',
                },
              })
            })
          }
        },
        root,
      )

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  return (
    <section
      ref={rootRef}
      id="quest-arenas"
      className="landing-section-dark scroll-mt-20"
      aria-labelledby="arenas-heading"
    >
      <div ref={pinRef} className="flex flex-col justify-center py-12 sm:py-16 lg:min-h-screen lg:py-20">
        <div className="mx-auto mb-10 w-full max-w-6xl px-4 sm:px-6 lg:mb-12 lg:px-8">
          <p className="landing-eyebrow-warm mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.35em]">
            Quest arenas
          </p>
          <h2
            id="arenas-heading"
            className="landing-heading-dark max-w-2xl text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-tight"
          >
            Learning environments built for momentum.
          </h2>
        </div>

        <div ref={trackWrapRef} className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex flex-col gap-5 px-4 sm:px-6 lg:w-max lg:flex-row lg:gap-6 lg:px-8"
          >
            {QUEST_ARENAS.map((arena) => (
              <article
                key={arena.id}
                data-arena-card
                className={`landing-arena-card landing-arena-card--${arena.id} group relative w-full max-w-md shrink-0 overflow-hidden rounded-2xl border p-6 lg:w-[320px]`}
              >
                <div
                  className="landing-arena-glow absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                  aria-hidden
                />
                <span className="landing-arena-tag mb-4 inline-block rounded-full px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.2em]">
                  {arena.tag}
                </span>
                <h3 className="landing-arena-title mb-3 text-xl font-bold">{arena.title}</h3>
                <p className="landing-arena-body text-sm leading-relaxed">{arena.description}</p>
                <div className="landing-arena-bar mt-6 h-1 w-12 rounded-full" aria-hidden />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
