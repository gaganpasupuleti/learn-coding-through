import { CODE_PRACTICE_LANGUAGE_MODES, type CodePracticeLanguageMode } from '../types/codePractice.types'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  value: CodePracticeLanguageMode
  onChange: (language: CodePracticeLanguageMode) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {CODE_PRACTICE_LANGUAGE_MODES.map((mode) => {
        const active = value === mode.id
        const disabled = mode.status === 'coming-soon'
        return (
          <button
            key={mode.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(mode.id)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
              disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-slate-400',
            )}
            title={disabled ? `${mode.label} — coming in a later phase` : mode.label}
          >
            {mode.label}
            {disabled ? ' · soon' : ''}
          </button>
        )
      })}
    </div>
  )
}
