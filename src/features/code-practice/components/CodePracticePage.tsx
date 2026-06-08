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
import { buildTestResultsFromCases } from '../utils/resultComparator'
import { createExecutionTimer } from '../utils/executionTimer'
import { classifyRunError, toLegacyMistakeLanguage } from '../utils/mistakeClassifier'
import {
  prepareCodeForExecution,
  resolveQuestionTestCases,
  resolveRunStdin,
} from '../utils/executionAdapter'
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
  const [activeTestCaseId, setActiveTestCaseId] = useState<string | null>(null)
  const [runStdin, setRunStdin] = useState('')
  const [executionNote, setExecutionNote] = useState<string | null>(null)

  const languageMeta = useMemo(
    () => CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === language) ?? CODE_PRACTICE_LANGUAGE_MODES[0],
    [language],
  )

  const question = useMemo(() => (questionId ? getQuestionById(questionId) : null), [questionId])

  const languageQuestions = useMemo(() => getQuestionsForLanguage(language), [language])

  const syncQuestionContext = useCallback((qid: string | null, lang: CodePracticeLanguageMode) => {
    const q = qid ? getQuestionById(qid) : null
    const cases = q ? resolveQuestionTestCases(q) : []
    setActiveTestCaseId(cases[0]?.id ?? null)
    setRunStdin(resolveRunStdin(q, cases[0]?.id ?? null))
    setCode(resolveStarterCode(lang, qid))
    setOutput('')
    setError(null)
    setConsoleLines([])
    setTestResults([])
    setRevealedHintCount(0)
    setLastRunMs(null)
    setExecutionNote(null)
  }, [])

  const loadLanguageQuestion = useCallback((nextLanguage: CodePracticeLanguageMode, nextQuestionId?: string | null) => {
    const defaultQ = getDefaultQuestionForLanguage(nextLanguage)
    const qid = nextQuestionId ?? defaultQ?.id ?? null
    setLanguage(nextLanguage)
    setQuestionId(qid)
    syncQuestionContext(qid, nextLanguage)
  }, [syncQuestionContext])

  const handleLanguageChange = (next: CodePracticeLanguageMode) => {
    const mode = CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === next)
    if (mode?.status === 'coming-soon') {
      toast.message(`${mode.label} execution will be added later with Judge0.`)
      return
    }
    loadLanguageQuestion(next)
  }

  const handleQuestionSelect = (id: string) => {
    const q = getQuestionById(id)
    if (!q || q.language !== language) return
    setQuestionId(id)
    syncQuestionContext(id, language)
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
    setExecutionNote(null)
    toast.success('Starter code restored.')
  }

  const executeOnce = async (stdin: string): Promise<{ output: string; error: string | null; note: string | null }> => {
    const execLang = toSandboxLanguage(language)
    if (!execLang) {
      return { output: '', error: 'Language not executable yet.', note: null }
    }

    const prepared = prepareCodeForExecution(language, code, stdin)
    const result = await sandbox.execute(prepared.code, execLang)
    if (result.error) {
      return { output: '', error: result.error, note: prepared.note ?? null }
    }
    return { output: result.output || '', error: null, note: prepared.note ?? null }
  }

  const handleRun = async (): Promise<string> => {
    const execLang = toSandboxLanguage(language)
    if (!execLang) {
      toast.message('Execution for this language is planned for a later phase.')
      return ''
    }

    const stdin = resolveRunStdin(question, activeTestCaseId)
    setRunStdin(stdin)
    setIsRunning(true)
    setError(null)
    setOutput('Running…')
    setExecutionNote(null)
    const timer = createExecutionTimer()

    try {
      const { output: out, error: runError, note } = await executeOnce(stdin)
      const elapsed = timer.elapsedMs()
      setLastRunMs(elapsed)
      setExecutionNote(note)

      if (runError) {
        setError(runError)
        setOutput('')
        setConsoleLines([`[${classifyRunError(runError)}] ${runError}`])
        const legacyLang = toLegacyMistakeLanguage(language)
        if (legacyLang) {
          logPracticeMistake(legacyLang, runError, code)
          setMistakesRefreshKey((k) => k + 1)
        }
        toast.error('Run failed — see output panel.')
        return ''
      }

      setOutput(out || '(no output)')
      setConsoleLines((out || '').split('\n').filter(Boolean))
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
      toast.error('Select a question with sample cases first.')
      return
    }

    const cases = resolveQuestionTestCases(question)
    const actualByCaseId: Record<string, string> = {}
    const executedIds: string[] = []
    let lastOutput = ''
    let hadError = false

    setIsRunning(true)
    setTestResults([])
    const timer = createExecutionTimer()

    try {
      for (const testCase of cases) {
        executedIds.push(testCase.id)
        const stdin = testCase.input ?? ''
        setRunStdin(stdin)
        const { output: out, error: runError, note } = await executeOnce(stdin)
        if (note) setExecutionNote(note)

        if (runError) {
          hadError = true
          setError(runError)
          setOutput('')
          actualByCaseId[testCase.id] = ''
          break
        }

        actualByCaseId[testCase.id] = out
        lastOutput = out
      }

      setLastRunMs(timer.elapsedMs())
      if (!hadError) {
        setOutput(lastOutput || '(no output)')
        setError(null)
        setConsoleLines((lastOutput || '').split('\n').filter(Boolean))
      }

      const results = buildTestResultsFromCases(cases, actualByCaseId, executedIds)
      setTestResults(results)

      const allPassed = results.every((r) => r.passed)
      if (allPassed) {
        toast.success(`All ${results.length} sample case(s) passed!`)
      } else if (!hadError) {
        toast.error('Some sample cases did not match.')
        const legacyLang = toLegacyMistakeLanguage(language)
        if (legacyLang) {
          logPracticeMistake(legacyLang, results.find((r) => !r.passed)?.message ?? 'Wrong output', code)
          setMistakesRefreshKey((k) => k + 1)
        }
      }
    } finally {
      setIsRunning(false)
    }
  }

  const handleSaveAttempt = () => {
    const entry: CodePracticeAttempt = {
      id: `${Date.now()}`,
      questionId: questionId ?? 'freeform',
      language,
      code,
      output,
      passed: testResults.length > 0 && testResults.every((t) => t.passed),
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
          editorTheme={theme}
          onChange={setCode}
        />
      }
      outputPanel={
        <OutputPanel
          output={output}
          error={error}
          consoleLines={consoleLines}
          lastRunMs={lastRunMs}
          sampleInput={runStdin || undefined}
          executionNote={executionNote}
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
