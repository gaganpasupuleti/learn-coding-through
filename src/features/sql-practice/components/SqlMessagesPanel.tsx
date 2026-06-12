import { Terminal } from 'lucide-react'
import type { SqlAnswerFeedback } from '../types/sqlPractice.types'
import { SqlAnswerFeedbackPanel } from './SqlAnswerFeedbackPanel'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlMessagesPanelProps {
  messages: string[]
  answerFeedback?: SqlAnswerFeedback | null
}

export function SqlMessagesPanel({ messages, answerFeedback }: SqlMessagesPanelProps) {
  const hasContent = messages.length > 0 || answerFeedback

  if (!hasContent) {
    return (
      <div className={cn('flex min-h-[140px] items-center gap-2 p-4 text-sm', wb.textMuted)}>
        <Terminal className="h-4 w-4 shrink-0" />
        Run a query or check your answer to see messages.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {answerFeedback && (
        <div className={cn('border-b', wb.border)}>
          <p className={cn('px-4 pt-4 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Answer feedback</p>
          <SqlAnswerFeedbackPanel feedback={answerFeedback} />
        </div>
      )}
      {messages.length > 0 && (
        <pre className={cn('max-h-48 overflow-auto px-4 pb-4 font-mono text-sm leading-relaxed', wb.textSecondary)}>
          {messages.join('\n')}
        </pre>
      )}
    </div>
  )
}
