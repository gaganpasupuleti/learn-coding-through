/**
 * Rule-based Python feedback for beginner students (Issue #29).
 * No AI/LLM — static pattern matching only. Not a full linter (no parso/ruff).
 */

import type { CodePracticeFeedback } from '../types/codePractice.types'

export type PythonFeedback = CodePracticeFeedback

export {
  formatFeedbackForError,
  formatFeedbackForConsole,
  formatHintsForConsole,
} from '../utils/feedbackDisplay'

function feedback(
  partial: Omit<PythonFeedback, 'ruleId'> & { ruleId: string },
): PythonFeedback {
  return partial
}

function stripComments(source: string): string {
  return source
    .split('\n')
    .map((line) => line.replace(/#.*$/, ''))
    .join('\n')
}

function lineNumberAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length
}

function countChar(text: string, char: string): number {
  let count = 0
  let inSingle = false
  let inDouble = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const prev = text[i - 1]
    if (ch === "'" && prev !== '\\' && !inDouble) inSingle = !inSingle
    if (ch === '"' && prev !== '\\' && !inSingle) inDouble = !inDouble
    if (!inSingle && !inDouble && ch === char) count++
  }
  return count
}

function extractPyodideLine(error: string): number | undefined {
  const match = error.match(/File "<exec>", line (\d+)/)
  return match ? Number(match[1]) : undefined
}

function extractErrorTail(error: string): string {
  const lines = error.trim().split('\n').filter(Boolean)
  return lines[lines.length - 1] ?? error
}

function extractQuotedName(tail: string): string | undefined {
  const match = tail.match(/name '([^']+)'/)
  return match?.[1]
}

/** Static checks before Pyodide runs. Errors block execution; warnings/info are hints only. */
export function analyzePythonCodeBeforeRun(code: string): PythonFeedback[] {
  const results: PythonFeedback[] = []
  const source = stripComments(code)
  const lines = source.split('\n')

  const openParen = countChar(source, '(')
  const closeParen = countChar(source, ')')
  if (openParen !== closeParen) {
    results.push(
      feedback({
        ruleId: 'unbalanced-parens',
        type: 'syntax',
        severity: 'error',
        title: 'Unmatched parentheses',
        message:
          openParen > closeParen
            ? 'A `(` is missing its closing `)`.'
            : 'There is an extra `)` somewhere.',
        suggestion: 'Count opening `(` and closing `)` — they must match.',
      }),
    )
  }

  const openBracket = countChar(source, '[')
  const closeBracket = countChar(source, ']')
  if (openBracket !== closeBracket) {
    results.push(
      feedback({
        ruleId: 'unbalanced-brackets',
        type: 'syntax',
        severity: 'error',
        title: 'Unmatched square brackets',
        message: 'Square brackets `[` and `]` do not balance.',
        suggestion: 'Check list literals and indexing brackets.',
      }),
    )
  }

  const headerPattern = /^\s*(if|elif|for|while|def|class)\b(.+)?$/
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    if (headerPattern.test(line) && !trimmed.endsWith(':') && !trimmed.endsWith('\\')) {
      const keyword = trimmed.match(/^\s*(if|elif|for|while|def|class)\b/)?.[1] ?? 'statement'
      results.push(
        feedback({
          ruleId: 'missing-colon',
          type: 'syntax',
          severity: 'error',
          title: 'Missing colon',
          message: `Python needs a colon \`:\` at the end of this ${keyword} line.`,
          lineNumber: index + 1,
          suggestion: `Add \`:\` at the end of line ${index + 1}.`,
        }),
      )
    }
  })

  const pritnMatch = /\bpritn\b/.exec(source)
  if (pritnMatch) {
    results.push(
      feedback({
        ruleId: 'typo-pritn',
        type: 'hint',
        severity: 'warning',
        title: 'Possible typo: pritn',
        message: 'Python does not have a function called `pritn`.',
        lineNumber: lineNumberAt(source, pritnMatch.index),
        suggestion: 'Did you mean `print()`?',
      }),
    )
  }

  lines.forEach((line, index) => {
    if (/^\s*print\s+[^(]/.test(line)) {
      results.push(
        feedback({
          ruleId: 'print-no-parens',
          type: 'style',
          severity: 'warning',
          title: 'print needs parentheses',
          message: 'In Python 3, `print` is a function and needs `()`.',
          lineNumber: index + 1,
          suggestion: 'Use `print("text")` instead of `print "text"`.',
        }),
      )
    }
  })

  lines.forEach((line, index) => {
    const condMatch = line.match(/^\s*(if|elif|while)\s+(.+)$/)
    if (!condMatch) return
    const condition = condMatch[2].replace(/#.*$/, '').trim()
    if (/[^=!<>]=[^=]/.test(condition) && !condition.includes('==')) {
      results.push(
        feedback({
          ruleId: 'assign-in-condition',
          type: 'hint',
          severity: 'warning',
          title: 'Did you mean == ?',
          message: 'A single `=` assigns a value. Conditions usually need `==` to compare.',
          lineNumber: index + 1,
          suggestion: 'Use `==` to compare values, e.g. `if x == 5:`.',
        }),
      )
    }
  })

  const wrongBoolPattern = /\b(true|false|none)\b/g
  let boolMatch: RegExpExecArray | null
  while ((boolMatch = wrongBoolPattern.exec(source)) !== null) {
    const word = boolMatch[1]
    const fixed = word === 'none' ? 'None' : word[0].toUpperCase() + word.slice(1)
    results.push(
      feedback({
        ruleId: 'wrong-bool-capitalization',
        type: 'style',
        severity: 'warning',
        title: `Use ${fixed}, not ${word}`,
        message: `Python spells this as \`${fixed}\` with a capital letter.`,
        lineNumber: lineNumberAt(source, boolMatch.index),
        suggestion: `Replace \`${word}\` with \`${fixed}\`.`,
      }),
    )
  }

  if (/\binput\s*\(/.test(source) && !/\bint\s*\(\s*input/.test(source) && !/\bfloat\s*\(\s*input/.test(source)) {
    results.push(
      feedback({
        ruleId: 'input-string-reminder',
        type: 'hint',
        severity: 'info',
        title: 'input() returns text',
        message: '`input()` always gives you a string. Use `int()` or `float()` before math.',
        suggestion: 'Example: `age = int(input())` when you need a number.',
      }),
    )
  }

  return results
}

export function getBlockingPreRunFeedback(code: string): PythonFeedback | null {
  return analyzePythonCodeBeforeRun(code).find((item) => item.severity === 'error') ?? null
}

export function getPreRunHints(code: string): PythonFeedback[] {
  return analyzePythonCodeBeforeRun(code).filter((item) => item.severity !== 'error')
}

/** Turn a Pyodide/Python traceback into beginner-friendly feedback. */
export function explainPythonError(error: string): PythonFeedback {
  const tail = extractErrorTail(error)
  const lineNumber = extractPyodideLine(error)
  const lower = tail.toLowerCase()

  if (lower.includes('syntaxerror')) {
    if (lower.includes("eol while scanning string") || lower.includes('unterminated')) {
      return feedback({
        ruleId: 'runtime-syntax-string',
        type: 'syntax',
        severity: 'error',
        title: 'Unfinished string or quote',
        message: 'A string started with `\'` or `"` but was not closed.',
        lineNumber,
        suggestion: 'Check every opening quote has a matching closing quote.',
      })
    }
    if (lower.includes('invalid syntax')) {
      return feedback({
        ruleId: 'runtime-syntax-invalid',
        type: 'syntax',
        severity: 'error',
        title: 'Invalid syntax',
        message: 'Python could not understand this line.',
        lineNumber,
        suggestion: 'Look for missing `:`, `)`, `]`, or a typo near the reported line.',
      })
    }
    return feedback({
      ruleId: 'runtime-syntax',
      type: 'syntax',
      severity: 'error',
      title: 'Syntax error',
      message: 'Your code has a grammar mistake Python cannot run.',
      lineNumber,
      suggestion: 'Read the line number in the technical message and fix punctuation or spelling.',
    })
  }

  if (lower.includes('indentationerror')) {
    return feedback({
      ruleId: 'runtime-indentation',
      type: 'syntax',
      severity: 'error',
      title: 'Indentation problem',
      message: 'Lines inside `if`, loops, and functions must line up with consistent spaces.',
      lineNumber,
      suggestion: 'Use 4 spaces per indent level. Do not mix tabs and spaces.',
    })
  }

  if (lower.includes('nameerror')) {
    const name = extractQuotedName(tail)
    if (name === 'pritn') {
      return feedback({
        ruleId: 'runtime-name-pritn',
        type: 'runtime',
        severity: 'error',
        title: 'Unknown name used',
        message: 'Python does not know what `pritn` means.',
        lineNumber,
        suggestion: 'Did you mean `print()`?',
      })
    }
    return feedback({
      ruleId: 'runtime-name',
      type: 'runtime',
      severity: 'error',
      title: 'Unknown name used',
      message: name
        ? `Python does not know what \`${name}\` means. It may be misspelled or not created yet.`
        : 'A variable or function name was used before it was defined.',
      lineNumber,
      suggestion: name
        ? `Check spelling of \`${name}\`, or define it before use.`
        : 'Define the variable or import it before using it.',
    })
  }

  if (lower.includes('typeerror')) {
    if (lower.includes('unsupported operand type') || lower.includes('can only concatenate')) {
      return feedback({
        ruleId: 'runtime-type-mix',
        type: 'runtime',
        severity: 'error',
        title: 'Mixed text and numbers',
        message: '`input()` and plain strings are text. You cannot add them to numbers directly.',
        lineNumber,
        suggestion: 'Convert with `int()` or `float()` before doing math, e.g. `int(input()) + 5`.',
      })
    }
    return feedback({
      ruleId: 'runtime-type',
      type: 'runtime',
      severity: 'error',
      title: 'Wrong value type',
      message: 'An operation was used on a value of the wrong type.',
      lineNumber,
      suggestion: 'Check whether you need `int()`, `float()`, or `str()` conversion.',
    })
  }

  if (lower.includes('valueerror')) {
    return feedback({
      ruleId: 'runtime-value',
      type: 'runtime',
      severity: 'error',
      title: 'Bad value',
      message: 'A function received a value it cannot use.',
      lineNumber,
      suggestion: 'Check `int()` / `float()` input — only numeric text can convert.',
    })
  }

  if (lower.includes('zerodivisionerror')) {
    return feedback({
      ruleId: 'runtime-zero-div',
      type: 'runtime',
      severity: 'error',
      title: 'Division by zero',
      message: 'You cannot divide a number by zero.',
      lineNumber,
      suggestion: 'Make sure the divisor is not `0` before dividing.',
    })
  }

  if (lower.includes('eoferror')) {
    return feedback({
      ruleId: 'runtime-eof-input',
      type: 'runtime',
      severity: 'error',
      title: 'Not enough input',
      message: 'Your code called `input()` more times than sample input provides.',
      lineNumber,
      suggestion: 'Add sample input for each `input()` call, or reduce how many times you read input.',
    })
  }

  return feedback({
    ruleId: 'runtime-unknown',
    type: 'runtime',
    severity: 'error',
    title: 'Python error',
    message: 'Something went wrong while running your code.',
    lineNumber,
    suggestion: 'Read the technical details below and check the reported line.',
  })
}

