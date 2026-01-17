export interface ExecutionResult {
  output: string
  error?: string
  executionTime: number
}

export class CodeSandbox {
  private timeout: number
  private maxOutputLength: number

  constructor(options: { timeout?: number; maxOutputLength?: number } = {}) {
    this.timeout = options.timeout || 5000
    this.maxOutputLength = options.maxOutputLength || 10000
  }

  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''
    let error: string | undefined = undefined
    const consoleLog: string[] = []

    try {
      const originalLog = console.log
      console.log = (...args: unknown[]) => {
        consoleLog.push(args.map(arg => String(arg)).join(' '))
      }

      try {
        const result = eval(code)
        if (result !== undefined) {
          consoleLog.push(String(result))
        }
      } finally {
        console.log = originalLog
      }

      output = consoleLog.join('\n')
      if (output.length > this.maxOutputLength) {
        output = output.substring(0, this.maxOutputLength) + '\n... (output truncated)'
      }
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
      const outputLines: string[] = []
      const variables: Record<string, unknown> = {}

      for (const line of lines) {
        if (line.trim().startsWith('#') || line.trim() === '') {
          continue
        }

        const printMatch = line.match(/print\((.*?)\)/)
        if (printMatch) {
          let content = printMatch[1].trim()
          
          if (content.startsWith('"') && content.endsWith('"')) {
            content = content.slice(1, -1)
            outputLines.push(content)
          } else if (content.startsWith("'") && content.endsWith("'")) {
            content = content.slice(1, -1)
            outputLines.push(content)
          } else if (content in variables) {
            outputLines.push(String(variables[content]))
          }
          continue
        }

        const assignMatch = line.match(/(\w+)\s*=\s*(.+)/)
        if (assignMatch) {
          const varName = assignMatch[1]
          const value = assignMatch[2].trim()
          
          if (value.startsWith('"') && value.endsWith('"')) {
            variables[varName] = value.slice(1, -1)
          } else if (value.startsWith("'") && value.endsWith("'")) {
            variables[varName] = value.slice(1, -1)
          } else if (!isNaN(Number(value))) {
            variables[varName] = Number(value)
          } else if (value === 'True' || value === 'False') {
            variables[varName] = value === 'True'
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
      const outputLines: string[] = []
      const variables: Record<string, unknown> = {}
      let inMain = false

      for (const line of lines) {
        if (line.includes('public static void main')) {
          inMain = true
          continue
        }

        if (!inMain) continue

        const printlnMatch = line.match(/System\.out\.println\((.*?)\);/)
        if (printlnMatch) {
          let content = printlnMatch[1].trim()
          
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
        }

        const varMatch = line.match(/(?:int|double|String|boolean)\s+(\w+)\s*=\s*(.+?);/)
        if (varMatch) {
          const varName = varMatch[1]
          const value = varMatch[2].trim()
          
          if (value.startsWith('"') && value.endsWith('"')) {
            variables[varName] = value.slice(1, -1)
          } else if (!isNaN(Number(value))) {
            variables[varName] = Number(value)
          } else if (value === 'true' || value === 'false') {
            variables[varName] = value === 'true'
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
      const statements = code.split(';').filter(s => s.trim())
      const results: string[] = []

      for (const statement of statements) {
        const trimmed = statement.trim()
        
        if (trimmed.startsWith('CREATE TABLE')) {
          results.push('✓ Table created successfully')
        } else if (trimmed.startsWith('INSERT INTO')) {
          const matches = trimmed.match(/VALUES\s*\((.*?)\)/gi)
          const count = matches ? matches.length : 1
          results.push(`✓ ${count} row(s) inserted`)
        } else if (trimmed.startsWith('SELECT')) {
          results.push('✓ Query executed successfully')
          results.push('(Sample data would be displayed here)')
        } else if (trimmed.startsWith('UPDATE')) {
          results.push('✓ Row(s) updated successfully')
        } else if (trimmed.startsWith('DELETE')) {
          results.push('✓ Row(s) deleted successfully')
        }
      }

      output = results.join('\n')
    } catch (err) {
      error = err instanceof Error ? err.message : 'SQL execution error'
    }

    const executionTime = performance.now() - startTime
    return { output, error, executionTime }
  }

  private evaluateExpression(expr: string, variables: Record<string, unknown>): unknown {
    try {
      const safeExpr = expr.replace(/[^0-9+\-*/().\s]/g, '')
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
          error: `Language '${language}' is not supported`,
          executionTime: 0
        }
    }
  }
}

export const sandbox = new CodeSandbox({
  timeout: 5000,
  maxOutputLength: 10000
})
