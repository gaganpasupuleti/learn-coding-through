import { useRef } from 'react'
import { LANDING_SKILLS } from '@/data/landingContent'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsapSetup'
import { motionAllowed } from '@/lib/motionPreference'

export function SkillsTicker() {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const items = [...LANDING_SKILLS, ...LANDING_SKILLS]

  useGSAP(
    () => {
      const root = rootRef.current
      const track = trackRef.current
      if (!root || !track) return

      if (!motionAllowed()) {
        gsap.set(track, { x: 0 })
        return
      }

      const buildTween = () => {
        const half = track.scrollWidth / 2
        if (!half) return null
        gsap.set(track, { x: 0 })
        return gsap.to(track, {
          x: -half,
          duration: 36,
          ease: 'none',
          repeat: -1,
        })
      }

      let tween = buildTween()
      if (!tween) {
        requestAnimationFrame(() => {
          tween = buildTween()
        })
      }

      const onResize = () => {
        tween?.kill()
        ScrollTrigger.refresh()
        tween = buildTween()
      }
      window.addEventListener('resize', onResize)

      const onEnter = () => tween?.pause()
      const onLeave = () => tween?.play()
      root.addEventListener('mouseenter', onEnter)
      root.addEventListener('mouseleave', onLeave)

      return () => {
        window.removeEventListener('resize', onResize)
        root.removeEventListener('mouseenter', onEnter)
        root.removeEventListener('mouseleave', onLeave)
        tween?.kill()
      }
    },
    { scope: rootRef },
  )

  return (
    <section
      ref={rootRef}
      className="landing-section-ticker landing-ticker py-5"
      aria-label="Skills and technologies"
    >
      <div className="overflow-hidden">
        <div ref={trackRef} className="flex w-max items-center">
          {items.map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              className="landing-ticker-item mx-5 inline-flex items-center whitespace-nowrap text-sm font-bold uppercase tracking-[0.2em]"
            >
              <span className="landing-ticker-dot mr-3 h-1.5 w-1.5 rounded-full" aria-hidden />
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
