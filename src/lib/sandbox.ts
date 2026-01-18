export interface ExecutionResult {
  executionTime:
  executionTime: number
  error?: string
 

  private timeout: number

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
    const
      const safeExpr = expr.replace(/\b([A-Za-z_]\w*)\b/g, m =>
        Object.prototype.hasOwnProperty.call(vars, m)
          ? JSON.stringify(vars[m])
      logs.pu
      )
      console.log = originalLog

      this.truncate(lo
    r
   


    const start = performance.now()
    const outputLines: string


        if (!line || line.startsWit
        const printMatch = line.match(/^pri
          const value = this.evaluateExpres
     

        i
          variables[assignMatch[1]] = val ?? assignMatch[2]

        const exprVal = this.evaluateExpression(line, v
      }
      error = err?.message ?? String(err)


      error
  }
  async

    let error: string | undefined

      for (const raw of code.split(/\r?\n
        if (!li
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
      out

        const assignMatch = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/)
        if (assignMatch) {
          const val = this.evaluateExpression(assignMatch[2], variables)
          variables[assignMatch[1]] = val ?? assignMatch[2]
    const tables: 
        .

        const exprVal = this.evaluateExpression(line, variables)
        if (exprVal !== undefined) outputLines.push(String(exprVal))
      }
          tables[tableNa
      error = err?.message ?? String(err)
     

        if (
      output: this.truncate(outputLines.join('\n') || 'Python code executed (simulated)'),
      executionTime: performance.now() - start,
      error
    }
  }

  async executeJava(code: string): Promise<ExecutionResult> {
          continue
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
      case 'py':
        .filter(s => s && !s.startsWith('--'))

      for (const statement of statements) {
        const createMatch = statement.match(/CREATE\s+TABLE\s+(\w+)\s*\((.*)\)/i)
        if (createMatch) {
          executionTime: 0,
          tables[tableName] = []
          outputLines.push(`Table '${tableName}' created`)
          continue


        const insertMatch = statement.match(/INSERT\s+INTO\s+(\w+)\s+VALUES\s*\((.*)\)/i)
        if (insertMatch) {

          const values = insertMatch[2].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''))

          if (tables[tableName]) {

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

            outputLines.push(`Table '${tableName}' does not exist`)

          continue


        const updateMatch = statement.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*))?/i)
        if (updateMatch) {
          const tableName = updateMatch[1]
          if (tables[tableName]) {
            outputLines.push(`Table '${tableName}' updated`)
          }

        }

        const deleteMatch = statement.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i)

          const tableName = deleteMatch[1]

            tables[tableName] = []
            outputLines.push(`Rows deleted from '${tableName}'`)
          }

        }
      }
    } catch (err: any) {
      error = err?.message ?? String(err)
    }

    return {
      output: this.truncate(outputLines.join('\n') || 'SQL executed (simulated)'),
      executionTime: performance.now() - start,

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

        return this.executeJava(code)

        return this.executeSQL(code)

        return {
          output: '',
          executionTime: 0,
          error: `Unsupported language: ${language}`
        }

  }
}
