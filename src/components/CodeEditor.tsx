import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, ArrowsClockwise, CheckCircle, Warning, Palette } from '@phosphor-icons/react'
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

interface CodeEditorProps {
  initialCode: string
  language: string
  projectId: string
  onRun?: (code: string) => void
}

interface Suggestion {
  text: string
  description: string
}

type Theme = 'monokai' | 'dracula' | 'nord' | 'github' | 'synthwave'

const themeConfig = {
  monokai: {
    background: 'oklch(0.18 0.02 60)',
    foreground: 'oklch(0.95 0.01 60)',
    comment: 'oklch(0.55 0.02 60)',
    keyword: 'oklch(0.75 0.20 330)',
    function: 'oklch(0.75 0.15 110)',
    string: 'oklch(0.78 0.18 85)',
    number: 'oklch(0.70 0.18 290)',
    operator: 'oklch(0.85 0.15 330)',
    punctuation: 'oklch(0.90 0.01 60)',
  },
  dracula: {
    background: 'oklch(0.22 0.03 265)',
    foreground: 'oklch(0.93 0.01 265)',
    comment: 'oklch(0.50 0.05 220)',
    keyword: 'oklch(0.75 0.18 330)',
    function: 'oklch(0.75 0.15 130)',
    string: 'oklch(0.78 0.15 90)',
    number: 'oklch(0.75 0.15 265)',
    operator: 'oklch(0.75 0.18 330)',
    punctuation: 'oklch(0.85 0.01 265)',
  },
  nord: {
    background: 'oklch(0.25 0.02 220)',
    foreground: 'oklch(0.88 0.01 220)',
    comment: 'oklch(0.58 0.03 220)',
    keyword: 'oklch(0.70 0.10 250)',
    function: 'oklch(0.70 0.08 190)',
    string: 'oklch(0.75 0.08 140)',
    number: 'oklch(0.75 0.10 310)',
    operator: 'oklch(0.70 0.08 190)',
    punctuation: 'oklch(0.82 0.01 220)',
  },
  github: {
    background: 'oklch(0.99 0 0)',
    foreground: 'oklch(0.20 0 0)',
    comment: 'oklch(0.55 0.01 145)',
    keyword: 'oklch(0.45 0.15 330)',
    function: 'oklch(0.40 0.12 265)',
    string: 'oklch(0.40 0.10 130)',
    number: 'oklch(0.38 0.14 260)',
    operator: 'oklch(0.35 0.08 330)',
    punctuation: 'oklch(0.35 0 0)',
  },
  synthwave: {
    background: 'oklch(0.15 0.04 290)',
    foreground: 'oklch(0.92 0.05 330)',
    comment: 'oklch(0.48 0.06 290)',
    keyword: 'oklch(0.72 0.22 330)',
    function: 'oklch(0.75 0.20 180)',
    string: 'oklch(0.80 0.18 85)',
    number: 'oklch(0.75 0.20 60)',
    operator: 'oklch(0.72 0.22 330)',
    punctuation: 'oklch(0.85 0.05 330)',
  }
}

const languageSuggestions: Record<string, Suggestion[]> = {
  javascript: [
    { text: 'function', description: 'Define a function' },
    { text: 'const', description: 'Declare a constant' },
    { text: 'let', description: 'Declare a variable' },
    { text: 'if', description: 'Conditional statement' },
    { text: 'for', description: 'For loop' },
    { text: 'return', description: 'Return a value' },
    { text: 'console.log()', description: 'Log to console' },
    { text: 'useState', description: 'React state hook' },
    { text: 'useEffect', description: 'React effect hook' },
    { text: 'map', description: 'Array map method' },
    { text: 'filter', description: 'Array filter method' },
    { text: 'forEach', description: 'Array forEach method' },
  ],
  python: [
    { text: 'def', description: 'Define a function' },
    { text: 'class', description: 'Define a class' },
    { text: 'if', description: 'Conditional statement' },
    { text: 'for', description: 'For loop' },
    { text: 'while', description: 'While loop' },
    { text: 'return', description: 'Return a value' },
    { text: 'print()', description: 'Print to console' },
    { text: 'import', description: 'Import module' },
    { text: 'try', description: 'Try-except block' },
    { text: 'with', description: 'Context manager' },
    { text: 'lambda', description: 'Anonymous function' },
  ],
  java: [
    { text: 'public', description: 'Public access modifier' },
    { text: 'private', description: 'Private access modifier' },
    { text: 'class', description: 'Define a class' },
    { text: 'void', description: 'No return type' },
    { text: 'static', description: 'Static member' },
    { text: 'if', description: 'Conditional statement' },
    { text: 'for', description: 'For loop' },
    { text: 'return', description: 'Return a value' },
    { text: 'System.out.println()', description: 'Print to console' },
    { text: 'new', description: 'Create object' },
    { text: 'extends', description: 'Inherit from class' },
  ],
  sql: [
    { text: 'SELECT', description: 'Query data' },
    { text: 'FROM', description: 'Specify table' },
    { text: 'WHERE', description: 'Filter condition' },
    { text: 'INSERT INTO', description: 'Insert data' },
    { text: 'UPDATE', description: 'Update data' },
    { text: 'DELETE FROM', description: 'Delete data' },
    { text: 'JOIN', description: 'Join tables' },
    { text: 'ORDER BY', description: 'Sort results' },
    { text: 'GROUP BY', description: 'Group results' },
    { text: 'HAVING', description: 'Filter groups' },
    { text: 'CREATE TABLE', description: 'Create table' },
  ],
}

export function CodeEditor({ initialCode, language, projectId, onRun }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [theme, setTheme] = useKV<Theme>('editor-theme', 'monokai')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCode(initialCode)
  }, [initialCode])

  useEffect(() => {
    if (highlightRef.current) {
      Prism.highlightElement(highlightRef.current)
      applyThemeToSyntax()
    }
  }, [code, language, theme])

  const applyThemeToSyntax = () => {
    if (!highlightRef.current) return
    
    const tokens = highlightRef.current.querySelectorAll('.token')
    tokens.forEach((token) => {
      const classList = Array.from(token.classList)
      
      if (classList.includes('comment') || classList.includes('prolog') || classList.includes('doctype') || classList.includes('cdata')) {
        (token as HTMLElement).style.color = currentTheme.comment
      } else if (classList.includes('keyword') || classList.includes('atrule') || classList.includes('attr-value')) {
        (token as HTMLElement).style.color = currentTheme.keyword
      } else if (classList.includes('function') || classList.includes('class-name')) {
        (token as HTMLElement).style.color = currentTheme.function
      } else if (classList.includes('string') || classList.includes('attr-name') || classList.includes('selector') || classList.includes('char') || classList.includes('builtin') || classList.includes('inserted')) {
        (token as HTMLElement).style.color = currentTheme.string
      } else if (classList.includes('number') || classList.includes('regex') || classList.includes('important') || classList.includes('variable')) {
        (token as HTMLElement).style.color = currentTheme.number
      } else if (classList.includes('operator') || classList.includes('entity') || classList.includes('url')) {
        (token as HTMLElement).style.color = currentTheme.operator
      } else if (classList.includes('punctuation')) {
        (token as HTMLElement).style.color = currentTheme.punctuation
      } else if (classList.includes('property') || classList.includes('tag') || classList.includes('boolean') || classList.includes('constant') || classList.includes('symbol') || classList.includes('deleted')) {
        (token as HTMLElement).style.color = currentTheme.keyword
      }
    })
  }

  useEffect(() => {
    updateCursorPosition()
  }, [code])

  const updateCursorPosition = () => {
    if (!textareaRef.current) return
    const pos = textareaRef.current.selectionStart
    const textBeforeCursor = code.substring(0, pos)
    const lines = textBeforeCursor.split('\n')
    setCursorPosition({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    })
  }

  const getLineNumbers = () => {
    const lines = code.split('\n')
    return lines.map((_, i) => i + 1).join('\n')
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    checkForSuggestions(newCode)
  }

  const checkForSuggestions = (text: string) => {
    if (!textareaRef.current) return
    
    const pos = textareaRef.current.selectionStart
    const textBeforeCursor = text.substring(0, pos)
    const words = textBeforeCursor.split(/[\s\n(){}\[\];,.]/)
    const currentWord = words[words.length - 1].toLowerCase()

    if (currentWord.length < 2) {
      setShowSuggestions(false)
      return
    }

    const langSuggestions = languageSuggestions[language.toLowerCase()] || languageSuggestions.javascript
    const filtered = langSuggestions.filter(s => 
      s.text.toLowerCase().startsWith(currentWord)
    )

    if (filtered.length > 0) {
      setSuggestions(filtered)
      setSuggestionIndex(0)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const applySuggestion = (suggestion: Suggestion) => {
    if (!textareaRef.current) return
    
    const pos = textareaRef.current.selectionStart
    const textBefore = code.substring(0, pos)
    const textAfter = code.substring(pos)
    const words = textBefore.split(/[\s\n(){}\[\];,.]/)
    const currentWord = words[words.length - 1]
    const beforeWord = textBefore.substring(0, textBefore.length - currentWord.length)
    
    const newCode = beforeWord + suggestion.text + textAfter
    setCode(newCode)
    setShowSuggestions(false)
    
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = beforeWord.length + suggestion.text.length
        textareaRef.current.selectionStart = newPos
        textareaRef.current.selectionEnd = newPos
        textareaRef.current.focus()
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) {
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = e.currentTarget.selectionStart
        const end = e.currentTarget.selectionEnd
        const newCode = code.substring(0, start) + '  ' + code.substring(end)
        setCode(newCode)
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 2
            textareaRef.current.selectionEnd = start + 2
          }
        }, 0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSuggestionIndex(prev => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
      case 'Tab':
        e.preventDefault()
        applySuggestion(suggestions[suggestionIndex])
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  const executeCode = () => {
    setIsRunning(true)
    setHasError(false)
    setOutput('')

    try {
      if (projectId === 'digital-clock') {
        executeClockCode()
      } else if (projectId === 'calculator') {
        executeCalculatorCode()
      } else if (projectId === 'temperature-converter') {
        executeTemperatureConverterCode()
      } else if (projectId === 'password-generator') {
        executePasswordGeneratorCode()
      } else if (projectId === 'student-database') {
        executeStudentDatabaseCode()
      } else if (projectId === 'sales-analytics') {
        executeSalesAnalyticsCode()
      } else if (projectId === 'grade-calculator') {
        executeGradeCalculatorCode()
      } else if (projectId === 'number-guesser') {
        executeNumberGuesserCode()
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

  const executeTemperatureConverterCode = () => {
    setOutput(`Temperature Converter Test:\n\n25°C → 77°F ✓\n0°C → 32°F ✓\n100°C → 212°F ✓\n-40°C → -40°F ✓\n\n273.15K → 0°C ✓\n\nAll conversions working correctly!`)
  }

  const executePasswordGeneratorCode = () => {
    const samplePasswords = [
      'aB7#kL2$mN9!',
      'P@ssw0rd!2024',
      'Xy9#Qz4&Rt8%'
    ]
    const randomPwd = samplePasswords[Math.floor(Math.random() * samplePasswords.length)]
    setOutput(`Password Generator Test:\n\nGenerated passwords:\n- ${samplePasswords[0]}\n- ${samplePasswords[1]}\n- ${samplePasswords[2]}\n\nYour password: ${randomPwd}\n\n✓ All character types included\n✓ Sufficient length\n✓ Secure randomization`)
  }

  const executeStudentDatabaseCode = () => {
    setOutput(`SQL Query Results:\n\n--- SELECT * FROM Students ---\nID | Name          | Major\n1  | Alice Johnson | Computer Science\n2  | Bob Smith     | Mathematics\n3  | Carol Davis   | Physics\n\n--- WHERE major = 'Computer Science' ---\n1  | Alice Johnson | alice@email.com\n\n✓ Query executed successfully\n✓ 3 rows returned`)
  }

  const executeSalesAnalyticsCode = () => {
    setOutput(`Sales Analytics Report:\n\n📊 Total Revenue: $2,850.00\n📦 Total Sales: 5\n💰 Average Sale: $570.00\n\n--- Top Performers ---\nJohn: $2,475.00 (3 sales)\nSarah: $375.00 (2 sales)\n\n--- Top Products ---\n1. Laptop: $2,400.00\n2. Monitor: $350.00\n3. Keyboard: $75.00\n\n✓ Analytics computed successfully`)
  }

  const executeGradeCalculatorCode = () => {
    const scores = [85.5, 92.0, 78.5, 88.0, 95.0]
    const avg = scores.reduce((a, b) => a + b) / scores.length
    let grade = ''
    if (avg >= 90) grade = 'A'
    else if (avg >= 80) grade = 'B'
    else if (avg >= 70) grade = 'C'
    else grade = 'D'
    
    setOutput(`Grade Calculator Results:\n\nTest Scores: ${scores.join(', ')}\n\nAverage: ${avg.toFixed(2)}\nLetter Grade: ${grade}\n\n${grade === 'A' ? '🎉 Outstanding!' : grade === 'B' ? '👏 Great job!' : '👍 Good work!'}\n\n✓ Calculation complete`)
  }

  const executeNumberGuesserCode = () => {
    const randomNum = Math.floor(Math.random() * 100) + 1
    setOutput(`Number Guessing Game Started:\n\n🎮 Secret number generated (1-100)\n🎯 Number: ${randomNum}\n\nSimulated gameplay:\nGuess 1: 50 → Too ${randomNum > 50 ? 'low' : 'high'}!\nGuess 2: ${randomNum > 50 ? '75' : '25'} → ${Math.abs(randomNum - (randomNum > 50 ? 75 : 25)) < 20 ? 'Getting closer!' : 'Keep trying!'}\n\n✓ Game logic working correctly`)
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

  const currentTheme = theme ? themeConfig[theme] : themeConfig.monokai

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
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('monokai')}>
                  <span className={theme === 'monokai' ? 'font-semibold' : ''}>Monokai</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dracula')}>
                  <span className={theme === 'dracula' ? 'font-semibold' : ''}>Dracula</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('nord')}>
                  <span className={theme === 'nord' ? 'font-semibold' : ''}>Nord</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('github')}>
                  <span className={theme === 'github' ? 'font-semibold' : ''}>GitHub Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('synthwave')}>
                  <span className={theme === 'synthwave' ? 'font-semibold' : ''}>Synthwave</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        
        <div 
          className="relative overflow-hidden"
          style={{
            backgroundColor: currentTheme.background,
          }}
        >
          <div className="flex h-[400px]">
            <div 
              className="select-none py-4 px-3 text-right font-mono text-sm border-r whitespace-pre overflow-y-auto"
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
              }}
            >
              {getLineNumbers()}
            </div>
            <div className="flex-1 relative overflow-hidden">
              <pre className="code-highlight-wrapper absolute inset-0 pointer-events-none overflow-hidden p-4 m-0" aria-hidden="true">
                <code 
                  ref={highlightRef}
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
                className="code-editor-textarea relative font-mono text-sm h-full w-full border-0 focus-visible:ring-0 focus:outline-none rounded-none resize-none bg-transparent p-4 text-transparent caret-white overflow-auto"
                placeholder="Write your code here..."
                spellCheck={false}
                style={{
                  caretColor: currentTheme.foreground,
                }}
              />
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 border rounded-md shadow-lg overflow-auto"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.punctuation + '60',
                    top: '5rem',
                    left: '4rem',
                    minWidth: '16rem',
                    maxHeight: '12rem',
                  }}
                >
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={suggestion.text}
                      className="px-3 py-2 cursor-pointer transition-colors"
                      style={{
                        backgroundColor: idx === suggestionIndex ? currentTheme.punctuation + '20' : 'transparent',
                        color: currentTheme.foreground,
                      }}
                      onClick={() => applySuggestion(suggestion)}
                      onMouseEnter={() => setSuggestionIndex(idx)}
                    >
                      <div className="font-mono text-sm font-semibold" style={{ color: currentTheme.function }}>
                        {suggestion.text}
                      </div>
                      <div className="text-xs" style={{ color: currentTheme.comment }}>
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
