import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, Timer, FileCode2, TextCursorInput } from 'lucide-react'
import {
  createTypingAttempt,
  fetchTypingAttempts,
  type TypingAttempt,
  type TypingMode,
  type TypingTestType,
} from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import { toast } from 'sonner'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type CodeLanguage = 'python' | 'javascript' | 'java' | 'sql'

interface TypingMetrics {
  wpm: number
  rawWpm: number
  accuracy: number
  errors: number
  elapsedSeconds: number
  correctChars: number
}

const TIMED_OPTIONS = [1, 3, 5, 0] as const
const PAGE_OPTIONS = [1, 2, 3] as const

const SENTENCE_PARAGRAPHS = [
  'Thank you for sharing your application materials. I reviewed your project portfolio and was impressed by the clarity of your documentation and the measurable impact of your final capstone.',
  'I am writing to confirm your interview slot for Monday at 10:30 AM. Please join ten minutes early and keep your project links and a short self introduction ready.',
  'During the internship you will collaborate with design, product, and engineering teams. Strong communication and consistent delivery will be important for success in this role.',
  'Your next goal is to improve writing speed while maintaining professional quality. Focus on punctuation, sentence rhythm, and correcting mistakes without stopping your flow.',
]

const CODE_SNIPPETS: Record<CodeLanguage, string[]> = {
  python: [
    'def merge_scores(scores_a, scores_b):\n    merged = []\n    left = 0\n    right = 0\n\n    while left < len(scores_a) and right < len(scores_b):\n        if scores_a[left] <= scores_b[right]:\n            merged.append(scores_a[left])\n            left += 1\n        else:\n            merged.append(scores_b[right])\n            right += 1\n\n    merged.extend(scores_a[left:])\n    merged.extend(scores_b[right:])\n    return merged',
    'def summarize_projects(projects):\n    total = len(projects)\n    completed = [item for item in projects if item["status"] == "completed"]\n    avg_score = sum(item["score"] for item in completed) / max(len(completed), 1)\n\n    return {\n        "total": total,\n        "completed": len(completed),\n        "average_score": round(avg_score, 2),\n    }',
  ],
  javascript: [
    'export function createProgressReport(entries) {\n  const summary = entries.reduce((acc, entry) => {\n    acc.total += 1\n    if (entry.completed) {\n      acc.completed += 1\n      acc.points += entry.points\n    }\n    return acc\n  }, { total: 0, completed: 0, points: 0 })\n\n  return {\n    ...summary,\n    completionRate: summary.total ? Math.round((summary.completed / summary.total) * 100) : 0,\n  }\n}',
    'async function fetchRoleSuggestions(api, roleId) {\n  try {\n    const response = await api.get(`/roles/${roleId}/suggestions`)\n    if (!response.ok) throw new Error("Request failed")\n    const data = await response.json()\n    return data.suggestions ?? []\n  } catch (error) {\n    console.error("Unable to fetch suggestions", error)\n    return []\n  }\n}',
  ],
  java: [
    'public class Scheduler {\n    public static int findAvailableSlot(int[] sessions, int targetMinutes) {\n        int current = 0;\n\n        for (int minutes : sessions) {\n            current += minutes;\n            if (current >= targetMinutes) {\n                return current;\n            }\n        }\n\n        return -1;\n    }\n}',
    'import java.util.List;\n\npublic class SkillTracker {\n    public static double averageScore(List<Integer> scores) {\n        if (scores.isEmpty()) {\n            return 0;\n        }\n\n        int total = 0;\n        for (int score : scores) {\n            total += score;\n        }\n\n        return (double) total / scores.size();\n    }\n}',
  ],
  sql: [
    'SELECT\n  s.full_name,\n  r.role_name,\n  p.completion_percentage,\n  p.last_updated\nFROM student_progress p\nJOIN students s ON s.id = p.student_id\nJOIN roles r ON r.id = p.role_id\nWHERE p.completion_percentage >= 70\nORDER BY p.completion_percentage DESC, s.full_name ASC;',
    'WITH monthly_scores AS (\n  SELECT\n    student_id,\n    DATE_TRUNC(\'month\', attempt_date) AS score_month,\n    AVG(score) AS avg_score\n  FROM typing_attempts\n  GROUP BY student_id, DATE_TRUNC(\'month\', attempt_date)\n)\nSELECT\n  student_id,\n  score_month,\n  ROUND(avg_score, 2) AS avg_score\nFROM monthly_scores\nORDER BY score_month DESC;',
  ],
}

function pickRandomItem<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

function expandTextToTarget(baseChunks: string[], targetChars: number): string {
  const result: string[] = []
  let currentLength = 0
  while (currentLength < targetChars) {
    const chunk = pickRandomItem(baseChunks)
    result.push(chunk)
    currentLength += chunk.length + 2
  }
  return result.join('\n\n').slice(0, targetChars)
}

function buildPrompt(
  mode: TypingMode,
  codeLanguage: CodeLanguage,
  testType: TypingTestType,
  option: number,
): string {
  if (testType === 'length') {
    const targetChars = option * 900
    if (mode === 'sentence') {
      return expandTextToTarget(SENTENCE_PARAGRAPHS, targetChars)
    }
    return expandTextToTarget(CODE_SNIPPETS[codeLanguage], targetChars)
  }

  const timedTargetChars = option === 0 ? 6000 : option * 500
  if (mode === 'sentence') {
    return expandTextToTarget(SENTENCE_PARAGRAPHS, timedTargetChars)
  }
  return expandTextToTarget(CODE_SNIPPETS[codeLanguage], timedTargetChars)
}

function calculateTypingMetrics(sourceText: string, typedText: string, elapsedSeconds: number): TypingMetrics {
  const safeElapsedSeconds = Math.max(elapsedSeconds, 1)
  const typedLength = typedText.length
  const comparedLength = Math.min(sourceText.length, typedLength)

  let correctChars = 0
  for (let index = 0; index < comparedLength; index += 1) {
    if (typedText[index] === sourceText[index]) {
      correctChars += 1
    }
  }

  const overflowErrors = Math.max(typedLength - sourceText.length, 0)
  const errors = Math.max(typedLength - correctChars, 0) + overflowErrors
  const minutes = safeElapsedSeconds / 60
  const rawWpm = Number(((typedLength / 5) / minutes).toFixed(2))
  const wpm = Number(((correctChars / 5) / minutes).toFixed(2))
  const accuracy = typedLength > 0 ? Number(((correctChars / typedLength) * 100).toFixed(2)) : 0

  return {
    wpm,
    rawWpm,
    accuracy,
    errors,
    elapsedSeconds: safeElapsedSeconds,
    correctChars,
  }
}

function getUpcomingPromptSegment(sourceText: string, typedLength: number, windowSize = 220): string {
  if (!sourceText) return ''

  const start = Math.max(0, typedLength)
  const end = Math.min(sourceText.length, start + windowSize)
  const visible = sourceText.slice(start, end)

  if (!visible) {
    return 'Completed. Great work!'
  }

  return end < sourceText.length ? `${visible}...` : visible
}

function HighlightedPrompt({ source, typed }: { source: string; typed: string }) {
  if (!source) {
    return <p className="p-4 text-sm text-slate-400">Click Start Test to generate prompt text.</p>
  }
  return (
    <pre className="p-4 text-sm md:text-base font-mono whitespace-pre-wrap max-h-[360px] overflow-auto leading-relaxed select-none">
      {source.split('').map((char, i) => {
        if (i < typed.length) {
          return (
            <span key={i} className={typed[i] === char ? 'text-green-600' : 'bg-red-100 text-red-600'}>
              {char}
            </span>
          )
        }
        if (i === typed.length) {
          return (
            <span key={i} className="bg-blue-200 text-slate-900 rounded-sm">
              {char}
            </span>
          )
        }
        return <span key={i} className="text-slate-400">{char}</span>
      })}
    </pre>
  )
}

export function TypingTrainerPage() {
  const isMobile = useIsMobile()
  const [mode, setMode] = useState<TypingMode>('sentence')
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('python')
  const [testType, setTestType] = useState<TypingTestType>('timed')
  const [timedOption, setTimedOption] = useState<number>(1)
  const [pageOption, setPageOption] = useState<number>(1)

  const [sourceText, setSourceText] = useState('')
  const [typedText, setTypedText] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [history, setHistory] = useState<TypingAttempt[]>([])
  const [lastResult, setLastResult] = useState<TypingMetrics | null>(null)
  const [isTypingFocused, setIsTypingFocused] = useState(false)

  const typingAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const isFinishingRef = useRef(false)

  const selectedOption = testType === 'timed' ? timedOption : pageOption

  const loadHistory = useCallback(async () => {
    try {
      const records = await fetchTypingAttempts(20)
      setHistory(records)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load typing history'
      toast.error(message)
    }
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const finishAttempt = useCallback(async (autoSubmit = false) => {
    if (!isRunning || isFinishingRef.current) {
      return
    }

    isFinishingRef.current = true
    setIsRunning(false)

    const metrics = calculateTypingMetrics(sourceText, typedText, elapsedSeconds)
    setLastResult(metrics)
    setIsSaving(true)

    try {
      await createTypingAttempt({
        mode,
        test_type: testType,
        test_option: testType === 'timed' ? (selectedOption === 0 ? 'unlimited' : `${selectedOption}m`) : `${selectedOption}p`,
        language: mode === 'code' ? codeLanguage : undefined,
        prompt_text: sourceText,
        typed_text: typedText,
        wpm: metrics.wpm,
        raw_wpm: metrics.rawWpm,
        accuracy: metrics.accuracy,
        error_count: metrics.errors,
        elapsed_seconds: metrics.elapsedSeconds,
      })

      await loadHistory()
      toast.success(autoSubmit ? 'Time is up. Result saved.' : 'Typing result saved.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save typing attempt'
      toast.error(message)
    } finally {
      setIsSaving(false)
      isFinishingRef.current = false
    }
  }, [
    codeLanguage,
    elapsedSeconds,
    isRunning,
    loadHistory,
    mode,
    selectedOption,
    sourceText,
    testType,
    typedText,
  ])

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1)
      if (testType === 'timed' && selectedOption !== 0) {
        setRemainingSeconds((value) => {
          if (value <= 1) {
            window.setTimeout(() => {
              void finishAttempt(true)
            }, 0)
            return 0
          }
          return value - 1
        })
      }
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [finishAttempt, isRunning, testType, selectedOption])

  const startAttempt = () => {
    const generatedPrompt = buildPrompt(mode, codeLanguage, testType, selectedOption)
    setSourceText(generatedPrompt)
    setTypedText('')
    setElapsedSeconds(0)
    setLastResult(null)
    isFinishingRef.current = false

    if (testType === 'timed') {
      setRemainingSeconds(selectedOption * 60)
    } else {
      setRemainingSeconds(0)
    }

    setIsRunning(true)
    window.setTimeout(() => {
      typingAreaRef.current?.focus()
    }, 40)
  }

  const liveMetrics = useMemo(() => {
    return calculateTypingMetrics(sourceText, typedText, elapsedSeconds)
  }, [elapsedSeconds, sourceText, typedText])

  const completionPct = sourceText.length > 0
    ? Math.min(100, Number(((typedText.length / sourceText.length) * 100).toFixed(1)))
    : 0

  const chartData = useMemo(() => {
    return history
      .slice(0, 10)
      .reverse()
      .map((attempt, index) => ({
        index: index + 1,
        wpm: attempt.wpm,
        accuracy: attempt.accuracy,
      }))
  }, [history])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Typing Trainer</h1>
        <p className="text-slate-500">Practice sentence and code typing with live speed metrics and history.</p>
        <p className="text-sm text-slate-400">Saving attempts to your profile requires a signed-in session and the CodeQuest API.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-2">Mode</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('sentence')}
                className={`px-4 py-2 text-sm rounded-md border ${mode === 'sentence' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Sentence
              </button>
              <button
                type="button"
                onClick={() => setMode('code')}
                className={`px-4 py-2 text-sm rounded-md border ${mode === 'code' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Code
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-2">Test Type</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTestType('timed')}
                className={`px-4 py-2 text-sm rounded-md border ${testType === 'timed' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Timed
              </button>
              <button
                type="button"
                onClick={() => setTestType('length')}
                className={`px-4 py-2 text-sm rounded-md border ${testType === 'length' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Page
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-2">Options</p>
            <div className="flex gap-2">
              {(testType === 'timed' ? TIMED_OPTIONS : PAGE_OPTIONS).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => testType === 'timed' ? setTimedOption(option) : setPageOption(option)}
                  className={`px-4 py-2 text-sm rounded-md border ${selectedOption === option ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
                >
                  {testType === 'timed' ? (option === 0 ? '∞' : `${option} min`) : `${option} page`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-2">Code Language</p>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
              value={codeLanguage}
              onChange={(event) => setCodeLanguage(event.target.value as CodeLanguage)}
              disabled={mode !== 'code'}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="sql">SQL</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startAttempt}
            disabled={isRunning}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isRunning ? 'Test Running' : 'Start Test'}
          </button>

          <button
            type="button"
            onClick={() => { void finishAttempt(false) }}
            disabled={!isRunning || isSaving}
            className="px-4 py-2 text-sm font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Finish Test
          </button>

          {testType === 'timed' && (
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
              <Timer size={14} />
              {selectedOption === 0
                ? `Elapsed: ${elapsedSeconds}s`
                : `Remaining: ${Math.max(remainingSeconds, 0)}s`}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800 inline-flex items-center gap-2">
              {mode === 'sentence' ? <TextCursorInput size={15} /> : <FileCode2 size={15} />} Prompt
            </span>
            <span className="text-xs text-slate-500">{sourceText.length} chars</span>
          </div>
          <HighlightedPrompt source={sourceText} typed={typedText} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800 inline-flex items-center gap-2"><Keyboard size={15} /> Your Typing</span>
            <span className="text-xs text-slate-500">Progress: {completionPct}%</span>
          </div>

          {isMobile && sourceText.length > 0 && isRunning && (
            <div className="px-4 py-3 border-b border-blue-100 bg-blue-50">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Next To Type</p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-[13px] leading-5 text-blue-900 max-h-24 overflow-auto">
                {getUpcomingPromptSegment(sourceText, typedText.length)}
              </pre>
            </div>
          )}

          <textarea
            ref={typingAreaRef}
            value={typedText}
            onChange={(event) => {
              const next = event.target.value
              setTypedText(next)
              if (isRunning && testType === 'length' && sourceText.length > 0 && next.length >= sourceText.length) {
                window.setTimeout(() => {
                  void finishAttempt(true)
                }, 0)
              }
            }}
            disabled={!isRunning}
            onFocus={() => setIsTypingFocused(true)}
            onBlur={() => setIsTypingFocused(false)}
            className={`w-full p-4 font-mono text-slate-700 border-0 focus:outline-none resize-none disabled:bg-slate-50 ${isMobile ? 'h-[34dvh] min-h-[200px] text-[15px] leading-6' : 'h-[360px] text-sm md:text-base'}`}
            placeholder={isRunning ? 'Start typing here...' : 'Start a test to begin typing'}
            spellCheck={false}
          />

          {isMobile && isTypingFocused && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
              Tip: keep this field focused and follow the "Next To Type" strip above.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">WPM</p>
          <p className="text-2xl font-bold text-slate-900">{liveMetrics.wpm}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Raw WPM</p>
          <p className="text-2xl font-bold text-slate-900">{liveMetrics.rawWpm}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Accuracy</p>
          <p className="text-2xl font-bold text-slate-900">{liveMetrics.accuracy}%</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Errors</p>
          <p className="text-2xl font-bold text-slate-900">{liveMetrics.errors}</p>
        </div>
      </div>

      {lastResult && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <h3 className="text-sm font-semibold text-green-900">Last Result</h3>
          <p className="text-sm text-green-800 mt-1">
            WPM {lastResult.wpm}, Accuracy {lastResult.accuracy}% with {lastResult.errors} errors in {lastResult.elapsedSeconds}s.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Recent Trend (last 10 attempts)</h3>
        {chartData.length > 1 ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis yAxisId="left" domain={[0, 120]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="wpm" stroke="#2563eb" strokeWidth={2} name="WPM" />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#16a34a" strokeWidth={2} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Complete at least two tests to see trend lines.</p>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Mode</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Option</th>
                <th className="py-2 pr-3">WPM</th>
                <th className="py-2 pr-3">Accuracy</th>
                <th className="py-2 pr-3">Errors</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 8).map((attempt) => (
                <tr key={attempt.id} className="border-b border-slate-50 last:border-b-0 text-slate-700">
                  <td className="py-2 pr-3">{attempt.mode}</td>
                  <td className="py-2 pr-3">{attempt.test_type}</td>
                  <td className="py-2 pr-3">{attempt.test_option}</td>
                  <td className="py-2 pr-3">{attempt.wpm}</td>
                  <td className="py-2 pr-3">{attempt.accuracy}%</td>
                  <td className="py-2 pr-3">{attempt.error_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <p className="text-sm text-slate-500 py-3">No attempts yet. Start your first typing test.</p>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
