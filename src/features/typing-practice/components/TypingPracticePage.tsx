import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Keyboard,
  RotateCcw,
  SkipForward,
  Sparkles,
  Timer,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { wb } from '@/lib/workbench-theme'
import { useIsMobile } from '@/hooks/use-mobile'
import { toast } from 'sonner'
import {
  buildMistakeReviewSample,
  getTypingSampleById,
  pickTypingSample,
} from '../data/typingSamples'
import {
  calculateTypingMetrics,
  finalizeTypingSession,
  getUpcomingPromptSegment,
  resolveFinishTypedText,
} from '../utils/typingMetrics'
import {
  clearTypingMistakes,
  filterMistakesForSnippet,
  getRecentTypingMistakes,
  getRecentTypingSessions,
  recordTypingMistakes,
  recordTypingSession,
} from '../utils/typingMistakes'
import type {
  TypingCodeLanguage,
  TypingCompletionSummary,
  TypingDifficulty,
  TypingPracticeMode,
  TypingSample,
  TypingSessionMistake,
} from '../types/typingPractice.types'
import { TypingPromptDisplay } from './TypingPromptDisplay'

const CODE_LANGUAGES: Array<{ id: TypingCodeLanguage; label: string }> = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
  { id: 'sql', label: 'SQL (typing only)' },
]

const MODES: Array<{ id: TypingPracticeMode; label: string }> = [
  { id: 'text', label: 'Normal text' },
  { id: 'code', label: 'Code typing' },
  { id: 'mistake-review', label: 'Mistake review' },
]

const DIFFICULTIES: Array<{ id: TypingDifficulty; label: string }> = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'mid', label: 'Mid-level' },
]

interface TypingPracticePageProps {
  embedded?: boolean
}

export function TypingPracticePage({ embedded = false }: TypingPracticePageProps) {
  const isMobile = useIsMobile()
  const [mode, setMode] = useState<TypingPracticeMode>('text')
  const [language, setLanguage] = useState<TypingCodeLanguage>('python')
  const [difficulty, setDifficulty] = useState<TypingDifficulty>('beginner')
  const [activeSample, setActiveSample] = useState<TypingSample | null>(null)
  const [typedText, setTypedText] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [completionSummary, setCompletionSummary] = useState<TypingCompletionSummary | null>(null)
  const [sessionMistakeCount, setSessionMistakeCount] = useState(0)
  const [oldMistakes, setOldMistakes] = useState(getRecentTypingMistakes(20))
  const [recentSessions, setRecentSessions] = useState(getRecentTypingSessions(8))
  const [selectedRetrySnippetId, setSelectedRetrySnippetId] = useState<string | null>(null)

  const typingAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const recordedMistakePositions = useRef<Set<number>>(new Set())
  const isFinishingRef = useRef(false)

  const sourceText = activeSample?.text ?? ''

  const refreshStoragePanels = useCallback(() => {
    setOldMistakes(getRecentTypingMistakes(20))
    setRecentSessions(getRecentTypingSessions(8))
  }, [])

  const startSample = useCallback((sample: TypingSample | null) => {
    setActiveSample(sample)
    setTypedText('')
    setElapsedSeconds(0)
    setCompletionSummary(null)
    setSessionMistakeCount(0)
    recordedMistakePositions.current = new Set()
    isFinishingRef.current = false
    setIsRunning(Boolean(sample))
    if (sample) {
      window.setTimeout(() => typingAreaRef.current?.focus(), 40)
    }
  }, [])

  const loadNextSample = useCallback(() => {
    if (mode === 'mistake-review') {
      const mistake = oldMistakes.find((item) => item.snippetId === selectedRetrySnippetId) ?? oldMistakes[0]
      if (!mistake) {
        toast.message('No saved mistakes yet. Complete a typing drill to build your review queue.')
        return
      }
      const sample = buildMistakeReviewSample([
        {
          snippetId: mistake.snippetId,
          snippetText: getTypingSampleById(mistake.snippetId)?.text ?? '',
          language: mistake.language,
        },
      ])
      startSample(sample)
      return
    }

    const sampleMode = mode === 'code' ? 'code' : 'text'
    const sample = pickTypingSample(sampleMode, language, difficulty, activeSample ? [activeSample.id] : [])
    if (!sample) {
      toast.error('No typing sample found for the current filters.')
      return
    }
    startSample(sample)
  }, [activeSample, difficulty, language, mode, oldMistakes, selectedRetrySnippetId, startSample])

  const finishSession = useCallback((typedTextOverride?: string) => {
    if (!isRunning || !activeSample || isFinishingRef.current) return
    isFinishingRef.current = true
    setIsRunning(false)

    const resolvedTypedText = resolveFinishTypedText(typedText, typedTextOverride)
    const { mistakePositions, summary } = finalizeTypingSession({
      sourceText,
      typedText: resolvedTypedText,
      elapsedSeconds,
    })
    setCompletionSummary(summary)

    if (mistakePositions.length > 0) {
      recordTypingMistakes(
        mistakePositions.map((mistake) => ({
          snippetId: activeSample.id,
          language: activeSample.language,
          expectedChar: mistake.expectedChar,
          typedChar: mistake.typedChar,
          position: mistake.position,
        })),
      )
    }

    recordTypingSession({
      mode,
      snippetId: activeSample.id,
      snippetTitle: activeSample.title,
      language: activeSample.language,
      difficulty: activeSample.difficulty,
      wpm: summary.wpm,
      accuracy: summary.accuracy,
      mistakeCount: summary.totalMistakes,
      elapsedSeconds: summary.elapsedSeconds,
    })

    refreshStoragePanels()
    toast.success('Typing session saved locally.')
    isFinishingRef.current = false
  }, [
    activeSample,
    elapsedSeconds,
    isRunning,
    mode,
    refreshStoragePanels,
    sourceText,
    typedText,
  ])

  useEffect(() => {
    if (!isRunning) return
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1)
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [isRunning])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'r') {
        event.preventDefault()
        if (activeSample) {
          startSample(activeSample)
          toast.message('Session restarted.')
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeSample, startSample])

  const liveMetrics = useMemo(
    () => calculateTypingMetrics({ sourceText, typedText, elapsedSeconds }),
    [elapsedSeconds, sourceText, typedText],
  )

  const handleTypedChange = (next: string) => {
    if (!isRunning || !activeSample) return

    const previousLength = typedText.length
    setTypedText(next)

    if (next.length > previousLength) {
      const index = next.length - 1
      const expected = sourceText[index]
      const typed = next[index]
      if (expected !== undefined && typed !== expected && !recordedMistakePositions.current.has(index)) {
        recordedMistakePositions.current.add(index)
        setSessionMistakeCount((count) => count + 1)
      }
    }

    if (sourceText.length > 0 && next.length >= sourceText.length) {
      window.setTimeout(() => finishSession(next), 0)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isRunning) return
    const nextIndex = typedText.length
    const expected = sourceText[nextIndex]
    if (event.key === 'Tab' && expected === '\t') {
      event.preventDefault()
      handleTypedChange(`${typedText}\t`)
    }
  }

  const retryMistake = (mistake: TypingSessionMistake) => {
    setMode('mistake-review')
    setSelectedRetrySnippetId(mistake.snippetId)
    const sample = buildMistakeReviewSample([
      {
        snippetId: mistake.snippetId,
        snippetText: getTypingSampleById(mistake.snippetId)?.text ?? '',
        language: mistake.language,
      },
    ])
    startSample(sample)
  }

  const handleClearMistakes = () => {
    const confirmed = window.confirm('Clear all saved typing mistakes from this browser?')
    if (!confirmed) return
    clearTypingMistakes()
    refreshStoragePanels()
    toast.success('Old typing mistakes cleared.')
  }

  const shellClass = embedded ? 'space-y-4' : cn('min-h-[calc(100vh-4rem)]', wb.root)
  const innerClass = embedded ? 'space-y-4' : 'mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 md:px-6'

  return (
    <div className={shellClass}>
      <div className={innerClass}>
        {!embedded ? (
          <header className="space-y-1">
            <h1 className={cn('text-2xl font-bold tracking-tight md:text-3xl', wb.textPrimary)}>
              Typing Practice
            </h1>
            <p className={cn('text-sm md:text-base', wb.textSecondary)}>
              Code-focused typing drills with live analytics, local mistake review, and beginner to mid-level snippets.
            </p>
            <p className={cn('text-xs', wb.textMuted)}>
              Progress and mistakes stay in localStorage on this device. SQL samples are typing-only — not connected to SQL Workbench execution.
            </p>
          </header>
        ) : null}

        <section className={cn('rounded-xl border p-4', wb.panel, wb.border)}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className={wb.sectionLabel}>Mode</p>
              <div className="flex flex-wrap gap-2">
                {MODES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors',
                      mode === item.id ? wb.langActive : wb.langInactive,
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className={wb.sectionLabel}>Language</p>
              <div className="flex flex-wrap gap-2">
                {CODE_LANGUAGES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={mode !== 'code'}
                    onClick={() => setLanguage(item.id)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors disabled:opacity-50',
                      language === item.id && mode === 'code' ? wb.langActive : wb.langInactive,
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className={wb.sectionLabel}>Difficulty</p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={mode === 'mistake-review'}
                    onClick={() => setDifficulty(item.id)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors disabled:opacity-50',
                      difficulty === item.id && mode !== 'mistake-review' ? wb.langActive : wb.langInactive,
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <button type="button" onClick={loadNextSample} className={cn(wb.toolbarBtn, 'bg-sky-600 text-white hover:bg-sky-500')}>
                <Sparkles size={15} />
                {isRunning ? 'New challenge' : 'Start'}
              </button>
              <button
                type="button"
                onClick={() => activeSample && startSample(activeSample)}
                disabled={!activeSample}
                className={wb.toolbarBtn}
              >
                <RotateCcw size={15} />
                Restart
              </button>
              <button
                type="button"
                onClick={() => finishSession()}
                disabled={!isRunning}
                className={wb.toolbarBtn}
              >
                Finish
              </button>
              <button type="button" onClick={loadNextSample} disabled={!activeSample} className={wb.toolbarBtn}>
                <SkipForward size={15} />
                Next
              </button>
            </div>
          </div>

          {activeSample ? (
            <div className={cn('mt-3 flex flex-wrap items-center gap-3 text-xs', wb.textMuted)}>
              <span className={cn('rounded-md border px-2 py-1', wb.border)}>{activeSample.title}</span>
              <span>{activeSample.language}</span>
              <span>{activeSample.difficulty}</span>
              <span className="inline-flex items-center gap-1">
                <Timer size={12} />
                {elapsedSeconds}s
              </span>
              <span>Ctrl+Shift+R restarts</span>
            </div>
          ) : null}
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className={cn('overflow-hidden rounded-xl border', wb.panel, wb.border)}>
            <div className={cn('flex items-center justify-between border-b px-4 py-3', wb.panelHeader, wb.border)}>
              <span className={cn('text-sm font-semibold', wb.textPrimary)}>Prompt</span>
              <span className={cn('text-xs', wb.textMuted)}>{sourceText.length} chars</span>
            </div>
            <TypingPromptDisplay source={sourceText} typed={typedText} />
          </div>

          <div className={cn('overflow-hidden rounded-xl border', wb.panel, wb.border)}>
            <div className={cn('flex items-center justify-between border-b px-4 py-3', wb.panelHeader, wb.border)}>
              <span className={cn('inline-flex items-center gap-2 text-sm font-semibold', wb.textPrimary)}>
                <Keyboard size={15} />
                Your typing
              </span>
              <span className={cn('text-xs', wb.textMuted)}>{liveMetrics.completionPct}%</span>
            </div>

            {isMobile && sourceText.length > 0 && isRunning ? (
              <div className="border-b border-sky-900/60 bg-sky-950/30 px-4 py-3">
                <p className="text-[11px] font-semibold tracking-wide text-sky-300 uppercase">Next to type</p>
                <pre className="mt-1 max-h-24 overflow-auto font-mono text-[13px] leading-5 whitespace-pre-wrap text-sky-100">
                  {getUpcomingPromptSegment(sourceText, typedText.length)}
                </pre>
              </div>
            ) : null}

            <textarea
              ref={typingAreaRef}
              value={typedText}
              onChange={(event) => handleTypedChange(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isRunning}
              spellCheck={false}
              className={cn(
                'w-full resize-none border-0 bg-transparent p-4 font-mono focus:outline-none disabled:opacity-60',
                wb.textPrimary,
                isMobile ? 'min-h-[200px] text-[15px] leading-6' : 'min-h-[360px] text-sm md:text-base',
              )}
              placeholder={isRunning ? 'Start typing here…' : 'Press Start to begin'}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {[
            { label: 'WPM', value: liveMetrics.wpm },
            { label: 'Accuracy', value: `${liveMetrics.accuracy}%` },
            { label: 'Correct', value: liveMetrics.correctChars },
            { label: 'Wrong', value: liveMetrics.wrongChars },
            { label: 'Mistakes', value: sessionMistakeCount },
            { label: 'Elapsed', value: `${liveMetrics.elapsedSeconds}s` },
            { label: 'Complete', value: `${liveMetrics.completionPct}%` },
          ].map((stat) => (
            <div key={stat.label} className={cn(wb.card, 'py-3')}>
              <p className={cn('text-xs tracking-wide uppercase', wb.textMuted)}>{stat.label}</p>
              <p className={cn('text-xl font-bold', wb.textPrimary)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {completionSummary ? (
          <section className={cn('rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4', wb.border)}>
            <h3 className="text-sm font-semibold text-emerald-200">Completion summary</h3>
            <p className="mt-1 text-sm text-emerald-100">
              WPM {completionSummary.wpm}, accuracy {completionSummary.accuracy}%, {completionSummary.totalMistakes} mistakes in {completionSummary.elapsedSeconds}s.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p className={cn('text-xs uppercase', wb.textMuted)}>Weak characters</p>
                <p className={cn('text-sm', wb.textSecondary)}>
                  {completionSummary.weakCharacters.length > 0
                    ? completionSummary.weakCharacters.map((item) => `${item.char} (${item.count})`).join(', ')
                    : 'None recorded'}
                </p>
              </div>
              <div>
                <p className={cn('text-xs uppercase', wb.textMuted)}>Weak tokens</p>
                <p className={cn('text-sm', wb.textSecondary)}>
                  {completionSummary.weakTokens.length > 0
                    ? completionSummary.weakTokens.map((item) => `${item.token} (${item.count})`).join(', ')
                    : 'None recorded'}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <section className={cn('rounded-xl border p-4', wb.panel, wb.border)}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={cn('text-sm font-semibold', wb.textPrimary)}>Session mistakes</h3>
              <span className={cn('text-xs', wb.textMuted)}>{sessionMistakeCount} this run</span>
            </div>
            {sessionMistakeCount === 0 ? (
              <p className={cn('text-sm', wb.textMuted)}>Mistakes appear here as you type.</p>
            ) : (
              <p className={cn('text-sm', wb.textSecondary)}>
                {sessionMistakeCount} character mistake{sessionMistakeCount === 1 ? '' : 's'} recorded for this session. Saved locally when you finish.
              </p>
            )}
          </section>

          <section className={cn('rounded-xl border p-4', wb.panel, wb.border)}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className={cn('inline-flex items-center gap-2 text-sm font-semibold', wb.textPrimary)}>
                <AlertTriangle size={15} />
                Old mistakes review
              </h3>
              <button type="button" onClick={handleClearMistakes} className={cn(wb.toolbarBtn, 'px-2 py-1 text-xs')}>
                <Trash2 size={13} />
                Clear
              </button>
            </div>
            {oldMistakes.length === 0 ? (
              <p className={cn('text-sm', wb.textMuted)}>No saved mistakes yet.</p>
            ) : (
              <ul className="space-y-2">
                {oldMistakes.slice(0, 8).map((mistake) => (
                  <li
                    key={mistake.id}
                    className={cn('flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm', wb.border, wb.card)}
                  >
                    <div className={cn('min-w-0', wb.textSecondary)}>
                      <p className="truncate font-medium">{mistake.snippetId}</p>
                      <p className={cn('text-xs', wb.textMuted)}>
                        expected "{mistake.expectedChar === '\n' ? '\\n' : mistake.expectedChar}" · got "{mistake.typedChar === '\n' ? '\\n' : mistake.typedChar}" · {mistake.language}
                      </p>
                    </div>
                    <button type="button" onClick={() => retryMistake(mistake)} className={cn(wb.toolbarBtn, 'shrink-0 px-2 py-1 text-xs')}>
                      Retry
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedRetrySnippetId ? (
              <p className={cn('mt-2 text-xs', wb.textMuted)}>
                Review queue: {filterMistakesForSnippet(selectedRetrySnippetId).length} saved mistakes for {selectedRetrySnippetId}
              </p>
            ) : null}
          </section>
        </div>

        <section className={cn('rounded-xl border p-4', wb.panel, wb.border)}>
          <h3 className={cn('mb-3 text-sm font-semibold', wb.textPrimary)}>Recent local sessions</h3>
          {recentSessions.length === 0 ? (
            <p className={cn('text-sm', wb.textMuted)}>Complete a drill to see local progress.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={cn('border-b text-left text-xs tracking-wide uppercase', wb.border, wb.textMuted)}>
                    <th className="py-2 pr-3">Snippet</th>
                    <th className="py-2 pr-3">Mode</th>
                    <th className="py-2 pr-3">Lang</th>
                    <th className="py-2 pr-3">WPM</th>
                    <th className="py-2 pr-3">Accuracy</th>
                    <th className="py-2 pr-3">Mistakes</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((session) => (
                    <tr key={session.id} className={cn('border-b last:border-b-0', wb.border, wb.textSecondary)}>
                      <td className="py-2 pr-3">{session.snippetTitle}</td>
                      <td className="py-2 pr-3">{session.mode}</td>
                      <td className="py-2 pr-3">{session.language}</td>
                      <td className="py-2 pr-3">{session.wpm}</td>
                      <td className="py-2 pr-3">{session.accuracy}%</td>
                      <td className="py-2 pr-3">{session.mistakeCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
