import type { CodePracticeLanguageMode, CodePracticeQuestion } from '../types/codePractice.types'

export interface ExecutionPrepareResult {
  code: string
  stdinApplied: boolean
  /** Shown in UI when stdin is mocked or deferred. */
  note?: string
}

/**
 * Prepares user code for sandbox execution.
 * Backend executors currently use stdin=DEVNULL — Python stdin is mocked client-side
 * until POST /api/v1/execute accepts an optional stdin field (planned).
 */
export function prepareCodeForExecution(
  language: CodePracticeLanguageMode,
  code: string,
  stdin?: string,
): ExecutionPrepareResult {
  const trimmedStdin = stdin?.trim()
  if (!trimmedStdin) {
    return { code, stdinApplied: false }
  }

  if (language === 'python') {
    const preamble = [
      'import io, sys',
      `sys.stdin = io.StringIO(${JSON.stringify(stdin)})`,
      '',
    ].join('\n')
    return {
      code: `${preamble}${code}`,
      stdinApplied: true,
      note: 'Stdin mocked in Python until backend stdin support ships.',
    }
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
