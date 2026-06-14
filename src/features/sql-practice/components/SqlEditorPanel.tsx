import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Monaco } from '@monaco-editor/react'
import type { IDisposable, editor as MonacoEditor } from 'monaco-editor'
import { Keyboard, Sparkles } from 'lucide-react'
import { CodeEditor } from '@/components/CodeEditor'
import type { SqlDatabaseId, SqlDatabaseMeta } from '../types/sqlPractice.types'
import { registerSqlCompletionProvider } from '../editor-intelligence/sqlCompletionProvider'
import { isExecutableSqlDatabase } from '../engine/sqlEngine'
import { insertSnippetAtCursor } from '../utils/sqlEditorInsert'
import { SqlShortcutHelp } from './SqlShortcutHelp'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

const MONACO_MOUNT_TIMEOUT_MS = 12_000

export interface SqlEditorPanelHandle {
  insertSnippet: (snippet: string) => void
  replaceSql: (sql: string) => void
}

interface SqlEditorPanelProps {
  sql: string
  databaseId: SqlDatabaseId
  database: SqlDatabaseMeta
  onChange: (sql: string) => void
  onRun?: () => void
  onCheckAnswer?: () => void
  onFormatSql?: () => void
  onClearOutput?: () => void
  editorStatus?: string | null
}

function isEditableShortcutTarget(active: Element | null, editorArea: HTMLElement | null): boolean {
  if (!active || !editorArea) return false
  if (!editorArea.contains(active)) return false
  if (active instanceof HTMLTextAreaElement) return true
  if (active instanceof HTMLInputElement || active instanceof HTMLSelectElement || active instanceof HTMLButtonElement) {
    return false
  }
  return active.closest('.monaco-editor') !== null || active.getAttribute('contenteditable') === 'true'
}

export const SqlEditorPanel = forwardRef<SqlEditorPanelHandle, SqlEditorPanelProps>(function SqlEditorPanel(
  {
    sql,
    databaseId,
    database,
    onChange,
    onRun,
    onCheckAnswer,
    onFormatSql,
    onClearOutput,
    editorStatus,
  },
  ref,
) {
  const [useFallback, setUseFallback] = useState(false)
  const monacoMountedRef = useRef(false)
  const monacoRef = useRef<Monaco | null>(null)
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const editorAreaRef = useRef<HTMLDivElement | null>(null)
  const sqlCompletionRef = useRef<IDisposable | null>(null)
  const executionNote = !isExecutableSqlDatabase(databaseId)
    ? 'Run and answer checking for this database will be enabled in a later phase.'
    : null

  const getCursorOffset = useCallback((): number => {
    if (useFallback && textareaRef.current) {
      return textareaRef.current.selectionStart ?? sql.length
    }
    const editor = editorRef.current
    const model = editor?.getModel()
    const position = editor?.getPosition()
    if (!editor || !model || !position) return sql.length
    return model.getOffsetAt(position)
  }, [sql.length, useFallback])

  const applySqlUpdate = useCallback(
    (nextSql: string, cursorOffset?: number) => {
      onChange(nextSql)
      const offset = cursorOffset ?? nextSql.length
      if (useFallback) {
        requestAnimationFrame(() => {
          const el = textareaRef.current
          if (!el) return
          el.focus()
          const safeOffset = Math.min(offset, nextSql.length)
          el.setSelectionRange(safeOffset, safeOffset)
        })
        return
      }
      const editor = editorRef.current
      const model = editor?.getModel()
      if (!editor || !model) return
      const position = model.getPositionAt(Math.min(offset, nextSql.length))
      editor.setPosition(position)
      editor.focus()
    },
    [onChange, useFallback],
  )

  useImperativeHandle(
    ref,
    () => ({
      insertSnippet(snippet: string) {
        const { text, cursorOffset } = insertSnippetAtCursor(sql, snippet, getCursorOffset())
        applySqlUpdate(text, cursorOffset)
      },
      replaceSql(nextSql: string) {
        applySqlUpdate(nextSql, nextSql.length)
      },
    }),
    [applySqlUpdate, getCursorOffset, sql],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isEditableShortcutTarget(document.activeElement, editorAreaRef.current)) return

      const mod = event.ctrlKey || event.metaKey
      if (!mod) return

      if (event.key === 'Enter' && event.shiftKey) {
        if (!onCheckAnswer) return
        event.preventDefault()
        onCheckAnswer()
        return
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        if (!onRun) return
        event.preventDefault()
        onRun()
        return
      }

      if (event.key.toLowerCase() === 'f' && event.shiftKey) {
        if (!onFormatSql) return
        event.preventDefault()
        onFormatSql()
        return
      }

      if (event.key.toLowerCase() === 'l' && event.shiftKey) {
        if (!onClearOutput) return
        event.preventDefault()
        onClearOutput()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCheckAnswer, onClearOutput, onFormatSql, onRun])

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

  const handleEditorMount = useCallback((editor: MonacoEditor.IStandaloneCodeEditor, monaco: Monaco) => {
    monacoMountedRef.current = true
    monacoRef.current = monaco
    editorRef.current = editor
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
      <div className={cn('flex flex-col gap-2 border-b px-4 py-2.5 sm:py-3', wb.border, 'bg-[#252526]')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <span className={cn('text-sm font-semibold', wb.textPrimary)}>Query Editor</span>
            {useFallback ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/60 bg-slate-900/50 px-2.5 py-1 text-xs text-slate-300"
                title="Monaco editor unavailable — basic textarea mode without SQL suggestions"
              >
                <Keyboard className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                Basic editor mode
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/50 bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-200"
                title="Offline SQL suggestions — press Ctrl + Space in the editor"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
                SQL suggestions · Ctrl + Space
              </span>
            )}
          </div>
          {editorStatus && (
            <span className={cn('max-w-[min(100%,280px)] truncate text-xs text-emerald-300/90', wb.textMuted)}>
              {editorStatus}
            </span>
          )}
        </div>
        <SqlShortcutHelp showSuggestions={!useFallback} compact />
      </div>

      {executionNote && (
        <p className={cn('border-b px-4 py-2 text-xs leading-relaxed text-amber-200/90', wb.border, 'bg-amber-950/20')}>
          {executionNote}
        </p>
      )}

      <div ref={editorAreaRef} className="sql-practice-editor relative min-h-0 flex-1 overflow-hidden">
        {useFallback ? (
          <textarea
            ref={textareaRef}
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
})
