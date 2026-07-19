import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  /** Wider workbench pages (resume builder, practice) can opt out of the max-width cap. */
  wide?: boolean
}

/**
 * Shared student content frame: fluid padding + centered max-width on large screens.
 * Does not change page business logic — layout only.
 */
export function StudentPageFrame({ children, className, wide = false }: Props) {
  return (
    <div
      className={cn(
        'mx-auto w-full min-w-0 px-3 py-4 sm:px-4 md:px-6 md:py-5',
        wide ? 'max-w-[1600px]' : 'max-w-7xl',
        className,
      )}
    >
      {children}
    </div>
  )
}
