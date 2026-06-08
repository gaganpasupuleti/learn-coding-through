/**
 * Issue #29 — Code Practice Ground types.
 * SQL is excluded; see Issue #30 for SQL Practice Ground.
 */

export type CodePracticeLanguageMode =
  | 'python'
  | 'javascript'
  | 'react'
  | 'java'
  | 'c'
  | 'cpp'

export type CodePracticeDifficulty = 'easy' | 'medium' | 'hard'

export type CodePracticeTopic =
  | 'basics'
  | 'strings'
  | 'components'
  | 'ui'
  | 'state'
  | 'loops'
  | 'functions'

export interface CodePracticeExample {
  input: string
  output: string
  explanation?: string
}

export interface CodePracticeQuestion {
  id: string
  title: string
  language: CodePracticeLanguageMode
  difficulty: CodePracticeDifficulty
  topic: CodePracticeTopic
  description: string
  examples: CodePracticeExample[]
  constraints: string[]
  starterCode: string
  expectedOutput: string
  hints: string[]
}

export interface CodePracticeAttempt {
  id: string
  questionId: string
  language: CodePracticeLanguageMode
  code: string
  output: string
  passed: boolean
  durationMs: number
  createdAt: string
}

export interface CodePracticeTestResult {
  id: string
  label: string
  passed: boolean
  expected: string
  actual: string
  message?: string
}

export type CodePracticeEditorTheme = 'vs-dark' | 'vs' | 'hc-black'

export interface CodePracticeWorkbenchState {
  language: CodePracticeLanguageMode
  questionId: string | null
  code: string
  output: string
  error: string | null
  consoleLines: string[]
  testResults: CodePracticeTestResult[]
  revealedHintCount: number
  isRunning: boolean
  lastRunMs: number | null
}

export const CODE_PRACTICE_LANGUAGE_MODES: Array<{
  id: CodePracticeLanguageMode
  label: string
  monacoLanguage: string
  status: 'active' | 'coming-soon'
}> = [
  { id: 'python', label: 'Python', monacoLanguage: 'python', status: 'active' },
  { id: 'javascript', label: 'JavaScript', monacoLanguage: 'javascript', status: 'active' },
  { id: 'react', label: 'React', monacoLanguage: 'javascript', status: 'active' },
  { id: 'java', label: 'Java', monacoLanguage: 'java', status: 'coming-soon' },
  { id: 'c', label: 'C', monacoLanguage: 'c', status: 'coming-soon' },
  { id: 'cpp', label: 'C++', monacoLanguage: 'cpp', status: 'coming-soon' },
]

export const CODE_PRACTICE_ROUTE = '/practice/code'
