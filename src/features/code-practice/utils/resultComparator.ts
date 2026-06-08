import type { CodePracticeTestResult } from '../types/codePractice.types'

function normalizeOutput(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .trim()
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
}

export function compareOutputs(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected)
}

export function buildTestResults(
  actual: string,
  expected: string,
  label = 'Sample case',
): CodePracticeTestResult[] {
  const passed = compareOutputs(actual, expected)
  return [
    {
      id: 'primary',
      label,
      passed,
      expected: normalizeOutput(expected),
      actual: normalizeOutput(actual),
      message: passed ? 'Output matches expected result.' : 'Output does not match expected result.',
    },
  ]
}
