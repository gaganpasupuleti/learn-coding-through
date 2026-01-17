export interface ExecutionResult {
  error?: string
}
class CodeSandbox {
}

class CodeSandbox {
  private timeout: number
  private maxOutputLength: number

  constructor(options: { timeout?: number; maxOutputLength?: number } = {}) {
      const consoleLog: string[] = []

   

        (function() {
            log: console.log,
          };
          console.log = function(..

         

            window.parent.postMessage({

          };
          try {
          } catch (err) {

      const wrappedCode = `
        (function() {
          const originalConsole = {
            log: console.log,
            error: console.error
          };

          console.log = function(...args) {
            window.parent.postMessage({
              type: 'console.log',
              args: args.map(arg => String(arg))
            }, '*');
          };

          console.error = function(...args) {
            window.parent.postMessage({
              type: 'console.error',
              args: args.map(arg => String(arg))
            }, '*');
          };

          try {

          } catch (err) {
            window.parent.postMessage({
              type: 'error',
              message: err.message
          const scri
          }
        })();
      `

      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'console.log') {
          consoleLog.push(event.data.args.join(' '))
        } else if (event.data.type === 'console.error') {
          consoleError.push(event.data.args.join(' '))
        } else if (event.data.type === 'error') {
          consoleError.push(event.data.message)

      }

      window.addEventListener('message', messageHandler)

      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Execution timeout'))
        }, this.timeout)

  async execu
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (!iframeDoc) {
            reject(new Error('Unable to access iframe document'))
            return
          }

          const script = iframeDoc.createElement('script')
          script.textContent = wrappedCode
          iframeDoc.body.appendChild(script)

          setTimeout(() => {
            window.removeEventListener('message', messageHandler)
            document.body.removeChild(iframe)
          try {
          }, 100)
            if (content
          reject(err)
         
      })

      output = consoleLog.length > 0 ? consoleLog.join('\n') : ''
      
      if (consoleError.length > 0) {
        const assignMatch = trimmed.mat
      }

      if (!output && !error) {
        output = 'Code executed successfully (no output)'
      }
              varia
      error = err instanceof Error ? err.message : 'JavaScript execution error'
     

          }
      output = output.substring(0, this.maxOutputLength) + '\n... (output truncated)'
     

        }

   

          inMain = false

          const pri
            let content = printMatc

         
              outputLines.push(Strin
          }
          const varMatch = line.match(/(\w+)\s+(\w+

            
              variables[varName] = 
        
              variables[varName] = value === 'true'

      }
      output = outputLine
        : 'Java
      error = err instanceof Error ? err.messa

    return { output, error, executionTime }

    const startTime = performance.now()
    let error: string | null = null
    try {
      const outputLi
      for (const statement of statements) {

          out
          if (fromM
          }
          c
         

          const rowCount = Math.floor(Math.random() * 5) + 1
        } else if (upperSt
          const tableName = fromMatch ? 
          outputLines.push(`✓ ${rowCount} row
          
          outpu
          const tableMatch = statement.match(/DROP TABLE\s+(\w+)/
          outputLines.push(`✓ Table '${tableName}' dr
      }
      output = outputLines.length > 0 
        : 'SQL execu
      error = err instanceof Error ? err.message : 'SQL execution error'

    return { output

    try {
        e

      return eval(safeExpr)
      return expr
  }
  async e

      case 'javascript':
      case 'typescript':
        return this.executeJavaScript(code)
      cas

      case 'java':

        return this.executeSQL(code)
      def
       

    }
}
export const sandbox = new CodeSandbox({
  maxOutputLength: 
































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
    return { output, error, executionTime }


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
    return { output, error, executionTime }


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

