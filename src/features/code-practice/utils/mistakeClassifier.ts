import type { CodePracticeLanguageMode } from '../types/codePractice.types'
import type { PracticeMistakeLanguage } from '@/lib/practice-mistakes'

/** Issue #29 — exclude SQL mistakes from the new workbench panel. */
export function isIssue29MistakeLanguage(language: PracticeMistakeLanguage): boolean {
  return language !== 'sql' && language !== 'quiz'
}

export function toLegacyMistakeLanguage(
  language: CodePracticeLanguageMode,
): PracticeMistakeLanguage | null {
  if (language === 'python' || language === 'java') return language
  if (language === 'javascript' || language === 'react') return null
  return null
}

export function classifyRunError(message: string): 'syntax' | 'runtime' | 'timeout' | 'unknown' {
  const lower = message.toLowerCase()
  if (/syntax|parse|unexpected token|indentation/i.test(lower)) return 'syntax'
  if (/timeout|timed out/i.test(lower)) return 'timeout'
  if (/error|exception|traceback/i.test(lower)) return 'runtime'
  return 'unknown'
}
