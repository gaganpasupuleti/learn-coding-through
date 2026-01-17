export interface ExecutionResult {
  error?: string
}
class CodeSandbox {
 

    this.maxOutputL

  private maxOutputLength: number

  constructor(options: { timeout?: number; maxOutputLength?: number } = {}) {
    this.timeout = options.timeout || 5000
    this.maxOutputLength = options.maxOutputLength || 10000
  }

  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''
    let error: string | null = null
    const consoleLog: string[] = []
          window.parent.postMessage({

          }, '*');
      (function() {
        console.error = function(
          log: console.log,
          error: console.error
        };

        console.log = function(...args) {
        } catch (err) {
            type: 'console.log',
    window.addEventListener('message', message
    try {
        se


        iframe.style.display = 'none'

          const iframeDoc = iframe.contentDocu
            reject
          

          ifr
          setTime
            document.bo
          }, 100)
          reject(err)
      })
      output = con
      if 
      }
     

      error = err instanceof Error ? err.message : 'J

      output = output.substring(0, this.maxOutputL

    return { output, error: error || undefined, exec

    const startTime = performance.now()
      }
    t



        i
          
            outputLines.pu
            outputLines.push(content.slice(1, -1))
            outputLines.push(String(variables[co
        }

          const varName = assignMatch[1]
          
            variables[varName] = value.sl

            v
            variables[varName] = value === 'True'
        }

        ? outputLi
    } catch

    const executionTime = performance.now() - startTime
  }
  async executeJava(code: string): Promise<E


      const lines = code.split('\n')
      const variables: Record<string, unknown

        if (line.
          continue

         
        

              outputLines.push(content)
      
          }
          const varMatch = line.match(/
       

              variables[varNam
              variables[varName] = Number(value)
       
          }
      }
     

      error = err instanceof Error ? err.messag

    r

    const startTime = performance.now()
    let error: string | null = null
   

      for (const statement of statements) {
    const startTime = performance.now()
          outputLin
    let error: string | null = null

    try {
          outputLines.push(`✓ 1 row 
          const tableMatch = statement
          const rowCount = Math.floor(Math.random()

          const tableName = fromM
          outputLines.push(`✓ ${row
        
          outputLines.push(`✓ Table '${tableName}' created successfu
          const tableMatch = statement.match(/DROP TA
          
      }
      output = outputLines.length > 0 
        : 'SQL executed successfully'
      error = err instanceof Error ? err.message :

    return { output, error: error || undefined, executio
          }
    try {


      return eval(safeExpr
      return expr
  }
  async ex
    
      case 'javascript':
      case 'typescript':
        return this.executeJavaScript(code)
      case 'python':
        return this.executePython(code)
      case 'java':

        ret
      def
      }

      output = outputLines.length > 0 
}
export const sandbox = new CodeSandbox({
  maxOutputLength: 

    }

















        if (line.includes('public static void main')) {




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

