import { Terminal } from 'lucide-react'
import type { SqlAnswerFeedback } from '../types/sqlPractice.types'
import { isSqlExecutionErrorMessage } from '../utils/sqlExecutionMessages'
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
        <div className="space-y-3 px-4 pb-4">
          {messages.map((line, index) => {
            const isErrorLine = index === 0 && isSqlExecutionErrorMessage(line)
            const isHelperLine = index > 0
            return (
              <p
                key={`${index}-${line.slice(0, 24)}`}
                className={cn(
                  'font-mono text-sm leading-relaxed',
                  isErrorLine && 'text-rose-200',
                  isHelperLine && 'rounded-lg border border-amber-700/40 bg-amber-950/25 p-3 text-amber-100',
                  !isErrorLine && !isHelperLine && wb.textSecondary,
                )}
              >
                {line}
              </p>
            )
          })}
        </div>
      )}
    </div>
  )
}
