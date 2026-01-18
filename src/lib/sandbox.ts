export interface ExecutionResult {
  output: string
  executionTime: number
  error?: string
}

export type ExecutorConfig = {
  timeout?: number
  maxOutputLength?: number
}

export class CodeExecutor {
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

  /* =======================
     JavaScript Executor
     ======================= */
  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const logs: string[] = []
    let error: string | undefined

    const originalLog = console.log
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }

    try {
      const run = () => new Function(`"use strict";\n${code}`)()

      const runPromise = Promise.resolve().then(() => {
        const result = run()
        if (result !== undefined) logs.push(String(result))
      })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timed out')), this.timeout)
      )

      await Promise.race([runPromise, timeoutPromise])
    } catch (err: any) {
      error = err?.message ?? String(err)
    } finally {
      console.log = originalLog
    }

    const output =
      this.truncate(logs.join('\n') || 'JavaScript code executed successfully')

    return {
      output,
      executionTime: performance.now() - start,
      error
    }
  }

  /* =======================
     Expression Evaluator
     ======================= */
  private evaluateExpression(expr: string, vars: Record<string, unknown>) {
    try {
      const safeExpr = expr.replace(/\b([A-Za-z_]\w*)\b/g, m =>
        Object.prototype.hasOwnProperty.call(vars, m)
          ? JSON.stringify(vars[m])
          : m
      )
      return new Function(`return (${safeExpr});`)()
    } catch {
      return undefined
    }
  }

  /* =======================
     Python (Simulated)
     ======================= */
  async executePython(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const variables: Record<string, unknown> = {}
    const outputLines: string[] = []
    let error: string | undefined

    try {
      for (const raw of code.split(/\r?\n/)) {
        const line = raw.trim()
        if (!line || line.startsWith('#')) continue

        const printMatch = line.match(/^print\((.*)\)$/)
        if (printMatch) {
          const value = this.evaluateExpression(printMatch[1], variables)
          if (value !== undefined) outputLines.push(String(value))
          continue
        }

        const assignMatch = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/)
        if (assignMatch) {
          const val = this.evaluateExpression(assignMatch[2], variables)
          variables[assignMatch[1]] = val ?? assignMatch[2]
          continue
        }

        const exprVal = this.evaluateExpression(line, variables)
        if (exprVal !== undefined) outputLines.push(String(exprVal))
      }
    } catch (err: any) {
      error = err?.message ?? String(err)
    }

    return {
      output: this.truncate(outputLines.join('\n') || 'Python code executed (simulated)'),
      executionTime: performance.now() - start,
      error
    }
  }

  /* =======================
     Java (Simulated)
     ======================= */
  async executeJava(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const variables: Record<string, unknown> = {}
    const outputLines: string[] = []
    let error: string | undefined
    let inMain = false

    try {
      for (const raw of code.split(/\r?\n/)) {
        const line = raw.trim()
        if (!line || line.startsWith('//')) continue

        if (line.includes('public static void main')) {
          inMain = true
          continue
        }

        if (inMain && line === '}') {
          inMain = false
          continue
        }

        if (!inMain) continue

        const printMatch = line.match(/System\.out\.println\((.*)\);?/)
        if (printMatch) {
          const value = this.evaluateExpression(printMatch[1], variables)
          if (value !== undefined) outputLines.push(String(value))
          continue
        }

        const declMatch = line.match(
          /(int|double|String|long|float|boolean)\s+([A-Za-z_]\w*)\s*=\s*(.+);?/
        )
        if (declMatch) {
          variables[declMatch[2]] =
            this.evaluateExpression(declMatch[3], variables) ?? declMatch[3]
        }
      }
    } catch (err: any) {
      error = err?.message ?? String(err)
    }

    return {
      output: this.truncate(outputLines.join('\n') || 'Java code executed (simulated)'),
      executionTime: performance.now() - start,
      error
    }
  }

  /* =======================
     Dispatcher
     ======================= */
  async execute(
    code: string,
    lang: 'javascript' | 'python' | 'java'
  ): Promise<ExecutionResult> {
    switch (lang) {
      case 'javascript':
        return this.executeJavaScript(code)
      case 'python':
        return this.executePython(code)
      case 'java':
        return this.executeJava(code)
      default:
        return {
          output: '',
          executionTime: 0,
          error: 'Unsupported language'
        }
    }
  }
}
