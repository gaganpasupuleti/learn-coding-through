import { cn } from '@/lib/utils'

interface SqlPaneResizeHandleProps {
  direction: 'horizontal' | 'vertical'
  onMouseDown: (event: React.MouseEvent) => void
}

export function SqlPaneResizeHandle({ direction, onMouseDown }: SqlPaneResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
      onMouseDown={onMouseDown}
      className={cn(
        'group relative shrink-0 bg-[#26324a] transition-colors hover:bg-emerald-500/40 active:bg-emerald-500/60',
        direction === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute opacity-0 transition-opacity group-hover:opacity-100',
          direction === 'horizontal'
            ? 'inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-emerald-400/80'
            : 'inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-emerald-400/80',
        )}
      />
    </div>
  )
}
