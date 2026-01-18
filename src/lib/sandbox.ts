export interface ExecutionResult {
  output: string
  executionTime: number
  error?: string
}

export type ExecutorConfig = {
  timeout?: number
  maxOutputLength?: number
}

/**
 * Simple CodeExecutor
 *
 * - executeJavaScript uses `new Function` and captures console.log output.
 *   Note: synchronous infinite loops cannot be forcibly interrupted by the timeout.
 *
 * - executePython and executeJava are very small line-based simulators:
 *   - Support comments, blank lines
 *   - Support simple variable assignments for strings and numbers (e.g. x = 5, s = "hi")
 *   - Support `print(...)` in Python (string literal or variable)
 *   - Support `System.out.println(...)` in Java inside a main-like block
 *   - Support evaluating simple arithmetic expressions using available variables
 *
 * This is intended as a quick, type-correct repair and not a full interpreter or sandbox.
 */
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

  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    let output = ''
    let error: string | undefined

    const logs: string[] = []
    const originalLog = console.log
    // capture console.log
    console.log = (...args: unknown[]) => {
      try {
        logs.push(args.map(a => String(a)).join(' '))
      } catch {
        logs.push('[unserializable log]')
      }
    }

    try {
      // Run code in a function scope to avoid leaking locals to the outer scope
      const run = () =>
        new Function(
          // expose no local variables intentionally
          `"use strict";\n${code}`
        )()

      // Race between the run and timeout.
      const runPromise = Promise.resolve().then(() => {
        try {
          const result = run()
          // If the code returns a value, include it in logs (like Node REPL)
          if (typeof result !== 'undefined') logs.push(String(result))
          return result
        } catch (err: any) {
          throw err
        }
      })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timed out')), this.timeout)
      )

      await Promise.race([runPromise, timeoutPromise])
      output = logs.length > 0 ? logs.join('\n') : 'JavaScript code executed successfully'
      output = this.truncate(output)
    } catch (err: any) {
      error = err instanceof Error ? err.message : String(err)
      output = logs.length > 0 ? logs.join('\n') : ''
      output = this.truncate(output)
    } finally {
      // restore console.log
      console.log = originalLog
    }

    const executionTime = performance.now() - start
    return { output, executionTime, error }
  }

  // Very small expression evaluator used by simulated interpreters.
  // It substitutes known variable names with JSON values then uses Function to compute the value.
  private evaluateExpression(expr: string, variables: Record<string, unknown>) {
    try {
      // Replace variable tokens with JSON stringified literal values.
      const safeExpr = expr.replace(/\b([A-Za-z_]\w*)\b/g, (m) => {
        if (Object.prototype.hasOwnProperty.call(variables, m)) {
          return JSON.stringify(variables[m])
        }
        return m
      })
      // eslint-disable-next-line no-new-func
      // This is intentionally simple — not safe for untrusted complex expressions.
      // It is fine for small arithmetic and concatenation in this quick repair.
      // The caller should be aware of the limitation.
      // @ts-ignore
      return new Function(`return (${safeExpr});`)()
    } catch {
      return undefined
    }
  }

  async executePython(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    let output = ''
    let error: string | undefined

    try {
      const lines = code.split(/\r?\n/)
      const variables: Record<string, unknown> = {}
      const outputLines: string[] = []

      for (let rawLine of lines) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#')) continue

        // print(...) support
        const printMatch = line.match(/^print\((.*)\)\s*$/)
        if (printMatch) {
          let content = printMatch[1].trim()
          // string literal double or single
          if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
            const unquoted = content.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t')
            outputLines.push(unquoted)
          } else if (Object.prototype.hasOwnProperty.call(variables, content)) {
            outputLines.push(String(variables[content]))
          } else {
            const val = this.evaluateExpression(content, variables)
            if (typeof val !== 'undefined') outputLines.push(String(val))
            else outputLines.push('')
          }
          continue
        }

        // assignment: var = value
        const assignMatch = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/)
        if (assignMatch) {
          const name = assignMatch[1]
          let value = assignMatch[2].trim()
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            variables[name] = value.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t')
          } else if (!Number.isNaN(Number(value))) {
            variables[name] = Number(value)
          } else {
            const evaluated = this.evaluateExpression(value, variables)
            if (typeof evaluated !== 'undefined') variables[name] = evaluated
            else variables[name] = value
          }
          continue
        }

        // fallback: try evaluating expression and push result
        const exprVal = this.evaluateExpression(line, variables)
        if (typeof exprVal !== 'undefined') outputLines.push(String(exprVal))
      }

      output = outputLines.join('\n') || 'Python code executed (simulated)'
      output = this.truncate(output)
    } catch (err: any) {
      error = err instanceof Error ? err.message : String(err)
    }

    const executionTime = performance.now() - start
    return { output, executionTime, error }
  }

  async executeJava(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    let output = ''
    let error: string | undefined

    try {
      const lines = code.split(/\r?\n/)
      const variables: Record<string, unknown> = {}
      const outputLines: string[] = []
      let inMain = false

      for (let rawLine of lines) {
        const line = rawLine.trim()
        if (!line || line.startsWith('//')) continue

        if (line.includes('public static void main') || line.includes('public static void main(String')) {
          inMain = true
          continue
        }
        if (inMain && line === '}') {
          inMain = false
          continue
        }

        // Within main, support System.out.println(...)
        if (inMain) {
          const printMatch = line.match(/System\.out\.println\((.*)\);?/)
          if (printMatch) {
            let content = printMatch[1].trim()
            if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
              outputLines.push(content.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t'))
            } else if (Object.prototype.hasOwnProperty.call(variables, content)) {
              outputLines.push(String(variables[content]))
            } else {
              const evaluated = this.evaluateExpression(content, variables)
              if (typeof evaluated !== 'undefined') outputLines.push(String(evaluated))
              else outputLines.push('')
            }
            continue
          }

          // support simple declarations/assignments inside main (e.g., int x = 5; String s = "hi";)
          const declMatch = line.match(/(?:int|double|String|var|long|float|boolean)\s+([A-Za-z_]\w*)\s*=\s*(.+);?/)
          if (declMatch) {
            const name = declMatch[1]
            let value = declMatch[2].trim().replace(/;$/, '')
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              variables[name] = value.slice(1, -1)
            } else if (!Number.isNaN(Number(value))) {
              variables[name] = Number(value)
            } else {
              const evaluated = this.evaluateExpression(value, variables)
              if (typeof evaluated !== 'undefined') variables[name] = evaluated
              else variables[name] = value
            }
            continue
          }

          // assignment without type
          const assignMatch = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+);?/)
          if (assignMatch) {
            const name = assignMatch[1]
            let value = assignMatch[2].trim().replace(/;$/, '')
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              variables[name] = value.slice(1, -1)
            } else if (!Number.isNaN(Number(value))) {
              variables[name] = Number(value)
            } else {
              const evaluated = this.evaluateExpression(value, variables)
              if (typeof evaluated !== 'undefined') variables[name] = evaluated
              else variables[name] = value
            }
            continue
          }
        } else {
          // outside main: simple variable declarations may be ignored in this simulation
          continue
        }
      }

      output = outputLines.join('\n') || 'Java code executed (simulated)'
      output = this.truncate(output)
    } catch (err: any) {
      error = err instanceof Error ? err.message : String(err)
    }

    const executionTime = performance.now() - start
    return { output, executionTime, error }
  }

  async execute(code: string, language: string): Promise<ExecutionResult> {
    const lang = language.toLowerCase()
    
    switch (lang) {
      case 'javascript':
      case 'js':
        return this.executeJavaScript(code)
      case 'python':
      case 'py':
        return this.executePython(code)
      case 'java':
        return this.executeJava(code)
      default:
        return {
          output: '',
          executionTime: 0,
          error: `Language "${language}" is not supported. Supported languages: JavaScript, Python, Java`
        }
    }
  }
}

export const sandbox = new CodeExecutor()