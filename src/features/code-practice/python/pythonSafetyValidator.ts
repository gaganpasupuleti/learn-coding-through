/**
 * Beginner safety checks for Python executed in the browser via Pyodide.
 *
 * Pyodide is intended for small, educational scripts — not a full security sandbox.
 * This validator blocks obvious patterns that can freeze the tab or touch the host.
 * A future worker-based execution timeout can be added for stronger isolation.
 */

export interface PythonSafetyResult {
  allowed: boolean
  severity: 'warning' | 'blocked'
  message: string
  ruleId: string
}

const SAFE: PythonSafetyResult = {
  allowed: true,
  severity: 'warning',
  message: '',
  ruleId: 'ok',
}

const LARGE_RANGE_THRESHOLD = 1_000_000

function blocked(ruleId: string, message: string, severity: 'warning' | 'blocked' = 'blocked'): PythonSafetyResult {
  return { allowed: false, severity, message, ruleId }
}

/** Strip single-line comments so `# while True` in a comment does not false-positive. */
function stripComments(source: string): string {
  return source
    .split('\n')
    .map((line) => line.replace(/#.*$/, ''))
    .join('\n')
}

function hasInfiniteWhileLoop(source: string): boolean {
  const pattern = /while\s+(True|1)\s*:/gi
  let match: RegExpExecArray | null
  while ((match = pattern.exec(source)) !== null) {
    const window = source.slice(match.index, match.index + 1200)
    if (!/\bbreak\b/.test(window)) {
      return true
    }
  }
  return false
}

function hasLargeRange(source: string): boolean {
  const rangePattern = /range\s*\(([^)]*)\)/gi
  let match: RegExpExecArray | null
  while ((match = rangePattern.exec(source)) !== null) {
    const args = match[1]
    const numbers = args.match(/\d+/g) ?? []
    for (const num of numbers) {
      if (Number(num) >= LARGE_RANGE_THRESHOLD) {
        return true
      }
    }
  }
  return false
}

const BLOCKED_IMPORTS: Array<{ ruleId: string; pattern: RegExp; message: string }> = [
  {
    ruleId: 'import-os',
    pattern: /^\s*import\s+os\b/m,
    message: 'import os is not allowed in browser Python practice.',
  },
  {
    ruleId: 'from-os',
    pattern: /^\s*from\s+os\b/m,
    message: 'import os is not allowed in browser Python practice.',
  },
  {
    ruleId: 'import-subprocess',
    pattern: /^\s*import\s+subprocess\b/m,
    message: 'import subprocess is not allowed in browser Python practice.',
  },
  {
    ruleId: 'from-subprocess',
    pattern: /^\s*from\s+subprocess\b/m,
    message: 'import subprocess is not allowed in browser Python practice.',
  },
  {
    ruleId: 'import-socket',
    pattern: /^\s*import\s+socket\b/m,
    message: 'import socket is not allowed in browser Python practice.',
  },
  {
    ruleId: 'from-socket',
    pattern: /^\s*from\s+socket\b/m,
    message: 'import socket is not allowed in browser Python practice.',
  },
  {
    ruleId: 'import-requests',
    pattern: /^\s*import\s+requests\b/m,
    message: 'import requests is not allowed in browser Python practice.',
  },
  {
    ruleId: 'from-requests',
    pattern: /^\s*from\s+requests\b/m,
    message: 'import requests is not allowed in browser Python practice.',
  },
]

const DANGEROUS_CALLS: Array<{ ruleId: string; pattern: RegExp; message: string }> = [
  {
    ruleId: 'eval-call',
    pattern: /\beval\s*\(/,
    message: 'eval() is not allowed in browser Python practice.',
  },
  {
    ruleId: 'exec-call',
    pattern: /\bexec\s*\(/,
    message: 'exec() is not allowed in browser Python practice.',
  },
  {
    ruleId: 'dunder-import',
    pattern: /__import__\s*\(/,
    message: '__import__() is not allowed in browser Python practice.',
  },
  {
    ruleId: 'file-write',
    pattern: /open\s*\([^)]*,\s*['"][wa]['"]/,
    message: 'Writing files is not allowed in browser Python practice.',
  },
  {
    ruleId: 'os-remove',
    pattern: /\b(?:os\.)?remove\s*\(/,
    message: 'Deleting files is not allowed in browser Python practice.',
  },
  {
    ruleId: 'os-unlink',
    pattern: /\b(?:os\.)?unlink\s*\(/,
    message: 'Deleting files is not allowed in browser Python practice.',
  },
]

/**
 * Inspect Python source before Pyodide runs it.
 * Warnings are treated as blocked in Phase 5 (no confirmation UI yet).
 */
export function validatePythonSafety(code: string): PythonSafetyResult {
  const source = stripComments(code)

  if (hasInfiniteWhileLoop(source)) {
    return blocked(
      'infinite-while',
      'An infinite while loop (while True / while 1 without break) can freeze the browser.',
      'warning',
    )
  }

  if (hasLargeRange(source)) {
    return blocked(
      'large-range',
      `range() with very large values (≥ ${LARGE_RANGE_THRESHOLD.toLocaleString()}) can freeze the browser.`,
      'warning',
    )
  }

  for (const rule of BLOCKED_IMPORTS) {
    if (rule.pattern.test(source)) {
      return blocked(rule.ruleId, rule.message)
    }
  }

  for (const rule of DANGEROUS_CALLS) {
    if (rule.pattern.test(source)) {
      return blocked(rule.ruleId, rule.message)
    }
  }

  return SAFE
}

/**
 * Returns a block result when code must not run; null when execution may proceed.
 * Warnings are stored with allowed: false (Phase 5 has no confirmation UI).
 */
export function getPythonSafetyBlock(code: string): PythonSafetyResult | null {
  const result = validatePythonSafety(code)
  return result.allowed ? null : result
}

export const PYTHON_SAFETY_USER_MESSAGE = 'This code looks unsafe for browser execution.'
