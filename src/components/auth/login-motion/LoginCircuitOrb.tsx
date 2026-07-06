import { cn } from '@/lib/utils'

interface LoginCircuitOrbProps {
  className?: string
}

/** ponytail: SVG orbit rings around CQ — subtle rotation via GSAP, no WebGL. */
export function LoginCircuitOrb({ className }: LoginCircuitOrbProps) {
  return (
    <svg
      aria-hidden
      className={cn(
        'login-circuit-orb pointer-events-none absolute left-1/2 top-1/2 h-[min(72vw,300px)] w-[min(72vw,300px)] -translate-x-1/2 -translate-y-1/2',
        className,
      )}
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="login-circuit-glow" cx="160" cy="160" r="118" stroke="#22FF88" strokeOpacity="0.1" strokeWidth="1" />
      <circle
        className="login-orbit-ring login-orbit-ring-a"
        cx="160"
        cy="160"
        r="104"
        stroke="#22FF88"
        strokeOpacity="0.3"
        strokeWidth="1"
        strokeDasharray="6 10"
      />
      <circle
        className="login-orbit-ring login-orbit-ring-b"
        cx="160"
        cy="160"
        r="88"
        stroke="#3B82F6"
        strokeOpacity="0.22"
        strokeWidth="0.75"
        strokeDasharray="4 14"
      />
      <ellipse
        className="login-orbit-ring login-orbit-ring-c"
        cx="160"
        cy="160"
        rx="120"
        ry="68"
        stroke="#22FF88"
        strokeOpacity="0.18"
        strokeWidth="0.75"
        strokeDasharray="3 12"
        transform="rotate(-18 160 160)"
      />
    </svg>
  )
}
