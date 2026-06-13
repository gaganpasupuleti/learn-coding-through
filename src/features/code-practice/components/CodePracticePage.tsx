import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { sandbox } from '@/lib/sandboxInstance'
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
  type CodePracticeFeedback,
  type CodePracticeLanguageMode,
  type CodePracticeTestResult,
} from '../types/codePractice.types'
import {
  getDefaultQuestionForLanguage,
  getQuestionById,
  getQuestionsForLanguage,
} from '../data/codeQuestions'
import { resolveStarterCode } from '../data/starterTemplates'
import { buildReactPreviewCheckResults, buildTestResultsFromCases } from '../utils/resultComparator'
import { createExecutionTimer } from '../utils/executionTimer'
import {
  recordFailedTestCaseMistake,
  recordJavaPrerunBlockMistake,
  recordJavaRuntimeMistake,
  recordJavaSafetyBlockMistake,
  recordJavaScriptPrerunBlockMistake,
  recordJavaScriptRuntimeMistake,
  recordJavaScriptSafetyBlockMistake,
  recordPythonPrerunBlockMistake,
  recordPythonRuntimeMistake,
  recordPythonSafetyBlockMistake,
  type CodePracticeMistake,
} from '../utils/codePracticeMistakes'
import {
  formatFeedbackForConsole,
  formatFeedbackForError,
  formatHintsForConsole,
} from '../utils/feedbackDisplay'
import {
  explainJavaScriptError,
  getBlockingJavaScriptPreRunFeedback,
  getJavaScriptPreRunHints,
} from '../javascript/javascriptFeedback'
import {
  getJavaScriptSafetyBlock,
  JAVASCRIPT_SAFETY_USER_MESSAGE,
} from '../javascript/javascriptSafetyValidator'
import {
  explainJavaError,
  getBlockingJavaPreRunFeedback,
  getJavaPreRunHints,
  JAVA_RUNTIME_UNAVAILABLE_MESSAGE,
} from '../java/javaFeedback'
import { getJavaSafetyBlock, JAVA_SAFETY_USER_MESSAGE } from '../java/javaSafetyValidator'
import { checkJavaRuntimeStatus } from '../java/javaRuntime'
import { resolveQuestionTestCases, resolveRunStdin } from '../utils/executionAdapter'
import { isPyodideReady, runPythonWithPyodide } from '../python/pyodideRunner'
import { getPythonSafetyBlock, PYTHON_SAFETY_USER_MESSAGE } from '../python/pythonSafetyValidator'
import {
  explainPythonError,
  getBlockingPreRunFeedback,
  getPreRunHints,
} from '../python/pythonFeedback'
import { cn } from '@/lib/utils'

type ExecuteOnceResult = {
  output: string
  error: string | null
  note: string | null
  executionTimeMs?: number
  feedback?: CodePracticeFeedback[]
  preRunHints?: CodePracticeFeedback[]
  rawError?: string | null
  blockedBy?: 'safety' | 'prerun' | 'runtime-unavailable'
  safetyRuleId?: string
  safetyMessage?: string
  errorCode?: string
}

function resolvePythonErrorDisplay(
  runError: string,
  options: {
    rawError?: string | null
    note?: string | null
    feedback?: CodePracticeFeedback[]
    blockedBy?: 'safety' | 'prerun'
  },
): { displayError: string; consoleLines: string[]; feedback: CodePracticeFeedback[] } {
  if (options.blockedBy === 'safety') {
    return {
      displayError: runError,
      consoleLines: options.note ? [options.note] : [runError],
      feedback: [],
    }
  }

  if (options.blockedBy === 'prerun' && options.feedback?.[0]) {
    return {
      displayError: runError,
      consoleLines: formatFeedbackForConsole(options.feedback[0]),
      feedback: options.feedback,
    }
  }

  const explained = explainPythonError(options.rawError ?? runError)
  return {
    displayError: formatFeedbackForError(explained),
    consoleLines: formatFeedbackForConsole(explained, options.rawError ?? runError),
    feedback: [explained],
  }
}

function resolveJavaScriptErrorDisplay(
  runError: string,
  options: {
    rawError?: string | null
    note?: string | null
    feedback?: CodePracticeFeedback[]
    blockedBy?: 'safety' | 'prerun'
  },
): { displayError: string; consoleLines: string[]; feedback: CodePracticeFeedback[] } {
  if (options.blockedBy === 'safety') {
    return {
      displayError: runError,
      consoleLines: options.note ? [options.note] : [runError],
      feedback: [],
    }
  }

  if (options.blockedBy === 'prerun' && options.feedback?.[0]) {
    return {
      displayError: runError,
      consoleLines: formatFeedbackForConsole(options.feedback[0]),
      feedback: options.feedback,
    }
  }

  const explained = explainJavaScriptError(options.rawError ?? runError)
  return {
    displayError: formatFeedbackForError(explained),
    consoleLines: formatFeedbackForConsole(explained, options.rawError ?? runError),
    feedback: [explained],
  }
}

function resolveJavaErrorDisplay(
  runError: string,
  options: {
    rawError?: string | null
    note?: string | null
    feedback?: CodePracticeFeedback[]
    blockedBy?: 'safety' | 'prerun' | 'runtime-unavailable'
    errorCode?: string
  },
): { displayError: string; consoleLines: string[]; feedback: CodePracticeFeedback[] } {
  if (options.blockedBy === 'runtime-unavailable') {
    return {
      displayError: runError,
      consoleLines: [runError],
      feedback: options.feedback ?? [explainJavaError(runError, 'runtime_unavailable')],
    }
  }

  if (options.blockedBy === 'safety') {
    return {
      displayError: runError,
      consoleLines: options.note ? [options.note] : [runError],
      feedback: [],
    }
  }

  if (options.blockedBy === 'prerun' && options.feedback?.[0]) {
    return {
      displayError: runError,
      consoleLines: formatFeedbackForConsole(options.feedback[0]),
      feedback: options.feedback,
    }
  }

  const explained = explainJavaError(options.rawError ?? runError, options.errorCode)
  return {
    displayError: formatFeedbackForError(explained),
    consoleLines: formatFeedbackForConsole(explained, options.rawError ?? runError),
    feedback: [explained],
  }
}

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

/** Python uses Pyodide; JavaScript and Java use backend sandbox. */
function canRunInWorkbench(language: CodePracticeLanguageMode): boolean {
  return language === 'python' || language === 'javascript' || language === 'java'
}

function isComingSoonLanguage(language: CodePracticeLanguageMode): boolean {
  const mode = CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === language)
  return mode?.status === 'coming-soon'
}

const REACT_RUN_OUTPUT = 'Use the live preview to test your component.'
const REACT_RUN_CONSOLE = 'Sandpack preview is active.'
const REACT_RUN_TOAST =
  'React preview runs live through Sandpack. Backend Run is not required for this task yet.'

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
  const [runtimeLabel, setRuntimeLabel] = useState<string | null>(null)
  const [workbenchFeedback, setWorkbenchFeedback] = useState<CodePracticeFeedback[]>([])
  const [javaRuntimeReady, setJavaRuntimeReady] = useState<boolean | null>(null)
  const [javaRuntimeError, setJavaRuntimeError] = useState<string | null>(null)

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
    setRuntimeLabel(null)
    setWorkbenchFeedback([])
  }, [])

  const loadLanguageQuestion = useCallback((nextLanguage: CodePracticeLanguageMode, nextQuestionId?: string | null) => {
    const defaultQ = getDefaultQuestionForLanguage(nextLanguage)
    const qid = nextQuestionId ?? defaultQ?.id ?? null
    setLanguage(nextLanguage)
    setQuestionId(qid)
    syncQuestionContext(qid, nextLanguage)
    if (nextLanguage === 'java') {
      void checkJavaRuntimeStatus(true).then((status) => {
        setJavaRuntimeReady(status.ready)
        setJavaRuntimeError(status.error)
        if (!status.ready) {
          setExecutionNote(JAVA_RUNTIME_UNAVAILABLE_MESSAGE)
        }
      })
    } else {
      setJavaRuntimeReady(null)
      setJavaRuntimeError(null)
    }
  }, [syncQuestionContext])

  const handleLanguageChange = (next: CodePracticeLanguageMode) => {
    const mode = CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === next)
    if (mode?.status === 'coming-soon') {
      toast.message(`${mode.label} execution will be added later through a Judge0-backed service.`)
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

  const clearExecutionState = () => {
    setOutput('')
    setError(null)
    setConsoleLines([])
    setTestResults([])
    setLastRunMs(null)
    setExecutionNote(null)
    setRuntimeLabel(null)
    setWorkbenchFeedback([])
  }

  const bumpMistakes = () => setMistakesRefreshKey((k) => k + 1)

  const recordPythonExecutionMistake = (
    attemptType: 'run' | 'submit',
    stdin: string,
    runError: string,
    options: {
      rawError?: string | null
      feedback?: CodePracticeFeedback[]
      blockedBy?: 'safety' | 'prerun'
      safetyRuleId?: string
      safetyMessage?: string
    },
  ) => {
    if (options.blockedBy === 'safety' && options.safetyRuleId) {
      recordPythonSafetyBlockMistake({
        question,
        code,
        stdin,
        attemptType,
        ruleId: options.safetyRuleId,
        message: options.safetyMessage ?? runError,
      })
      bumpMistakes()
      return
    }

    if (options.blockedBy === 'prerun' && options.feedback?.[0]) {
      recordPythonPrerunBlockMistake({
        question,
        code,
        stdin,
        attemptType,
        feedback: options.feedback[0],
      })
      bumpMistakes()
      return
    }

    const explained = explainPythonError(options.rawError ?? runError)
    recordPythonRuntimeMistake({
      question,
      code,
      stdin,
      attemptType,
      rawError: options.rawError ?? runError,
      feedback: explained,
    })
    bumpMistakes()
  }

  const recordJavaScriptExecutionMistake = (
    attemptType: 'run' | 'submit',
    stdin: string,
    runError: string,
    options: {
      rawError?: string | null
      feedback?: CodePracticeFeedback[]
      blockedBy?: 'safety' | 'prerun'
      safetyRuleId?: string
      safetyMessage?: string
    },
  ) => {
    if (options.blockedBy === 'safety' && options.safetyRuleId) {
      recordJavaScriptSafetyBlockMistake({
        question,
        code,
        stdin,
        attemptType,
        ruleId: options.safetyRuleId,
        message: options.safetyMessage ?? runError,
      })
      bumpMistakes()
      return
    }

    if (options.blockedBy === 'prerun' && options.feedback?.[0]) {
      recordJavaScriptPrerunBlockMistake({
        question,
        code,
        stdin,
        attemptType,
        feedback: options.feedback[0],
      })
      bumpMistakes()
      return
    }

    const explained = explainJavaScriptError(options.rawError ?? runError)
    recordJavaScriptRuntimeMistake({
      question,
      code,
      stdin,
      attemptType,
      rawError: options.rawError ?? runError,
      feedback: explained,
    })
    bumpMistakes()
  }

  const recordJavaExecutionMistake = (
    attemptType: 'run' | 'submit',
    stdin: string,
    runError: string,
    options: {
      rawError?: string | null
      feedback?: CodePracticeFeedback[]
      blockedBy?: 'safety' | 'prerun' | 'runtime-unavailable'
      safetyRuleId?: string
      safetyMessage?: string
      errorCode?: string
    },
  ) => {
    if (options.blockedBy === 'runtime-unavailable') {
      const explained = explainJavaError(runError, 'runtime_unavailable')
      recordJavaRuntimeMistake({
        question,
        code,
        stdin,
        attemptType,
        rawError: runError,
        feedback: explained,
      })
      bumpMistakes()
      return
    }

    if (options.blockedBy === 'safety' && options.safetyRuleId) {
      recordJavaSafetyBlockMistake({
        question,
        code,
        stdin,
        attemptType,
        ruleId: options.safetyRuleId,
        message: options.safetyMessage ?? runError,
      })
      bumpMistakes()
      return
    }

    if (options.blockedBy === 'prerun' && options.feedback?.[0]) {
      recordJavaPrerunBlockMistake({
        question,
        code,
        stdin,
        attemptType,
        feedback: options.feedback[0],
      })
      bumpMistakes()
      return
    }

    const explained = explainJavaError(options.rawError ?? runError, options.errorCode)
    recordJavaRuntimeMistake({
      question,
      code,
      stdin,
      attemptType,
      rawError: options.rawError ?? runError,
      feedback: explained,
    })
    bumpMistakes()
  }

  const handleRetryMistake = useCallback((mistake: CodePracticeMistake) => {
    const q = mistake.questionId !== 'freeform' ? getQuestionById(mistake.questionId) : null
    const cases = q ? resolveQuestionTestCases(q) : []
    const matchingCase = mistake.inputUsed
      ? cases.find((c) => (c.input ?? '') === mistake.inputUsed)
      : undefined

    setLanguage(mistake.language)
    setQuestionId(q?.id ?? null)
    setActiveTestCaseId(matchingCase?.id ?? cases[0]?.id ?? null)
    setRunStdin(
      mistake.inputUsed || resolveRunStdin(q, matchingCase?.id ?? cases[0]?.id ?? null),
    )
    setCode(mistake.submittedCode)
    clearExecutionState()
    setRevealedHintCount(0)
    if (mistake.language === 'java') {
      void checkJavaRuntimeStatus(true).then((status) => {
        setJavaRuntimeReady(status.ready)
        setJavaRuntimeError(status.error)
        if (!status.ready) {
          setExecutionNote(JAVA_RUNTIME_UNAVAILABLE_MESSAGE)
        }
      })
    }
    toast.message('Mistake loaded — fix your code and run again.')
  }, [])

  const handleReset = () => {
    if (!question) {
      setCode(resolveStarterCode(language))
      clearExecutionState()
      toast.success('Editor reset.')
      return
    }
    setCode(question.starterCode)
    clearExecutionState()
    toast.success('Starter code restored.')
  }

  const executeOnce = async (
    stdin: string,
    onPythonLoading?: () => void,
    onPythonReady?: () => void,
  ): Promise<ExecuteOnceResult> => {
    if (language === 'python') {
      const preRunHints = getPreRunHints(code)

      const safetyBlock = getPythonSafetyBlock(code)
      if (safetyBlock) {
        return {
          output: '',
          error: PYTHON_SAFETY_USER_MESSAGE,
          note: `[${safetyBlock.ruleId}] ${safetyBlock.message}`,
          executionTimeMs: 0,
          blockedBy: 'safety',
          safetyRuleId: safetyBlock.ruleId,
          safetyMessage: safetyBlock.message,
          preRunHints,
        }
      }

      const preRunBlock = getBlockingPreRunFeedback(code)
      if (preRunBlock) {
        return {
          output: '',
          error: formatFeedbackForError(preRunBlock),
          note: preRunBlock.suggestion ?? preRunBlock.message,
          executionTimeMs: 0,
          feedback: [preRunBlock],
          preRunHints,
          blockedBy: 'prerun',
        }
      }

      const result = await runPythonWithPyodide(
        code,
        stdin || undefined,
        onPythonLoading,
        onPythonReady,
      )
      return {
        output: result.output,
        error: result.error,
        rawError: result.error,
        note: result.error ? null : result.note ?? 'Runtime: Pyodide',
        executionTimeMs: result.executionTimeMs,
        preRunHints,
      }
    }

    if (language === 'javascript') {
      const preRunHints = getJavaScriptPreRunHints(code)

      const safetyBlock = getJavaScriptSafetyBlock(code)
      if (safetyBlock) {
        return {
          output: '',
          error: JAVASCRIPT_SAFETY_USER_MESSAGE,
          note: `[${safetyBlock.ruleId}] ${safetyBlock.message}`,
          executionTimeMs: 0,
          blockedBy: 'safety',
          safetyRuleId: safetyBlock.ruleId,
          safetyMessage: safetyBlock.message,
          preRunHints,
        }
      }

      const preRunBlock = getBlockingJavaScriptPreRunFeedback(code)
      if (preRunBlock) {
        return {
          output: '',
          error: formatFeedbackForError(preRunBlock),
          note: preRunBlock.suggestion ?? preRunBlock.message,
          executionTimeMs: 0,
          feedback: [preRunBlock],
          preRunHints,
          blockedBy: 'prerun',
        }
      }

      const result = await sandbox.execute(code, 'javascript')
      if (result.error) {
        return {
          output: '',
          error: result.error,
          rawError: result.error,
          note: null,
          preRunHints,
        }
      }
      return {
        output: result.output || '',
        error: null,
        note: 'Runtime: Backend sandbox',
        preRunHints,
      }
    }

    if (language === 'java') {
      const runtimeStatus = await checkJavaRuntimeStatus()
      if (!runtimeStatus.ready) {
        return {
          output: '',
          error: JAVA_RUNTIME_UNAVAILABLE_MESSAGE,
          note: runtimeStatus.error ?? undefined,
          executionTimeMs: 0,
          blockedBy: 'runtime-unavailable' as const,
        }
      }

      const preRunHints = getJavaPreRunHints(code)

      const safetyBlock = getJavaSafetyBlock(code)
      if (safetyBlock) {
        return {
          output: '',
          error: JAVA_SAFETY_USER_MESSAGE,
          note: `[${safetyBlock.ruleId}] ${safetyBlock.message}`,
          executionTimeMs: 0,
          blockedBy: 'safety',
          safetyRuleId: safetyBlock.ruleId,
          safetyMessage: safetyBlock.message,
          preRunHints,
        }
      }

      const preRunBlock = getBlockingJavaPreRunFeedback(code)
      if (preRunBlock) {
        return {
          output: '',
          error: formatFeedbackForError(preRunBlock),
          note: preRunBlock.suggestion ?? preRunBlock.message,
          executionTimeMs: 0,
          feedback: [preRunBlock],
          preRunHints,
          blockedBy: 'prerun',
        }
      }

      const result = await sandbox.execute(code, 'java')
      if (result.error) {
        return {
          output: result.output || '',
          error: result.error,
          rawError: result.error,
          note: null,
          preRunHints,
          errorCode: result.error_code,
        }
      }
      return {
        output: result.output || '',
        error: null,
        note: 'Runtime: Backend Java (javac + java)',
        preRunHints,
      }
    }

    return { output: '', error: 'Language not executable yet.', note: null }
  }

  const handleReactRun = (): string => {
    setError(null)
    setRunStdin('')
    setExecutionNote('React uses Sandpack for live preview — not the backend JavaScript executor.')
    setOutput(REACT_RUN_OUTPUT)
    setConsoleLines([REACT_RUN_CONSOLE])
    setLastRunMs(0)
    toast.message(REACT_RUN_TOAST)
    return REACT_RUN_OUTPUT
  }

  const handleRun = async (): Promise<string> => {
    if (language === 'react') {
      return handleReactRun()
    }

    if (isComingSoonLanguage(language)) {
      const mode = CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === language)
      toast.message(`${mode?.label ?? language} execution will be added later through a Judge0-backed service.`)
      return ''
    }

    if (!canRunInWorkbench(language)) {
      toast.message('Execution for this language is planned for a later phase.')
      return ''
    }

    const stdin = resolveRunStdin(question, activeTestCaseId)
    setRunStdin(stdin)
    setIsRunning(true)
    setError(null)
    setRuntimeLabel(null)
    setExecutionNote(null)
    setWorkbenchFeedback([])
    setOutput(
      language === 'python'
        ? isPyodideReady()
          ? 'Running Python…'
          : 'Starting Python runtime…'
        : language === 'java'
          ? 'Compiling and running Java…'
          : 'Running…',
    )
    const timer = createExecutionTimer()

    try {
      const {
        output: out,
        error: runError,
        note,
        executionTimeMs,
        feedback,
        preRunHints,
        rawError,
        blockedBy,
        safetyRuleId,
        safetyMessage,
        errorCode,
      } = await executeOnce(
        stdin,
        language === 'python' ? () => setOutput('Starting Python runtime…') : undefined,
        language === 'python' ? () => setOutput('Running Python…') : undefined,
      )
      const elapsed = executionTimeMs ?? timer.elapsedMs()
      setLastRunMs(elapsed)
      setExecutionNote(note)
      if (language === 'python' && !runError) {
        setRuntimeLabel('Pyodide')
      }
      if (language === 'java' && !runError) {
        setRuntimeLabel('Java JDK')
      }

      if (runError) {
        if (language === 'python') {
          const errorState = resolvePythonErrorDisplay(runError, {
            rawError,
            note,
            feedback,
            blockedBy,
          })
          setError(errorState.displayError)
          setWorkbenchFeedback(errorState.feedback)
          setConsoleLines(errorState.consoleLines)
          recordPythonExecutionMistake('run', stdin, runError, {
            rawError,
            feedback,
            blockedBy,
            safetyRuleId,
            safetyMessage,
          })
          if (blockedBy === 'safety') {
            toast.error('Code blocked for browser safety.')
          } else if (blockedBy === 'prerun') {
            toast.error('Fix the issue above before running.')
          } else {
            toast.error('Run failed — see feedback in the output panel.')
          }
        } else if (language === 'javascript') {
          const errorState = resolveJavaScriptErrorDisplay(runError, {
            rawError,
            note,
            feedback,
            blockedBy,
          })
          setError(errorState.displayError)
          setWorkbenchFeedback(errorState.feedback)
          setConsoleLines(errorState.consoleLines)
          recordJavaScriptExecutionMistake('run', stdin, runError, {
            rawError,
            feedback,
            blockedBy,
            safetyRuleId,
            safetyMessage,
          })
          if (blockedBy === 'safety') {
            toast.error('Code blocked for practice safety.')
          } else if (blockedBy === 'prerun') {
            toast.error('Fix the issue above before running.')
          } else {
            toast.error('Run failed — see feedback in the output panel.')
          }
        } else if (language === 'java') {
          const errorState = resolveJavaErrorDisplay(runError, {
            rawError,
            note,
            feedback,
            blockedBy: blockedBy === 'runtime-unavailable' ? 'runtime-unavailable' : blockedBy,
            errorCode,
          })
          setError(errorState.displayError)
          setWorkbenchFeedback(errorState.feedback)
          setConsoleLines(errorState.consoleLines)
          recordJavaExecutionMistake('run', stdin, runError, {
            rawError,
            feedback,
            blockedBy: blockedBy === 'runtime-unavailable' ? 'runtime-unavailable' : blockedBy,
            safetyRuleId,
            safetyMessage,
            errorCode,
          })
          if (blockedBy === 'runtime-unavailable') {
            setJavaRuntimeReady(false)
            setJavaRuntimeError(note ?? javaRuntimeError)
            toast.error('Java runtime is not available on the backend.')
          } else if (blockedBy === 'safety') {
            toast.error('Code blocked for practice safety.')
          } else if (blockedBy === 'prerun') {
            toast.error('Fix the issue above before running.')
          } else {
            toast.error('Run failed — see feedback in the output panel.')
          }
        }
        setOutput('')
        return ''
      }

      const hintLines = formatHintsForConsole(preRunHints ?? [])
      setWorkbenchFeedback(preRunHints ?? [])
      setOutput(out || '(no output)')
      setConsoleLines([...hintLines, ...(out || '').split('\n').filter(Boolean)])
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

    if (language === 'react') {
      handleReactRun()
      setTestResults(buildReactPreviewCheckResults())
      toast.success('Preview check recorded — use Sandpack to validate your component.')
      return
    }

    if (isComingSoonLanguage(language)) {
      const mode = CODE_PRACTICE_LANGUAGE_MODES.find((m) => m.id === language)
      toast.message(`${mode?.label ?? language} execution will be added later through a Judge0-backed service.`)
      return
    }

    if (!canRunInWorkbench(language)) {
      toast.error('This language is not runnable in the workbench yet.')
      return
    }

    const cases = resolveQuestionTestCases(question)
    const actualByCaseId: Record<string, string> = {}
    const executedIds: string[] = []
    let lastOutput = ''
    let hadError = false

    setIsRunning(true)
    setTestResults([])
    setRuntimeLabel(null)
    setWorkbenchFeedback([])
    const timer = createExecutionTimer()

    try {
      if (language === 'python') {
        setOutput(isPyodideReady() ? 'Running Python…' : 'Starting Python runtime…')
      } else if (language === 'java') {
        setOutput('Compiling and running Java…')
      }

      for (const testCase of cases) {
        executedIds.push(testCase.id)
        const stdin = testCase.input ?? ''
        setRunStdin(stdin)
        const {
          output: out,
          error: runError,
          note,
          executionTimeMs,
          feedback,
          preRunHints,
          rawError,
          blockedBy,
          safetyRuleId,
          safetyMessage,
          errorCode,
        } = await executeOnce(
          stdin,
          language === 'python' ? () => setOutput('Starting Python runtime…') : undefined,
          language === 'python' ? () => setOutput('Running Python…') : undefined,
        )
        if (note) setExecutionNote(note)
        if (language === 'python' && !runError) setRuntimeLabel('Pyodide')
        if (language === 'java' && !runError) setRuntimeLabel('Java JDK')

        if (runError) {
          hadError = true
          setOutput('')
          if (language === 'python') {
            const errorState = resolvePythonErrorDisplay(runError, {
              rawError,
              note,
              feedback,
              blockedBy,
            })
            setError(errorState.displayError)
            setWorkbenchFeedback(errorState.feedback)
            setConsoleLines(errorState.consoleLines)
            recordPythonExecutionMistake('submit', stdin, runError, {
              rawError,
              feedback,
              blockedBy,
              safetyRuleId,
              safetyMessage,
            })
            if (blockedBy === 'safety') {
              toast.error('Code blocked for browser safety.')
            } else if (blockedBy === 'prerun') {
              toast.error('Fix the issue above before submitting.')
            } else {
              toast.error('Submit failed — see feedback in the output panel.')
            }
          } else if (language === 'javascript') {
            const errorState = resolveJavaScriptErrorDisplay(runError, {
              rawError,
              note,
              feedback,
              blockedBy,
            })
            setError(errorState.displayError)
            setWorkbenchFeedback(errorState.feedback)
            setConsoleLines(errorState.consoleLines)
            recordJavaScriptExecutionMistake('submit', stdin, runError, {
              rawError,
              feedback,
              blockedBy,
              safetyRuleId,
              safetyMessage,
            })
            if (blockedBy === 'safety') {
              toast.error('Code blocked for practice safety.')
            } else if (blockedBy === 'prerun') {
              toast.error('Fix the issue above before submitting.')
            } else {
              toast.error('Submit failed — see feedback in the output panel.')
            }
          } else if (language === 'java') {
            const errorState = resolveJavaErrorDisplay(runError, {
              rawError,
              note,
              feedback,
              blockedBy: blockedBy === 'runtime-unavailable' ? 'runtime-unavailable' : blockedBy,
              errorCode,
            })
            setError(errorState.displayError)
            setWorkbenchFeedback(errorState.feedback)
            setConsoleLines(errorState.consoleLines)
            recordJavaExecutionMistake('submit', stdin, runError, {
              rawError,
              feedback,
              blockedBy: blockedBy === 'runtime-unavailable' ? 'runtime-unavailable' : blockedBy,
              safetyRuleId,
              safetyMessage,
              errorCode,
            })
            if (blockedBy === 'runtime-unavailable') {
              setJavaRuntimeReady(false)
              toast.error('Java runtime is not available on the backend.')
            } else if (blockedBy === 'safety') {
              toast.error('Code blocked for practice safety.')
            } else if (blockedBy === 'prerun') {
              toast.error('Fix the issue above before submitting.')
            } else {
              toast.error('Submit failed — see feedback in the output panel.')
            }
          }
          actualByCaseId[testCase.id] = ''
          break
        }

        if (preRunHints?.length) {
          setWorkbenchFeedback(preRunHints)
        }

        actualByCaseId[testCase.id] = out
        lastOutput = out
        if (executionTimeMs) setLastRunMs(executionTimeMs)
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
        const failed = results.find((r) => !r.passed)
        if (failed) {
          const failedCase = cases.find((c) => c.id === failed.id)
          recordFailedTestCaseMistake({
            language,
            question,
            code,
            stdin: failedCase?.input ?? '',
            expectedOutput: failed.expected,
            actualOutput: failed.actual,
            attemptType: 'submit',
            caseLabel: failed.label,
          })
          bumpMistakes()
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
    <div className="flex flex-wrap items-center gap-2.5 border-b border-[#26324A] bg-[#0F172A] px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">Question</span>
      {languageQuestions.map((q) => (
        <button
          key={q.id}
          type="button"
          onClick={() => handleQuestionSelect(q.id)}
          className={cn(
            'rounded-md px-3.5 py-2 text-sm font-medium transition-all',
            questionId === q.id
              ? 'bg-violet-600 text-white shadow ring-1 ring-violet-400/50'
              : 'border border-[#26324A] bg-[#111827] text-[#CBD5E1] hover:border-violet-500/50 hover:bg-[#1a2332] hover:text-[#E5E7EB]',
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
          executionNote={
            language === 'java' && javaRuntimeReady === false
              ? JAVA_RUNTIME_UNAVAILABLE_MESSAGE
              : executionNote
          }
          runtimeLabel={runtimeLabel}
          feedbackItems={workbenchFeedback}
        />
      }
      livePreview={
        <LivePreviewPanel
          language={language}
          code={code}
          questionTitle={question?.title}
        />
      }
      testResults={<TestResultsPanel results={testResults} />}
      hints={
        <HintsPanel
          hints={question?.hints ?? []}
          revealedCount={revealedHintCount}
          onRevealNext={() => setRevealedHintCount((c) => Math.min(c + 1, question?.hints.length ?? 0))}
        />
      }
      mistakes={<OldMistakesPanel refreshKey={mistakesRefreshKey} onRetry={handleRetryMistake} />}
      attemptHistory={<AttemptHistoryPanel attempts={attempts} />}
    />
  )
}
