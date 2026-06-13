/**
 * Issue #29 — Code Practice Ground mistake tracking (separate from legacy practice hub).
 * Uses localStorage; does not share the legacy `codequest-practice-mistakes` key.
 */

import type {
  CodePracticeFeedback,
  CodePracticeLanguageMode,
  CodePracticeQuestion,
} from '../types/codePractice.types'
import { JAVASCRIPT_SAFETY_USER_MESSAGE } from '../javascript/javascriptSafetyValidator'
import { JAVA_SAFETY_USER_MESSAGE } from '../java/javaSafetyValidator'
import { PYTHON_SAFETY_USER_MESSAGE } from '../python/pythonSafetyValidator'

export type CodePracticeMistakeType =
  | 'syntax'
  | 'runtime'
  | 'safety-block'
  | 'prerun-block'
  | 'wrong-output'
  | 'failed-test-case'
  | 'unknown'

export type CodePracticeMistakeStatus = 'failed' | 'blocked' | 'warning'
export type CodePracticeMistakeAttemptType = 'run' | 'submit'

export interface CodePracticeMistake {
  id: string
  language: CodePracticeLanguageMode
  questionId: string
  questionTitle: string
  topic: string
  difficulty: string
  submittedCode: string
  inputUsed: string
  expectedOutput: string
  actualOutput: string
  errorMessage: string
  feedbackTitle: string
  feedbackMessage: string
  feedbackSuggestion: string
  feedbackRuleId: string
  mistakeType: CodePracticeMistakeType
  createdAt: string
  attemptType: CodePracticeMistakeAttemptType
  status: CodePracticeMistakeStatus
}

const STORAGE_KEY = 'codequest-code-practice-mistakes'
const MAX_MISTAKES = 50

function readAll(): CodePracticeMistake[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CodePracticeMistake[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(items: CodePracticeMistake[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_MISTAKES)))
  } catch {
    /* ignore quota */
  }
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function mistakeTypeFromFeedback(feedback: CodePracticeFeedback): CodePracticeMistakeType {
  if (feedback.type === 'syntax') return 'syntax'
  if (feedback.type === 'runtime') return 'runtime'
  return 'unknown'
}

export interface SaveCodePracticeMistakeInput {
  language: CodePracticeLanguageMode
  question?: CodePracticeQuestion | null
  submittedCode: string
  attemptType: CodePracticeMistakeAttemptType
  status: CodePracticeMistakeStatus
  mistakeType: CodePracticeMistakeType
  inputUsed?: string
  expectedOutput?: string
  actualOutput?: string
  errorMessage?: string
  feedback?: CodePracticeFeedback | null
  feedbackRuleId?: string
  feedbackTitle?: string
  feedbackMessage?: string
  feedbackSuggestion?: string
}

export function saveCodePracticeMistake(input: SaveCodePracticeMistakeInput): CodePracticeMistake {
  const entry: CodePracticeMistake = {
    id: newId(),
    language: input.language,
    questionId: input.question?.id ?? 'freeform',
    questionTitle: input.question?.title ?? 'Freeform practice',
    topic: input.question?.topic ?? '',
    difficulty: input.question?.difficulty ?? '',
    submittedCode: input.submittedCode.trim().slice(0, 4000),
    inputUsed: input.inputUsed ?? '',
    expectedOutput: input.expectedOutput ?? '',
    actualOutput: input.actualOutput ?? '',
    errorMessage: (input.errorMessage ?? '').slice(0, 1200),
    feedbackTitle: input.feedbackTitle ?? input.feedback?.title ?? '',
    feedbackMessage: input.feedbackMessage ?? input.feedback?.message ?? '',
    feedbackSuggestion: input.feedbackSuggestion ?? input.feedback?.suggestion ?? '',
    feedbackRuleId: input.feedbackRuleId ?? input.feedback?.ruleId ?? '',
    mistakeType: input.mistakeType,
    createdAt: new Date().toISOString(),
    attemptType: input.attemptType,
    status: input.status,
  }

  const existing = readAll()
  const recent = existing[0]
  if (
    recent &&
    recent.language === entry.language &&
    recent.mistakeType === entry.mistakeType &&
    recent.feedbackRuleId === entry.feedbackRuleId &&
    recent.errorMessage === entry.errorMessage &&
    recent.submittedCode === entry.submittedCode &&
    Date.now() - new Date(recent.createdAt).getTime() < 30_000
  ) {
    return recent
  }

  writeAll([entry, ...existing])
  return entry
}

export function listCodePracticeMistakes(): CodePracticeMistake[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function removeCodePracticeMistake(id: string): void {
  writeAll(readAll().filter((item) => item.id !== id))
}

export function clearCodePracticeMistakes(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function getTopRepeatedMistake(
  mistakes: CodePracticeMistake[],
): { key: string; label: string; count: number } | null {
  if (mistakes.length === 0) return null

  const counts = new Map<string, number>()
  for (const m of mistakes) {
    const key = m.feedbackRuleId || m.mistakeType
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  let topKey = ''
  let topCount = 0
  for (const [key, count] of counts) {
    if (count > topCount) {
      topKey = key
      topCount = count
    }
  }

  if (!topKey || topCount < 2) return null

  const sample = mistakes.find((m) => (m.feedbackRuleId || m.mistakeType) === topKey)
  const label = sample?.feedbackTitle || sample?.mistakeType || topKey

  return { key: topKey, label, count: topCount }
}

export function recordPythonSafetyBlockMistake(params: {
  question?: CodePracticeQuestion | null
  code: string
  stdin: string
  attemptType: CodePracticeMistakeAttemptType
  ruleId: string
  message: string
}): CodePracticeMistake {
  return saveCodePracticeMistake({
    language: 'python',
    question: params.question,
    submittedCode: params.code,
    attemptType: params.attemptType,
    status: 'blocked',
    mistakeType: 'safety-block',
    inputUsed: params.stdin,
    errorMessage: PYTHON_SAFETY_USER_MESSAGE,
    feedbackRuleId: params.ruleId,
    feedbackTitle: 'Blocked for browser safety',
    feedbackMessage: params.message,
  })
}

export function recordPythonPrerunBlockMistake(params: {
  question?: CodePracticeQuestion | null
  code: string
  stdin: string
  attemptType: CodePracticeMistakeAttemptType
  feedback: CodePracticeFeedback
}): CodePracticeMistake {
  return saveCodePracticeMistake({
    language: 'python',
    question: params.question,
    submittedCode: params.code,
    attemptType: params.attemptType,
    status: 'blocked',
    mistakeType: 'prerun-block',
    inputUsed: params.stdin,
    errorMessage: params.feedback.title,
    feedback: params.feedback,
  })
}

export function recordPythonRuntimeMistake(params: {
  question?: CodePracticeQuestion | null
  code: string
  stdin: string
  attemptType: CodePracticeMistakeAttemptType
  rawError: string
  feedback: CodePracticeFeedback
}): CodePracticeMistake {
  return saveCodePracticeMistake({
    language: 'python',
    question: params.question,
    submittedCode: params.code,
    attemptType: params.attemptType,
    status: 'failed',
    mistakeType: mistakeTypeFromFeedback(params.feedback),
    inputUsed: params.stdin,
    errorMessage: params.rawError,
    feedback: params.feedback,
  })
}

export function recordFailedTestCaseMistake(params: {
  language: CodePracticeLanguageMode
  question?: CodePracticeQuestion | null
  code: string
  stdin: string
  expectedOutput: string
  actualOutput: string
  attemptType: CodePracticeMistakeAttemptType
  caseLabel?: string
}): CodePracticeMistake {
  return saveCodePracticeMistake({
    language: params.language,
    question: params.question,
    submittedCode: params.code,
    attemptType: params.attemptType,
    status: 'failed',
    mistakeType: 'failed-test-case',
    inputUsed: params.stdin,
    expectedOutput: params.expectedOutput,
    actualOutput: params.actualOutput,
    errorMessage: `Expected "${params.expectedOutput}" but got "${params.actualOutput}".`,
    feedbackTitle: 'Test case failed',
    feedbackMessage: params.caseLabel
      ? `${params.caseLabel}: output did not match.`
      : 'Output did not match the expected result.',
    feedbackSuggestion: 'Compare your output with the sample case and fix the logic.',
    feedbackRuleId: 'failed-test-case',
  })
}

export function recordJavaScriptSafetyBlockMistake(params: {
  question?: CodePracticeQuestion | null
  code: string
  stdin: string
  attemptType: CodePracticeMistakeAttemptType
  ruleId: string
  message: string
}): CodePracticeMistake {
  return saveCodePracticeMistake({
    language: 'javascript',
    question: params.question,
    submittedCode: params.code,
    attemptType: params.attemptType,
    status: 'blocked',
    mistakeType: 'safety-block',
    inputUsed: params.stdin,
    errorMessage: JAVASCRIPT_SAFETY_USER_MESSAGE,
    feedbackRuleId: params.ruleId,
    feedbackTitle: 'Blocked for practice safety',
    feedbackMessage: params.message,
  })
}

export function recordJavaScriptPrerunBlockMistake(params: {
  question?: CodePracticeQuestion | null
  code: string
  stdin: string
  attemptType: CodePracticeMistakeAttemptType
  feedback: CodePracticeFeedback
}): CodePracticeMistake {
  return saveCodePracticeMistake({
    language: 'javascript',
    question: params.question,
    submittedCode: params.code,
    attemptType: params.attemptType,
    status: 'blocked',
    mistakeType: 'prerun-block',
    inputUsed: params.stdin,
    errorMessage: params.feedback.title,
    feedback: params.feedback,
  })
}

export function recordJavaScriptRuntimeMistake(params: {
  question?: CodePracticeQuestion | null
  code: string
  stdin: string
  attemptType: CodePracticeMistakeAttemptType
  rawError: string
  feedback: CodePracticeFeedback
}): CodePracticeMistake {
  return saveCodePracticeMistake({
    language: 'javascript',
    question: params.question,
    submittedCode: params.code,
    attemptType: params.attemptType,
    status: 'failed',
    mistakeType: mistakeTypeFromFeedback(params.feedback),
    inputUsed: params.stdin,
    errorMessage: params.rawError,
    feedback: params.feedback,
  })
}

export function recordJavaSafetyBlockMistake(params: {
  question?: CodePracticeQuestion | null
  code: string
  stdin: string
  attemptType: CodePracticeMistakeAttemptType
  ruleId: string
  message: string
}): CodePracticeMistake {
  return saveCodePracticeMistake({
    language: 'java',
    question: params.question,
    submittedCode: params.code,
    attemptType: params.attemptType,
    status: 'blocked',
    mistakeType: 'safety-block',
    inputUsed: params.stdin,
    errorMessage: JAVA_SAFETY_USER_MESSAGE,
    feedbackRuleId: params.ruleId,
    feedbackTitle: 'Blocked for practice safety',
    feedbackMessage: params.message,
  })
}

export function recordJavaPrerunBlockMistake(params: {
  question?: CodePracticeQuestion | null
  code: string
  stdin: string
  attemptType: CodePracticeMistakeAttemptType
  feedback: CodePracticeFeedback
}): CodePracticeMistake {
  return saveCodePracticeMistake({
    language: 'java',
    question: params.question,
    submittedCode: params.code,
    attemptType: params.attemptType,
    status: 'blocked',
    mistakeType: 'prerun-block',
    inputUsed: params.stdin,
    errorMessage: params.feedback.title,
    feedback: params.feedback,
  })
}

export function recordJavaRuntimeMistake(params: {
  question?: CodePracticeQuestion | null
  code: string
  stdin: string
  attemptType: CodePracticeMistakeAttemptType
  rawError: string
  feedback: CodePracticeFeedback
}): CodePracticeMistake {
  return saveCodePracticeMistake({
    language: 'java',
    question: params.question,
    submittedCode: params.code,
    attemptType: params.attemptType,
    status: 'failed',
    mistakeType: mistakeTypeFromFeedback(params.feedback),
    inputUsed: params.stdin,
    errorMessage: params.rawError,
    feedback: params.feedback,
  })
}
