import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Database,
  Coffee,
  FileCode2,
  Keyboard,
  LayoutGrid,
  Sparkles,
} from 'lucide-react'

import { MistakesReviewPanel } from '@/components/practice-ground/MistakesReviewPanel'
import {
  isCodeSection,
  PRACTICE_GROUND_SECTIONS,
  type CodePracticeLanguage,
  type PracticeGroundSection,
} from '@/components/practice-ground/practice-ground-types'
import { PracticePage } from '@/components/pages/PracticePage'
import { TypingTrainerPage } from '@/components/pages/TypingTrainerPage'
import { fetchTypingAttempts } from '@/lib/api'
import { listPracticeMistakes } from '@/lib/practice-mistakes'
import { cn } from '@/lib/utils'

const SECTION_ICONS: Record<PracticeGroundSection, React.ReactNode> = {
  typing: <Keyboard className="h-4 w-4" aria-hidden />,
  sql: <Database className="h-4 w-4" aria-hidden />,
  java: <Coffee className="h-4 w-4" aria-hidden />,
  python: <FileCode2 className="h-4 w-4" aria-hidden />,
  mistakes: <AlertTriangle className="h-4 w-4" aria-hidden />,
}

interface CodePracticeGroundPageProps {
  section: PracticeGroundSection
  onSectionChange: (section: PracticeGroundSection) => void
  retryCode: string | null
  onRetryFromMistakes: (language: CodePracticeLanguage, code: string) => void
  onRetryConsumed: () => void
}

export function CodePracticeGroundPage({
  section,
  onSectionChange,
  retryCode,
  onRetryFromMistakes,
  onRetryConsumed,
}: CodePracticeGroundPageProps) {
  const [mistakeCount, setMistakeCount] = useState(() => listPracticeMistakes().length)
  const [latestWpm, setLatestWpm] = useState<number | null>(null)

  const refreshMistakeCount = useCallback(() => {
    setMistakeCount(listPracticeMistakes().length)
  }, [])

  useEffect(() => {
    void fetchTypingAttempts(1)
      .then((rows) => setLatestWpm(rows[0]?.wpm ?? null))
      .catch(() => setLatestWpm(null))
  }, [section])

  useEffect(() => {
    if (section === 'mistakes') refreshMistakeCount()
  }, [section, refreshMistakeCount])

  const activeMeta = useMemo(
    () => PRACTICE_GROUND_SECTIONS.find((item) => item.id === section) ?? PRACTICE_GROUND_SECTIONS[0],
    [section],
  )

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <header className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-600">
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                Unified practice hub
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Code Practice Ground
              </h1>
              <p className="max-w-2xl text-sm text-slate-500 md:text-base">
                Typing, SQL, Java, Python, and mistake review — one place to build speed and accuracy.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatChip label="Latest WPM" value={latestWpm !== null ? `${latestWpm}` : '—'} />
              <StatChip
                label="Mistakes"
                value={String(mistakeCount)}
                tone={mistakeCount > 0 ? 'amber' : 'neutral'}
              />
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <nav
            className="lg:w-56 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm"
            aria-label="Practice sections"
          >
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Practice areas
            </p>
            <ul className="space-y-0.5">
              {PRACTICE_GROUND_SECTIONS.map((item) => {
                const active = section === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-testid={`practice-section-${item.id}`}
                      onClick={() => onSectionChange(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                        active
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      )}
                    >
                      {SECTION_ICONS[item.id]}
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.id === 'mistakes' && mistakeCount > 0 ? (
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                            active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800',
                          )}
                        >
                          {mistakeCount}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm md:px-5">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" aria-hidden />
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{activeMeta.label}</h2>
                  <p className="text-xs text-slate-500 md:text-sm">{activeMeta.description}</p>
                </div>
              </div>
            </div>

            {section === 'typing' ? <TypingTrainerPage embedded /> : null}

            {section === 'mistakes' ? (
              <MistakesReviewPanel
                onRetry={(language, code) => {
                  onRetryFromMistakes(language, code)
                  refreshMistakeCount()
                }}
              />
            ) : null}

            {isCodeSection(section) ? (
              <PracticePage
                key={section}
                embedded
                initialLanguage={section}
                retryCode={retryCode}
                onRetryConsumed={onRetryConsumed}
                onMistakeLogged={refreshMistakeCount}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatChip({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'amber'
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2 text-center min-w-[5.5rem]',
        tone === 'amber'
          ? 'border-amber-200 bg-amber-50'
          : 'border-slate-200 bg-slate-50',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={cn(
          'text-lg font-bold tabular-nums',
          tone === 'amber' ? 'text-amber-800' : 'text-slate-900',
        )}
      >
        {value}
      </p>
    </div>
  )
}
