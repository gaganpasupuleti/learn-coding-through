import { useEffect, useState, type ReactNode } from 'react'
import type {
  SqlAnswerFeedback,
  SqlBottomTab,
  SqlDatabaseMeta,
  SqlExpectedOutputPreview,
  SqlPracticeQuestion,
  SqlQueryGrid,
  SqlSchemaRelationship,
} from '../types/sqlPractice.types'
import { SqlResultsPanel } from './SqlResultsPanel'
import { SqlMessagesPanel } from './SqlMessagesPanel'
import { SqlExpectedOutputPreviewPanel } from './SqlExpectedOutputPreview'
import { SqlAttemptHistoryPanel } from './SqlAttemptHistoryPanel'
import { SqlMistakesPanel } from './SqlMistakesPanel'
import { loadSqlAttempts, loadSqlMistakes } from '../utils/sqlPracticeStorage'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'
import { Box, History, LayoutGrid, MessageSquare, Table2, Target, AlertTriangle } from 'lucide-react'
import { SqlSchemaDiagram } from './schema/SqlSchemaDiagram'
import { SqlSchemaFullscreenDialog } from './schema/SqlSchemaFullscreenDialog'

const TABS: Array<{ id: SqlBottomTab; label: string; shortLabel: string; icon: typeof Table2 }> = [
  { id: 'results', label: 'Results', shortLabel: 'Results', icon: Table2 },
  { id: 'expected', label: 'Expected Output', shortLabel: 'Expected', icon: Target },
  { id: 'messages', label: 'Messages', shortLabel: 'Messages', icon: MessageSquare },
  { id: 'history', label: 'Attempt History', shortLabel: 'History', icon: History },
  { id: 'mistakes', label: 'Mistakes', shortLabel: 'Mistakes', icon: AlertTriangle },
  { id: 'schema', label: 'Schema Diagram', shortLabel: 'Schema', icon: LayoutGrid },
  { id: 'schema3d', label: '3D Schema', shortLabel: '3D', icon: Box },
]

interface SqlBottomPanelProps {
  messages: string[]
  result: SqlQueryGrid
  database: SqlDatabaseMeta
  question: SqlPracticeQuestion
  expectedPreview: SqlExpectedOutputPreview
  answerFeedback: SqlAnswerFeedback | null
  attemptHistoryVersion: number
  mistakesVersion: number
  preferredTab?: SqlBottomTab | null
  onRetryQuestion: (questionId: string, databaseId: SqlPracticeQuestion['databaseId'], sql: string) => void
  onLoadSql: (sql: string, questionId?: string, databaseId?: SqlPracticeQuestion['databaseId']) => void
  onLoadFailedSql?: (questionId: string, databaseId: SqlPracticeQuestion['databaseId'], sql: string) => void
  onClearResolvedMistakes?: () => void
  resolvedMistakeCount?: number
  onInsertJoinTemplate?: (relationship: SqlSchemaRelationship) => void
  headerActions?: ReactNode
}

export function SqlBottomPanel({
  messages,
  result,
  database,
  question,
  expectedPreview,
  answerFeedback,
  attemptHistoryVersion,
  mistakesVersion,
  preferredTab,
  onRetryQuestion,
  onLoadSql,
  onLoadFailedSql,
  onClearResolvedMistakes,
  resolvedMistakeCount = 0,
  onInsertJoinTemplate,
  headerActions,
}: SqlBottomPanelProps) {
  const [tab, setTab] = useState<SqlBottomTab>('results')
  const [schemaFullscreenOpen, setSchemaFullscreenOpen] = useState(false)
  const attempts = loadSqlAttempts()
  const mistakes = loadSqlMistakes()
  void attemptHistoryVersion
  void mistakesVersion

  useEffect(() => {
    if (preferredTab) setTab(preferredTab)
  }, [preferredTab])

  useEffect(() => {
    setSchemaFullscreenOpen(false)
  }, [database.id])

  return (
    <section className={cn('flex h-full min-h-0 flex-col', wb.panel)}>
      <div className={cn('flex flex-wrap items-center gap-1 border-b pr-1', wb.border)}>
        <div className={cn('flex min-w-0 flex-1 flex-wrap gap-0.5 px-1 sm:px-2', wb.border)}>
          {TABS.map((item) => {
            const Icon = item.icon
            const isActive = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                onClick={() => setTab(item.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1 rounded-sm px-2 py-2 text-xs font-medium transition-colors sm:gap-1.5 sm:px-2.5 sm:text-sm',
                  isActive
                    ? 'border-b-2 border-emerald-400 bg-emerald-950/25 text-emerald-100'
                    : wb.tabInactive,
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden min-[360px]:inline">{item.shortLabel}</span>
              </button>
            )
          })}
        </div>
        {headerActions}
      </div>
      <div className={cn('min-h-0 flex-1', tab === 'schema' ? 'overflow-hidden' : 'overflow-y-auto', wb.textSecondary)}>
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
          <SqlExpectedOutputPreviewPanel question={question} preview={expectedPreview} />
        )}
        {tab === 'messages' && <SqlMessagesPanel messages={messages} answerFeedback={answerFeedback} />}
        {tab === 'history' && <SqlAttemptHistoryPanel attempts={attempts} onLoadSql={onLoadSql} />}
        {tab === 'mistakes' && (
          <SqlMistakesPanel
            mistakes={mistakes}
            onRetryQuestion={onRetryQuestion}
            onLoadFailedSql={onLoadFailedSql ?? onRetryQuestion}
            onClearResolved={onClearResolvedMistakes}
            resolvedMistakeCount={resolvedMistakeCount}
          />
        )}
        {tab === 'schema' && (
          <div className="h-full min-h-[280px]">
            <SqlSchemaDiagram
              database={database}
              onRequestFullscreen={() => setSchemaFullscreenOpen(true)}
              onInsertJoinTemplate={onInsertJoinTemplate}
            />
          </div>
        )}
        {tab === 'schema3d' && (
          <div className={cn('flex min-h-[140px] flex-col gap-4 p-6', wb.textMuted)}>
            <div className="flex flex-col items-center gap-2 text-center">
              <Box className="h-8 w-8 text-[#475569]" />
              <p className="text-sm font-medium">3D schema view — coming soon</p>
              <p className="max-w-md text-xs">
                3D schema view is planned for a later phase. Current Phase 6 provides the interactive 2D ERD — use the
                Schema Diagram tab (or Expand schema) for full table and relationship exploration.
              </p>
            </div>
            <div className={cn('rounded-lg border p-4', wb.border, 'bg-[#111827]')}>
              <p className={cn('mb-2 text-xs font-semibold uppercase tracking-wide', wb.textMuted)}>
                {database.displayName} summary
              </p>
              <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {database.tables.map((tbl) => (
                  <li key={tbl.name} className="font-mono text-xs text-emerald-300/90">
                    {tbl.name}
                    <span className={cn('ml-1', wb.textMuted)}>({tbl.columns.length} cols)</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <SqlSchemaFullscreenDialog
        database={database}
        open={schemaFullscreenOpen}
        onClose={() => setSchemaFullscreenOpen(false)}
        onInsertJoinTemplate={onInsertJoinTemplate}
      />
    </section>
  )
}
