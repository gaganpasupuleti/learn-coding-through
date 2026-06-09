import { CODE_PRACTICE_LANGUAGE_MODES, type CodePracticeLanguageMode } from '../types/codePractice.types'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  value: CodePracticeLanguageMode
  onChange: (language: CodePracticeLanguageMode) => void
  onComingSoon?: (language: CodePracticeLanguageMode) => void
}

export function LanguageSelector({ value, onChange, onComingSoon }: LanguageSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {CODE_PRACTICE_LANGUAGE_MODES.map((mode) => {
        const active = value === mode.id
        const comingSoon = mode.status === 'coming-soon'
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => {
              if (comingSoon) {
                onComingSoon?.(mode.id)
                return
              }
              onChange(mode.id)
            }}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              active && !comingSoon
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
              comingSoon && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-500',
            )}
            title={comingSoon ? `${mode.label} — Judge0-backed execution coming later` : mode.label}
          >
            {mode.label}
            {comingSoon ? ' · soon' : ''}
          </button>
        )
      })}
    </div>
  )
}
