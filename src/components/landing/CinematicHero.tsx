import { useRef } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { LandingCtaButton } from '@/components/landing/LandingCtaButton'
import { CQLogo } from '@/components/landing/shared/CQLogo'
import { HERO_FLOAT_LABELS } from '@/data/landingContent'
import { gsap, useGSAP } from '@/lib/gsapSetup'
import { motionAllowed, pointerTiltAllowed } from '@/lib/motionPreference'

const HEADLINE_LINES = ['Build Skills.', 'Prove Progress.', 'Get Hired.']

type CinematicHeroProps = {
  onStartQuest: () => void
}

export function CinematicHero({ onStartQuest }: CinematicHeroProps) {

  const rootRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const copyRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const logoWrapRef = useRef<HTMLDivElement>(null)
  const logoMotionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const scene = sceneRef.current
      const headline = headlineRef.current
      const copy = copyRef.current
      const cta = ctaRef.current
      const logoWrap = logoWrapRef.current
      const logoMotion = logoMotionRef.current
      const grid = gridRef.current
      if (!root || !scene || !headline || !copy || !cta || !logoWrap || !logoMotion) return

      const lines = headline.querySelectorAll<HTMLElement>('[data-hero-line]')
      const words = headline.querySelectorAll<HTMLElement>('[data-hero-word]')
      const labels = root.querySelectorAll<HTMLElement>('[data-float-label]')
      const nodes = root.querySelectorAll<HTMLElement>('[data-glow-node]')

      if (!motionAllowed()) {
        gsap.set([lines, words, copy, cta, logoWrap, logoMotion, labels, nodes], {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotation: 0,
          rotationX: 0,
          rotationY: 0,
        })
        return
      }

      gsap.set(logoMotion, { transformOrigin: '50% 50%', transformPerspective: 900 })

      gsap.to(logoMotion, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none',
      })

      gsap.to(logoMotion, {
        y: -10,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from(grid, { opacity: 0, duration: 1.2 })
        .from(logoWrap, { scale: 0.6, autoAlpha: 0, duration: 0.8 }, '-=0.8')
        .from(
          lines,
          {
            yPercent: 110,
            autoAlpha: 0,
            stagger: 0.12,
            duration: 0.9,
          },
          '-=0.4',
        )
        .from(
          words,
          {
            y: 24,
            autoAlpha: 0,
            stagger: 0.04,
            duration: 0.5,
          },
          '-=0.5',
        )
        .from(copy, { y: 20, autoAlpha: 0, duration: 0.7 }, '-=0.25')
        .from(cta.children, { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.5 }, '-=0.35')
        .from(
          labels,
          {
            autoAlpha: 0,
            scale: 0.8,
            stagger: 0.08,
            duration: 0.6,
          },
          '-=0.5',
        )
        .from(
          nodes,
          {
            scale: 0,
            autoAlpha: 0,
            stagger: 0.05,
            duration: 0.5,
            ease: 'back.out(1.4)',
          },
          '-=0.6',
        )

      gsap.to(labels, {
        y: '+=12',
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.3, from: 'random' },
      })

      gsap.to(scene, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      let rotateXTo: gsap.QuickToFunc | undefined
      let rotateYTo: gsap.QuickToFunc | undefined
      let onMove: ((e: MouseEvent) => void) | undefined

      if (pointerTiltAllowed()) {
        rotateXTo = gsap.quickTo(logoMotion, 'rotationX', { duration: 0.7, ease: 'power2.out' })
        rotateYTo = gsap.quickTo(logoMotion, 'rotationY', { duration: 0.7, ease: 'power2.out' })

        onMove = (e: MouseEvent) => {
          const rect = root.getBoundingClientRect()
          const px = (e.clientX - rect.left) / rect.width - 0.5
          const py = (e.clientY - rect.top) / rect.height - 0.5
          rotateYTo?.(px * 14)
          rotateXTo?.(-py * 10)
        }
        root.addEventListener('mousemove', onMove)
      }

      return () => {
        if (onMove) root.removeEventListener('mousemove', onMove)
      }
    },
    { scope: rootRef },
  )

  return (
    <section
      ref={rootRef}
      id="hero"
      className="landing-section-dark relative flex min-h-screen items-center overflow-hidden pb-24 pt-16 sm:pb-20"
      aria-labelledby="hero-heading"
    >
      <div ref={gridRef} className="landing-coding-grid absolute inset-0 opacity-50" aria-hidden />
      <div className="landing-hero-glow-blue absolute inset-0" aria-hidden />
      <div className="landing-hero-glow-mint absolute inset-0" aria-hidden />

      {HERO_FLOAT_LABELS.map((label, i) => (
        <span
          key={label}
          data-float-label
          className="landing-float-label pointer-events-none absolute hidden font-mono text-[10px] font-semibold uppercase tracking-[0.25em] lg:block"
          style={{
            top: `${12 + i * 16}%`,
            left: i % 2 === 0 ? `${4 + i * 2}%` : undefined,
            right: i % 2 === 1 ? `${4 + i * 2}%` : undefined,
          }}
        >
          {label}
        </span>
      ))}

      {[...Array(4)].map((_, i) => (
        <span
          key={`node-${i}`}
          data-glow-node
          className="landing-particle absolute h-1 w-1 rounded-full"
          style={{
            top: `${20 + (i * 11) % 60}%`,
            left: `${12 + (i * 17) % 76}%`,
          }}
          aria-hidden
        />
      ))}

      <div ref={sceneRef} className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div ref={logoWrapRef} className="mb-8">
            <div ref={logoMotionRef} className="inline-flex will-change-transform">
              <CQLogo size="lg" animated />
            </div>
          </div>

          <h1
            id="hero-heading"
            ref={headlineRef}
            className="mb-6 max-w-4xl text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] landing-heading-dark"
          >
            {HEADLINE_LINES.map((line) => (
              <span key={line} className="block overflow-hidden py-1">
                <span data-hero-line className="block">
                  {line.split(' ').map((word, wi) => (
                    <span key={`${line}-${word}`} className="mr-[0.2em] inline-block overflow-hidden">
                      <span data-hero-word className="inline-block">
                        {word}
                        {wi < line.split(' ').length - 1 ? ' ' : ''}
                      </span>
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </h1>

          <p
            ref={copyRef}
            className="mb-10 max-w-2xl text-lg leading-relaxed landing-body-dark sm:text-xl"
          >
            CodeQuest brings learning, practice, projects, career preparation and job discovery into
            one guided student journey.
          </p>

          <div ref={ctaRef} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LandingCtaButton size="lg" className="landing-btn-primary" onClick={onStartQuest}>
              Start Your Quest
              <ArrowRight className="h-4 w-4" aria-hidden />
            </LandingCtaButton>
            <LandingCtaButton
              variant="outline"
              size="lg"
              className="landing-btn-outline-dark"
              onClick={onStartQuest}
            >
              Explore the Platform
            </LandingCtaButton>
          </div>
        </div>
      </div>

      <div className="landing-body-dark absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-5 w-5 motion-safe:animate-bounce" aria-hidden />
      </div>
    </section>
  )
}
