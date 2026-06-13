/**
 * Rule-based Java feedback for beginner students (Issue #29 Phase 13).
 * No AI/LLM — static pattern matching only.
 */

import type { CodePracticeFeedback } from '../types/codePractice.types'

export type JavaFeedback = CodePracticeFeedback

export const JAVA_RUNTIME_UNAVAILABLE_MESSAGE =
  'Java execution is not available in this environment yet. Backend JDK is required. Install OpenJDK and restart the backend.'

function feedback(
  partial: Omit<JavaFeedback, 'ruleId'> & { ruleId: string },
): JavaFeedback {
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

function extractJavaLine(error: string): number | undefined {
  const match = error.match(/\.java:(\d+)/) ?? error.match(/line (\d+)/i)
  return match ? Number(match[1]) : undefined
}

function extractErrorTail(error: string): string {
  const lines = error.trim().split('\n').filter(Boolean)
  return lines[lines.length - 1] ?? error
}

export function analyzeJavaCodeBeforeRun(code: string): JavaFeedback[] {
  const results: JavaFeedback[] = []
  const source = stripComments(code)
  const lines = source.split('\n')

  if (!/public\s+class\s+Main\b/.test(source)) {
    const classMatch = source.match(/public\s+class\s+(\w+)/)
    if (!classMatch) {
      results.push(
        feedback({
          ruleId: 'missing-public-class',
          type: 'syntax',
          severity: 'error',
          title: 'Missing public class Main',
          message: 'Java practice expects a public class named `Main` (no package needed).',
          suggestion: 'Add `public class Main { ... }` wrapping your code.',
        }),
      )
    } else if (classMatch[1] !== 'Main') {
      results.push(
        feedback({
          ruleId: 'class-name-mismatch',
          type: 'syntax',
          severity: 'error',
          title: 'Class name should be Main',
          message: `Found class \`${classMatch[1]}\`, but the runner expects \`Main\`.`,
          suggestion: 'Rename your class to `Main` so javac and java can find it.',
        }),
      )
    }
  }

  if (!/public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w*\s*\)/.test(source)) {
    if (/public\s+static\s+main\s*\(/.test(source)) {
      results.push(
        feedback({
          ruleId: 'main-missing-void',
          type: 'syntax',
          severity: 'error',
          title: 'main method needs void',
          message: 'Use `public static void main(String[] args)` — `void` is required.',
          suggestion: 'Add `void` between `static` and `main`.',
        }),
      )
    } else {
      results.push(
        feedback({
          ruleId: 'missing-main-method',
          type: 'syntax',
          severity: 'error',
          title: 'Missing main method',
          message: 'Java programs need `public static void main(String[] args)` to run.',
          suggestion: 'Add the main method inside class Main.',
        }),
      )
    }
  }

  if (/main\s*\(\s*string\s*\[\s*\]/i.test(source) && !/main\s*\(\s*String\s*\[\s*\]/.test(source)) {
    results.push(
      feedback({
        ruleId: 'lowercase-string-args',
        type: 'syntax',
        severity: 'warning',
        title: 'Use String[] with capital S',
        message: 'Java types are case-sensitive — use `String[] args`, not `string[]`.',
        suggestion: 'Change `string[]` to `String[]`.',
      }),
    )
  }

  if (/\bsystem\.out\./i.test(source) && !/System\.out\./.test(source)) {
    results.push(
      feedback({
        ruleId: 'lowercase-system-out',
        type: 'syntax',
        severity: 'warning',
        title: 'System.out needs capital letters',
        message: 'Java is case-sensitive — use `System.out.println`, not `system.out`.',
        suggestion: 'Capitalize `System` and `out`.',
      }),
    )
  }

  if (/\bScanner\b/.test(source) || /\bnew\s+Scanner\s*\(/.test(source)) {
    results.push(
      feedback({
        ruleId: 'scanner-stdin-unsupported',
        type: 'hint',
        severity: 'warning',
        title: 'Scanner / stdin not supported yet',
        message: 'The practice backend cannot read stdin yet. Use in-code variables instead of Scanner.',
        suggestion: 'Assign values to variables (e.g. `int n = 4;`) rather than reading input.',
      }),
    )
  }

  const openBraces = (source.match(/\{/g) ?? []).length
  const closeBraces = (source.match(/\}/g) ?? []).length
  if (openBraces > closeBraces) {
    results.push(
      feedback({
        ruleId: 'unbalanced-braces',
        type: 'syntax',
        severity: 'warning',
        title: 'Missing closing brace',
        message: `Found ${openBraces} \`{\` but only ${closeBraces} \`}\` — a block may be unclosed.`,
        suggestion: 'Add `}` to close open blocks.',
      }),
    )
  }

  if (/\bprint\s*\(/.test(source) && !/System\.out\.print/.test(source)) {
    const printMatch = source.match(/\bprint\s*\(/)
    results.push(
      feedback({
        ruleId: 'python-style-print',
        type: 'style',
        severity: 'warning',
        title: 'Use System.out.println in Java',
        message: '`print()` is Python syntax. Java uses `System.out.println()`.',
        lineNumber: printMatch ? lineNumberAt(source, printMatch.index ?? 0) : undefined,
        suggestion: 'Replace `print(...)` with `System.out.println(...)`.',
      }),
    )
  }

  if (/\bconsole\.log\b/.test(source)) {
    results.push(
      feedback({
        ruleId: 'javascript-style-console',
        type: 'style',
        severity: 'warning',
        title: 'Use System.out.println in Java',
        message: '`console.log()` is JavaScript. Java uses `System.out.println()`.',
        suggestion: 'Replace console.log with System.out.println.',
      }),
    )
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return
    if (/^(public|class|import|if|for|while|return|System\.)/.test(trimmed)) return
    if (/[;{})\]]$/.test(trimmed)) return
    if (trimmed.includes('=') || trimmed.includes('System.out')) {
      results.push(
        feedback({
          ruleId: 'missing-semicolon',
          type: 'syntax',
          severity: 'warning',
          title: 'Missing semicolon?',
          message: 'Most Java statements end with a semicolon `;`.',
          lineNumber: index + 1,
          suggestion: 'Add `;` at the end of the statement.',
        }),
      )
    }
  })

  return results
}

export function getBlockingJavaPreRunFeedback(code: string): JavaFeedback | null {
  return analyzeJavaCodeBeforeRun(code).find((item) => item.severity === 'error') ?? null
}

export function getJavaPreRunHints(code: string): JavaFeedback[] {
  return analyzeJavaCodeBeforeRun(code).filter((item) => item.severity !== 'error')
}

export function explainJavaError(error: string, errorCode?: string): JavaFeedback {
  const tail = extractErrorTail(error)
  const lineNumber = extractJavaLine(error)
  const lower = error.toLowerCase()

  if (errorCode === 'runtime_unavailable' || lower.includes('not found') && lower.includes('javac')) {
    return feedback({
      ruleId: 'runtime-unavailable',
      type: 'runtime',
      severity: 'error',
      title: 'Java runtime unavailable',
      message: JAVA_RUNTIME_UNAVAILABLE_MESSAGE,
      suggestion: 'Install OpenJDK on the backend server, ensure javac/java are on PATH, then restart the backend.',
    })
  }

  if (errorCode === 'timeout' || lower.includes('timeout') || lower.includes('timed out')) {
    return feedback({
      ruleId: 'runtime-timeout',
      type: 'runtime',
      severity: 'error',
      title: 'Program took too long',
      message: 'Your Java program exceeded the time limit — often an infinite loop.',
      lineNumber,
      suggestion: 'Check while/for loops and make sure they eventually stop.',
    })
  }

  if (errorCode === 'validation_error' || lower.includes('no public class')) {
    return feedback({
      ruleId: 'validation-no-class',
      type: 'syntax',
      severity: 'error',
      title: 'Missing public class',
      message: 'The runner could not find `public class Main` in your code.',
      suggestion: 'Wrap your code in `public class Main { ... }`.',
    })
  }

  if (errorCode === 'compile_error' || lower.includes('compilation error')) {
    if (lower.includes('expected') && lower.includes(';')) {
      return feedback({
        ruleId: 'compile-missing-semicolon',
        type: 'syntax',
        severity: 'error',
        title: 'Compile error — missing semicolon',
        message: 'javac expected a semicolon at the end of a statement.',
        lineNumber,
        suggestion: 'Add `;` after the statement on the reported line.',
      })
    }
    if (lower.includes('cannot find symbol')) {
      return feedback({
        ruleId: 'compile-cannot-find-symbol',
        type: 'syntax',
        severity: 'error',
        title: 'Unknown name',
        message: 'javac could not find a variable, class, or method you used.',
        lineNumber,
        suggestion: 'Check spelling and declare variables before use.',
      })
    }
    return feedback({
      ruleId: 'compile-generic',
      type: 'syntax',
      severity: 'error',
      title: 'Compile error',
      message: 'javac could not compile your code.',
      lineNumber,
      suggestion: 'Read the line number in the message and fix syntax near that line.',
    })
  }

  if (errorCode === 'runtime_error' || lower.includes('runtime error') || lower.includes('exception')) {
    if (lower.includes('arrayindexoutofbounds')) {
      return feedback({
        ruleId: 'runtime-array-bounds',
        type: 'runtime',
        severity: 'error',
        title: 'Array index out of bounds',
        message: 'You accessed an array position that does not exist.',
        lineNumber,
        suggestion: 'Check array length and loop bounds (0 to length - 1).',
      })
    }
    return feedback({
      ruleId: 'runtime-exception',
      type: 'runtime',
      severity: 'error',
      title: 'Runtime exception',
      message: 'Your program compiled but crashed while running.',
      lineNumber,
      suggestion: 'Read the exception name in the technical details below.',
    })
  }

  if (lower.includes('no output') || error.trim() === '') {
    return feedback({
      ruleId: 'runtime-no-output',
      type: 'runtime',
      severity: 'warning',
      title: 'No output',
      message: 'Your program ran but printed nothing.',
      suggestion: 'Add `System.out.println(...)` to show results.',
    })
  }

  return feedback({
    ruleId: 'runtime-unknown',
    type: 'runtime',
    severity: 'error',
    title: 'Java error',
    message: tail || 'Something went wrong while running your Java code.',
    lineNumber,
    suggestion: 'Read the technical details below and check the reported line.',
  })
}
