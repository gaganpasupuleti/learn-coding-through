export type TypingPracticeMode = 'text' | 'code' | 'mistake-review'

export type TypingCodeLanguage = 'python' | 'javascript' | 'java' | 'sql'

export type TypingDifficulty = 'beginner' | 'mid'

export interface TypingSample {
  id: string
  title: string
  language: TypingCodeLanguage | 'text'
  difficulty: TypingDifficulty | 'any'
  mode: 'text' | 'code'
  text: string
  topics: string[]
}

export interface TypingCharacterMistake {
  id: string
  snippetId: string
  language: TypingCodeLanguage | 'text'
  expectedChar: string
  typedChar: string
  position: number
  timestamp: string
}

export interface TypingSessionMistake extends TypingCharacterMistake {
  snippetText: string
}

export interface TypingLiveMetrics {
  wpm: number
  rawWpm: number
  accuracy: number
  correctChars: number
  wrongChars: number
  totalMistakes: number
  elapsedSeconds: number
  completionPct: number
}

export interface TypingCompletionSummary extends TypingLiveMetrics {
  weakCharacters: Array<{ char: string; count: number }>
  weakTokens: Array<{ token: string; count: number }>
}

export interface TypingSessionRecord {
  id: string
  mode: TypingPracticeMode
  snippetId: string
  snippetTitle: string
  language: TypingCodeLanguage | 'text'
  difficulty: TypingDifficulty | 'any'
  wpm: number
  accuracy: number
  mistakeCount: number
  elapsedSeconds: number
  completedAt: string
}
