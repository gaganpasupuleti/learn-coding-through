import type { CodePracticeLanguageMode } from '../types/codePractice.types'

export type PracticeIntelligenceLanguage = Extract<
  CodePracticeLanguageMode,
  'python' | 'javascript' | 'react' | 'java'
>

export interface PracticeSnippet {
  label: string
  insertText: string
  detail: string
  documentation?: string
  /** Prefix used for prefix-matching (e.g. "pri" → print). */
  filterText?: string
}

export interface PracticeKeyword {
  label: string
  detail?: string
}

export interface VariableSuggestionContext {
  language: PracticeIntelligenceLanguage
  code: string
  lineContent: string
  wordPrefix: string
}
