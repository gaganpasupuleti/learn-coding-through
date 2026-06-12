import { useCallback, useEffect, useRef, useState } from 'react'
import type { Monaco } from '@monaco-editor/react'
import type { IDisposable } from 'monaco-editor'
import { Sparkles } from 'lucide-react'
import { CodeEditor } from '@/components/CodeEditor'
import type { SqlDatabaseId, SqlDatabaseMeta } from '../types/sqlPractice.types'
import { registerSqlCompletionProvider } from '../editor-intelligence/sqlCompletionProvider'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

const MONACO_MOUNT_TIMEOUT_MS = 12_000

interface SqlEditorPanelProps {
  sql: string
  databaseId: SqlDatabaseId
  database: SqlDatabaseMeta
  onChange: (sql: string) => void
  onRun?: () => void
}

export function SqlEditorPanel({ sql, databaseId, database, onChange, onRun }: SqlEditorPanelProps) {
  const [useFallback, setUseFallback] = useState(false)
  const monacoMountedRef = useRef(false)
  const monacoRef = useRef<Monaco | null>(null)
  const sqlCompletionRef = useRef<IDisposable | null>(null)
  const executionNote =
    databaseId !== 'university_system'
      ? 'Run is enabled only for University System in Phase 2. Other databases execute in later phases.'
      : null

  useEffect(() => {
    if (!onRun) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        onRun()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRun])

  useEffect(() => {
    monacoMountedRef.current = false
    setUseFallback(false)
    const timer = window.setTimeout(() => {
      if (!monacoMountedRef.current) {
        setUseFallback(true)
      }
    }, MONACO_MOUNT_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const handleEditorMount = useCallback((_editor: unknown, monaco: Monaco) => {
    monacoMountedRef.current = true
    monacoRef.current = monaco
    setUseFallback(false)
  }, [])

  useEffect(() => {
    const monaco = monacoRef.current
    if (!monaco || useFallback) return
    sqlCompletionRef.current?.dispose()
    sqlCompletionRef.current = registerSqlCompletionProvider(monaco, database)
  }, [database, useFallback])

  useEffect(() => {
    return () => {
      sqlCompletionRef.current?.dispose()
      sqlCompletionRef.current = null
    }
  }, [])

  return (
    <div className={cn('flex h-full min-h-0 flex-col', wb.editor)}>
      <div className={cn('flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3', wb.border, 'bg-[#252526]')}>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className={cn('text-sm font-semibold', wb.textPrimary)}>Query Editor</span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/50 bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-200"
            title="Offline SQL suggestions — no AI"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
            SQL suggestions
          </span>
        </div>
        <span className={cn('text-xs', wb.textMuted)}>SQL · Monaco · Ctrl+Space</span>
      </div>

      {executionNote && (
        <p className={cn('border-b px-4 py-2 text-xs leading-relaxed text-amber-200/90', wb.border, 'bg-amber-950/20')}>
          {executionNote}
        </p>
      )}

      <div className="sql-practice-editor relative min-h-0 flex-1 overflow-hidden">
        {useFallback ? (
          <textarea
            value={sql}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
            className="h-full min-h-[280px] w-full resize-none border-0 bg-[#1e1e1e] p-4 font-mono text-[16px] leading-[26px] text-[#d4d4d4] outline-none focus:ring-2 focus:ring-emerald-500/40"
            aria-label="SQL query editor fallback"
            placeholder="Write your SQL query here…"
          />
        ) : (
          <CodeEditor
            code={sql}
            onChange={onChange}
            language="sql"
            monacoTheme="vs-dark"
            showExecutionControls={false}
            showOutputPanel={false}
            showEditorChrome={false}
            fontSize={16}
            lineHeight={26}
            enableQuickSuggestions
            onEditorMount={handleEditorMount}
          />
        )}
      </div>
    </div>
  )
}
