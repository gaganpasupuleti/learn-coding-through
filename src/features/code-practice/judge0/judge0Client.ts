/**
 * Placeholder Judge0 client for Issue #29 — Phase 9 architecture only.
 *
 * RULES:
 * - Do NOT call Judge0 directly from the frontend.
 * - Do NOT store API keys or secrets in the browser.
 * - Phase 10+ should call our backend adapter, which proxies to Judge0 with limits.
 */

import type { Judge0SubmissionRequest, Judge0SubmissionResult } from './judge0Types'

export const JUDGE0_NOT_ENABLED_MESSAGE =
  'Judge0 execution is not enabled yet. This must call our backend adapter after deployment.'

/**
 * Future entry point: browser → our backend → Judge0.
 *
 * Planned backend routes (not implemented in Phase 9):
 * - POST /api/code/judge0/execute  — single run with stdin
 * - POST /api/code/judge0/submit   — run against test cases (hidden cases later)
 */
export async function submitToJudge0Backend(
  request: Judge0SubmissionRequest,
): Promise<Judge0SubmissionResult> {
  void request
  throw new Error(JUDGE0_NOT_ENABLED_MESSAGE)
}

/** Returns true when backend Judge0 adapter is wired (always false in Phase 9). */
export function isJudge0BackendEnabled(): boolean {
  return false
}
