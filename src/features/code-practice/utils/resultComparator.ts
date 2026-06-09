import type { CodePracticeTestCase, CodePracticeTestResult } from '../types/codePractice.types'

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

/** React Submit — preview-only check until DOM validation exists (Phase 3.1). */
export function buildReactPreviewCheckResults(): CodePracticeTestResult[] {
  return [
    {
      id: 'react-preview-check',
      label: 'Preview check',
      passed: true,
      expected: 'Component renders in Sandpack preview',
      actual: 'Preview available',
      message: 'React visual validation will be improved later.',
    },
  ]
}

export function buildTestResultsFromCases(
  cases: CodePracticeTestCase[],
  actualByCaseId: Record<string, string>,
  executedCaseIds: string[],
): CodePracticeTestResult[] {
  return cases.map((testCase) => {
    const executed = executedCaseIds.includes(testCase.id)
    const actual = actualByCaseId[testCase.id] ?? ''
    if (!executed) {
      return {
        id: testCase.id,
        label: testCase.label,
        passed: false,
        expected: normalizeOutput(testCase.expectedOutput),
        actual: '',
        message: 'Not executed in this pass (structure ready for multi-case runs).',
      }
    }
    const passed = compareOutputs(actual, testCase.expectedOutput)
    return {
      id: testCase.id,
      label: testCase.label,
      passed,
      expected: normalizeOutput(testCase.expectedOutput),
      actual: normalizeOutput(actual),
      message: passed
        ? 'Output matches expected result.'
        : `Expected "${normalizeOutput(testCase.expectedOutput)}" but got "${normalizeOutput(actual)}".`,
    }
  })
}
