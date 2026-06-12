export interface SqlGuardrailResult {
  ok: boolean
  message: string
}

const FORBIDDEN_KEYWORDS =
  /\b(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|ATTACH|DETACH|REPLACE|VACUUM)\b/i

const UNSAFE_PRAGMA = /\bPRAGMA\b(?![\s(]*(?:table_info|foreign_key_list|index_list)\b)/i

/** Strip SQL comments for guardrail checks only (not for execution). */
function stripCommentsForCheck(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n\r]*/g, ' ')
    .trim()
}

/**
 * Phase 2: user SQL must be read-only SELECT (WITH … SELECT allowed).
 * Trusted seed SQL in universitySeedSql.ts is not validated here.
 */
export function validateUserSql(sql: string): SqlGuardrailResult {
  const trimmed = sql.trim()
  if (!trimmed) {
    return { ok: false, message: 'Write a SQL query before running.' }
  }

  if (FORBIDDEN_KEYWORDS.test(trimmed)) {
    return { ok: false, message: 'Only SELECT queries are allowed in practice mode.' }
  }

  if (UNSAFE_PRAGMA.test(trimmed)) {
    return { ok: false, message: 'Only SELECT queries are allowed in practice mode.' }
  }

  const stripped = stripCommentsForCheck(trimmed)
  const firstToken = stripped.split(/\s+/)[0]?.toUpperCase() ?? ''
  if (firstToken !== 'SELECT' && firstToken !== 'WITH') {
    return { ok: false, message: 'Only SELECT queries are allowed in practice mode.' }
  }

  return { ok: true, message: '' }
}
