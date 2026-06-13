/**
 * Beginner safety checks for Java before backend sandbox execution.
 * Mirrors backend denylist patterns for early user feedback.
 */

export interface JavaSafetyResult {
  allowed: boolean
  severity: 'warning' | 'blocked'
  message: string
  ruleId: string
}

const SAFE: JavaSafetyResult = {
  allowed: true,
  severity: 'blocked',
  message: '',
  ruleId: 'ok',
}

function blocked(ruleId: string, message: string): JavaSafetyResult {
  return { allowed: false, severity: 'blocked', message, ruleId }
}

const BLOCKED_PATTERNS: Array<{ ruleId: string; pattern: RegExp; message: string }> = [
  { ruleId: 'runtime-getruntime', pattern: /\bRuntime\.getRuntime\b/, message: 'Runtime.getRuntime() is not allowed in practice Java.' },
  { ruleId: 'process-builder', pattern: /\bProcessBuilder\b/, message: 'ProcessBuilder is not allowed in practice Java.' },
  { ruleId: 'file-io', pattern: /\bFileInputStream\b|\bFileOutputStream\b|\bjava\.io\.File\b/, message: 'File I/O is not allowed in practice Java.' },
  { ruleId: 'system-exit', pattern: /\bSystem\.exit\b/, message: 'System.exit() is not allowed in practice Java.' },
]

export const JAVA_SAFETY_USER_MESSAGE =
  'Your code was blocked for practice safety. Remove restricted APIs and try again.'

export function getJavaSafetyBlock(code: string): JavaSafetyResult | null {
  for (const { ruleId, pattern, message } of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return blocked(ruleId, message)
    }
  }
  return SAFE.allowed ? null : SAFE
}
