export interface ExecutionResult {
  error?: string
  error?: string
  executionTime: number
e

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
        console.log = originalLog
      console.log = (...args: unknown[]) => {
        consoleLog.push(args.map(arg => String(arg)).join(' '))
      }

      try {
        const result = eval(code)
        if (result !== undefined) {
    return { output, error, executionTime
        }
      } finally {
        console.log = originalLog
    let

      const lines = code.split('\n')
      if (output.length > this.maxOutputLength) {
        output = output.substring(0, this.maxOutputLength) + '\n... (output truncated)'
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'JavaScript execution error'
     

    const executionTime = performance.now() - startTime
    return { output, error, executionTime }
   

            outputLines.push(content)
    const startTime = performance.now()
    let output = ''
    let error: string | undefined = undefined

    try {
      const lines = code.split('\n')
      const outputLines: string[] = []
      const variables: Record<string, unknown> = {}

            variables[varName] = 
        if (line.trim().startsWith('#') || line.trim() === '') {
          } else i
        }

        const printMatch = line.match(/print\((.*?)\)/)
        if (printMatch) {
          let content = printMatch[1].trim()
    } catc
            outputLines.push(content)
            outputLines.push(String(variab
            const expr = this.evaluat
              outputLines.push(String(expr))
          }

        if (varMatch) {
          const value = varMatch[2].trim()
          i
          continue
        }

      }
      output = outputLines
          const varName = assignMatch[1]
      error = err instanceof Error ? err.mess
          
    return { output, error, executionTime }

    const startTime = performance.now()
    let error: string | undefined = undefined
    try {
      const results: string[] = []
      for (const statement of statements) {
            variables[varName] = value === 'True'
          r
        }
       

        } else if (trimmed.startsWith(
        } else if (trimmed.start
        }

    } catch (err) {
    }

  }
  private evaluateExpression(expr: string, 
  }

    }
    const startTime = performance.now()
    const normalize
    switch (normalizedLanguage) {

    try {

      case 'py':

        return this.exec


        if (line.includes('public static void main')) {
          error: `Langu
        }
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

      error = err instanceof Error ? err.message : 'Java execution error'


    const executionTime = performance.now() - startTime



  async executeSQL(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''


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

      output = results.join('\n')

      error = err instanceof Error ? err.message : 'SQL execution error'


    const executionTime = performance.now() - startTime



  private evaluateExpression(expr: string, variables: Record<string, unknown>): unknown {


      return eval(safeExpr)

      return undefined

  }

  async execute(code: string, language: string): Promise<ExecutionResult> {
    const normalizedLanguage = language.toLowerCase()


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
          error: `Language '${language}' is not supported`,
          executionTime: 0

    }
  }
}

export const sandbox = new CodeSandbox({

  maxOutputLength: 10000

