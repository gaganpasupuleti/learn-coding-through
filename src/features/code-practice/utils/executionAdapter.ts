import type { CodePracticeLanguageMode, CodePracticeQuestion } from '../types/codePractice.types'

export interface ExecutionPrepareResult {
  code: string
  stdinApplied: boolean
  /** Shown in UI when stdin is mocked or deferred. */
  note?: string
}

/**
 * Prepares code for backend sandbox execution (JavaScript in Code Practice Ground).
 * Python in the new workbench uses Pyodide — see `python/pyodideRunner.ts`.
 * Legacy PracticePage still uses backend Python subprocess separately.
 */
export function prepareCodeForExecution(
  language: CodePracticeLanguageMode,
  code: string,
  stdin?: string,
): ExecutionPrepareResult {
  if (language === 'python') {
    return {
      code,
      stdinApplied: false,
      note: 'Python uses Pyodide in Code Workbench — not backend stdin mock.',
    }
  }

  const trimmedStdin = stdin?.trim()
  if (!trimmedStdin) {
    return { code, stdinApplied: false }
  }

  return {
    code,
    stdinApplied: false,
    note: 'Stdin not wired for this language yet — use inline variables in starter code.',
  }
}

export function resolveQuestionTestCases(question: CodePracticeQuestion) {
  if (question.testCases && question.testCases.length > 0) {
    return question.testCases
  }
  return [
    {
      id: 'default',
      label: 'Sample case',
      input: question.defaultInput,
      expectedOutput: question.expectedOutput,
    },
  ]
}

export function resolveRunStdin(
  question: CodePracticeQuestion | null,
  selectedTestCaseId: string | null,
): string {
  if (!question) return ''
  const cases = resolveQuestionTestCases(question)
  const selected = cases.find((c) => c.id === selectedTestCaseId)
  if (selected?.input) return selected.input
  return question.defaultInput ?? cases[0]?.input ?? ''
}
