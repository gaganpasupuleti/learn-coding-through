import { CODE_PRACTICE_LANGUAGE_MODES, type CodePracticeLanguageMode } from '../types/codePractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  value: CodePracticeLanguageMode
  onChange: (language: CodePracticeLanguageMode) => void
  onComingSoon?: (language: CodePracticeLanguageMode) => void
}

export function LanguageSelector({ value, onChange, onComingSoon }: LanguageSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
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
              'rounded-md px-3.5 py-2 text-sm font-medium transition-all',
              active && !comingSoon && wb.langActive,
              !active && !comingSoon && wb.langInactive,
              comingSoon && `${wb.langSoon} px-3 py-1.5 text-xs`,
            )}
            title={
              comingSoon
                ? `${mode.label} — execution coming in a later phase`
                : mode.id === 'java'
                  ? `${mode.label} — backend JDK (javac + java)`
                  : mode.label
            }
          >
            {mode.label}
            {comingSoon ? ' · soon' : ''}
          </button>
        )
      })}
    </div>
  )
}
