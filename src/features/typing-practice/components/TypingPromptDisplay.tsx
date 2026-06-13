import { cn } from '@/lib/utils'
import { wb } from '@/lib/workbench-theme'

interface TypingPromptDisplayProps {
  source: string
  typed: string
  emptyLabel?: string
}

export function TypingPromptDisplay({ source, typed, emptyLabel }: TypingPromptDisplayProps) {
  if (!source) {
    return (
      <p className={cn('p-4 text-sm', wb.textMuted)}>
        {emptyLabel ?? 'Choose a mode and press Start to load a typing challenge.'}
      </p>
    )
  }

  return (
    <pre
      className={cn(
        'max-h-[min(360px,42dvh)] overflow-auto p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap select-none md:text-base',
        wb.cardMono,
        'border-0 bg-transparent',
      )}
      aria-label="Typing prompt"
    >
      {source.split('').map((char, index) => {
        if (index < typed.length) {
          const isCorrect = typed[index] === char
          return (
            <span
              key={`${index}-${char}`}
              className={isCorrect ? 'text-emerald-400' : 'rounded-sm bg-red-950/60 text-red-300'}
            >
              {char}
            </span>
          )
        }
        if (index === typed.length) {
          return (
            <span key={`${index}-${char}`} className="rounded-sm bg-sky-500/35 text-sky-50">
              {char}
            </span>
          )
        }
        return (
          <span key={`${index}-${char}`} className={wb.textMuted}>
            {char}
          </span>
        )
      })}
    </pre>
  )
}
