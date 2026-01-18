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

  /* ---------- JavaScript ---------- */
  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const logs: string[] = []
    let error: string | undefined

    const originalLog = console.log
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }

    try {
      new Function(`"use strict";\n${code}`)()
    } catch (err: any) {
      error = err?.message ?? String(err)
    } finally {
      console.log = originalLog
    }

    return {
      output: this.truncate(logs.join('\n') || 'JavaScript executed'),
      executionTime: performance.now() - start,
      error
    }
  }

  /* ---------- Python (simulated) ---------- */
  async executePython(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const output: string[] = []
    let error: string | undefined

    try {
      for (const line of code.split('\n')) {
        const match = line.match(/^print\((.*)\)$/)
        if (match) output.push(match[1].replace(/['"]/g, ''))
      }
    } catch (err: any) {
      error = err?.message ?? String(err)
    }

    return {
      output: this.truncate(output.join('\n') || 'Python executed (simulated)'),
      executionTime: performance.now() - start,
      error
    }
  }

  /* ---------- Java (simulated) ---------- */
  async executeJava(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const output: string[] = []
    let error: string | undefined

    try {
      const matches = code.matchAll(/System\.out\.println\((.*)\);/g)
      for (const m of matches) {
        output.push(m[1].replace(/['"]/g, ''))
      }
    } catch (err: any) {
      error = err?.message ?? String(err)
    }

    return {
      output: this.truncate(output.join('\n') || 'Java executed (simulated)'),
      executionTime: performance.now() - start,
      error
    }
  }

  /* ---------- SQL (simulated) ---------- */
  async executeSQL(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    return {
      output: this.truncate('SQL executed (simulated)'),
      executionTime: performance.now() - start
    }
  }

  /* ---------- Dispatcher ---------- */
  async execute(code: string, language: string): Promise<ExecutionResult> {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return this.executeJavaScript(code)
      case 'python':
      case 'py':
        return this.executePython(code)
      case 'java':
        return this.executeJava(code)
      case 'sql':
        return this.executeSQL(code)
      default:
        return {
          output: '',
          executionTime: 0,
          error: `Unsupported language: ${language}`
        }
    }
  }
}
