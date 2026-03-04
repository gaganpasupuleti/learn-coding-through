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
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-sql'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useKV } from '@github/spark/hooks'
import { sandbox } from '@/lib/sandboxInstance'

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

interface Suggestion {
  text: string
  description: string
}

type Theme = 'monokai' | 'dracula' | 'nord' | 'github' | 'synthwave'

/* ---------------- Theme Config ---------------- */

const themeConfig = {
  monokai: {
    background: '#1e1e1e',
    foreground: '#f8f8f2',
    comment: '#75715e',
    keyword: '#f92672',
    function: '#a6e22e',
    string: '#e6db74',
    number: '#ae81ff',
    operator: '#f92672',
    punctuation: '#f8f8f2',
  },
  dracula: {
    background: '#282a36',
    foreground: '#f8f8f2',
    comment: '#6272a4',
    keyword: '#ff79c6',
    function: '#50fa7b',
    string: '#f1fa8c',
    number: '#bd93f9',
    operator: '#ff79c6',
    punctuation: '#f8f8f2',
  },
  nord: {
    background: '#2e3440',
    foreground: '#d8dee9',
    comment: '#616e88',
    keyword: '#81a1c1',
    function: '#88c0d0',
    string: '#a3be8c',
    number: '#b48ead',
    operator: '#81a1c1',
    punctuation: '#d8dee9',
  },
  github: {
    background: '#ffffff',
    foreground: '#24292f',
    comment: '#6a737d',
    keyword: '#d73a49',
    function: '#6f42c1',
    string: '#032f62',
    number: '#005cc5',
    operator: '#d73a49',
    punctuation: '#24292f',
  },
  synthwave: {
    background: '#241b2f',
    foreground: '#f8f8f2',
    comment: '#7f7094',
    keyword: '#ff7edb',
    function: '#36f9f6',
    string: '#fede5d',
    number: '#f97e72',
    operator: '#ff7edb',
    punctuation: '#f8f8f2',
  },
}

/* ---------------- Suggestions ---------------- */

const languageSuggestions: Record<string, Suggestion[]> = {
  javascript: [
    { text: 'function', description: 'Define a function' },
    { text: 'const', description: 'Declare a constant' },
    { text: 'let', description: 'Declare a variable' },
    { text: 'if', description: 'Conditional statement' },
    { text: 'for', description: 'For loop' },
    { text: 'return', description: 'Return value' },
    { text: 'console.log()', description: 'Log to console' },
  ],
  python: [
    { text: 'def', description: 'Define a function' },
    { text: 'class', description: 'Define a class' },
    { text: 'print()', description: 'Print output' },
    { text: 'for', description: 'For loop' },
    { text: 'try', description: 'Try-except block' },
  ],
  java: [
    { text: 'public', description: 'Public modifier' },
    { text: 'class', description: 'Define class' },
    { text: 'static', description: 'Static keyword' },
    { text: 'System.out.println()', description: 'Print output' },
  ],
  sql: [
    { text: 'SELECT', description: 'Query data' },
    { text: 'FROM', description: 'Select table' },
    { text: 'WHERE', description: 'Filter rows' },
  ],
}

/* ---------------- Component ---------------- */

export function CodeEditor({
  initialCode,
  code: externalCode,
  onChange,
  language,
  projectId,
  onRun,
  showExecutionControls = true,
  showOutputPanel = true,
}: CodeEditorProps) {
  const [internalCode, setInternalCode] = useState(
    externalCode || initialCode || ''
  )
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [executionTime, setExecutionTime] = useState(0)
  const [theme, setTheme] = useKV<Theme>('editor-theme', 'monokai')

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0 })
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 })

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const code = externalCode ?? internalCode
  const currentTheme = themeConfig[theme ?? 'monokai']

  /* ---------- Debounced Prism ---------- */
  useEffect(() => {
    const id = setTimeout(() => {
      if (highlightRef.current) {
        Prism.highlightElement(highlightRef.current)
      }
    }, 80)
    return () => clearTimeout(id)
  }, [code, language, theme])

  /* ---------- Click outside suggestions ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ---------- Update cursor position on code or selection change ---------- */
  useEffect(() => {
    updateCursorPosition()
  }, [code])

  /* ---------- Update cursor position ---------- */
  const updateCursorPosition = () => {
    if (!textareaRef.current) return
    const pos = textareaRef.current.selectionStart
    const textBeforeCursor = code.substring(0, pos)
    const lines = textBeforeCursor.split('\n')
    setCursorPosition({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    })
  }

  /* ---------- Get line numbers ---------- */
  const getLineNumbers = () => {
    const lines = code.split('\n')
    return lines.map((_, i) => i + 1).join('\n')
  }

  /* ---------- Code change ---------- */
  const handleCodeChange = (value: string) => {
    onChange ? onChange(value) : setInternalCode(value)
    checkForSuggestions(value)
  }

  /* ---------- Suggestions ---------- */
  const checkForSuggestions = (text: string) => {
    if (!textareaRef.current) return

    const pos = textareaRef.current.selectionStart
    const before = text.slice(0, pos)
    const word = before.split(/\s+/).pop()?.toLowerCase() || ''

    if (word.length < 2) return setShowSuggestions(false)

    const list =
      languageSuggestions[language.toLowerCase()] ||
      languageSuggestions.javascript

    const filtered = list.filter((s) =>
      s.text.toLowerCase().startsWith(word)
    )

    if (!filtered.length) return setShowSuggestions(false)

    const lineHeight = 24
    const lines = before.split('\n').length

    setSuggestionPos({
      top: lines * lineHeight + 8,
      left: 80,
    })

    setSuggestions(filtered)
    setSuggestionIndex(0)
    setShowSuggestions(true)
  }

  /* ---------- Apply suggestion ---------- */
  const applySuggestion = (s: Suggestion) => {
    if (!textareaRef.current) return
    const pos = textareaRef.current.selectionStart
    const before = code.slice(0, pos).replace(/\w+$/, '')
    const after = code.slice(pos)
    const newCode = before + s.text + after
    handleCodeChange(newCode)
    setShowSuggestions(false)
  }

  /* ---------- Scroll sync ---------- */
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  /* ---------- TAB handling (multi-line indent) ---------- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        applySuggestion(suggestions[suggestionIndex])
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSuggestionIndex((prev) => (prev + 1) % suggestions.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
      }
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const selected = code.slice(start, end)

      const indented = selected
        .split('\n')
        .map((l) => '  ' + l)
        .join('\n')

      const newCode =
        code.slice(0, start) + indented + code.slice(end)

      handleCodeChange(newCode)
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2
          textareaRef.current.selectionEnd = start + 2 + selected.length
        }
      }, 0)
    }
  }

  /* ---------- Execute ---------- */
  const executeCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!')
      return
    }

    const langMap: Record<string, 'javascript' | 'python' | 'java' | 'sql'> = {
      javascript: 'javascript',
      python: 'python',
      java: 'java',
      sql: 'sql',
    }

    const execLang = langMap[language.toLowerCase()]
    if (!execLang) {
      toast.error('Execution not supported for this language')
      return
    }

    setIsRunning(true)
    setHasError(false)
    setOutput('')
    setExecutionTime(0)

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
      }
    } catch (err: any) {
      setHasError(true)
      setOutput(err.message || 'Execution failed')
      toast.error('Failed to execute code')
    } finally {
      setIsRunning(false)
      onRun?.(code)
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

  const getPrismLanguage = () => {
    const langMap: Record<string, string> = {
      javascript: 'javascript',
      python: 'python',
      java: 'java',
      sql: 'sql',
    }
    return langMap[language.toLowerCase()] || 'javascript'
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
              <div className="w-3 h-3 rounded-full bg-accent/60"></div>
              <div className="w-3 h-3 rounded-full bg-primary/60"></div>
            </div>
            <span className="text-sm font-medium text-muted-foreground ml-2">
              {language.toUpperCase()} Editor
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">
              Ln {cursorPosition.line}, Col {cursorPosition.col}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                >
                  <Palette className="mr-1.5" size={14} />
                  Theme
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTheme('monokai')}>
                  <span className={theme === 'monokai' ? 'font-semibold' : ''}>
                    Monokai
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dracula')}>
                  <span className={theme === 'dracula' ? 'font-semibold' : ''}>
                    Dracula
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('nord')}>
                  <span className={theme === 'nord' ? 'font-semibold' : ''}>
                    Nord
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('github')}>
                  <span className={theme === 'github' ? 'font-semibold' : ''}>
                    GitHub Light
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('synthwave')}>
                  <span className={theme === 'synthwave' ? 'font-semibold' : ''}>
                    Synthwave
                  </span>
                </DropdownMenuItem>
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
            <Button
              size="sm"
              onClick={executeCode}
              disabled={isRunning}
              className="h-8 bg-primary hover:bg-primary/90 text-xs"
              style={{ display: showExecutionControls ? 'inline-flex' : 'none' }}
            >
              <Play className="mr-1.5" size={14} weight="fill" />
              Run
            </Button>
          </div>
        </div>

        <div
          className="relative overflow-hidden"
          style={{
            backgroundColor: currentTheme.background,
            ['--prism-background' as any]: currentTheme.background,
            ['--prism-foreground' as any]: currentTheme.foreground,
            ['--prism-comment' as any]: currentTheme.comment,
            ['--prism-keyword' as any]: currentTheme.keyword,
            ['--prism-function' as any]: currentTheme.function,
            ['--prism-string' as any]: currentTheme.string,
            ['--prism-number' as any]: currentTheme.number,
            ['--prism-operator' as any]: currentTheme.operator,
            ['--prism-punctuation' as any]: currentTheme.punctuation,
          }}
        >
          <div className="flex h-[400px]">
            <div
              className="select-none py-4 px-3 text-right font-mono text-sm border-r whitespace-pre"
              ref={(el) => {
                if (el && textareaRef.current) {
                  el.scrollTop = textareaRef.current.scrollTop
                }
              }}
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.comment,
                borderColor: currentTheme.punctuation + '20',
                minWidth: '3.5rem',
                lineHeight: '1.5',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                overflowY: 'hidden',
                overflowX: 'hidden',
              }}
            >
              {getLineNumbers()}
            </div>
            <div className="flex-1 relative overflow-hidden">
              <pre
                className="code-highlight-wrapper absolute inset-0 pointer-events-none m-0 p-4"
                aria-hidden="true"
                ref={highlightRef}
                style={{
                  lineHeight: '1.5',
                  overflow: 'hidden',
                  opacity: 0,
                }}
              >
                <code
                  className={`language-${getPrismLanguage()} block min-h-full`}
                  style={{
                    color: currentTheme.foreground,
                  }}
                >
                  {code}
                </code>
              </pre>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                onSelect={updateCursorPosition}
                onClick={updateCursorPosition}
                className="code-editor-textarea absolute inset-0 font-mono text-sm border-0 focus-visible:ring-0 focus:outline-none rounded-none resize-none bg-transparent p-4 caret-white overflow-auto"
                placeholder="Write your code here..."
                spellCheck={false}
                style={{
                  caretColor: currentTheme.foreground,
                  color: currentTheme.foreground,
                  WebkitTextFillColor: currentTheme.foreground,
                  lineHeight: '1.5',
                }}
              />
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 border rounded-md shadow-lg overflow-auto"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.punctuation + '60',
                    top: `${suggestionPos.top}px`,
                    left: `${suggestionPos.left}px`,
                    minWidth: '16rem',
                    maxHeight: '12rem',
                  }}
                >
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={suggestion.text}
                      className="px-3 py-2 cursor-pointer transition-colors"
                      style={{
                        backgroundColor:
                          idx === suggestionIndex
                            ? currentTheme.punctuation + '20'
                            : 'transparent',
                        color: currentTheme.foreground,
                      }}
                      onClick={() => applySuggestion(suggestion)}
                      onMouseEnter={() => setSuggestionIndex(idx)}
                    >
                      <div
                        className="font-mono text-sm font-semibold"
                        style={{ color: currentTheme.function }}
                      >
                        {suggestion.text}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: currentTheme.comment }}
                      >
                        {suggestion.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

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
                    <Warning
                      size={20}
                      weight="fill"
                      className="text-destructive"
                    />
                    <span className="font-semibold text-destructive">
                      Error Output
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle
                      size={20}
                      weight="fill"
                      className="text-primary"
                    />
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

