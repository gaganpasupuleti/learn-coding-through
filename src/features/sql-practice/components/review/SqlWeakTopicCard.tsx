import type { SqlPracticeDifficulty, SqlPracticeTopic } from '../../types/sqlPractice.types'
import {
  DIFFICULTY_LABELS,
  TOPIC_LABELS,
  type SqlDifficultyAnalyticsRow,
  type SqlTopicAnalyticsRow,
} from '../../utils/sqlPracticeAnalytics'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'
import { TrendingDown } from 'lucide-react'

interface SqlWeakTopicCardProps {
  weakestTopic: SqlTopicAnalyticsRow | null
  weakestDifficulty: SqlDifficultyAnalyticsRow | null
}

export function SqlWeakTopicCard({ weakestTopic, weakestDifficulty }: SqlWeakTopicCardProps) {
  if (!weakestTopic && !weakestDifficulty) {
    return (
      <div className={cn('rounded-lg border border-emerald-700/30 bg-emerald-950/20 p-3 text-xs text-emerald-200/90')} role="status">
        No weak topics right now — keep practicing or try Review mode when you miss questions.
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border border-amber-700/40 bg-amber-950/20 p-3', wb.textSecondary)}>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-200/90">
        <TrendingDown className="h-3.5 w-3.5" />
        Weak areas
      </div>
      <div className="space-y-1.5 text-xs">
        {weakestTopic && (
          <p>
            <span className="text-amber-100">Topic:</span>{' '}
            {TOPIC_LABELS[weakestTopic.topic as SqlPracticeTopic]} — {weakestTopic.passed} passed,{' '}
            {weakestTopic.failed} failed ({Math.round(weakestTopic.passRate * 100)}% pass rate)
          </p>
        )}
        {weakestDifficulty && (
          <p>
            <span className="text-amber-100">Difficulty:</span>{' '}
            {DIFFICULTY_LABELS[weakestDifficulty.difficulty as SqlPracticeDifficulty]} —{' '}
            {weakestDifficulty.passed} / {weakestDifficulty.total} passed
          </p>
        )}
      </div>
    </div>
  )
}
