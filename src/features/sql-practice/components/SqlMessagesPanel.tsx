import { Terminal } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlMessagesPanelProps {
  messages: string[]
}

export function SqlMessagesPanel({ messages }: SqlMessagesPanelProps) {
  if (messages.length === 0) {
    return (
      <div className={cn('flex min-h-[140px] items-center gap-2 p-4 text-sm', wb.textMuted)}>
        <Terminal className="h-4 w-4 shrink-0" />
        Run a query to see messages.
      </div>
    )
  }

  return (
    <pre className={cn('max-h-48 overflow-auto p-4 font-mono text-sm leading-relaxed', wb.textSecondary)}>
      {messages.join('\n')}
    </pre>
  )
}
