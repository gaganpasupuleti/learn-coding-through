import type { TypingAttempt } from '@/lib/api'
import {
  getCodePracticeSummary,
  getSqlPracticeSummary,
  getTypingPracticeSummary,
  type PracticeAreaSummary,
} from '@/lib/practice-progress-summary'

export interface SkillProgressItem extends PracticeAreaSummary {
  id: string
  href: 'practice-sql' | 'practice-code' | 'practice-typing'
}

export function buildSkillProgressItems(typingAttempts: TypingAttempt[]): SkillProgressItem[] {
  const typingWpm =
    typingAttempts.length > 0
      ? Math.round(typingAttempts.reduce((s, a) => s + a.wpm, 0) / typingAttempts.length)
      : null

  return [
    { id: 'sql', ...getSqlPracticeSummary(), href: 'practice-sql' as const },
    { id: 'code', ...getCodePracticeSummary(), href: 'practice-code' as const },
    {
      id: 'typing',
      ...getTypingPracticeSummary(typingWpm),
      href: 'practice-typing' as const,
    },
  ]
}
