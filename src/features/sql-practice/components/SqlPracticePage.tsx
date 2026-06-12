import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDatabaseById } from '../data/databaseCatalog'
import {
  getDefaultQuestionForDatabase,
  getQuestionById,
  getQuestionsForDatabase,
  getStarterQueryForDatabase,
} from '../data/sqlQuestions'
import { isExecutableSqlDatabase } from '../engine/sqlEngine'
import { runSelectQuery, runTrustedSql } from '../engine/sqlRunner'
import { validateSqlResults } from '../engine/sqlResultValidator'
import type {
  SqlAnswerFeedback,
  SqlBottomTab,
  SqlDatabaseId,
  SqlQueryGrid,
  SqlRunState,
} from '../types/sqlPractice.types'
import { getValidationOptionsForQuestion } from '../types/sqlPractice.types'
import {
  appendSqlAttempt,
  appendSqlMistake,
  loadRevealedHintCounts,
  loadRevealedSolutionIds,
  saveRevealedHintCount,
  saveSolutionRevealed,
} from '../utils/sqlPracticeStorage'
import { SqlPracticeLayout } from './SqlPracticeLayout'
import { SqlTopBar } from './SqlTopBar'
import { SqlObjectExplorer } from './SqlObjectExplorer'
import { SqlEditorPanel } from './SqlEditorPanel'
import { SqlQuestionPanel } from './SqlQuestionPanel'
import { SqlBottomPanel } from './SqlBottomPanel'
import { SqlStatusBar } from './SqlStatusBar'
import { useResizableSqlLayout } from '../hooks/useResizableSqlLayout'
import { buildSqlErrorMessages } from '../utils/sqlExecutionMessages'

const LATER_PHASE_RUN_MESSAGE = 'Execution for this database will be enabled in a later phase.'
const LATER_PHASE_CHECK_MESSAGE = 'Answer checking for this database will be enabled in a later phase.'

const EMPTY_RESULT: SqlQueryGrid = {
  columns: [],
  rows: [],
  rowCount: 0,
  executionTimeMs: 0,
  hasRun: false,
}

export function SqlPracticePage() {
  const [databaseId, setDatabaseId] = useState<SqlDatabaseId>('university_system')
  const [questionId, setQuestionId] = useState(() => getDefaultQuestionForDatabase('university_system').id)
  const [sql, setSql] = useState(() => getStarterQueryForDatabase('university_system'))
  const [messages, setMessages] = useState<string[]>([])
  const [result, setResult] = useState<SqlQueryGrid>(EMPTY_RESULT)
  const [runState, setRunState] = useState<SqlRunState>('ready')
  const [isRunning, setIsRunning] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [answerFeedback, setAnswerFeedback] = useState<SqlAnswerFeedback | null>(null)
  const [attemptHistoryVersion, setAttemptHistoryVersion] = useState(0)
  const [mistakesVersion, setMistakesVersion] = useState(0)
  const [preferredBottomTab, setPreferredBottomTab] = useState<SqlBottomTab | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ tables: true })
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})

  const questionsForDb = useMemo(() => getQuestionsForDatabase(databaseId), [databaseId])
  const question = useMemo(
    () => getQuestionById(questionId) ?? getDefaultQuestionForDatabase(databaseId),
    [questionId, databaseId],
  )
  const database = useMemo(() => getDatabaseById(databaseId), [databaseId])
  const resizableLayout = useResizableSqlLayout()

  const [revealedHintCount, setRevealedHintCount] = useState(() => {
    const stored = loadRevealedHintCounts()
    return stored[question.id] ?? 0
  })

  const [solutionRevealed, setSolutionRevealed] = useState(() => {
    const stored = loadRevealedSolutionIds()
    return stored[question.id] ?? false
  })

  useEffect(() => {
    const storedHints = loadRevealedHintCounts()
    setRevealedHintCount(storedHints[question.id] ?? 0)
    const storedSolutions = loadRevealedSolutionIds()
    setSolutionRevealed(storedSolutions[question.id] ?? false)
    setAnswerFeedback(null)
  }, [question.id])

  const bumpHistory = useCallback(() => {
    setAttemptHistoryVersion((v) => v + 1)
  }, [])

  const handleDatabaseChange = useCallback((id: SqlDatabaseId) => {
    setDatabaseId(id)
    const nextQ = getDefaultQuestionForDatabase(id)
    setQuestionId(nextQ.id)
    setSql(nextQ.starterSql)
    setMessages([])
    setResult(EMPTY_RESULT)
    setExpandedTables({})
    setRunState('ready')
    setAnswerFeedback(null)
    setPreferredBottomTab(null)
  }, [])

  const handleSelectQuestion = useCallback(
    (id: string) => {
      const next = getQuestionById(id)
      if (!next || next.databaseId !== databaseId) return
      setQuestionId(id)
      setSql(next.starterSql)
      setMessages([])
      setResult(EMPTY_RESULT)
      setRunState('ready')
      setAnswerFeedback(null)
      setPreferredBottomTab(null)
    },
    [databaseId],
  )

  const handleRun = useCallback(async () => {
    if (isRunning || isChecking) return

    if (!isExecutableSqlDatabase(databaseId)) {
      setMessages([LATER_PHASE_RUN_MESSAGE])
      setResult(EMPTY_RESULT)
      setRunState('error')
      setPreferredBottomTab('messages')
      appendSqlAttempt({
        questionId: question.id,
        questionTitle: question.title,
        databaseId,
        sql,
        ranAt: new Date().toISOString(),
        action: 'run',
        status: 'blocked',
        success: false,
        rowCount: 0,
        executionTimeMs: 0,
        message: LATER_PHASE_RUN_MESSAGE,
      })
      bumpHistory()
      return
    }

    setIsRunning(true)
    setRunState('running')

    const outcome = await runSelectQuery(databaseId, sql, () => {
      setMessages(['Loading SQL engine…'])
    })

    setIsRunning(false)

    if (outcome.blocked) {
      const errorMessage = outcome.error ?? 'Query blocked.'
      setMessages(buildSqlErrorMessages(databaseId, errorMessage))
      setResult({ ...EMPTY_RESULT, hasRun: true, errorMessage })
      setRunState('error')
      setPreferredBottomTab('messages')
      appendSqlAttempt({
        questionId: question.id,
        questionTitle: question.title,
        databaseId,
        sql,
        ranAt: new Date().toISOString(),
        action: 'run',
        status: 'blocked',
        success: false,
        rowCount: 0,
        executionTimeMs: outcome.executionTimeMs,
        message: outcome.error ?? 'Query blocked.',
      })
      bumpHistory()
      return
    }

    if (!outcome.success) {
      const errorMessage = outcome.error ?? 'SQL execution failed.'
      setMessages(buildSqlErrorMessages(databaseId, errorMessage))
      setResult({ ...EMPTY_RESULT, hasRun: true, errorMessage })
      setRunState('error')
      setPreferredBottomTab('messages')
      appendSqlAttempt({
        questionId: question.id,
        questionTitle: question.title,
        databaseId,
        sql,
        ranAt: new Date().toISOString(),
        action: 'run',
        status: 'error',
        success: false,
        rowCount: 0,
        executionTimeMs: outcome.executionTimeMs,
        message: outcome.error ?? 'SQL execution failed.',
      })
      bumpHistory()
      return
    }

    setMessages(outcome.messages)
    setResult({
      columns: outcome.columns,
      rows: outcome.rows,
      rowCount: outcome.rowCount,
      executionTimeMs: outcome.executionTimeMs,
      hasRun: true,
      errorMessage: null,
    })
    setRunState('success')
    setPreferredBottomTab('results')
    appendSqlAttempt({
      questionId: question.id,
      questionTitle: question.title,
      databaseId,
      sql,
      ranAt: new Date().toISOString(),
      action: 'run',
      status: 'success',
      success: true,
      rowCount: outcome.rowCount,
      executionTimeMs: outcome.executionTimeMs,
      message: `Rows returned: ${outcome.rowCount}`,
    })
    bumpHistory()
  }, [bumpHistory, databaseId, isChecking, isRunning, question.id, question.title, sql])

  const handleCheckAnswer = useCallback(async () => {
    if (isRunning || isChecking) return

    if (!isExecutableSqlDatabase(databaseId)) {
      setMessages([LATER_PHASE_CHECK_MESSAGE])
      setAnswerFeedback(null)
      setRunState('error')
      setPreferredBottomTab('messages')
      appendSqlAttempt({
        questionId: question.id,
        questionTitle: question.title,
        databaseId,
        sql,
        ranAt: new Date().toISOString(),
        action: 'check',
        status: 'blocked',
        success: false,
        rowCount: 0,
        executionTimeMs: 0,
        message: LATER_PHASE_CHECK_MESSAGE,
        feedbackSummary: LATER_PHASE_CHECK_MESSAGE,
      })
      bumpHistory()
      return
    }

    setIsChecking(true)
    setRunState('checking')
    setPreferredBottomTab('messages')

    const studentOutcome = await runSelectQuery(databaseId, sql, () => {
      setMessages(['Loading SQL engine…'])
    })

    const solutionOutcome = await runTrustedSql(databaseId, question.solutionSql)
    const validationOptions = getValidationOptionsForQuestion(question)
    const check = validateSqlResults(studentOutcome, solutionOutcome, validationOptions)

    const feedback: SqlAnswerFeedback = {
      passed: check.passed,
      feedback: check.feedback,
      studentColumns: check.studentColumns,
      expectedColumns: check.expectedColumns,
      studentRowCount: check.studentRowCount,
      expectedRowCount: check.expectedRowCount,
      checkedAt: new Date().toISOString(),
    }

    setAnswerFeedback(feedback)
    setIsChecking(false)

    if (studentOutcome.success && !studentOutcome.blocked) {
      setResult({
        columns: studentOutcome.columns,
        rows: studentOutcome.rows,
        rowCount: studentOutcome.rowCount,
        executionTimeMs: studentOutcome.executionTimeMs,
        hasRun: true,
        errorMessage: null,
      })
      setMessages(studentOutcome.messages)
    } else if (studentOutcome.blocked) {
      const errorMessage = studentOutcome.error ?? 'Query blocked.'
      setMessages(buildSqlErrorMessages(databaseId, errorMessage))
      setResult({ ...EMPTY_RESULT, hasRun: true, errorMessage })
    } else {
      const errorMessage = studentOutcome.error ?? 'SQL execution failed.'
      setMessages(buildSqlErrorMessages(databaseId, errorMessage))
      setResult({ ...EMPTY_RESULT, hasRun: true, errorMessage })
    }

    const status = check.passed ? 'passed' : studentOutcome.blocked ? 'blocked' : studentOutcome.success ? 'failed' : 'error'
    setRunState(check.passed ? 'passed' : 'failed')

    const feedbackSummary = check.feedback[0] ?? (check.passed ? 'Correct answer.' : 'Answer check failed.')

    appendSqlAttempt({
      questionId: question.id,
      questionTitle: question.title,
      databaseId,
      sql,
      ranAt: new Date().toISOString(),
      action: 'check',
      status,
      success: check.passed,
      rowCount: studentOutcome.rowCount,
      executionTimeMs: studentOutcome.executionTimeMs,
      message: feedbackSummary,
      feedbackSummary,
    })
    bumpHistory()

    if (!check.passed && check.errorType) {
      appendSqlMistake({
        questionId: question.id,
        databaseId,
        sql,
        errorType: check.errorType,
        feedback: check.feedback.join(' '),
      })
      setMistakesVersion((v) => v + 1)
    }
  }, [bumpHistory, databaseId, isChecking, isRunning, question, sql])

  const handleResetQuery = useCallback(() => {
    setSql(question.starterSql)
    setRunState('ready')
    setAnswerFeedback(null)
  }, [question.starterSql])

  const handleFormatSql = useCallback(() => {
    // Format SQL deferred to a later phase.
  }, [])

  const handleClearOutput = useCallback(() => {
    setMessages([])
    setResult(EMPTY_RESULT)
    setRunState('ready')
    setAnswerFeedback(null)
    setPreferredBottomTab(null)
  }, [])

  const handleRevealHint = useCallback(() => {
    if (revealedHintCount >= question.hints.length) return
    const next = revealedHintCount + 1
    setRevealedHintCount(next)
    saveRevealedHintCount(question.id, next)
  }, [question.hints.length, question.id, revealedHintCount])

  const handleRevealSolution = useCallback(() => {
    setSolutionRevealed(true)
    saveSolutionRevealed(question.id)
  }, [question.id])

  const handleUseSolution = useCallback(() => {
    setSql(question.solutionSql)
    setRunState('ready')
    setAnswerFeedback(null)
  }, [question.solutionSql])

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const toggleTable = useCallback((tableName: string) => {
    setExpandedTables((prev) => ({ ...prev, [tableName]: !prev[tableName] }))
  }, [])

  return (
    <SqlPracticeLayout
      layout={resizableLayout}
      topBar={
        <SqlTopBar
          databaseLabel={database.displayName}
          runState={runState}
          isRunning={isRunning}
          isChecking={isChecking}
          onRun={handleRun}
          onCheckAnswer={handleCheckAnswer}
          onResetQuery={handleResetQuery}
          onFormatSql={handleFormatSql}
          onClearOutput={handleClearOutput}
          onResetLayout={resizableLayout.desktopLayout ? resizableLayout.resetLayout : undefined}
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
          headerActions={
            resizableLayout.desktopLayout ? (
              <SqlPaneCollapseButton
                side="left"
                label="Object Explorer"
                onClick={resizableLayout.toggleLeftCollapsed}
              />
            ) : undefined
          }
        />
      }
      editorPanel={
        <SqlEditorPanel
          sql={sql}
          databaseId={databaseId}
          database={database}
          onChange={setSql}
          onRun={handleRun}
        />
      }
      questionPanel={
        <SqlQuestionPanel
          question={question}
          questions={questionsForDb}
          revealedHintCount={revealedHintCount}
          solutionRevealed={solutionRevealed}
          answerFeedback={answerFeedback}
          onSelectQuestion={handleSelectQuestion}
          onRevealHint={handleRevealHint}
          onRevealSolution={handleRevealSolution}
          onUseSolution={handleUseSolution}
          headerActions={
            resizableLayout.desktopLayout ? (
              <SqlPaneCollapseButton
                side="right"
                label="Practice Question"
                onClick={resizableLayout.toggleRightCollapsed}
              />
            ) : undefined
          }
        />
      }
      bottomPanel={
        <SqlBottomPanel
          messages={messages}
          result={result}
          database={database}
          expectedColumns={question.expectedColumns}
          answerFeedback={answerFeedback}
          attemptHistoryVersion={attemptHistoryVersion}
          mistakesVersion={mistakesVersion}
          preferredTab={preferredBottomTab}
          headerActions={
            resizableLayout.desktopLayout ? (
              <SqlPaneCollapseButton
                side="bottom"
                label="Results"
                onClick={resizableLayout.toggleBottomCollapsed}
              />
            ) : undefined
          }
        />
      }
      statusBar={
        <SqlStatusBar
          databaseId={databaseId}
          databaseName={database.displayName}
          tableCount={database.tables.length}
          questionTitle={question.title}
          runState={runState}
        />
      }
    />
  )
}
