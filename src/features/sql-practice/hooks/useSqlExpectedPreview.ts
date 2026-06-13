import { useEffect, useState } from 'react'
import { isCheckableQuestion } from '../data/sqlQuestions'
import { runTrustedSql } from '../engine/sqlRunner'
import type { SqlExpectedOutputPreview, SqlPracticeQuestion } from '../types/sqlPractice.types'
import { mapExpectedPreviewResult } from '../utils/sqlExpectedPreviewMapper'

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
      setPreview(mapExpectedPreviewResult(question, outcome))
    })

    return () => {
      cancelled = true
    }
  }, [question])

  return preview
}
