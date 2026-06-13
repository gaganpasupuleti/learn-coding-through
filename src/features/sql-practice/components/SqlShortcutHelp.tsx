import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

export function SqlShortcutHelp({ className }: { className?: string }) {
  const shortcuts = [
    { label: 'Run', keys: 'Ctrl/Cmd + Enter' },
    { label: 'Check', keys: 'Ctrl/Cmd + Shift + Enter' },
    { label: 'Format', keys: 'Ctrl/Cmd + Shift + F' },
    { label: 'Clear', keys: 'Ctrl/Cmd + L' },
    { label: 'Suggestions', keys: 'Ctrl + Space' },
  ]

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]', wb.textMuted, className)}>
      {shortcuts.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          <span className="font-medium text-slate-400">{item.label}:</span>
          <kbd className="rounded border border-[#334155] bg-[#111827] px-1 py-0.5 font-mono text-[10px] text-slate-300">
            {item.keys}
          </kbd>
        </span>
      ))}
    </div>
  )
}
