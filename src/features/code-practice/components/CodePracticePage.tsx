import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { sandbox } from '@/lib/sandboxInstance'
import { logPracticeMistake } from '@/lib/practice-mistakes'
import { CodeWorkbenchLayout } from './CodeWorkbenchLayout'
import { PracticeToolbar } from './PracticeToolbar'
import { ProblemPanel } from './ProblemPanel'
import { CodeEditorPanel } from './CodeEditorPanel'
import { OutputPanel } from './OutputPanel'
import { LivePreviewPanel } from './LivePreviewPanel'
import { TestResultsPanel } from './TestResultsPanel'
import { HintsPanel } from './HintsPanel'
import { OldMistakesPanel } from './OldMistakesPanel'
import { AttemptHistoryPanel } from './AttemptHistoryPanel'
import {
  CODE_PRACTICE_LANGUAGE_MODES,
  type CodePracticeAttempt,
  type CodePracticeEditorTheme,
  type CodePracticeLanguageMode,
  type CodePracticeTestResult,
} from '../types/codePractice.types'
import {
  getDefaultQuestionForLanguage,
  getQuestionById,
  getQuestionsForLanguage,
} from '../data/codeQuestions'
import { resolveStarterCode } from '../data/starterTemplates'
import { buildTestResults } from '../utils/resultComparator'
import { createExecutionTimer } from '../utils/executionTimer'
import { classifyRunError, toLegacyMistakeLanguage } from '../utils/mistakeClassifier'
import { cn } from '@/lib/utils'

const ATTEMPTS_KEY = 'codequest-code-practice-attempts'

function readAttempts(): CodePracticeAttempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CodePracticeAttempt[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAttempts(items: CodePracticeAttempt[]) {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(items.slice(0, 30)))
  } catch {
    /* ignore */
  }
}

function toSandboxLanguage(language: CodePracticeLanguageMode): 'python' | 'javascript' | null {
  if (language === 'python') return 'python'
  if (language === 'javascript' || language === 'react') return 'javascript'
  return null
}

export function CodePracticePage() {
  const [language, setLanguage] = useState<CodePracticeLanguageMode>('python')
  const [questionId, setQuestionId] = useState<string | null>(() => getDefaultQuestionForLanguage('python')?.id ?? null)
  const [code, setCode] = useState(() => resolveStarterCode('python', getDefaultQuestionForLanguage('python')?.id))
  const [theme, setTheme] = useState<CodePracticeEditorTheme>('vs-dark')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [consoleLines, setConsoleLines] = useState<string[]>([])
  const [testResults, setTestResults] = useState<CodePracticeTestResult[]>([])
  const [revealedHintCount, setRevealedHintCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [lastRunMs, setLastRunMs] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<CodePracticeAttempt[]>(() => readAttempts())
  const [mistakesRefreshKey, setMistakesRefreshKey] = useState(0)

  const languageMeta = useMemo(
    () => CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === language) ?? CODE_PRACTICE_LANGUAGE_MODES[0],
    [language],
  )

  const question = useMemo(() => (questionId ? getQuestionById(questionId) : null), [questionId])

  const languageQuestions = useMemo(() => getQuestionsForLanguage(language), [language])

  const loadLanguageQuestion = useCallback((nextLanguage: CodePracticeLanguageMode, nextQuestionId?: string | null) => {
    const defaultQ = getDefaultQuestionForLanguage(nextLanguage)
    const qid = nextQuestionId ?? defaultQ?.id ?? null
    setLanguage(nextLanguage)
    setQuestionId(qid)
    setCode(resolveStarterCode(nextLanguage, qid))
    setOutput('')
    setError(null)
    setConsoleLines([])
    setTestResults([])
    setRevealedHintCount(0)
    setLastRunMs(null)
  }, [])

  const handleLanguageChange = (next: CodePracticeLanguageMode) => {
    const mode = CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === next)
    if (mode?.status === 'coming-soon') {
      toast.message(`${mode.label} support is planned for a later phase.`)
      return
    }
    loadLanguageQuestion(next)
  }

  const handleQuestionSelect = (id: string) => {
    const q = getQuestionById(id)
    if (!q || q.language !== language) return
    setQuestionId(id)
    setCode(q.starterCode)
    setOutput('')
    setError(null)
    setTestResults([])
    setRevealedHintCount(0)
  }

  const handleReset = () => {
    if (!question) {
      setCode(resolveStarterCode(language))
      return
    }
    setCode(question.starterCode)
    setOutput('')
    setError(null)
    setTestResults([])
    toast.success('Starter code restored.')
  }

  const handleRun = async (): Promise<string> => {
    const execLang = toSandboxLanguage(language)
    if (!execLang) {
      toast.message('Execution for this language is planned for a later phase.')
      return ''
    }

    setIsRunning(true)
    setError(null)
    setOutput('Running…')
    const timer = createExecutionTimer()

    try {
      const result = await sandbox.execute(code, execLang)
      const elapsed = timer.elapsedMs()
      setLastRunMs(elapsed)

      if (result.error) {
        const msg = result.error
        setError(msg)
        setOutput('')
        setConsoleLines([`[${classifyRunError(msg)}] ${msg}`])
        const legacyLang = toLegacyMistakeLanguage(language)
        if (legacyLang) {
          logPracticeMistake(legacyLang, msg, code)
          setMistakesRefreshKey((k) => k + 1)
        }
        toast.error('Run failed — see output panel.')
        return ''
      }

      const out = result.output || '(no output)'
      setOutput(out)
      setConsoleLines(out.split('\n').filter(Boolean))
      toast.success(`Finished in ${elapsed} ms`)
      return out
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Execution failed'
      setError(msg)
      setOutput('')
      toast.error(msg)
      return ''
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!question) {
      toast.error('Select a question with a sample case first.')
      return
    }

    const actual = await handleRun()
    const results = buildTestResults(actual, question.expectedOutput)
    setTestResults(results)

    if (results[0]?.passed) {
      toast.success('Sample case passed!')
    } else if (actual) {
      toast.error('Sample case did not match expected output.')
      const legacyLang = toLegacyMistakeLanguage(language)
      if (legacyLang) {
        logPracticeMistake(legacyLang, results[0]?.message ?? 'Wrong output', code)
        setMistakesRefreshKey((k) => k + 1)
      }
    }
  }

  const handleSaveAttempt = () => {
    const entry: CodePracticeAttempt = {
      id: `${Date.now()}`,
      questionId: questionId ?? 'freeform',
      language,
      code,
      output,
      passed: testResults.some((t) => t.passed),
      durationMs: lastRunMs ?? 0,
      createdAt: new Date().toISOString(),
    }
    const next = [entry, ...readAttempts()]
    writeAttempts(next)
    setAttempts(next)
    toast.success('Attempt saved locally.')
  }

  useEffect(() => {
    setAttempts(readAttempts())
  }, [])

  const questionPicker = languageQuestions.length > 0 ? (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-4 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Question</span>
      {languageQuestions.map((q) => (
        <button
          key={q.id}
          type="button"
          onClick={() => handleQuestionSelect(q.id)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs transition-colors',
            questionId === q.id
              ? 'bg-violet-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200',
          )}
        >
          {q.title}
        </button>
      ))}
    </div>
  ) : null

  return (
    <CodeWorkbenchLayout
      toolbar={
        <PracticeToolbar
          language={language}
          theme={theme}
          isRunning={isRunning}
          onLanguageChange={handleLanguageChange}
          onThemeChange={setTheme}
          onRun={() => void handleRun()}
          onSubmit={() => void handleSubmit()}
          onReset={handleReset}
          onSaveAttempt={handleSaveAttempt}
        />
      }
      questionPicker={questionPicker}
      problemPanel={
        <ProblemPanel question={question} languageLabel={languageMeta.label} />
      }
      editorPanel={
        <CodeEditorPanel
          code={code}
          languageId={language}
          monacoLanguage={languageMeta.monacoLanguage}
          onChange={setCode}
        />
      }
      outputPanel={
        <OutputPanel
          output={output}
          error={error}
          consoleLines={consoleLines}
          lastRunMs={lastRunMs}
        />
      }
      livePreview={<LivePreviewPanel language={language} />}
      testResults={<TestResultsPanel results={testResults} />}
      hints={
        <HintsPanel
          hints={question?.hints ?? []}
          revealedCount={revealedHintCount}
          onRevealNext={() => setRevealedHintCount((c) => Math.min(c + 1, question?.hints.length ?? 0))}
        />
      }
      mistakes={<OldMistakesPanel refreshKey={mistakesRefreshKey} />}
      attemptHistory={<AttemptHistoryPanel attempts={attempts} />}
    />
  )
}
