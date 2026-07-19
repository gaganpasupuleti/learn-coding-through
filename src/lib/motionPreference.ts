/** Respect user motion preferences and device capabilities. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function motionAllowed(): boolean {
  if (typeof window === 'undefined') return false
  return !prefersReducedMotion()
}

/** Desktop pointer-only depth effects (no touch). */
export function pointerTiltAllowed(): boolean {
  if (typeof window === 'undefined') return false
  if (!motionAllowed()) return false
  if ('ontouchstart' in window) return false
  return window.matchMedia('(pointer: fine)').matches
}
