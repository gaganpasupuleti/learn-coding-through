import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-typescript'

interface CodeDisplayProps {
  code: string
  language: string
  title?: string
  maxHeight?: string
}

const themeConfig = {
  background: 'oklch(0.18 0.02 60)',
  foreground: 'oklch(0.95 0.01 60)',
  comment: 'oklch(0.55 0.02 60)',
  keyword: 'oklch(0.75 0.20 330)',
  function: 'oklch(0.75 0.15 110)',
  string: 'oklch(0.78 0.18 85)',
  number: 'oklch(0.70 0.18 290)',
  operator: 'oklch(0.85 0.15 330)',
  punctuation: 'oklch(0.90 0.01 60)',
}

const getPrismLanguage = (lang: string) => {
  const langMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    sql: 'sql',
  }
  return langMap[lang.toLowerCase()] || 'javascript'
}

const getLineNumbers = (code: string) => {
  const lines = code.split('\n')
  return lines.map((_, i) => i + 1).join('\n')
}

export function CodeDisplay({
  code,
  language,
  title = 'Code',
  maxHeight = '600px',
}: CodeDisplayProps) {
  const highlightRef = useRef<HTMLElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const codeContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (highlightRef.current) {
      Prism.highlightElement(highlightRef.current)
      applyThemeToSyntax()
    }
  }, [code, language])

  const applyThemeToSyntax = () => {
    if (!highlightRef.current) return

    const tokens = highlightRef.current.querySelectorAll('.token')
    tokens.forEach((token) => {
      const classList = Array.from(token.classList)

      if (
        classList.includes('comment') ||
        classList.includes('prolog') ||
        classList.includes('doctype') ||
        classList.includes('cdata')
      ) {
        (token as HTMLElement).style.color = themeConfig.comment
      } else if (
        classList.includes('keyword') ||
        classList.includes('atrule') ||
        classList.includes('attr-value')
      ) {
        (token as HTMLElement).style.color = themeConfig.keyword
      } else if (classList.includes('function') || classList.includes('class-name')) {
        (token as HTMLElement).style.color = themeConfig.function
      } else if (
        classList.includes('string') ||
        classList.includes('attr-name') ||
        classList.includes('selector') ||
        classList.includes('char') ||
        classList.includes('builtin') ||
        classList.includes('inserted')
      ) {
        (token as HTMLElement).style.color = themeConfig.string
      } else if (
        classList.includes('number') ||
        classList.includes('regex') ||
        classList.includes('important') ||
        classList.includes('variable')
      ) {
        (token as HTMLElement).style.color = themeConfig.number
      } else if (classList.includes('operator') || classList.includes('entity') || classList.includes('url')) {
        (token as HTMLElement).style.color = themeConfig.operator
      } else if (classList.includes('punctuation')) {
        (token as HTMLElement).style.color = themeConfig.punctuation
      } else if (
        classList.includes('property') ||
        classList.includes('tag') ||
        classList.includes('boolean') ||
        classList.includes('constant') ||
        classList.includes('symbol') ||
        classList.includes('deleted')
      ) {
        (token as HTMLElement).style.color = themeConfig.keyword
      }
    })
  }

  const handleScroll = () => {
    if (codeContainerRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = codeContainerRef.current.scrollTop
    }
  }

  return (
    <Card className="border-2 overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
            <div className="w-3 h-3 rounded-full bg-accent/60"></div>
            <div className="w-3 h-3 rounded-full bg-primary/60"></div>
          </div>
          <span className="text-sm font-medium text-muted-foreground ml-2">
            {title} - {language.toUpperCase()}
          </span>
        </div>
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: themeConfig.background,
        }}
      >
        <div className="flex" style={{ maxHeight }}>
          <div
            ref={lineNumbersRef}
            className="select-none py-4 px-3 text-right font-mono text-sm border-r whitespace-pre"
            style={{
              backgroundColor: themeConfig.background,
              color: themeConfig.comment,
              borderColor: themeConfig.punctuation + '20',
              minWidth: '3.5rem',
              lineHeight: '1.5',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              overflowY: 'hidden',
              overflowX: 'hidden',
            }}
          >
            {getLineNumbers(code)}
          </div>

          <div
            ref={codeContainerRef}
            className="flex-1 overflow-auto p-4"
            style={{
              backgroundColor: themeConfig.background,
              lineHeight: '1.5',
            }}
            onScroll={handleScroll}
          >
            <pre
              className="m-0"
              style={{
                backgroundColor: 'transparent',
              }}
            >
              <code
                ref={highlightRef}
                className={`language-${getPrismLanguage(language)} block min-h-full`}
                style={{
                  color: themeConfig.foreground,
                }}
              >
                {code}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </Card>
  )
}
