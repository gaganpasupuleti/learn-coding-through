import { Badge } from '@/components/ui/badge'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'
import type { PowerBiModuleDefinition } from '../types/powerbiPractice.types'

interface PowerBiModuleCardProps {
  module: PowerBiModuleDefinition
  icon: React.ReactNode
  onOpen?: () => void
}

export function PowerBiModuleCard({ module, icon, onOpen }: PowerBiModuleCardProps) {
  const isActive = module.status === 'active'
  const isComingSoon = module.status === 'coming-soon'
  const isAvailableSoon = module.status === 'available-soon'
  const isDisabled = isComingSoon || (isAvailableSoon && !onOpen)

  const body = (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
            wb.border,
            isComingSoon ? 'bg-[#0F172A] text-[#64748B]' : 'bg-amber-950/40 text-amber-300',
            isActive && 'bg-emerald-950/40 text-emerald-300',
          )}
        >
          {icon}
        </div>
        {isComingSoon ? (
          <Badge variant="outline" className="border-[#475569] bg-[#0F172A] text-[#94A3B8]">
            Coming Soon
          </Badge>
        ) : isActive ? (
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-950/40 text-emerald-200">
            Available
          </Badge>
        ) : (
          <Badge variant="outline" className="border-amber-500/50 bg-amber-950/40 text-amber-200">
            Available Soon
          </Badge>
        )}
      </div>

      <h3 className={cn('text-base font-semibold', isComingSoon ? wb.textMuted : wb.textPrimary)}>
        {module.title}
      </h3>
      <p className={cn('mt-2 flex-1 text-sm leading-relaxed', wb.textSecondary)}>{module.description}</p>

      {isComingSoon && (
        <p className={cn('mt-4 text-xs', wb.textMuted)}>This module is planned for a later phase.</p>
      )}
      {isAvailableSoon && !onOpen && (
        <p className={cn('mt-4 text-xs', wb.textMuted)}>Opens in a later phase.</p>
      )}
      {isActive && (
        <p className={cn('mt-4 text-xs text-emerald-300/90')}>Open the DAX Practice IDE skeleton.</p>
      )}
    </>
  )

  if (isActive && onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'flex h-full w-full flex-col rounded-xl border p-5 text-left transition-colors hover:border-emerald-500/50 hover:bg-[#1a2332]',
          wb.border,
          'bg-[#111827]',
        )}
      >
        {body}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-xl border p-5 transition-colors',
        wb.border,
        isComingSoon ? wb.langSoon : 'bg-[#111827]',
        isAvailableSoon && 'border-amber-500/40 bg-[#111827] opacity-100',
      )}
      aria-disabled={isDisabled}
    >
      {body}
    </div>
  )
}
