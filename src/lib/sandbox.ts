export interface ExecutionResult {
  output: string
  executionTime: number
  error?: string
e

export interface ExecutorConfig {
  timeout?: number
  maxOutputLength?: number
}

export class CodeSandbox {
  }
  private maxOutputLength: number

  constructor(config?: ExecutorConfig) {
    this.timeout = config?.timeout ?? 5000
    this.maxOutputLength = config?.maxOutputLength ?? 1000
   

  private truncate(output: string): string {
    return output.slice(0, this.maxOutputLength)
  }

  private evaluateExpression(expr: string): string {
    try {
      const safeExpr = expr.replace(/^['"`](.*)['"`]$/, '$1')
      return String(eval(safeExpr))
    } catch {
      return expr
     
  }

      for (const raw of code.split(/\r?\n/)) {
        if (!line || line.startsWit
        const printMatch = li
          const value = this.eval


        if (assignMatch) {
          try {
          } catch {
       

      error = er

      output: this.trunc
      error
  }

    const outputLines: string[] = []

      const 
        const
      }
      error

   

  }
  async executeSQL(code: string): P
    const outputLines: string[] = []
    const tables: Record<string, Arr
    try {

        .
      for (const raw of code.split(/\r?\n/)) {
        const line = raw.trim()
        if (!line || line.startsWith('#')) continue

        const printMatch = line.match(/^print\((.*)\)$/)
        if (printMatch) {
          const value = this.evaluateExpression(printMatch[1])
          outputLines.push(value)
          continue
        }

        const assignMatch = line.match(/^(\w+)\s*=\s*(.*)$/)
        if (assignMatch) {
          const [, varName, value] = assignMatch
          try {
            variables[varName] = eval(value)
          } catch {
            variables[varName] = value
          }
        }
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
    const outputLines: string[] = []
    let error: string | undefined

    try {
      const printMatches = code.matchAll(/System\.out\.println\((.*?)\)/g)
      for (const match of printMatches) {
        const value = this.evaluateExpression(match[1])
        outputLines.push(value)
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

    } catch (err: any) {
        const createMatch = statement.match(/CREATE\s+TABLE\s+(\w+)\s*\((.*)\)/i)

          const tableName = createMatch[1]
      executionTime: performance
          outputLines.push(`Table '${tableName}' created`)
        return thi
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

        }

        const updateMatch = statement.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*))?/i)
        if (updateMatch) {
          const tableName = updateMatch[1]
          if (tables[tableName]) {
            outputLines.push(`Table '${tableName}' updated`)

          continue


        const deleteMatch = statement.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i)
        if (deleteMatch) {
          const tableName = deleteMatch[1]
          if (tables[tableName]) {
            tables[tableName] = []
            outputLines.push(`Rows deleted from '${tableName}'`)
          }
          continue

      }

      error = err?.message ?? String(err)



      output: this.truncate(outputLines.join('\n') || 'SQL executed (simulated)'),
      executionTime: performance.now() - start,
      error

  }

  async execute(code: string, language: string): Promise<ExecutionResult> {



      case 'javascript':

        return this.executeJavaScript(code)
      case 'python':
      case 'py':
        return this.executePython(code)
      case 'java':

      case 'sql':
        return this.executeSQL(code)
      default:
        return {
          output: '',
          executionTime: 0,
          error: `Unsupported language: ${language}`

    }

}
