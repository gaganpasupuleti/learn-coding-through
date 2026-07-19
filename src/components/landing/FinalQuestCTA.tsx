import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { LandingCtaButton } from '@/components/landing/LandingCtaButton'
import { CQLogo } from '@/components/landing/shared/CQLogo'
import { gsap, useGSAP } from '@/lib/gsapSetup'
import { motionAllowed, pointerTiltAllowed } from '@/lib/motionPreference'

type FinalQuestCTAProps = {
  onStartQuest: () => void
}

export function FinalQuestCTA({ onStartQuest }: FinalQuestCTAProps) {

  const rootRef = useRef<HTMLElement>(null)
  const logoWrapRef = useRef<HTMLDivElement>(null)
  const logoMotionRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const logoWrap = logoWrapRef.current
      const logoMotion = logoMotionRef.current
      const headline = headlineRef.current
      const cta = ctaRef.current
      if (!root || !logoWrap || !logoMotion || !headline || !cta) return

      if (!motionAllowed()) {
        gsap.set([logoWrap, logoMotion, headline, cta], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          rotationX: 0,
          rotationY: 0,
        })
        return
      }

      gsap.set(logoMotion, { transformOrigin: '50% 50%', transformPerspective: 900 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      })

      tl.from(logoWrap, { scale: 0.5, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)' })
        .from(headline, { y: 32, autoAlpha: 0, duration: 0.7 }, '-=0.4')
        .from(cta.children, { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.5 }, '-=0.3')

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
      id="final-cta"
      className="landing-section-dark relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8"
      aria-labelledby="final-cta-heading"
    >
      <div className="landing-hero-glow-blue absolute inset-0 opacity-80" aria-hidden />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div ref={logoWrapRef} className="mb-8 flex justify-center">
          <div ref={logoMotionRef} className="inline-flex will-change-transform">
            <CQLogo size="lg" animated />
          </div>
        </div>

        <h2
          id="final-cta-heading"
          ref={headlineRef}
          className="landing-heading-dark mb-6 text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight tracking-tight"
        >
          Your career quest starts here.
        </h2>

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
            View Learning Paths
          </LandingCtaButton>
        </div>
      </div>
    </section>
  )
}
