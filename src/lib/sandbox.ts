import { executeCode } from './api'

export interface ExecutionResult {
  output: string
  executionTime: number
  error?: string
  error_code?: string
  timed_out?: boolean
}

export interface ExecutorConfig {
  timeout?: number
  maxOutputLength?: number
}

export class CodeSandbox {
  private timeout: number
  private maxOutputLength: number

  constructor(config?: ExecutorConfig) {
    this.timeout = config?.timeout ?? 5000
    this.maxOutputLength = config?.maxOutputLength ?? 10000
  }

  private truncate(output: string) {
    if (output.length <= this.maxOutputLength) return output
    return output.slice(0, this.maxOutputLength) + '\n...output truncated'
  }

  /* ---------- Execute via Backend API ----------
   * Uses a client-side timeout (this.timeout ms). If the backend hasn't
   * responded by then, the fetch is aborted and the returned Promise
   * *rejects* with a human-readable timeout message — allowing the
   * caller to catch it and surface it as a console error.
   */
  async execute(code: string, language: string): Promise<ExecutionResult> {
    const controller = new AbortController()

    // Timeout promise: aborts the in-flight fetch and rejects after this.timeout ms
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => {
        controller.abort()
        reject(new Error(
          `Execution timeout: request exceeded ${this.executionTimeoutSeconds + 1} seconds. Did you write an infinite loop?`
        ))
      }, this.timeout)
    )

    // API call promise: always resolves (executeCode swallows its own errors)
    const apiPromise = executeCode(
      code,
      language,
      controller.signal,
      this.executionTimeoutSeconds,
    ).then(
      (result): ExecutionResult => ({
        output: this.truncate(result.output),
        executionTime: result.execution_time,
        error: result.error,
        error_code: result.error_code,
        timed_out: result.timed_out,
      })
    )

    // The timeout promise rejects synchronously when the timer fires,
    // so it always beats any microtask-delayed apiPromise resolution.
    return Promise.race([apiPromise, timeoutPromise])
  }

  /* Legacy methods for backwards compatibility */
  async executeJavaScript(code: string): Promise<ExecutionResult> {
    return this.execute(code, 'javascript')
  }

  async executePython(code: string): Promise<ExecutionResult> {
    return this.execute(code, 'python')
  }

  async executeJava(code: string): Promise<ExecutionResult> {
    return this.execute(code, 'java')
  }

  async executeSQL(code: string): Promise<ExecutionResult> {
    return this.execute(code, 'sql')
  }
}
