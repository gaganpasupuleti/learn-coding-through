import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlShortcutHelpProps {
  className?: string
  /** When false, omit Ctrl+Space (fallback textarea has no suggestions). */
  showSuggestions?: boolean
  compact?: boolean
}

export function SqlShortcutHelp({
  className,
  showSuggestions = true,
  compact = false,
}: SqlShortcutHelpProps) {
  const shortcuts = [
    { label: 'Run', keys: 'Ctrl/Cmd + Enter' },
    { label: 'Check', keys: 'Ctrl/Cmd + Shift + Enter' },
    { label: 'Format', keys: 'Ctrl/Cmd + Shift + F' },
    { label: 'Clear', keys: 'Ctrl/Cmd + Shift + L' },
    ...(showSuggestions ? [{ label: 'Suggestions', keys: 'Ctrl + Space' }] : []),
  ]

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1',
        compact ? 'text-[10px]' : 'text-[11px]',
        wb.textMuted,
        className,
      )}
      aria-label="SQL editor keyboard shortcuts"
    >
      {shortcuts.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          <span className="font-medium text-slate-400">{item.label}:</span>
          <kbd
            className={cn(
              'rounded border border-[#334155] bg-[#111827] font-mono text-slate-300',
              compact ? 'px-1 py-0.5 text-[9px]' : 'px-1 py-0.5 text-[10px]',
            )}
          >
            {item.keys}
          </kbd>
        </span>
      ))}
    </div>
  )
}
