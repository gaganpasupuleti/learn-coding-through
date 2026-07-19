import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type LandingCtaButtonProps = {
  children: ReactNode
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline'
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
}

/** Thin CTA wrapper so landing can reuse CQ Button without UI Lab's motion Button. */
export function LandingCtaButton({
  children,
  onClick,
  className,
  size = 'md',
  variant = 'primary',
  type = 'button',
}: LandingCtaButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      size={size === 'md' ? 'default' : size}
      variant={variant === 'outline' ? 'outline' : 'default'}
      className={cn(
        'rounded-full font-semibold shadow-none',
        size === 'lg' && 'h-11 px-7 text-base',
        size === 'sm' && 'h-8 px-3 text-sm',
        className,
      )}
    >
      {children}
    </Button>
  )
}
