import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDatabaseById } from '../data/databaseCatalog'
import {
  getAnotherQuestionByTopic,
  getDefaultQuestionForDatabase,
  getNextQuestion,
  getQuestionById,
  getQuestionsForDatabase,
  getStarterQueryForDatabase,
} from '../data/sqlQuestions'
import { isExecutableSqlDatabase } from '../engine/sqlEngine'
import { runSelectQuery, runTrustedSql } from '../engine/sqlRunner'
import { validateSqlResults } from '../engine/sqlResultValidator'
import { useSqlExpectedPreview } from '../hooks/useSqlExpectedPreview'
import type {
  SqlAnswerFeedback,
  SqlAttemptStatus,
  SqlBottomTab,
  SqlDatabaseId,
  SqlPracticeDifficulty,
  SqlPracticeTopic,
  SqlQueryGrid,
  SqlQuestionFilterStatus,
  SqlRunState,
} from '../types/sqlPractice.types'
import { getValidationOptionsForQuestion } from '../types/sqlPractice.types'
import {
  appendSqlAttempt,
  appendSqlMistake,
  loadRevealedHintCounts,
  loadRevealedSolutionIds,
  loadSqlMistakes,
  saveRevealedHintCount,
  saveSolutionRevealed,
} from '../utils/sqlPracticeStorage'
import {
  getDatabaseProgressSummary,
  getQuestionProgress,
  syncQuestionProgressMeta,
  updateProgressOnAttempt,
} from '../utils/sqlPracticeProgress'
import { SqlPracticeLayout } from './SqlPracticeLayout'
import { SqlTopBar } from './SqlTopBar'
import { SqlObjectExplorer } from './SqlObjectExplorer'
import { SqlEditorPanel } from './SqlEditorPanel'
import { SqlQuestionPanel } from './SqlQuestionPanel'
import { SqlBottomPanel } from './SqlBottomPanel'
import { SqlStatusBar } from './SqlStatusBar'
import { useResizableSqlLayout } from '../hooks/useResizableSqlLayout'
import { buildSqlErrorMessages } from '../utils/sqlExecutionMessages'
import { SqlPaneCollapseButton } from './SqlPaneCollapseButton'

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
  const [progressVersion, setProgressVersion] = useState(0)
  const [preferredBottomTab, setPreferredBottomTab] = useState<SqlBottomTab | null>(null)
  const [statusFilter, setStatusFilter] = useState<SqlQuestionFilterStatus>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<SqlPracticeDifficulty | 'all'>('all')
  const [topicFilter, setTopicFilter] = useState<SqlPracticeTopic | 'all'>('all')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ tables: true })
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})

  const questionsForDb = useMemo(() => getQuestionsForDatabase(databaseId), [databaseId])
  const question = useMemo(
    () => getQuestionById(questionId) ?? getDefaultQuestionForDatabase(databaseId),
    [questionId, databaseId],
  )
  const database = useMemo(() => getDatabaseById(databaseId), [databaseId])
  const resizableLayout = useResizableSqlLayout()
  const expectedPreview = useSqlExpectedPreview(question)

  const databaseSummary = useMemo(() => {
    void progressVersion
    return getDatabaseProgressSummary(databaseId, questionsForDb)
  }, [databaseId, questionsForDb, progressVersion])

  const questionProgress = useMemo(() => {
    void progressVersion
    return getQuestionProgress(question.id)
  }, [question.id, progressVersion])

  const mistakesCount = useMemo(() => {
    void mistakesVersion
    return loadSqlMistakes().length
  }, [mistakesVersion])

  const nextQuestion = useMemo(
    () => getNextQuestion(question.id, questionsForDb),
    [question.id, questionsForDb],
  )
  const sameTopicQuestion = useMemo(
    () => getAnotherQuestionByTopic(question, questionsForDb),
    [question, questionsForDb],
  )
  const similarQuestion = sameTopicQuestion

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

  const bumpProgress = useCallback(() => {
    setProgressVersion((v) => v + 1)
  }, [])

  const recordProgress = useCallback(
    (
      qId: string,
      dbId: SqlDatabaseId,
      action: 'run' | 'check',
      status: SqlAttemptStatus,
      executionTimeMs?: number,
    ) => {
      updateProgressOnAttempt({
        questionId: qId,
        databaseId: dbId,
        action,
        status,
        executionTimeMs,
        hintsUsedCount: loadRevealedHintCounts()[qId] ?? 0,
        solutionRevealed: loadRevealedSolutionIds()[qId] ?? false,
      })
      bumpProgress()
    },
    [bumpProgress],
  )

  const loadQuestionContext = useCallback(
    (qId: string, dbId: SqlDatabaseId, nextSql: string) => {
      setDatabaseId(dbId)
      setQuestionId(qId)
      setSql(nextSql)
      setMessages([])
      setResult(EMPTY_RESULT)
      setRunState('ready')
      setAnswerFeedback(null)
      setPreferredBottomTab(null)
    },
    [],
  )

  const handleDatabaseChange = useCallback((id: SqlDatabaseId) => {
    const nextQ = getDefaultQuestionForDatabase(id)
    loadQuestionContext(nextQ.id, id, nextQ.starterSql)
    setExpandedTables({})
    setStatusFilter('all')
    setDifficultyFilter('all')
    setTopicFilter('all')
  }, [loadQuestionContext])

  const handleSelectQuestion = useCallback(
    (id: string) => {
      const next = getQuestionById(id)
      if (!next || next.databaseId !== databaseId) return
      loadQuestionContext(next.id, databaseId, next.starterSql)
    },
    [databaseId, loadQuestionContext],
  )

  const handleRetryQuestion = useCallback(
    (qId: string, dbId: SqlDatabaseId, failedSql: string) => {
      const q = getQuestionById(qId)
      loadQuestionContext(qId, dbId, failedSql || q?.starterSql || getStarterQueryForDatabase(dbId))
      setPreferredBottomTab(null)
    },
    [loadQuestionContext],
  )

  const handleLoadSql = useCallback(
    (attemptSql: string, qId?: string, dbId?: SqlDatabaseId) => {
      if (dbId && qId) {
        const q = getQuestionById(qId)
        if (q) {
          loadQuestionContext(qId, dbId, attemptSql)
          return
        }
      }
      setSql(attemptSql)
      setRunState('ready')
    },
    [loadQuestionContext],
  )

  const handleNextQuestion = useCallback(() => {
    if (nextQuestion) handleSelectQuestion(nextQuestion.id)
  }, [nextQuestion, handleSelectQuestion])

  const handlePracticeSameTopic = useCallback(() => {
    if (sameTopicQuestion) handleSelectQuestion(sameTopicQuestion.id)
  }, [sameTopicQuestion, handleSelectQuestion])

  const handleReviewSimilarQuestion = useCallback(() => {
    if (similarQuestion) handleSelectQuestion(similarQuestion.id)
  }, [similarQuestion, handleSelectQuestion])

  const handleReviewMistakes = useCallback(() => {
    setPreferredBottomTab('mistakes')
  }, [])

  const handleViewExpectedOutput = useCallback(() => {
    setPreferredBottomTab('expected')
  }, [])

  const handleTryAgain = useCallback(() => {
    setAnswerFeedback(null)
    setRunState('ready')
  }, [])

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
      recordProgress(question.id, databaseId, 'run', 'blocked')
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
      recordProgress(question.id, databaseId, 'run', 'blocked', outcome.executionTimeMs)
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
      recordProgress(question.id, databaseId, 'run', 'error', outcome.executionTimeMs)
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
    recordProgress(question.id, databaseId, 'run', 'success', outcome.executionTimeMs)
    bumpHistory()
  }, [bumpHistory, databaseId, isChecking, isRunning, question.id, question.title, recordProgress, sql])

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
      recordProgress(question.id, databaseId, 'check', 'blocked')
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
    recordProgress(question.id, databaseId, 'check', status, studentOutcome.executionTimeMs)
    bumpHistory()

    if (!check.passed && check.errorType) {
      appendSqlMistake({
        questionId: question.id,
        questionTitle: question.title,
        databaseId,
        sql,
        errorType: check.errorType,
        feedback: check.feedback.join(' '),
      })
      setMistakesVersion((v) => v + 1)
    }
  }, [bumpHistory, databaseId, isChecking, isRunning, question, recordProgress, sql])

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
    syncQuestionProgressMeta(question.id, question.databaseId, { hintsUsedCount: next })
    bumpProgress()
  }, [bumpProgress, question.databaseId, question.hints.length, question.id, revealedHintCount])

  const handleRevealSolution = useCallback(() => {
    setSolutionRevealed(true)
    saveSolutionRevealed(question.id)
    syncQuestionProgressMeta(question.id, question.databaseId, { solutionRevealed: true })
    bumpProgress()
  }, [bumpProgress, question.databaseId, question.id])

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
          questionProgress={questionProgress}
          databaseSummary={databaseSummary}
          progressVersion={progressVersion}
          revealedHintCount={revealedHintCount}
          solutionRevealed={solutionRevealed}
          answerFeedback={answerFeedback}
          statusFilter={statusFilter}
          difficultyFilter={difficultyFilter}
          topicFilter={topicFilter}
          mistakesCount={mistakesCount}
          hasNextQuestion={Boolean(nextQuestion)}
          hasSameTopicQuestion={Boolean(sameTopicQuestion)}
          hasSimilarQuestion={Boolean(similarQuestion)}
          onSelectQuestion={handleSelectQuestion}
          onStatusFilterChange={setStatusFilter}
          onDifficultyFilterChange={setDifficultyFilter}
          onTopicFilterChange={setTopicFilter}
          onRevealHint={handleRevealHint}
          onRevealSolution={handleRevealSolution}
          onUseSolution={handleUseSolution}
          onNextQuestion={handleNextQuestion}
          onPracticeSameTopic={handlePracticeSameTopic}
          onReviewMistakes={handleReviewMistakes}
          onTryAgain={handleTryAgain}
          onViewExpectedOutput={handleViewExpectedOutput}
          onReviewSimilarQuestion={handleReviewSimilarQuestion}
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
          question={question}
          expectedPreview={expectedPreview}
          answerFeedback={answerFeedback}
          attemptHistoryVersion={attemptHistoryVersion}
          mistakesVersion={mistakesVersion}
          preferredTab={preferredBottomTab}
          onRetryQuestion={handleRetryQuestion}
          onLoadSql={handleLoadSql}
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
          databaseSummary={databaseSummary}
        />
      }
    />
  )
}
