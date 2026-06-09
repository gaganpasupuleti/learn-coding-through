/** Classify backend/Pyodide error text for mistake records (Issue #29). */
export function classifyRunError(message: string): 'syntax' | 'runtime' | 'timeout' | 'unknown' {
  const lower = message.toLowerCase()
  if (/syntax|parse|unexpected token|indentation/i.test(lower)) return 'syntax'
  if (/timeout|timed out/i.test(lower)) return 'timeout'
  if (/error|exception|traceback/i.test(lower)) return 'runtime'
  return 'unknown'
}
