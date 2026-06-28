import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import {
  CQ_CARD,
  CQ_CARD_BODY,
  CQ_CARD_HOVER,
  CQ_FOCUS,
  CQ_LINK,
  CQ_SECTION_SUB,
  CQ_SECTION_TITLE,
  CQ_TONE_BG,
  type CQTone,
} from './cqTheme'

/**
 * Presentational primitives adapted from the codequest-frontend-kit sample
 * (CQCard / CQStatCard / CQProgressBar / CQSectionTitle / CQActionButton /
 * CQWeeklyChart). Dashboard-scoped only — no runtime import from the kit.
 */

interface CQCardProps {
  tone?: CQTone
  interactive?: boolean
  className?: string
  children: ReactNode
}

export function CQCard({ tone = 'cream', interactive = false, className, children }: CQCardProps) {
  const toneBg = tone === 'cream' ? CQ_CARD : cn(CQ_CARD, CQ_TONE_BG[tone])
  return (
    <div className={cn(toneBg, interactive && CQ_CARD_HOVER, CQ_CARD_BODY, className)}>
      {children}
    </div>
  )
}

interface CQStatCardProps {
  label: string
  value?: ReactNode
  detail?: ReactNode
  detailHighlight?: boolean
  tone?: CQTone
  footer?: ReactNode
  icon?: ReactNode
  onClick?: () => void
  className?: string
}

export function CQStatCard({
  label,
  value,
  detail,
  detailHighlight = false,
  tone = 'yellow',
  footer,
  icon,
  onClick,
  className,
}: CQStatCardProps) {
  const interactive = Boolean(onClick)
  const Wrapper = interactive ? 'button' : 'div'
  return (
    <Wrapper
      {...(interactive ? { type: 'button' as const, onClick } : {})}
      className={cn(
        CQ_CARD,
        CQ_TONE_BG[tone],
        'flex h-full min-h-[140px] flex-col p-4 text-left md:p-[18px]',
        interactive && cn(CQ_CARD_HOVER, CQ_FOCUS, 'cursor-pointer'),
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#111827]/70">
          {label}
        </h3>
        {icon && <span className="shrink-0 text-[#0A1020]/55">{icon}</span>}
      </div>
      {value != null && value !== '' && (
        <p className="text-xl font-bold tracking-tight text-[#111827]">{value}</p>
      )}
      {detail && (
        <p
          className={cn(
            'mt-0.5 text-[13px]',
            detailHighlight ? 'font-semibold text-[#0F9488]' : 'text-[#4B5563]',
          )}
        >
          {detail}
        </p>
      )}
      {footer && <div className="mt-auto pt-3">{footer}</div>}
    </Wrapper>
  )
}

interface CQProgressBarProps {
  label?: string
  value: number
  className?: string
}

export function CQProgressBar({ label, value, className }: CQProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={cn('flex items-center gap-2 text-[12px] font-medium text-[#111827]', className)}>
      {label && <span className="w-14 shrink-0">{label}</span>}
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#0A1020]/10">
        <div
          className="h-full rounded-full bg-[#0A1020]/75 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {!label && <span className="shrink-0 tabular-nums">{pct}%</span>}
    </div>
  )
}

interface CQSectionTitleProps {
  children: ReactNode
  sub?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function CQSectionTitle({ children, sub, icon, action, className }: CQSectionTitleProps) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className={cn(CQ_SECTION_TITLE, 'flex items-center gap-2')}>
          {icon && <span className="text-[#0A1020]/70">{icon}</span>}
          {children}
        </h2>
        {sub && <p className={CQ_SECTION_SUB}>{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

type CQButtonVariant = 'primary' | 'navy' | 'ghost'

const CQ_BUTTON_VARIANTS: Record<CQButtonVariant, string> = {
  primary: 'bg-[#2563EB] text-[#FFF9EA] hover:bg-[#1D4ED8]',
  navy: 'bg-[#0A1020] text-[#FAF3E0] hover:bg-[#121A2E]',
  ghost:
    'border border-[#708090]/30 bg-[#FFF9EA] text-[#374151] hover:bg-[#FAF3E0] hover:text-[#111827]',
}

interface CQActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CQButtonVariant
}

export function CQActionButton({
  variant = 'primary',
  className,
  children,
  ...props
}: CQActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        CQ_BUTTON_VARIANTS[variant],
        CQ_FOCUS,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function CQInlineLink({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(CQ_LINK, CQ_FOCUS, 'inline-flex items-center gap-1 rounded', className)}
      {...props}
    >
      {children}
    </button>
  )
}

/** Display-only weekly activity sparkline (decorative, like the kit). */
export function CQWeeklyChart({ heights }: { heights?: number[] }) {
  const bars = heights && heights.length > 0 ? heights : [35, 50, 42, 58, 68, 55, 72]
  return (
    <div className="my-1 flex h-9 items-end gap-1">
      {bars.map((h, i) => (
        <div
          key={i}
          className="min-h-[4px] flex-1 rounded-t-sm bg-[#0A1020]/20"
          style={{ height: `${Math.max(8, Math.min(100, h))}%` }}
        />
      ))}
    </div>
  )
}
