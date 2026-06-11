import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getDatabaseById } from '../data/databaseCatalog'
import { getDefaultQuestionForDatabase, SQL_STARTER_QUERY } from '../data/sqlQuestions'
import type { SqlDatabaseId } from '../types/sqlPractice.types'
import { loadRevealedHintCounts, saveRevealedHintCount } from '../utils/sqlPracticeStorage'
import { SqlPracticeLayout } from './SqlPracticeLayout'
import { SqlTopBar } from './SqlTopBar'
import { SqlObjectExplorer } from './SqlObjectExplorer'
import { SqlEditorPanel } from './SqlEditorPanel'
import { SqlQuestionPanel } from './SqlQuestionPanel'
import { SqlBottomPanel } from './SqlBottomPanel'
import { SqlStatusBar } from './SqlStatusBar'

const PHASE2_RUN_MESSAGE = 'SQL execution will be enabled in Phase 2.'

export function SqlPracticePage() {
  const [databaseId, setDatabaseId] = useState<SqlDatabaseId>('university_system')
  const [sql, setSql] = useState(SQL_STARTER_QUERY)
  const [messages, setMessages] = useState<string[]>([])
  const [statusText, setStatusText] = useState('Ready')
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
    setStatusText(`Switched to ${getDatabaseById(id).displayName}`)
  }, [])

  const handleRun = useCallback(() => {
    toast.message(PHASE2_RUN_MESSAGE)
    setStatusText('Run — Phase 2')
    setMessages((prev) => [...prev, `[info] ${PHASE2_RUN_MESSAGE}`])
  }, [])

  const handleCheckAnswer = useCallback(() => {
    toast.message('Answer checking will be enabled in Phase 3.')
    setStatusText('Check Answer — coming soon')
  }, [])

  const handleResetQuery = useCallback(() => {
    setSql(question.starterSql)
    setStatusText('Query reset')
    toast.success('Query reset to starter SQL.')
  }, [question.starterSql])

  const handleFormatSql = useCallback(() => {
    toast.message('SQL formatting will be added in a later phase.')
  }, [])

  const handleClearOutput = useCallback(() => {
    setMessages([])
    setStatusText('Output cleared')
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
          statusText={statusText}
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
      editorPanel={<SqlEditorPanel sql={sql} onChange={setSql} />}
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
          database={database}
          expectedColumns={question.expectedColumns}
        />
      }
      statusBar={
        <SqlStatusBar
          databaseName={database.displayName}
          tableCount={database.tables.length}
          questionTitle={question.title}
        />
      }
    />
  )
}
