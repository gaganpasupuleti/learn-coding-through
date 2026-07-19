import { type RefObject, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const LOGIN_MOTION = import.meta.env.VITE_LOGIN_MOTION !== '0'

function motionAllowed(): boolean {
  if (typeof window === 'undefined') return false
  if (!LOGIN_MOTION) return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Animates auth panel content when switching login / signup / forgot / pending. */
export function useLoginAuthPanelMotion(
  panelRef: RefObject<HTMLElement | null>,
  modeKey: string,
) {
  const isFirstMount = useRef(true)

  useGSAP(
    () => {
      const panel = panelRef.current
      if (!panel || !motionAllowed()) return

      if (isFirstMount.current) {
        isFirstMount.current = false
        return
      }

      const items = panel.querySelectorAll<HTMLElement>('.login-card-stagger')
      if (!items.length) return

      gsap.fromTo(
        items,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.045, ease: 'power2.out' },
      )
    },
    { dependencies: [modeKey], scope: panelRef },
  )
}
