/**
 * Rule-based JavaScript feedback for beginner students (Issue #29).
 * No AI/LLM — static pattern matching only.
 */

import type { CodePracticeFeedback } from '../types/codePractice.types'

export type JavaScriptFeedback = CodePracticeFeedback

function feedback(
  partial: Omit<JavaScriptFeedback, 'ruleId'> & { ruleId: string },
): JavaScriptFeedback {
  return partial
}

function stripComments(source: string): string {
  let out = source.replace(/\/\*[\s\S]*?\*\//g, '')
  out = out
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n')
  return out
}

function lineNumberAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length
}

function countChar(text: string, char: string): number {
  let count = 0
  let inSingle = false
  let inDouble = false
  let inTemplate = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const prev = text[i - 1]
    if (ch === "'" && prev !== '\\' && !inDouble && !inTemplate) inSingle = !inSingle
    if (ch === '"' && prev !== '\\' && !inSingle && !inTemplate) inDouble = !inDouble
    if (ch === '`' && prev !== '\\' && !inSingle && !inDouble) inTemplate = !inTemplate
    if (!inSingle && !inDouble && !inTemplate && ch === char) count++
  }
  return count
}

function extractJsLine(error: string): number | undefined {
  const match = error.match(/:(\d+):(\d+)/) ?? error.match(/line (\d+)/i)
  return match ? Number(match[1]) : undefined
}

function extractErrorTail(error: string): string {
  const lines = error.trim().split('\n').filter(Boolean)
  return lines[lines.length - 1] ?? error
}

function extractQuotedName(tail: string): string | undefined {
  const match = tail.match(/(\w+) is not defined/) ?? tail.match(/'([^']+)'/)
  return match?.[1]
}

export function analyzeJavaScriptCodeBeforeRun(code: string): JavaScriptFeedback[] {
  const results: JavaScriptFeedback[] = []
  const source = stripComments(code)
  const lines = source.split('\n')

  const pairs: Array<{ open: string; close: string; ruleId: string; label: string }> = [
    { open: '(', close: ')', ruleId: 'unbalanced-parens', label: 'parentheses' },
    { open: '[', close: ']', ruleId: 'unbalanced-brackets', label: 'square brackets' },
    { open: '{', close: '}', ruleId: 'unbalanced-braces', label: 'curly braces' },
  ]

  for (const { open, close, ruleId, label } of pairs) {
    const openCount = countChar(source, open)
    const closeCount = countChar(source, close)
    if (openCount !== closeCount) {
      results.push(
        feedback({
          ruleId,
          type: 'syntax',
          severity: 'error',
          title: `Unmatched ${label}`,
          message:
            openCount > closeCount
              ? `A \`${open}\` is missing its closing \`${close}\`.`
              : `There is an extra \`${close}\` somewhere.`,
          suggestion: `Count \`${open}\` and \`${close}\` — they must match.`,
        }),
      )
    }
  }

  const consoleTypoPattern = /\b(consle\.log|console\.loh|consol\.log)\b/g
  let typoMatch: RegExpExecArray | null
  while ((typoMatch = consoleTypoPattern.exec(source)) !== null) {
    results.push(
      feedback({
        ruleId: 'typo-console-log',
        type: 'hint',
        severity: 'warning',
        title: 'Possible console.log typo',
        message: `\`${typoMatch[1]}\` is not the correct way to print in JavaScript.`,
        lineNumber: lineNumberAt(source, typoMatch.index),
        suggestion: 'Did you mean `console.log()`?',
      }),
    )
  }

  if (/\bprint\s*\(/.test(source)) {
    results.push(
      feedback({
        ruleId: 'python-style-print',
        type: 'style',
        severity: 'warning',
        title: 'Use console.log in JavaScript',
        message: '`print()` is Python syntax. JavaScript uses `console.log()`.',
        suggestion: 'Replace `print(...)` with `console.log(...)`.',
      }),
    )
  }

  lines.forEach((line, index) => {
    const condMatch = line.match(/^\s*if\s*\((.+)\)/)
    if (!condMatch) return
    const condition = condMatch[1]
    if (/[^=!<>]=[^=]/.test(condition) && !condition.includes('===') && !condition.includes('!==')) {
      results.push(
        feedback({
          ruleId: 'assign-in-condition',
          type: 'hint',
          severity: 'warning',
          title: 'Did you mean === ?',
          message: 'A single `=` assigns a value. Conditions usually need `===` to compare.',
          lineNumber: index + 1,
          suggestion: 'Use `===` to compare values, e.g. `if (x === 5)`.',
        }),
      )
    }
  })

  lines.forEach((line, index) => {
    const logMatch = line.match(/console\.log\s*\(\s*([A-Za-z_]\w*)\s*\)/)
    if (logMatch) {
      results.push(
        feedback({
          ruleId: 'missing-quotes',
          type: 'syntax',
          severity: 'warning',
          title: 'String may need quotes',
          message: `\`${logMatch[1]}\` looks like text — wrap it in quotes inside console.log().`,
          lineNumber: index + 1,
          suggestion: `Use console.log("${logMatch[1]}") with quotes around the text.`,
        }),
      )
    }
  })

  const wrongBoolPattern = /\b(True|False|None)\b/g
  let boolMatch: RegExpExecArray | null
  while ((boolMatch = wrongBoolPattern.exec(source)) !== null) {
    const word = boolMatch[1]
    const fixed = word === 'None' ? 'null' : word.toLowerCase()
    results.push(
      feedback({
        ruleId: 'python-bool-style',
        type: 'style',
        severity: 'warning',
        title: `Use ${fixed}, not ${word}`,
        message: `JavaScript spells this as \`${fixed}\`, not Python's \`${word}\`.`,
        lineNumber: lineNumberAt(source, boolMatch.index),
        suggestion: `Replace \`${word}\` with \`${fixed}\`.`,
      }),
    )
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return
    if (/^(if|for|while|function|const|let|var|return|console\.)/.test(trimmed)) return
    if (/[;{})\]]$/.test(trimmed)) return
    if (trimmed.includes('=') || trimmed.includes('console.log')) {
      results.push(
        feedback({
          ruleId: 'missing-semicolon-info',
          type: 'style',
          severity: 'info',
          title: 'Semicolon reminder',
          message: 'JavaScript often works without semicolons, but adding `;` can prevent surprises.',
          lineNumber: index + 1,
          suggestion: 'Consider ending the statement with `;`.',
        }),
      )
    }
  })

  return results
}

export function getBlockingJavaScriptPreRunFeedback(code: string): JavaScriptFeedback | null {
  return analyzeJavaScriptCodeBeforeRun(code).find((item) => item.severity === 'error') ?? null
}

export function getJavaScriptPreRunHints(code: string): JavaScriptFeedback[] {
  return analyzeJavaScriptCodeBeforeRun(code).filter((item) => item.severity !== 'error')
}

export function explainJavaScriptError(error: string): JavaScriptFeedback {
  const tail = extractErrorTail(error)
  const lineNumber = extractJsLine(error)
  const lower = tail.toLowerCase()

  if (lower.includes('syntaxerror')) {
    if (lower.includes('unexpected token') || lower.includes('invalid')) {
      return feedback({
        ruleId: 'runtime-syntax',
        type: 'syntax',
        severity: 'error',
        title: 'Syntax error',
        message: 'JavaScript could not understand this code.',
        lineNumber,
        suggestion: 'Check for missing `)`, `}`, `]`, quotes, or a typo near the reported line.',
      })
    }
    return feedback({
      ruleId: 'runtime-syntax-generic',
      type: 'syntax',
      severity: 'error',
      title: 'Syntax error',
      message: 'Your code has a grammar mistake JavaScript cannot run.',
      lineNumber,
      suggestion: 'Read the line number in the technical message and fix punctuation.',
    })
  }

  if (lower.includes('referenceerror')) {
    const name = extractQuotedName(tail)
    if (name && /consle|consol|loh/i.test(name)) {
      return feedback({
        ruleId: 'runtime-ref-console-typo',
        type: 'runtime',
        severity: 'error',
        title: 'Unknown name used',
        message: `JavaScript does not know what \`${name}\` means.`,
        lineNumber,
        suggestion: 'Did you mean `console.log()`?',
      })
    }
    return feedback({
      ruleId: 'runtime-reference',
      type: 'runtime',
      severity: 'error',
      title: 'Unknown name used',
      message: name
        ? `\`${name}\` was used before it was defined or is misspelled.`
        : 'A variable or function was used before it was created.',
      lineNumber,
      suggestion: name
        ? `Check spelling of \`${name}\`, or define it before use.`
        : 'Declare the variable with let/const before using it.',
    })
  }

  if (
    lower.includes('fatal process oom') ||
    lower.includes('failed to reserve virtual memory') ||
    lower.includes('javascript heap out of memory')
  ) {
    return feedback({
      ruleId: 'runtime-sandbox-oom',
      type: 'runtime',
      severity: 'error',
      title: 'Sandbox could not start',
      message: 'The JavaScript runner ran out of memory on the server.',
      lineNumber,
      suggestion: 'Try again in a moment. If this keeps happening, tell your instructor — the backend may need more memory.',
    })
  }

  if (lower.includes('typeerror')) {
    if (lower.includes('is not a function')) {
      const fnMatch = tail.match(/(\S+) is not a function/)
      return feedback({
        ruleId: 'runtime-not-a-function',
        type: 'runtime',
        severity: 'error',
        title: 'Not a function',
        message: fnMatch
          ? `\`${fnMatch[1]}\` cannot be called like a function.`
          : 'Something was called like a function but is not one.',
        lineNumber,
        suggestion: 'Check spelling — e.g. `console.log` not `console.loh`.',
      })
    }
    return feedback({
      ruleId: 'runtime-type',
      type: 'runtime',
      severity: 'error',
      title: 'Wrong value type',
      message: 'An operation was used on a value of the wrong type.',
      lineNumber,
      suggestion: 'Check whether you need Number(), String(), or parseInt() conversion.',
    })
  }

  return feedback({
    ruleId: 'runtime-unknown',
    type: 'runtime',
    severity: 'error',
    title: 'JavaScript error',
    message: 'Something went wrong while running your code.',
    lineNumber,
    suggestion: 'Read the technical details below and check the reported line.',
  })
}
