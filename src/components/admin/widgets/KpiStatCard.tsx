import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function KpiStatCard({
  label,
  value,
  icon,
  accent,
  onClick,
  className,
  compact = false,
}: {
  label: string
  value: string | number
  icon?: ReactNode
  accent?: string
  onClick?: () => void
  className?: string
  compact?: boolean
}) {
  const interactive = Boolean(onClick)

  return (
    <Card
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        'bg-card text-card-foreground flex items-start gap-2 border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] transition-all duration-200 dark:border-border dark:ring-white/[0.04]',
        compact ? 'rounded-lg p-2.5' : 'admin-bento-tile gap-3 rounded-2xl p-6',
        !compact && 'transition-transform hover:-translate-y-0.5',
        interactive && 'group cursor-pointer hover:border-primary/35 hover:shadow-[0_4px_14px_-4px_rgba(37,99,235,0.2)] active:scale-[0.99]',
        interactive && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1',
        accent,
        className,
      )}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {icon && <div className={cn('text-slate-400 transition-colors group-hover:text-primary dark:text-muted-foreground')}>{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-muted-foreground', compact ? 'text-[10px] font-medium leading-tight' : 'text-xs')}>{label}</p>
        <p
          className={cn(
            'font-bold tracking-tight text-slate-900 tabular-nums dark:text-foreground',
            compact ? 'mt-0.5 text-base leading-tight' : 'mt-0.5 text-2xl',
          )}
        >
          {value}
        </p>
      </div>
    </Card>
  )
}
