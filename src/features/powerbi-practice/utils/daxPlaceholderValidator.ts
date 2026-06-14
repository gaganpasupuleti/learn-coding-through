import type { DaxAnswerFeedback, DaxPracticeQuestion } from '../types/powerbiPractice.types'

function normalizeFormula(formula: string): string {
  return formula.trim().replace(/\s+/g, ' ')
}

function containsFunction(formula: string, fn: string): boolean {
  return new RegExp(`\\b${fn}\\s*\\(`, 'i').test(formula)
}

function containsTableRef(formula: string, table: string): boolean {
  return new RegExp(`\\b${table}\\b`, 'i').test(formula)
}

function containsColumnRef(formula: string, column: string): boolean {
  return new RegExp(`\\[${column}\\]`, 'i').test(formula)
}

/**
 * Phase 24B placeholder checks only — full rule engine arrives in Phase 24C.
 */
export function checkDaxFormulaPlaceholder(
  formula: string,
  question: DaxPracticeQuestion,
): DaxAnswerFeedback {
  const normalized = normalizeFormula(formula)
  const checkedAt = new Date().toISOString()

  if (!normalized || normalized === '=' || normalized.endsWith('=')) {
    return {
      passed: false,
      feedback: ['Write a DAX formula first.'],
      checkedAt,
    }
  }

  const feedback: string[] = []
  const rules = question.placeholderRules

  for (const fn of rules.requiredFunctions ?? []) {
    if (!containsFunction(normalized, fn)) {
      feedback.push(`Expected the ${fn} function in your formula.`)
    }
  }

  for (const table of rules.requiredTableRefs ?? []) {
    if (!containsTableRef(normalized, table)) {
      feedback.push(`Reference the ${table} table in your formula.`)
    }
  }

  for (const column of rules.requiredColumnRefs ?? []) {
    if (!containsColumnRef(normalized, column)) {
      feedback.push(`Include the [${column}] column reference.`)
    }
  }

  if (feedback.length === 0) {
    return {
      passed: true,
      feedback: [
        'Placeholder check passed — your formula includes the expected function and column references.',
        'Full DAX validation arrives in Phase 24C.',
      ],
      checkedAt,
      explanation: question.explanation,
    }
  }

  return {
    passed: false,
    feedback,
    checkedAt,
  }
}
