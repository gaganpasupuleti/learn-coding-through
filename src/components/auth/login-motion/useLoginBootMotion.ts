import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const LOGIN_MOTION = import.meta.env.VITE_LOGIN_MOTION !== '0'

function motionAllowed(): boolean {
  if (typeof window === 'undefined') return false
  if (!LOGIN_MOTION) return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Living left-scene motion aligned to cinematic landing. */
export function useLoginBootMotion() {
  const rootRef = useRef<HTMLElement>(null)
  const portalTiltRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const logoWrapRef = useRef<HTMLDivElement>(null)
  const logoMotionRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLParagraphElement>(null)
  const featureChipsRef = useRef<HTMLDivElement>(null)
  const journeyRef = useRef<HTMLDivElement>(null)
  const tickerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const logoWrap = logoWrapRef.current
      const logoMotion = logoMotionRef.current
      const headline = headlineRef.current
      const copy = copyRef.current
      const eyebrow = eyebrowRef.current
      const chips = featureChipsRef.current
      const journey = journeyRef.current
      const ticker = tickerRef.current
      const card = cardRef.current
      if (!root || !logoWrap || !logoMotion || !headline || !copy || !card) return

      const lines = headline.querySelectorAll<HTMLElement>('[data-login-line]')
      const chipEls = chips?.querySelectorAll<HTMLElement>('.login-feature-chip') ?? []
      const journeySteps = journey?.querySelectorAll<HTMLElement>('.login-journey-step') ?? []
      const skillTrack = ticker?.querySelector<HTMLElement>('.login-skill-track')
      const labels = root.querySelectorAll<HTMLElement>('[data-float-label]')
      const nodes = root.querySelectorAll<HTMLElement>('[data-glow-node]')
      const cardItems = card.querySelectorAll<HTMLElement>('.login-card-stagger')

      if (!motionAllowed()) {
        gsap.set(
          [
            logoWrap,
            logoMotion,
            lines,
            copy,
            eyebrow,
            chipEls,
            journeySteps,
            card,
            labels,
            nodes,
            cardItems,
          ],
          { opacity: 1, y: 0, scale: 1, rotation: 0, rotationX: 0, rotationY: 0 },
        )
        return
      }

      gsap.set(logoMotion, {
        force3D: true,
        rotation: 0,
        transformOrigin: '50% 50%',
        transformPerspective: 900,
      })

      gsap.to(logoMotion, {
        rotation: 360,
        duration: 28,
        repeat: -1,
        ease: 'none',
      })

      if (skillTrack) {
        const width = skillTrack.scrollWidth / 2
        gsap.fromTo(
          skillTrack,
          { x: 0 },
          {
            x: -width,
            duration: 28,
            ease: 'none',
            repeat: -1,
          },
        )
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from(logoWrap, { scale: 0.6, autoAlpha: 0, duration: 0.8 })
        .from(eyebrow, { y: 12, autoAlpha: 0, duration: 0.4 }, '-=0.4')
        .from(
          lines,
          {
            yPercent: 110,
            autoAlpha: 0,
            stagger: 0.11,
            duration: 0.85,
          },
          '-=0.25',
        )
        .from(copy, { y: 16, autoAlpha: 0, duration: 0.5 }, '-=0.35')
        .from(ticker, { y: 12, autoAlpha: 0, duration: 0.45 }, '-=0.25')
        .from(
          journeySteps,
          {
            y: 16,
            autoAlpha: 0,
            stagger: 0.07,
            duration: 0.4,
          },
          '-=0.2',
        )
        .from(chipEls, { y: 10, autoAlpha: 0, stagger: 0.05, duration: 0.35 }, '-=0.15')
        .from(card, { y: 22, autoAlpha: 0, duration: 0.55 }, '-=0.4')
        .from(cardItems, { y: 10, autoAlpha: 0, stagger: 0.04, duration: 0.3 }, '-=0.25')
        .from(
          labels,
          {
            autoAlpha: 0,
            scale: 0.85,
            stagger: 0.08,
            duration: 0.5,
          },
          '-=0.6',
        )
        .from(
          nodes,
          {
            scale: 0,
            autoAlpha: 0,
            stagger: 0.04,
            duration: 0.4,
            ease: 'back.out(1.4)',
          },
          '-=0.55',
        )

      gsap.to(labels, {
        y: '+=6',
        duration: 5.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.3, from: 'random' },
      })

      return undefined
    },
    { scope: rootRef },
  )

  return {
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
  }
}
