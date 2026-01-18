export interface ExecutionResult {
  executionTime:
}
export interface
}

export interface ExecutorConfig {
  timeout?: number
    this.timeout = config?
 

    return output.slice(0, 

    try {

          : m
      return eval(safeExpr)
      return expr
  }

    const logs: string[] = []

      const originalLog = console.log
   

      console.log = originalLog
      err


      output,
      error
  }
      return eval(safeExpr)
    } catch {
      return expr
    }


  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const logs: string[] = []
    let error: string | undefined

    try {
      const originalLog = console.log
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => String(arg)).join(' '))
      }

      eval(code)
      console.log = originalLog
    } catch (err: any) {
      error = err?.message ?? String(err)
    }

    const output = this.truncate(logs.join('\n') || 'JavaScript code executed successfully')

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
  }
  async executeSQL(code: string): Promise<ExecutionResult> {
    const outputLines: string[] = []
    const tables: 
    try {

        .filter(s => s && !s.startsWith('--'))
      for (const statement
        if (createMatch) {
          tables[tableName] = []
          continue


          const values = insertMatch[2].split(',').map(v => v.tr
          if (tables[tableName]) {
       
            })
            outputLines.push(`1 row inser
     

        if (

            outputLines.push(`\nResults from '$

     
  }

            outputLines.push(`\n${tables[tableName].length} r
            outputLines.push(`Table
          continue

        if (updateMatch) {
          if (tables[t

        }
        const deleteMatch = statement.match(/D
          const tableName = del
            tables[tableName] = []

        }
    } catch (err: any) 
    }
    retur

    }

    const lang = l
    switc

      case 'python':

        return this.executeJava(code)
        return this.execu
        return {
          executionTime: 0,
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

        .filter(s => s && !s.startsWith('--'))

      for (const statement of statements) {
        const createMatch = statement.match(/CREATE\s+TABLE\s+(\w+)\s*\((.*)\)/i)
        if (createMatch) {

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
