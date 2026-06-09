/**
 * Beginner safety checks for JavaScript before backend sandbox execution.
 * Not full security — blocks obvious platform-abuse patterns in the workbench.
 */

export interface JavaScriptSafetyResult {
  allowed: boolean
  severity: 'warning' | 'blocked'
  message: string
  ruleId: string
}

const SAFE: JavaScriptSafetyResult = {
  allowed: true,
  severity: 'blocked',
  message: '',
  ruleId: 'ok',
}

const LARGE_LOOP_THRESHOLD = 1_000_000

function blocked(ruleId: string, message: string): JavaScriptSafetyResult {
  return { allowed: false, severity: 'blocked', message, ruleId }
}

function stripComments(source: string): string {
  let out = source.replace(/\/\*[\s\S]*?\*\//g, '')
  out = out
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n')
  return out
}

function hasInfiniteLoop(source: string): boolean {
  if (/while\s*\(\s*true\s*\)/i.test(source)) return true
  if (/for\s*\(\s*;\s*;\s*\)/.test(source)) return true
  return false
}

function hasLargeLoop(source: string): boolean {
  const patterns = [
    /for\s*\([^)]*<\s*(\d+)/gi,
    /while\s*\([^)]*<\s*(\d+)/gi,
    /i\s*<\s*(\d+)/gi,
  ]
  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(source)) !== null) {
      const num = Number(match[1])
      if (num >= LARGE_LOOP_THRESHOLD) return true
    }
  }
  return false
}

const BLOCKED_PATTERNS: Array<{ ruleId: string; pattern: RegExp; message: string }> = [
  { ruleId: 'fetch-call', pattern: /\bfetch\s*\(/, message: 'fetch() is not allowed in practice JavaScript.' },
  { ruleId: 'xmlhttprequest', pattern: /\bXMLHttpRequest\b/, message: 'XMLHttpRequest is not allowed in practice JavaScript.' },
  { ruleId: 'websocket', pattern: /\bWebSocket\b/, message: 'WebSocket is not allowed in practice JavaScript.' },
  { ruleId: 'local-storage', pattern: /\blocalStorage\b/, message: 'localStorage is not allowed in practice JavaScript.' },
  { ruleId: 'session-storage', pattern: /\bsessionStorage\b/, message: 'sessionStorage is not allowed in practice JavaScript.' },
  { ruleId: 'document-cookie', pattern: /\bdocument\.cookie\b/, message: 'document.cookie is not allowed in practice JavaScript.' },
  { ruleId: 'eval-call', pattern: /\beval\s*\(/, message: 'eval() is not allowed in practice JavaScript.' },
  { ruleId: 'function-constructor', pattern: /\bFunction\s*\(/, message: 'Function() constructor is not allowed in practice JavaScript.' },
  { ruleId: 'dynamic-import', pattern: /\bimport\s*\(/, message: 'dynamic import() is not allowed in practice JavaScript.' },
  { ruleId: 'require-call', pattern: /\brequire\s*\(/, message: 'require() is not allowed in practice JavaScript.' },
  { ruleId: 'process-access', pattern: /\bprocess\./, message: 'process APIs are not allowed in practice JavaScript.' },
  { ruleId: 'child-process', pattern: /\bchild_process\b/, message: 'child_process is not allowed in practice JavaScript.' },
  { ruleId: 'fs-access', pattern: /\bfs\./, message: 'fs module access is not allowed in practice JavaScript.' },
]

export function validateJavaScriptSafety(code: string): JavaScriptSafetyResult {
  const source = stripComments(code)

  if (hasInfiniteLoop(source)) {
    return blocked(
      'infinite-loop',
      'An infinite loop (while(true) or for(;;)) can freeze the practice runner.',
    )
  }

  if (hasLargeLoop(source)) {
    return blocked(
      'large-loop',
      `Loops with very large limits (≥ ${LARGE_LOOP_THRESHOLD.toLocaleString()}) can freeze the practice runner.`,
    )
  }

  for (const rule of BLOCKED_PATTERNS) {
    if (rule.pattern.test(source)) {
      return blocked(rule.ruleId, rule.message)
    }
  }

  return SAFE
}

export function getJavaScriptSafetyBlock(code: string): JavaScriptSafetyResult | null {
  const result = validateJavaScriptSafety(code)
  return result.allowed ? null : result
}

export const JAVASCRIPT_SAFETY_USER_MESSAGE =
  'This code looks unsafe for practice execution.'
