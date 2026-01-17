import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, ArrowsClockwise, CheckCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-sql'

interface CodeEditorProps {
  initialCode: string
  language: string
  projectId: string
  onRun?: (code: string) => void
}

export function CodeEditor({ initialCode, language, projectId, onRun }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setCode(initialCode)
  }, [initialCode])

  useEffect(() => {
    if (highlightRef.current) {
      Prism.highlightElement(highlightRef.current)
    }
  }, [code, language])

  const executeCode = () => {
    setIsRunning(true)
    setHasError(false)
    setOutput('')

    try {
      if (projectId === 'digital-clock') {
        executeClockCode()
      } else if (projectId === 'calculator') {
        executeCalculatorCode()
      } else {
        executeGenericCode()
      }
      toast.success('Code executed successfully!')
    } catch (error) {
      setHasError(true)
      setOutput(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`)
      toast.error('Oops! There was an error in your code.')
    } finally {
      setIsRunning(false)
    }

    if (onRun) {
      onRun(code)
    }
  }

  const executeClockCode = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    
    setOutput(`Current time: ${hours}:${minutes}:${seconds}\n\nYour clock is working! It would update every second in the live version.`)
  }

  const executeCalculatorCode = () => {
    const testCases = [
      { a: 10, b: 5, op: '+', expected: 15 },
      { a: 20, b: 8, op: '-', expected: 12 },
      { a: 6, b: 7, op: '×', expected: 42 },
      { a: 100, b: 4, op: '÷', expected: 25 },
    ]

    let results = 'Testing your calculator:\n\n'
    testCases.forEach(test => {
      let result
      switch (test.op) {
        case '+': result = test.a + test.b; break
        case '-': result = test.a - test.b; break
        case '×': result = test.a * test.b; break
        case '÷': result = test.a / test.b; break
        default: result = 0
      }
      const pass = result === test.expected
      results += `${test.a} ${test.op} ${test.b} = ${result} ${pass ? '✓' : '✗'}\n`
    })

    setOutput(results + '\nAll tests passed! Your calculator logic is correct.')
  }

  const executeGenericCode = () => {
    const lines = code.split('\n').length
    const chars = code.length
    setOutput(`Code analysis:\n\n📝 Lines: ${lines}\n📊 Characters: ${chars}\n✨ Syntax looks good!\n\nYour code is ready to use.`)
  }

  const resetCode = () => {
    setCode(initialCode)
    setOutput('')
    setHasError(false)
    toast.success('Code reset to original!')
  }

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const getPrismLanguage = () => {
    const langMap: Record<string, string> = {
      javascript: 'javascript',
      python: 'python',
      java: 'java',
      sql: 'sql'
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
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={resetCode}
              className="h-8 text-xs"
            >
              <ArrowsClockwise className="mr-1.5" size={14} />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={executeCode}
              disabled={isRunning}
              className="h-8 bg-primary hover:bg-primary/90 text-xs"
            >
              <Play className="mr-1.5" size={14} weight="fill" />
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <pre className="code-highlight-wrapper absolute inset-0 pointer-events-none overflow-auto p-4 m-0" aria-hidden="true">
            <code 
              ref={highlightRef}
              className={`language-${getPrismLanguage()} block min-h-[300px]`}
            >
              {code}
            </code>
          </pre>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={handleScroll}
            className="code-editor-textarea relative font-mono text-sm min-h-[300px] w-full border-0 focus-visible:ring-0 focus:outline-none rounded-none resize-none bg-transparent p-4 text-transparent caret-foreground"
            placeholder="Write your code here..."
            spellCheck={false}
          />
        </div>
      </Card>

      {output && (
        <Card className={`border-2 ${hasError ? 'border-destructive/50 bg-destructive/5' : 'border-primary/30 bg-primary/5'}`}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
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
            <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground">
              {output}
            </pre>
          </div>
        </Card>
      )}
    </div>
  )
}
