import { executeCode } from './api'

export interface ExecutionResult {
  output: string
  executionTime: number
  error?: string
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

  /* ---------- Execute via Backend API ---------- */
  async execute(code: string, language: string): Promise<ExecutionResult> {
    try {
      const result = await executeCode(code, language)
      
      return {
        output: this.truncate(result.output),
        executionTime: result.execution_time,
        error: result.error
      }
    } catch (err: any) {
      return {
        output: '',
        executionTime: 0,
        error: err?.message ?? String(err)
      }
    }
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
