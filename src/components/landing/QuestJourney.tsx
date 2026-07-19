import { useRef } from 'react'
import { BookOpen, Briefcase, Code2, Layers, LineChart } from 'lucide-react'
import { QUEST_JOURNEY_STEPS } from '@/data/landingContent'
import { gsap, useGSAP } from '@/lib/gsapSetup'
import { motionAllowed } from '@/lib/motionPreference'

const ICONS = {
  book: BookOpen,
  code: Code2,
  layers: Layers,
  chart: LineChart,
  briefcase: Briefcase,
} as const

const STEP_COUNT = QUEST_JOURNEY_STEPS.length

function stepVisualState(index: number, activeIndex: number) {
  if (index === activeIndex) {
    return { autoAlpha: 1, scale: 1 }
  }
  if (index < activeIndex) {
    return { autoAlpha: 0.45, scale: 0.99 }
  }
  return { autoAlpha: 0.32, scale: 0.98 }
}

export function QuestJourney() {
  const rootRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const stepsStageRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const pin = pinRef.current
      const path = pathRef.current
      const viewport = viewportRef.current
      const stepsStage = stepsStageRef.current
      if (!root || !pin || !path || !viewport || !stepsStage) return

      const steps = gsap.utils.toArray<HTMLElement>('[data-journey-step]', root)
      const dots = gsap.utils.toArray<HTMLElement>('[data-journey-dot]', root)

      const computeFocusY = (activeIndex: number) => {
        const step = steps[activeIndex]
        if (!step) return 0

        const viewportHeight = viewport.clientHeight
        const totalHeight = stepsStage.scrollHeight
        const focusTop = Math.min(72, viewportHeight * 0.18)

        let y = focusTop - step.offsetTop

        if (totalHeight > viewportHeight) {
          const minY = viewportHeight - totalHeight
          y = Math.max(minY, Math.min(0, y))
        } else {
          y = 0
        }

        return y
      }

      if (!motionAllowed()) {
        gsap.set(stepsStage, { y: 0 })
        gsap.set(steps, { autoAlpha: 1, scale: 1 })
        gsap.set(dots, { scale: 1 })
        path.style.strokeDashoffset = '0'
        return
      }

      const pathLength = path.getTotalLength()
      gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength })
      gsap.set(stepsStage, { y: 0 })
      gsap.set(steps, { autoAlpha: 1, scale: 1 })

      const mm = gsap.matchMedia()
      mm.add(
        {
          isDesktop: '(min-width: 1024px)',
          isMobile: '(max-width: 1023px)',
        },
        (context) => {
          const isDesktop = Boolean(context.conditions?.isDesktop)

          if (isDesktop) {
            const pinDistance = (STEP_COUNT - 1) * 520

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: root,
                start: 'top top',
                end: `+=${pinDistance}`,
                pin,
                scrub: 0.75,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onRefresh: () => {
                  gsap.set(stepsStage, { y: computeFocusY(0) })
                },
              },
            })

            tl.to(path, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0)

            for (let activeIndex = 0; activeIndex < STEP_COUNT; activeIndex++) {
              const position = activeIndex / (STEP_COUNT - 1)

              tl.to(
                stepsStage,
                {
                  y: () => computeFocusY(activeIndex),
                  duration: 0.3,
                  ease: 'power2.out',
                },
                position,
              )

              tl.to(
                steps,
                {
                  autoAlpha: (index: number) => stepVisualState(index, activeIndex).autoAlpha,
                  scale: (index: number) => stepVisualState(index, activeIndex).scale,
                  duration: 0.25,
                  ease: 'power2.out',
                },
                position,
              )

              tl.to(
                dots,
                {
                  scale: (index: number) => (index === activeIndex ? 1.15 : 1),
                  backgroundColor: (index: number) =>
                    index <= activeIndex ? '#1944F1' : '#F5F3F3',
                  duration: 0.2,
                },
                position,
              )
            }
          } else {
            gsap.set(stepsStage, { y: 0 })
            steps.forEach((step, i) => {
              gsap.from(step, {
                y: 16,
                scrollTrigger: {
                  trigger: step,
                  start: 'top 92%',
                  toggleActions: 'play none none reverse',
                },
              })
              gsap.to(path, {
                strokeDashoffset: pathLength * (1 - (i + 1) / STEP_COUNT),
                scrollTrigger: {
                  trigger: step,
                  start: 'top 82%',
                  toggleActions: 'play none none reverse',
                },
              })
              gsap.to(dots[i], {
                scale: 1.1,
                backgroundColor: '#1944F1',
                scrollTrigger: {
                  trigger: step,
                  start: 'top 82%',
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
      id="how-it-works"
      className="landing-section-journey relative scroll-mt-20"
      aria-labelledby="journey-heading"
    >
      <div ref={pinRef} className="relative px-4 py-16 sm:px-6 sm:py-20 lg:min-h-screen lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="landing-eyebrow mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.35em]">
            How CodeQuest works
          </p>
          <h2
            id="journey-heading"
            className="landing-heading mb-4 max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight tracking-tight"
          >
            Your quest from first lesson to first offer.
          </h2>
          <p className="landing-body mb-8 max-w-xl lg:mb-10">
            Scroll through the student journey — each step unlocks the next.
          </p>

          <div
            ref={viewportRef}
            className="relative overflow-hidden lg:ml-4 lg:h-[min(52vh,420px)]"
          >
            <div ref={stepsStageRef} className="relative will-change-transform lg:pl-12">
              <svg
                className="absolute left-0 top-0 hidden h-full w-8 lg:block"
                viewBox="0 0 32 400"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  ref={pathRef}
                  d="M16 0 V400"
                  fill="none"
                  className="landing-journey-line"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.35"
                />
              </svg>

              <div className="space-y-1 lg:space-y-2">
                {QUEST_JOURNEY_STEPS.map((step, i) => {
                  const Icon = ICONS[step.icon]
                  return (
                    <article
                      key={step.id}
                      data-journey-step
                      className="landing-journey-step relative flex gap-5 rounded-2xl px-2 py-3 lg:gap-6 lg:py-4"
                    >
                      <span
                        data-journey-dot
                        className="landing-journey-dot relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2"
                        aria-hidden
                      >
                        <span className="landing-journey-dot-inner h-2.5 w-2.5 rounded-full" />
                      </span>
                      <div className="min-w-0 max-w-lg flex-1">
                        <div className="mb-2 flex items-center gap-3 lg:mb-3">
                          <span className="landing-journey-icon-wrap flex h-9 w-9 shrink-0 items-center justify-center rounded-xl lg:h-10 lg:w-10">
                            <Icon className="h-5 w-5" aria-hidden />
                          </span>
                          <h3 className="landing-heading text-xl font-bold lg:text-2xl">
                            {i + 1}. {step.title}
                          </h3>
                        </div>
                        <p className="landing-body text-sm leading-relaxed lg:text-base">
                          {step.description}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
