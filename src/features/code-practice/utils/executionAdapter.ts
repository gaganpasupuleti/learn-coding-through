import type { CodePracticeQuestion } from '../types/codePractice.types'

/** Test cases and stdin helpers for Code Practice Ground Run/Submit. */
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
