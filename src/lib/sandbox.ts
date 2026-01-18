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
          continue
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

  async executeSQL(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const outputLines: string[] = []
    let error: string | undefined
    const tables: Record<string, Array<Record<string, unknown>>> = {}

    try {
      const statements = code
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'))

      for (const statement of statements) {
        const createMatch = statement.match(/CREATE\s+TABLE\s+(\w+)\s*\((.*)\)/i)
        if (createMatch) {
          const tableName = createMatch[1]
          tables[tableName] = []
          outputLines.push(`Table '${tableName}' created`)
          continue
        }

        const insertMatch = statement.match(/INSERT\s+INTO\s+(\w+)\s+VALUES\s*\((.*)\)/i)
        if (insertMatch) {
          const tableName = insertMatch[1]
          const values = insertMatch[2].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''))
          
          if (tables[tableName]) {
            const row: Record<string, unknown> = {}
            values.forEach((val, idx) => {
              row[`col${idx}`] = isNaN(Number(val)) ? val : Number(val)
            })
            tables[tableName].push(row)
            outputLines.push(`1 row inserted into '${tableName}'`)
          }
          continue
        }

        const selectMatch = statement.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i)
        if (selectMatch) {
          const tableName = selectMatch[2]

          if (tables[tableName]) {
            outputLines.push(`\nResults from '${tableName}':`)
            outputLines.push('-'.repeat(50))
            
            if (tables[tableName].length === 0) {
              outputLines.push('(no rows)')
            } else {
              tables[tableName].forEach((row, idx) => {
                outputLines.push(`Row ${idx + 1}: ${JSON.stringify(row)}`)
              })
            }
            outputLines.push(`\n${tables[tableName].length} row(s) returned`)
          } else {
            outputLines.push(`Table '${tableName}' does not exist`)
          }
          continue
        }

        const updateMatch = statement.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*))?/i)
        if (updateMatch) {
          const tableName = updateMatch[1]
          if (tables[tableName]) {
            outputLines.push(`Table '${tableName}' updated`)
          }
          continue
        }

        const deleteMatch = statement.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i)
        if (deleteMatch) {
          const tableName = deleteMatch[1]
          if (tables[tableName]) {
            tables[tableName] = []
            outputLines.push(`Rows deleted from '${tableName}'`)
          }
          continue
        }
      }
    } catch (err: any) {
      error = err?.message ?? String(err)
    }

    return {
      output: this.truncate(outputLines.join('\n') || 'SQL executed (simulated)'),
      executionTime: performance.now() - start,
      error
    }
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
