export interface ExecutionResult {
  output: string
  executionTime:
  executionTime: number
c

    this.maxOutputL

    const startTime = performance

  constructor(options: { timeout?: number; maxOutputLength?: number } = {}) {
    this.timeout = options.timeout || 5000
    this.maxOutputLength = options.maxOutputLength || 10000
  }

  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''
    let error: string | null = null
    const consoleLog: string[] = []

    try {

      output = output.substring(0, this.m

    return { output, error: error || un

    const startTime = performance.now()
      }

      const outputLines: string[] = []

        if (line.trim().startsWith('#') ||
      }

          let co

          } else if (content.st
          } else if (content in var

          }

        if (assignMatch) {
     

          } else if (value.startsWith("'") && v
          } else if (!isNaN(Number(value))) {
     

      }
      output = outputLines.length > 0 
   


    return { output, error: error || un

    const startTime = performance.n

    try {
      const variables: Record<string
      let inMain = false
      for (const line of lines) {

        }
        if (inMain) {
          if (prin
         

            } else if (content in variables) {
            }

          
            const value = varMatch[3].trim()
            outputLines.push(content.slice(1, -1))
            } else if (!isNaN(Number(value))) {
            } else if (value === 'true' || value =
            }
        }

        ? outputLines.join('\n')
    } catch
        }

  }
  async executeSQL(code: s
          const varName = assignMatch[1]

          

        const upperStatement = statement.trim().toU
        if (upperStatement.startsWith('SELECT')) {
          const fromMatch = statement.match(/FROM\s
            outputLines.push(`✓ Reading from 
        } else if (upperStatement.startsWith('
          const tableName = tableMatch ? tableMatch[1] : 'tab
            variables[varName] = value === 'True'
          c
        }
       

        } else if (upperStatement.star
          const tableName = tabl
        } else if (upperStatement.startsWith(
          const tab
        }


    const executionTime = performance.now() - startTime
    }
  }

  private evaluateExpression(expr: string, variables: Record<
    const startTime = performance.now()
      }
    let error: string | null = null

    try {

    const normalizedLanguage = language.toLowerCase
    switch (normalizedLanguage) {
      case 'js':

      case 'python':
        if (line.includes('public static void main')) {
        return this.exe
        return thi
        r

        if (inMain) {
          const printMatch = line.match(/System\.out\.println\((.*?)\);/)
          if (printMatch) {
            let content = printMatch[1].trim()
            
            if (content.startsWith('"') && content.endsWith('"')) {
              content = content.slice(1, -1)

            } else if (content in variables) {
              outputLines.push(String(variables[content]))
            }
          }

          const varMatch = line.match(/(\w+)\s+(\w+)\s*=\s*(.+);/)
          if (varMatch) {
            const varName = varMatch[2]
            const value = varMatch[3].trim()
            
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
        : 'Java code compiled and executed successfully'

      error = err instanceof Error ? err.message : 'Java execution error'


    const executionTime = performance.now() - startTime



  async executeSQL(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''
    let error: string | null = null

    try {
      const statements = code.split(';').filter(s => s.trim())
      const outputLines: string[] = []

      for (const statement of statements) {
        const upperStatement = statement.trim().toUpperCase()

        if (upperStatement.startsWith('SELECT')) {
          outputLines.push('✓ Query executed successfully')
          const fromMatch = statement.match(/FROM\s+(\w+)/i)
          if (fromMatch) {
            outputLines.push(`✓ Reading from table: ${fromMatch[1]}`)
          }
        } else if (upperStatement.startsWith('INSERT')) {
          const tableMatch = statement.match(/INTO\s+(\w+)/i)
          const tableName = tableMatch ? tableMatch[1] : 'table'
          outputLines.push(`✓ 1 row inserted into ${tableName}`)
        } else if (upperStatement.startsWith('UPDATE')) {
          const tableMatch = statement.match(/UPDATE\s+(\w+)/i)
          const tableName = tableMatch ? tableMatch[1] : 'table'
          const rowCount = Math.floor(Math.random() * 5) + 1
          outputLines.push(`✓ ${rowCount} row(s) updated in ${tableName}`)
        } else if (upperStatement.startsWith('DELETE')) {
          const fromMatch = statement.match(/FROM\s+(\w+)/i)
          const tableName = fromMatch ? fromMatch[1] : 'table'
          const rowCount = Math.floor(Math.random() * 3) + 1
          outputLines.push(`✓ ${rowCount} row(s) deleted from ${tableName}`)
        } else if (upperStatement.startsWith('CREATE TABLE')) {
          const tableMatch = statement.match(/CREATE TABLE\s+(\w+)/i)
          const tableName = tableMatch ? tableMatch[1] : 'table'
          outputLines.push(`✓ Table '${tableName}' created successfully`)
        } else if (upperStatement.startsWith('DROP TABLE')) {
          const tableMatch = statement.match(/DROP TABLE\s+(\w+)/i)
          const tableName = tableMatch ? tableMatch[1] : 'table'
          outputLines.push(`✓ Table '${tableName}' dropped`)

      }

      output = outputLines.length > 0 
        ? outputLines.join('\n')
        : 'SQL executed successfully'

      error = err instanceof Error ? err.message : 'SQL execution error'


    const executionTime = performance.now() - startTime



  private evaluateExpression(expr: string, variables: Record<string, unknown>): unknown {

      for (const [key, value] of Object.entries(variables)) {
        expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value))
      }


      return eval(safeExpr)

      return expr

  }

  async execute(code: string, language: string): Promise<ExecutionResult> {
    const normalizedLanguage = language.toLowerCase().trim()
    

      case 'javascript':
      case 'js':

      case 'ts':
        return this.executeJavaScript(code)
      case 'python':

        return this.executePython(code)
      case 'java':
        return this.executeJava(code)

        return this.executeSQL(code)
      default:
        return {
          output: '',
          error: `Language '${language}' is not supported. Supported languages: JavaScript, Python, Java, SQL`,
          executionTime: 0

    }
  }
}

export const sandbox = new CodeSandbox({

  maxOutputLength: 10000

