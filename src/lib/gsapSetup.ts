import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

let registered = false

/** Register GSAP plugins once for the app shell. */
export function registerGsapPlugins(): void {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger, useGSAP)
  registered = true
}

registerGsapPlugins()

export { gsap, ScrollTrigger, useGSAP }
