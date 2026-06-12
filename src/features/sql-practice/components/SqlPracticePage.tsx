import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getDatabaseById } from '../data/databaseCatalog'
import { getDefaultQuestionForDatabase, SQL_STARTER_QUERY } from '../data/sqlQuestions'
import { runUniversitySelectQuery } from '../engine/sqlRunner'
import type { SqlDatabaseId, SqlQueryGrid, SqlRunState } from '../types/sqlPractice.types'
import {
  appendSqlAttempt,
  loadRevealedHintCounts,
  saveRevealedHintCount,
} from '../utils/sqlPracticeStorage'
import { SqlPracticeLayout } from './SqlPracticeLayout'
import { SqlTopBar } from './SqlTopBar'
import { SqlObjectExplorer } from './SqlObjectExplorer'
import { SqlEditorPanel } from './SqlEditorPanel'
import { SqlQuestionPanel } from './SqlQuestionPanel'
import { SqlBottomPanel } from './SqlBottomPanel'
import { SqlStatusBar } from './SqlStatusBar'

const LATER_PHASE_MESSAGE = 'Execution for this database will be enabled in a later phase.'

const EMPTY_RESULT: SqlQueryGrid = {
  columns: [],
  rows: [],
  rowCount: 0,
  executionTimeMs: 0,
  hasRun: false,
}

export function SqlPracticePage() {
  const [databaseId, setDatabaseId] = useState<SqlDatabaseId>('university_system')
  const [sql, setSql] = useState(SQL_STARTER_QUERY)
  const [messages, setMessages] = useState<string[]>([])
  const [result, setResult] = useState<SqlQueryGrid>(EMPTY_RESULT)
  const [runState, setRunState] = useState<SqlRunState>('ready')
  const [isRunning, setIsRunning] = useState(false)
  const [attemptHistoryVersion, setAttemptHistoryVersion] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ tables: true })
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})

  const question = useMemo(() => getDefaultQuestionForDatabase(databaseId), [databaseId])
  const database = useMemo(() => getDatabaseById(databaseId), [databaseId])

  const [revealedHintCount, setRevealedHintCount] = useState(() => {
    const stored = loadRevealedHintCounts()
    return stored[question.id] ?? 0
  })

  useEffect(() => {
    const stored = loadRevealedHintCounts()
    setRevealedHintCount(stored[question.id] ?? 0)
  }, [question.id])

  const handleDatabaseChange = useCallback((id: SqlDatabaseId) => {
    setDatabaseId(id)
    const nextQ = getDefaultQuestionForDatabase(id)
    setSql(nextQ.starterSql)
    setExpandedTables({})
    setRunState('ready')
  }, [])

  const handleRun = useCallback(async () => {
    if (isRunning) return

    if (databaseId !== 'university_system') {
      setMessages([LATER_PHASE_MESSAGE])
      setResult(EMPTY_RESULT)
      setRunState('error')
      appendSqlAttempt({
        questionId: question.id,
        databaseId,
        sql,
        ranAt: new Date().toISOString(),
        status: 'blocked',
        success: false,
        rowCount: 0,
        executionTimeMs: 0,
        message: LATER_PHASE_MESSAGE,
      })
      setAttemptHistoryVersion((v) => v + 1)
      return
    }

    setIsRunning(true)
    setRunState('running')

    const outcome = await runUniversitySelectQuery(sql, () => {
      setMessages(['Loading SQL engine…'])
    })

    setIsRunning(false)

    if (outcome.blocked) {
      setMessages([outcome.error ?? 'Query blocked.'])
      setResult({ ...EMPTY_RESULT, hasRun: true })
      setRunState('error')
      appendSqlAttempt({
        questionId: question.id,
        databaseId,
        sql,
        ranAt: new Date().toISOString(),
        status: 'blocked',
        success: false,
        rowCount: 0,
        executionTimeMs: outcome.executionTimeMs,
        message: outcome.error ?? 'Query blocked.',
      })
      setAttemptHistoryVersion((v) => v + 1)
      return
    }

    if (!outcome.success) {
      setMessages([outcome.error ?? 'SQL execution failed.'])
      setResult({ ...EMPTY_RESULT, hasRun: true })
      setRunState('error')
      appendSqlAttempt({
        questionId: question.id,
        databaseId,
        sql,
        ranAt: new Date().toISOString(),
        status: 'error',
        success: false,
        rowCount: 0,
        executionTimeMs: outcome.executionTimeMs,
        message: outcome.error ?? 'SQL execution failed.',
      })
      setAttemptHistoryVersion((v) => v + 1)
      return
    }

    setMessages(outcome.messages)
    setResult({
      columns: outcome.columns,
      rows: outcome.rows,
      rowCount: outcome.rowCount,
      executionTimeMs: outcome.executionTimeMs,
      hasRun: true,
    })
    setRunState('success')
    appendSqlAttempt({
      questionId: question.id,
      databaseId,
      sql,
      ranAt: new Date().toISOString(),
      status: 'success',
      success: true,
      rowCount: outcome.rowCount,
      executionTimeMs: outcome.executionTimeMs,
      message: `Rows returned: ${outcome.rowCount}`,
    })
    setAttemptHistoryVersion((v) => v + 1)
  }, [databaseId, isRunning, question.id, sql])

  const handleCheckAnswer = useCallback(() => {
    toast.message('Answer checking will be enabled in Phase 3.')
  }, [])

  const handleResetQuery = useCallback(() => {
    setSql(question.starterSql)
    setRunState('ready')
  }, [question.starterSql])

  const handleFormatSql = useCallback(() => {
    // Format SQL deferred to a later phase.
  }, [])

  const handleClearOutput = useCallback(() => {
    setMessages([])
    setResult(EMPTY_RESULT)
    setRunState('ready')
  }, [])

  const handleRevealHint = useCallback(() => {
    if (revealedHintCount >= question.hints.length) return
    const next = revealedHintCount + 1
    setRevealedHintCount(next)
    saveRevealedHintCount(question.id, next)
  }, [question.hints.length, question.id, revealedHintCount])

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const toggleTable = useCallback((tableName: string) => {
    setExpandedTables((prev) => ({ ...prev, [tableName]: !prev[tableName] }))
  }, [])

  return (
    <SqlPracticeLayout
      topBar={
        <SqlTopBar
          databaseLabel={database.displayName}
          runState={runState}
          isRunning={isRunning}
          onRun={handleRun}
          onCheckAnswer={handleCheckAnswer}
          onResetQuery={handleResetQuery}
          onFormatSql={handleFormatSql}
          onClearOutput={handleClearOutput}
        />
      }
      objectExplorer={
        <SqlObjectExplorer
          activeDatabaseId={databaseId}
          onDatabaseChange={handleDatabaseChange}
          expandedSections={expandedSections}
          expandedTables={expandedTables}
          onToggleSection={toggleSection}
          onToggleTable={toggleTable}
        />
      }
      editorPanel={<SqlEditorPanel sql={sql} onChange={setSql} onRun={handleRun} />}
      questionPanel={
        <SqlQuestionPanel
          question={question}
          revealedHintCount={revealedHintCount}
          onRevealHint={handleRevealHint}
        />
      }
      bottomPanel={
        <SqlBottomPanel
          messages={messages}
          result={result}
          database={database}
          expectedColumns={question.expectedColumns}
          attemptHistoryVersion={attemptHistoryVersion}
        />
      }
      statusBar={
        <SqlStatusBar
          databaseName={database.displayName}
          tableCount={database.tables.length}
          questionTitle={question.title}
          runState={runState}
        />
      }
    />
  )
}
