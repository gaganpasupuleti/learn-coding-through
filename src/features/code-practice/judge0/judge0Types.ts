/**
 * Judge0 integration types for Issue #29 — Java, C, C++ (future phases).
 * Types only; no execution in Phase 9.
 *
 * @see https://github.com/judge0/judge0
 */

/** Supported compiled-language keys for the Code Practice Ground Judge0 track. */
export type Judge0LanguageKey = 'java' | 'c' | 'cpp'

/** Submission payload sent to our backend adapter (not directly to Judge0 from the browser). */
export interface Judge0SubmissionRequest {
  sourceCode: string
  language: Judge0LanguageKey
  stdin?: string
  expectedOutput?: string
  /** CPU time limit in seconds (Judge0 `cpu_time_limit`). */
  cpuTimeLimit?: number
  /** Memory limit in kilobytes (Judge0 `memory_limit`). */
  memoryLimit?: number
}

/** Normalized result returned by the future backend adapter. */
export interface Judge0SubmissionResult {
  stdout: string
  stderr: string
  compileOutput: string
  message: string
  status: Judge0Status
  /** Wall-clock or reported execution time in milliseconds. */
  executionTime: number | null
  /** Reported memory usage in kilobytes, when available. */
  memory: number | null
  /** Optional pass/fail when compared against expectedOutput on the backend. */
  passed?: boolean
}

/** Subset of Judge0 status object — IDs vary by deployment; verify against live instance. */
export interface Judge0Status {
  id: number
  description: string
}
