import { useEffect, useState, type ReactNode } from 'react'
import type { SqlAnswerFeedback, SqlBottomTab, SqlDatabaseMeta, SqlQueryGrid } from '../types/sqlPractice.types'
import { SqlResultsPanel } from './SqlResultsPanel'
import { SqlMessagesPanel } from './SqlMessagesPanel'
import { formatAttemptActionLabel, loadSqlAttempts, loadSqlMistakes } from '../utils/sqlPracticeStorage'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'
import { Box, History, LayoutGrid, MessageSquare, Table2, Target, AlertTriangle } from 'lucide-react'

const TABS: Array<{ id: SqlBottomTab; label: string; icon: typeof Table2 }> = [
  { id: 'results', label: 'Results', icon: Table2 },
  { id: 'expected', label: 'Expected Output', icon: Target },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'history', label: 'Attempt History', icon: History },
  { id: 'mistakes', label: 'Mistakes', icon: AlertTriangle },
  { id: 'schema', label: 'Schema Diagram', icon: LayoutGrid },
  { id: 'schema3d', label: '3D Schema', icon: Box },
]

interface SqlBottomPanelProps {
  messages: string[]
  result: SqlQueryGrid
  database: SqlDatabaseMeta
  expectedColumns: string[]
  answerFeedback: SqlAnswerFeedback | null
  attemptHistoryVersion: number
  mistakesVersion: number
  preferredTab?: SqlBottomTab | null
  headerActions?: ReactNode
}

export function SqlBottomPanel({
  messages,
  result,
  database,
  expectedColumns,
  answerFeedback,
  attemptHistoryVersion,
  mistakesVersion,
  preferredTab,
  headerActions,
}: SqlBottomPanelProps) {
  const [tab, setTab] = useState<SqlBottomTab>('results')
  // attemptHistoryVersion / mistakesVersion intentionally trigger reload from localStorage
  const attempts = loadSqlAttempts()
  const mistakes = loadSqlMistakes()
  void attemptHistoryVersion
  void mistakesVersion

  useEffect(() => {
    if (preferredTab) setTab(preferredTab)
  }, [preferredTab])

  return (
    <section className={cn('flex h-full min-h-0 flex-col', wb.panel)}>
      <div className={cn('flex items-center gap-1 border-b pr-1', wb.border)}>
        <div className={cn('flex min-w-0 flex-1 gap-0.5 overflow-x-auto px-2', wb.border)}>
        {TABS.map((item) => {
          const Icon = item.icon
          const isActive = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-b-2 border-emerald-400 bg-emerald-950/25 text-emerald-100'
                  : wb.tabInactive,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          )
        })}
        </div>
        {headerActions}
      </div>
      <div className={cn('min-h-0 flex-1 overflow-y-auto', wb.textSecondary)}>
        {tab === 'results' && (
          <SqlResultsPanel
            result={result}
            emptyMessage={
              result.hasRun && !result.errorMessage && result.rowCount === 0
                ? 'Query returned no rows.'
                : undefined
            }
          />
        )}
        {tab === 'expected' && (
          <div className={cn('p-4 text-sm', wb.textMuted)}>
            <p className="mb-2">Expected column names for the current question:</p>
            <p className={cn('text-xs uppercase tracking-widest', wb.sectionLabel)}>Columns</p>
            <p className="font-mono text-emerald-300">{expectedColumns.join(' | ') || '—'}</p>
            {answerFeedback && (
              <p className="mt-3 text-xs">Expected row count: {answerFeedback.expectedRowCount}</p>
            )}
          </div>
        )}
        {tab === 'messages' && <SqlMessagesPanel messages={messages} answerFeedback={answerFeedback} />}
        {tab === 'history' && (
          <div className={cn('p-4 text-sm', wb.textMuted)}>
            {attempts.length === 0 ? (
              <p>No attempts recorded yet. Run a query or check your answer to populate history.</p>
            ) : (
              <ul className="space-y-3">
                {attempts.map((a) => (
                  <li key={a.id} className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-semibold',
                          a.status === 'passed' && 'bg-emerald-950/60 text-emerald-200',
                          a.status === 'failed' && 'bg-rose-950/60 text-rose-200',
                          a.status === 'blocked' && 'bg-amber-950/60 text-amber-200',
                          a.status === 'error' && 'bg-rose-950/60 text-rose-200',
                          a.status === 'success' && 'bg-sky-950/60 text-sky-200',
                        )}
                      >
                        {formatAttemptActionLabel(a.action, a.status)}
                      </span>
                      {a.questionTitle && <span className="font-medium text-violet-200">{a.questionTitle}</span>}
                      <span className={wb.textMuted}>{new Date(a.ranAt).toLocaleString()}</span>
                    </div>
                    <p className="mb-1 font-mono text-xs text-slate-300">{a.sql.trim().slice(0, 200)}{a.sql.length > 200 ? '…' : ''}</p>
                    <p className="text-xs">
                      {a.message}
                      {a.rowCount > 0 && ` · ${a.rowCount} rows`}
                      {a.executionTimeMs > 0 && ` · ${Math.round(a.executionTimeMs)} ms`}
                    </p>
                    {a.feedbackSummary && <p className="mt-1 text-xs text-amber-200">{a.feedbackSummary}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === 'mistakes' && (
          <div className={cn('p-4 text-sm', wb.textMuted)}>
            {mistakes.length === 0 ? (
              <p>No SQL mistakes tracked yet. Failed answer checks appear here.</p>
            ) : (
              <ul className="space-y-3">
                {mistakes.map((m) => (
                  <li key={m.id} className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-rose-950/60 px-2 py-0.5 font-semibold text-rose-200">
                        {m.errorType.replace(/_/g, ' ')}
                      </span>
                      <span className={wb.textMuted}>{new Date(m.recordedAt).toLocaleString()}</span>
                    </div>
                    <p className="mb-1 font-mono text-xs text-slate-300">{m.sql.trim().slice(0, 200)}{m.sql.length > 200 ? '…' : ''}</p>
                    <p className="text-xs">{m.feedback}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === 'schema' && (
          <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {database.tables.slice(0, 6).map((tbl) => (
              <div key={tbl.name} className={cn('rounded-lg border p-3', wb.border, 'bg-[#111827]')}>
                <p className={cn('mb-2 font-mono text-sm font-semibold text-emerald-300', wb.textPrimary)}>
                  {tbl.name}
                </p>
                <ul className={cn('space-y-0.5 text-xs', wb.textMuted)}>
                  {tbl.columns.slice(0, 4).map((c) => (
                    <li key={c.name}>
                      {c.name} <span className="text-[#64748B]">{c.dataType}</span>
                    </li>
                  ))}
                  {tbl.columns.length > 4 && <li>+{tbl.columns.length - 4} more…</li>}
                </ul>
              </div>
            ))}
            <p className={cn('col-span-full text-xs', wb.textMuted)}>
              Full interactive schema diagram coming in a later phase.
            </p>
          </div>
        )}
        {tab === 'schema3d' && (
          <div className={cn('flex min-h-[140px] flex-col items-center justify-center gap-2 p-6 text-center', wb.textMuted)}>
            <Box className="h-8 w-8 text-[#475569]" />
            <p className="text-sm font-medium">Coming in Phase 6</p>
            <p className="max-w-sm text-xs">3D schema exploration will be added after core SQL practice is stable.</p>
          </div>
        )}
      </div>
    </section>
  )
}
