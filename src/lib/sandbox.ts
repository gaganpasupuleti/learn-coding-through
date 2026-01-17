export interface ExecutionResult {
  output: string
  executionTime:
  executionTime: number
e

export class CodeSandbox {
  private timeout: number
    const startTime = performance



      console.log = (...args: unknown[]) => {
   

        if (result !== undefined) {
        }
        console.log



    } catch (err) {

    }
    const executionTime = performance.now() -
  }
  async


      const lines = code.split('\
      const variables: Record<strin
      for (const line of lines) {
         

        if (printMatch) {
       

          } else if (content.startsW

            outputLines.push(String(variables[con
            const expr = this.evaluateExpression(content, variables)
       
          }
        }
        const v
          const varName = varMa
     

            variables[varName] = value.slice(1, -1)
            variables[varName] = Number(val
   

      }
      output = outputLines.length > 0 
        : 'Python c
    } catch (err) {

    const
  }
  async executeJava(code: string): Pro
    let output = ''

      const lines = code.split('\
      const variables: Record<string, unknown> = {}
          continue
        }


          inMain = false
        }
        if
          if (content.startsWith('"') && content.endsWith('"')) {
            content = content.slice(1, -1)
          if (content.startsWith('"')
              .replace(/\\n/g, '\n')
            outputLines.push(content)
            outputLines.push(String(v
            const expr = this.evaluateExpres
              outputLines.push(String(expr))
          }
        }
        const varMatch = line.match(/
          const varName = varMatch[1]
          
           
            variab
         


        ? outputLines.j

      error = err instanceof Error ? err.m

    return { output, error, executionTime }

    const startTime = performance.now()
    let error: string | undefined = undefined
    try {
      const results: string[] = []
      for (const statement of statements) {
        
          r
          const ma
         
       

        } else if (trimmed.startsWith(
        }


      error = err i

    r

    try {
        return match in variables ? JSON.st
   

  }
  async execute(code: string, language:

      case 'javascript':

        r
      case 'python':
        return this.executePython(code
      case 'java':


      default:
          output: '',
          executionTime
    }
}

  maxOutputLength: 10000












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

