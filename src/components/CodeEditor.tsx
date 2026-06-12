import { useState, useEffect, useRef, useCallback } from 'react'
import type { Monaco } from '@monaco-editor/react'
import type { IDisposable, editor as MonacoEditor } from 'monaco-editor'
import type { CodePracticeLanguageMode } from '@/features/code-practice/types/codePractice.types'
import {
  isPracticeIntelligenceLanguage,
  registerPracticeCompletionProvider,
} from '@/features/code-practice/editor-intelligence/completionProvider'
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Palette,
  Timer,
} from 'lucide-react'
import { toast } from 'sonner'
import { Editor } from '@monaco-editor/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useKV } from '@github/spark/hooks'
import { sandbox } from '@/lib/sandboxInstance'
import { DemoLimits } from '../lib/demo-limits'

/* ---------------- Types ---------------- */

export type MonacoEditorTheme = 'vs-dark' | 'vs' | 'hc-black'

interface CodeEditorProps {
  initialCode?: string
  code?: string
  onChange?: (code: string) => void
  language: string
  projectId?: string
  onRun?: (code: string) => void
  showExecutionControls?: boolean
  showOutputPanel?: boolean
  /** When set, overrides the internal KV theme picker for Monaco. */
  monacoTheme?: MonacoEditorTheme
  /** Monaco font size in px (default 15). */
  fontSize?: number
  /** Monaco line height in px; defaults to ~1.6× fontSize. */
  lineHeight?: number
  /** Hide the built-in editor chrome (toolbar) for embedded workbench layouts. */
  showEditorChrome?: boolean
  /** Enable offline rule-based completions (Code Workbench only). */
  enablePracticeSuggestions?: boolean
  practiceLanguage?: CodePracticeLanguageMode
  /** Enable Monaco quick suggestions (SQL Workbench and similar embeds). */
  enableQuickSuggestions?: boolean
  /** Extra mount hook for language-specific providers (e.g. SQL). */
  onEditorMount?: (editor: MonacoEditor.IStandaloneCodeEditor, monaco: Monaco) => IDisposable | void
}

type Theme = 'monokai' | 'dracula' | 'nord' | 'github' | 'synthwave'

/* ---------------- Component ---------------- */

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  code: controlledCode,
  language,
  onChange,
  onRun,
  showExecutionControls = true,
  showOutputPanel = true,
  monacoTheme,
  fontSize = 16,
  lineHeight,
  showEditorChrome = true,
  enablePracticeSuggestions = false,
  practiceLanguage,
  enableQuickSuggestions = false,
  onEditorMount,
}) => {
  const editorLineHeight = lineHeight ?? Math.round(fontSize * 1.6)
  const completionDisposableRef = useRef<IDisposable | null>(null)
  const extraMountDisposableRef = useRef<IDisposable | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const isControlled = controlledCode !== undefined
  const [internalCode, setInternalCode] = useState(initialCode || '')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [executionTime, setExecutionTime] = useState(0)
  const [theme, setTheme] = useKV<Theme>('editor-theme', 'monokai')

  const workerRef = useRef<Worker | null>(null)

  const editorCode = isControlled ? controlledCode : internalCode

  useEffect(() => {
    if (!isControlled) {
      setInternalCode(initialCode || '')
    }
  }, [initialCode, isControlled])

  /* ---------- Worker helpers ---------- */
  const createWorker = () => {
    const w = new Worker(
      new URL('../workers/pythonWorker.ts', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = w
    return w
  }

  useEffect(() => {
    createWorker()
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  /* ---------- Monaco language ---------- */
  const getMonacoLanguage = () => {
    const langMap: Record<string, string> = {
      javascript: 'javascript',
      python: 'python',
      java: 'java',
      sql: 'sql',
      typescript: 'typescript',
    }
    return langMap[language.toLowerCase()] || 'plaintext'
  }

  /* ---------- Monaco theme ---------- */
  const getMonacoTheme = (): MonacoEditorTheme => {
    if (monacoTheme) return monacoTheme
    return theme === 'github' ? 'vs' : 'vs-dark'
  }

  /* ---------- Code change ---------- */
  const handleCodeChange = (value: string | undefined) => {
    const val = value ?? ''
    onChange?.(val)
    if (!isControlled) {
      setInternalCode(val)
    }
  }

  /* ---------- Execute ---------- */
  const executeCode = () => {
    if (!DemoLimits.canExecuteCode()) {
      DemoLimits.triggerLimitReachedError()
      return
    }

    if (!editorCode.trim()) {
      toast.error('Please write some code first!')
      return
    }

    setIsRunning(true)
    setHasError(false)
    setOutput('')
    setExecutionTime(0)

    const isPython = language.toLowerCase() === 'python'

    if (isPython && workerRef.current) {
      const startTime = Date.now()

      const timeoutId = setTimeout(() => {
        workerRef.current?.terminate()
        setHasError(true)
        setOutput('Timeout: Possible infinite loop detected')
        setIsRunning(false)
        toast.error('Execution timed out. Possible infinite loop detected.')
        createWorker()
        onRun?.(editorCode)
      }, 5000)

      workerRef.current.onmessage = (
        e: MessageEvent<{ output: string | null; error: string | null }>
      ) => {
        clearTimeout(timeoutId)
        setExecutionTime(Date.now() - startTime)

        if (e.data.error) {
          setHasError(true)
          setOutput(e.data.error)
          toast.error('Oops! There was an error in your code.')
        } else {
          setOutput(e.data.output || 'Code executed successfully (no output)')
          toast.success('Code executed successfully!')
          DemoLimits.incrementExecutionCount()
          const remaining = DemoLimits.getRemainingExecutions()
          if (remaining <= 3) toast.warning(`Only ${remaining} executions left!`)
        }

        setIsRunning(false)
        onRun?.(editorCode)
      }

      workerRef.current.postMessage({ code: editorCode })
    } else {
      const langMap: Record<string, 'javascript' | 'python' | 'java' | 'sql'> = {
        javascript: 'javascript',
        python: 'python',
        java: 'java',
        sql: 'sql',
      }
      const execLang = langMap[language.toLowerCase()]
      if (!execLang) {
        toast.error('Execution not supported for this language')
        setIsRunning(false)
        return
      }

      void (async () => {
        try {
          const result = await sandbox.execute(editorCode, execLang)
          setExecutionTime(result.executionTime || 0)

          if (result.error) {
            setHasError(true)
            setOutput(result.error)
            toast.error('Oops! There was an error in your code.')
          } else {
            setOutput(result.output || 'Code executed successfully (no output)')
            toast.success('Code executed successfully!')
            DemoLimits.incrementExecutionCount()
            const remaining = DemoLimits.getRemainingExecutions()
            if (remaining <= 3) toast.warning(`Only ${remaining} executions left!`)
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Execution failed'
          setHasError(true)
          setOutput(message)
          toast.error('Failed to execute code')
        } finally {
          setIsRunning(false)
          onRun?.(editorCode)
        }
      })()
    }
  }

  /* ---------- Reset ---------- */
  const resetCode = () => {
    const val = initialCode || ''
    onChange?.(val)
    if (!isControlled) {
      setInternalCode(val)
    }
    setOutput('')
    setHasError(false)
    toast.success('Code reset to original!')
  }

  const setupCompletionProvider = useCallback(() => {
    completionDisposableRef.current?.dispose()
    completionDisposableRef.current = null
    if (!enablePracticeSuggestions || !practiceLanguage || !monacoRef.current) return
    if (!isPracticeIntelligenceLanguage(practiceLanguage)) return
    completionDisposableRef.current = registerPracticeCompletionProvider(
      monacoRef.current,
      practiceLanguage,
    )
  }, [enablePracticeSuggestions, practiceLanguage])

  useEffect(() => {
    setupCompletionProvider()
    return () => {
      completionDisposableRef.current?.dispose()
      completionDisposableRef.current = null
    }
  }, [setupCompletionProvider])

  const handleEditorMount = useCallback(
    (editor: MonacoEditor.IStandaloneCodeEditor, monaco: Monaco) => {
      monacoRef.current = monaco
      setupCompletionProvider()
      extraMountDisposableRef.current?.dispose()
      extraMountDisposableRef.current = onEditorMount?.(editor, monaco) ?? null
      editor.focus()
    },
    [onEditorMount, setupCompletionProvider],
  )

  useEffect(() => {
    return () => {
      extraMountDisposableRef.current?.dispose()
      extraMountDisposableRef.current = null
    }
  }, [])

  const suggestionsEnabled = enablePracticeSuggestions || enableQuickSuggestions

  const editorOptions = {
    minimap: { enabled: false },
    fontSize,
    lineHeight: editorLineHeight,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    wordWrap: 'on' as const,
    automaticLayout: true,
    readOnly: false,
    autoClosingBrackets: 'always' as const,
    autoClosingQuotes: 'always' as const,
    lineDecorationsWidth: 8,
    padding: { top: 14, bottom: 14 },
    ...(suggestionsEnabled
      ? {
          quickSuggestions: { other: true, comments: false, strings: true },
          suggestOnTriggerCharacters: true,
          tabCompletion: 'on' as const,
        }
      : {}),
  }

  const editorElement = (
    <Editor
      height="100%"
      language={getMonacoLanguage()}
      theme={getMonacoTheme()}
      value={editorCode}
      onChange={handleCodeChange}
      onMount={handleEditorMount}
      options={editorOptions}
    />
  )

  const rootClassName = showEditorChrome
    ? 'space-y-3'
    : 'code-editor-embedded-root h-full min-h-0 flex flex-col'

  return (
    <div className={rootClassName}>
      {/* Editor container */}
      {showEditorChrome ? (
      <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* macOS-style traffic dots */}
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <span className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <span className="text-xs font-medium text-slate-500 ml-1 font-mono">
              {language.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Runs left counter */}
            {showExecutionControls && (
              <span className="text-xs text-slate-400 mr-1 hidden sm:inline">
                {DemoLimits.getRemainingExecutions()} runs left
              </span>
            )}

            {/* Theme picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-md hover:bg-slate-200 transition-all duration-150"
                >
                  <Palette size={13} />
                  Theme
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(['monokai', 'dracula', 'nord', 'github', 'synthwave'] as Theme[]).map((t) => (
                  <DropdownMenuItem key={t} onClick={() => setTheme(t)}>
                    <span className={theme === t ? 'font-semibold' : ''}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {showExecutionControls && (
              <button
                type="button"
                onClick={resetCode}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-md hover:bg-slate-200 transition-all duration-150"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}

            {showExecutionControls && (
              <button
                type="button"
                onClick={executeCode}
                disabled={isRunning}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-1.5 rounded-md transition-all duration-150 hover:shadow-sm"
              >
                <Play size={13} strokeWidth={2.5} />
                {isRunning ? 'Running…' : 'Run'}
              </button>
            )}
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="h-[400px]">
          {editorElement}
        </div>
      </div>
      ) : (
        <div className="code-editor-embedded h-full min-h-[280px] flex-1">
          {editorElement}
        </div>
      )}

      {/* Output panel */}
      {showOutputPanel && output && (
        <div
          className={`rounded-lg border overflow-hidden shadow-sm ${
            hasError
              ? 'border-red-200 bg-red-50'
              : 'border-emerald-200 bg-emerald-50'
          }`}
        >
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{
            borderColor: hasError ? 'rgb(254 202 202)' : 'rgb(167 243 208)',
            backgroundColor: hasError ? 'rgb(255 241 242)' : 'rgb(240 253 244)',
          }}>
            <div className="flex items-center gap-2">
              {hasError ? (
                <>
                  <AlertTriangle size={15} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-700">Error Output</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Output</span>
                </>
              )}
            </div>
            {executionTime > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Timer size={12} />
                <span>{executionTime.toFixed(2)}ms</span>
              </div>
            )}
          </div>
          <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-slate-700 p-4">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}

export { CodeEditor }
export default CodeEditor
