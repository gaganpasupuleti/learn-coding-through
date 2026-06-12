import { useMemo, useState, type ReactNode } from 'react'
import type { SqlBottomTab, SqlDatabaseMeta, SqlQueryGrid } from '../types/sqlPractice.types'
import { SqlResultsPanel } from './SqlResultsPanel'
import { SqlMessagesPanel } from './SqlMessagesPanel'
import { loadSqlAttempts, loadSqlMistakes } from '../utils/sqlPracticeStorage'
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
  attemptHistoryVersion: number
  headerActions?: ReactNode
}

export function SqlBottomPanel({
  messages,
  result,
  database,
  expectedColumns,
  attemptHistoryVersion,
  headerActions,
}: SqlBottomPanelProps) {
  const [tab, setTab] = useState<SqlBottomTab>('results')
  const attempts = useMemo(() => loadSqlAttempts(), [attemptHistoryVersion])
  const mistakes = loadSqlMistakes()

  return (
    <section className={cn('flex h-full min-h-0 flex-col', wb.panel)}>
      <div className={cn('flex items-center gap-1 border-b pr-1', wb.border)}>
        <div className={cn('flex min-w-0 flex-1 gap-0.5 overflow-x-auto px-2', wb.border)}>
        {TABS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors',
                tab === item.id
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
            emptyMessage={result.hasRun && result.rowCount === 0 ? 'Query returned no rows.' : undefined}
          />
        )}
        {tab === 'expected' && (
          <div className={cn('p-4 text-sm', wb.textMuted)}>
            <p className="mb-2">Expected output preview (validation in Phase 3+).</p>
            <p className={cn('text-xs uppercase tracking-widest', wb.sectionLabel)}>Columns</p>
            <p className="font-mono text-emerald-300">{expectedColumns.join(' | ') || '—'}</p>
          </div>
        )}
        {tab === 'messages' && <SqlMessagesPanel messages={messages} />}
        {tab === 'history' && (
          <div className={cn('p-4 text-sm', wb.textMuted)}>
            {attempts.length === 0 ? (
              <p>No attempts recorded yet. Run a query to populate history.</p>
            ) : (
              <ul className="space-y-2">
                {attempts.map((a) => (
                  <li key={a.id} className="font-mono text-xs">
                    {a.ranAt} — [{a.status}] {a.message}
                    {a.rowCount > 0 && ` · ${a.rowCount} rows`}
                    {a.executionTimeMs > 0 && ` · ${Math.round(a.executionTimeMs)} ms`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === 'mistakes' && (
          <div className={cn('p-4 text-sm', wb.textMuted)}>
            {mistakes.length === 0 ? (
              <p>No SQL mistakes tracked yet.</p>
            ) : (
              <ul className="space-y-2">
                {mistakes.map((m) => (
                  <li key={m.id}>{m.message}</li>
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
