import { useEffect, useState } from 'react'
import { isCheckableQuestion } from '../data/sqlQuestions'
import { runTrustedSql } from '../engine/sqlRunner'
import type { SqlExpectedOutputPreview, SqlPracticeQuestion } from '../types/sqlPractice.types'

const EMPTY_PREVIEW: SqlExpectedOutputPreview = {
  status: 'idle',
  columns: [],
  sampleRows: [],
  rowCount: 0,
}

export function useSqlExpectedPreview(question: SqlPracticeQuestion): SqlExpectedOutputPreview {
  const [preview, setPreview] = useState<SqlExpectedOutputPreview>(EMPTY_PREVIEW)

  useEffect(() => {
    if (!isCheckableQuestion(question) || !question.solutionSql.trim()) {
      setPreview(EMPTY_PREVIEW)
      return
    }

    let cancelled = false
    setPreview({ status: 'loading', columns: [], sampleRows: [], rowCount: 0 })

    void runTrustedSql(question.databaseId, question.solutionSql).then((outcome) => {
      if (cancelled) return

      if (!outcome.success) {
        setPreview({
          status: 'error',
          columns: [],
          sampleRows: [],
          rowCount: 0,
          errorMessage: outcome.error ?? 'Unable to load expected output preview.',
        })
        return
      }

      setPreview({
        status: 'ready',
        columns: outcome.columns,
        sampleRows: outcome.rows.slice(0, 5),
        rowCount: outcome.rowCount,
      })
    })

    return () => {
      cancelled = true
    }
  }, [question])

  return preview
}
