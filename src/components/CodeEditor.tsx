import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Play,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Palette,
  Timer,
} from '@phosphor-icons/react'
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

interface CodeEditorProps {
  initialCode?: string
  code?: string
  onChange?: (code: string) => void
  language: string
  projectId?: string
  onRun?: (code: string) => void
  showExecutionControls?: boolean
  showOutputPanel?: boolean
}

type Theme = 'monokai' | 'dracula' | 'nord' | 'github' | 'synthwave'

/* ---------------- Component ---------------- */

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  language,
  onChange,
  onRun,
  showExecutionControls = true,
  showOutputPanel = true,
}) => {
  const [internalCode, setInternalCode] = useState(initialCode || '')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [executionTime, setExecutionTime] = useState(0)
  const [theme, setTheme] = useKV<Theme>('editor-theme', 'monokai')

  const workerRef = useRef<Worker | null>(null)

  const code = initialCode ?? internalCode

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
  const getMonacoTheme = () => (theme === 'github' ? 'vs' : 'vs-dark')

  /* ---------- Code change ---------- */
  const handleCodeChange = (value: string | undefined) => {
    const val = value ?? ''
    onChange ? onChange(val) : setInternalCode(val)
  }

  /* ---------- Execute ---------- */
  const executeCode = () => {
    if (!DemoLimits.canExecuteCode()) {
      DemoLimits.triggerLimitReachedError()
      return
    }

    if (!code.trim()) {
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

      // 5-second timeout failsafe for infinite loops
      const timeoutId = setTimeout(() => {
        workerRef.current?.terminate()
        setHasError(true)
        setOutput('Timeout: Possible infinite loop detected')
        setIsRunning(false)
        toast.error('Execution timed out. Possible infinite loop detected.')
        // Re-initialize a fresh worker so the user can keep coding
        createWorker()
        onRun?.(code)
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
          if (remaining <= 3) {
            toast.warning(`Only ${remaining} executions left!`)
          }
        }

        setIsRunning(false)
        onRun?.(code)
      }

      workerRef.current.postMessage({ code })
    } else {
      // Fallback: sandbox API for non-Python languages
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

      ;(async () => {
        try {
          const result = await sandbox.execute(code, execLang)
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
            if (remaining <= 3) {
              toast.warning(`Only ${remaining} executions left!`)
            }
          }
        } catch (err: any) {
          setHasError(true)
          setOutput(err.message || 'Execution failed')
          toast.error('Failed to execute code')
        } finally {
          setIsRunning(false)
          onRun?.(code)
        }
      })()
    }
  }

  /* ---------- Reset ---------- */
  const resetCode = () => {
    const val = initialCode || ''
    onChange ? onChange(val) : setInternalCode(val)
    setOutput('')
    setHasError(false)
    toast.success('Code reset to original!')
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 overflow-hidden">
        {/* Toolbar */}
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
            </div>
            <span className="text-sm font-medium text-muted-foreground ml-2">
              {language.toUpperCase()} Editor
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 text-xs">
                  <Palette className="mr-1.5" size={14} />
                  Theme
                </Button>
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

            <Button
              size="sm"
              variant="ghost"
              onClick={resetCode}
              className="h-8 text-xs"
              style={{ display: showExecutionControls ? 'inline-flex' : 'none' }}
            >
              <ArrowsClockwise className="mr-1.5" size={14} />
              Reset
            </Button>

            <span className="text-xs text-muted-foreground mr-2">
              Demo: {DemoLimits.getRemainingExecutions()} runs left
            </span>

            <Button
              size="sm"
              onClick={executeCode}
              disabled={isRunning}
              className="h-8 bg-primary hover:bg-primary/90 text-xs"
              style={{ display: showExecutionControls ? 'inline-flex' : 'none' }}
            >
              <Play className="mr-1.5" size={14} weight="fill" />
              {isRunning ? 'Running…' : 'Run'}
            </Button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="h-[400px]">
          <Editor
            height="100%"
            language={getMonacoLanguage()}
            theme={getMonacoTheme()}
            value={code}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
            }}
          />
        </div>
      </Card>

      {/* Output panel */}
      {showOutputPanel && output && (
        <Card
          className={`border-2 ${
            hasError
              ? 'border-destructive/50 bg-destructive/5'
              : 'border-primary/30 bg-primary/5'
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {hasError ? (
                  <>
                    <Warning size={20} weight="fill" className="text-destructive" />
                    <span className="font-semibold text-destructive">Error Output</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} weight="fill" className="text-primary" />
                    <span className="font-semibold text-primary">Output</span>
                  </>
                )}
              </div>
              {executionTime > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Timer size={14} />
                  <span>{executionTime.toFixed(2)}ms</span>
                </div>
              )}
            </div>
            <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground">
              {output}
            </pre>
          </div>
        </Card>
      )}
    </div>
  )
}

export { CodeEditor }
export default CodeEditor
