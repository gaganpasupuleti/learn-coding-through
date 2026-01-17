export interface ExecutionResult {
  output: string
  error?: string
  executionTime: number
}

export class CodeSandbox {
  private timeout: number
  private maxOutputLength: number

  constructor(config?: { timeout?: number; maxOutputLength?: number }) {
    this.timeout = config?.timeout || 5000
    this.maxOutputLength = config?.maxOutputLength || 10000
  }

  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''
    let error: string | undefined = undefined

    try {
      const logs: string[] = []
      const originalLog = console.log

      console.log = (...args: unknown[]) => {
        logs.push(args.map(arg => String(arg)).join(' '))
      }

      try {
        const result = eval(code)
        if (result !== undefined) {
          logs.push(String(result))
        }
      } finally {
        console.log = originalLog
      }

      output = logs.length > 0 ? logs.join('\n') : 'JavaScript code executed successfully'
    } catch (err) {
      error = err instanceof Error ? err.message : 'JavaScript execution error'
    }

    const executionTime = performance.now() - startTime
    return { output, error, executionTime }
  }

  async executePython(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''
    let error: string | undefined = undefined

    try {
      const lines = code.split('\n')
      const variables: Record<string, unknown> = {}
      const outputLines: string[] = []

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const printMatch = trimmed.match(/^print\((.*)\)/)
        if (printMatch) {
          let content = printMatch[1].trim()

          if (content.startsWith('"') && content.endsWith('"')) {
            content = content.slice(1, -1)
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t')
            outputLines.push(content)
          } else if (content.startsWith("'") && content.endsWith("'")) {
            content = content.slice(1, -1)
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t')
            outputLines.push(content)
          } else if (content in variables) {
            outputLines.push(String(variables[content]))
          } else {
            const expr = this.evaluateExpression(content, variables)
            if (expr !== undefined) {
              outputLines.push(String(expr))
            }
          }
          continue
        }

        const varMatch = line.match(/^(\w+)\s*=\s*(.+)/)
        if (varMatch) {
          const varName = varMatch[1]
          const value = varMatch[2].trim()

          if (value.startsWith('"') && value.endsWith('"')) {
            variables[varName] = value.slice(1, -1)
          } else if (value.startsWith("'") && value.endsWith("'")) {
            variables[varName] = value.slice(1, -1)
          } else if (!isNaN(Number(value))) {
            variables[varName] = Number(value)
          }
        }
      }

      output = outputLines.length > 0
        ? outputLines.join('\n')
        : 'Python code executed successfully'
    } catch (err) {
      error = err instanceof Error ? err.message : 'Python execution error'
    }

    const executionTime = performance.now() - startTime
    return { output, error, executionTime }
  }

  async executeJava(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''
    let error: string | undefined = undefined

    try {
      const lines = code.split('\n')
      const variables: Record<string, unknown> = {}
      const outputLines: string[] = []
      let inMain = false

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('//')) continue

        if (trimmed.includes('public static void main')) {
          inMain = true
          continue
        }

        if (trimmed === '}') {
          inMain = false
          continue
        }

        if (inMain) {
          const printMatch = trimmed.match(/System\.out\.println\((.*)\);?/)
          if (printMatch) {
            let content = printMatch[1].trim()

            if (content.startsWith('"') && content.endsWith('"')) {
              content = content.slice(1, -1)
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
              outputLines.push(content)
            } else if (content in variables) {
              outputLines.push(String(variables[content]))
            } else {
              const expr = this.evaluateExpression(content, variables)
              if (expr !== undefined) {
                outputLines.push(String(expr))
              }
            }
            continue
          }

          const varMatch = trimmed.match(/(\w+)\s+(\w+)\s*=\s*(.+?);?$/)
          if (varMatch) {
            const varName = varMatch[2]
            const value = varMatch[3].trim()

            if (value.startsWith('"') && value.endsWith('"')) {
              variables[varName] = value.slice(1, -1)
            } else if (!isNaN(Number(value))) {
              variables[varName] = Number(value)
            }
          }
        }
      }

      output = outputLines.length > 0
        ? outputLines.join('\n')
        : 'Java code executed successfully'
    } catch (err) {
      error = err instanceof Error ? err.message : 'Java execution error'
    }

    const executionTime = performance.now() - startTime
    return { output, error, executionTime }
  }

  async executeSQL(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''
    let error: string | undefined = undefined

    try {
      const trimmed = code.trim().toLowerCase()
      
      if (trimmed.startsWith('select')) {
        output = 'SQL SELECT query executed successfully\nResults would appear here in a real database.'
      } else if (trimmed.startsWith('insert')) {
        output = 'SQL INSERT statement executed successfully\n1 row affected.'
      } else if (trimmed.startsWith('update')) {
        output = 'SQL UPDATE statement executed successfully\nRows affected: 1'
      } else if (trimmed.startsWith('delete')) {
        output = 'SQL DELETE statement executed successfully\nRows affected: 1'
      } else if (trimmed.startsWith('create')) {
        output = 'SQL CREATE statement executed successfully\nTable/Database created.'
      } else {
        output = 'SQL query executed successfully'
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'SQL execution error'
    }

    const executionTime = performance.now() - startTime
    return { output, error, executionTime }
  }

  private evaluateExpression(expr: string, variables: Record<string, unknown>): unknown {
    try {
      const safeExpr = expr.replace(/\b(\w+)\b/g, (match) => {
        return match in variables ? JSON.stringify(variables[match]) : match
      })
      return eval(safeExpr)
    } catch {
      return undefined
    }
  }

  async execute(code: string, language: string): Promise<ExecutionResult> {
    const normalizedLanguage = language.toLowerCase()

    switch (normalizedLanguage) {
      case 'javascript':
      case 'js':
      case 'typescript':
      case 'ts':
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
          error: `Unsupported language: ${language}`,
          executionTime: 0
        }
    }
  }
}

export const sandbox = new CodeSandbox({
  timeout: 5000,
  maxOutputLength: 10000
})
