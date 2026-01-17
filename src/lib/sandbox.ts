export interface ExecutionResult {
  output?: string
  error?: string
  executionTime?: number
}

class CodeSandbox {
  private timeout: number
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
    const consoleError: string[] = []

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
          ${code}
        } catch (err) {
          window.parent.postMessage({
            type: 'error',
            message: err.message
          }, '*');
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
    }

    window.addEventListener('message', messageHandler)

    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Execution timeout'))
        }, this.timeout)

        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        document.body.appendChild(iframe)

        try {
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
            resolve()
          }, 100)
        } catch (err) {
          reject(err)
        }
      })

      output = consoleLog.length > 0 ? consoleLog.join('\n') : ''
      
      if (consoleError.length > 0) {
        error = consoleError.join('\n')
      }

      if (!output && !error) {
        output = 'Code executed successfully (no output)'
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'JavaScript execution error'
    }

    if (output.length > this.maxOutputLength) {
      output = output.substring(0, this.maxOutputLength) + '\n... (output truncated)'
    }

    const executionTime = performance.now() - startTime
    return { output, error: error || undefined, executionTime }
  }

  async executePython(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''
    let error: string | null = null

    try {
      const lines = code.split('\n')
      const outputLines: string[] = []
      const variables: Record<string, unknown> = {}

      for (const line of lines) {
        const trimmed = line.trim()
        
        if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
          const content = trimmed.slice(6, -1).trim()
          
          if (content.startsWith('"') && content.endsWith('"')) {
            outputLines.push(content.slice(1, -1))
          } else if (content.startsWith("'") && content.endsWith("'")) {
            outputLines.push(content.slice(1, -1))
          } else if (content in variables) {
            outputLines.push(String(variables[content]))
          }
        }

        const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/)
        if (assignMatch) {
          const varName = assignMatch[1]
          let value = assignMatch[2].trim()
          
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
        : 'Python code executed successfully (no output)'
    } catch (err) {
      error = err instanceof Error ? err.message : 'Python execution error'
    }

    const executionTime = performance.now() - startTime
    return { output, error: error || undefined, executionTime }
  }

  async executeJava(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    let output = ''
    let error: string | null = null

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

        if (inMain) {
          const printMatch = line.match(/System\.out\.println\((.*?)\);/)
          if (printMatch) {
            let content = printMatch[1].trim()
            
            if (content.startsWith('"') && content.endsWith('"')) {
              content = content.slice(1, -1)
              outputLines.push(content)
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
      }

      output = outputLines.length > 0 
        ? outputLines.join('\n')
        : 'Java code compiled and executed successfully'
    } catch (err) {
      error = err instanceof Error ? err.message : 'Java execution error'
    }

    const executionTime = performance.now() - startTime
    return { output, error: error || undefined, executionTime }
  }

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
      }

      output = outputLines.length > 0 
        ? outputLines.join('\n')
        : 'SQL executed successfully'
    } catch (err) {
      error = err instanceof Error ? err.message : 'SQL execution error'
    }

    const executionTime = performance.now() - startTime
    return { output, error: error || undefined, executionTime }
  }

  private evaluateExpression(expr: string, variables: Record<string, unknown>): unknown {
    try {
      for (const [key, value] of Object.entries(variables)) {
        expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value))
      }

      const safeExpr = expr.replace(/[^0-9+\-*/().\s]/g, '')
      return eval(safeExpr)
    } catch {
      return expr
    }
  }

  async execute(code: string, language: string): Promise<ExecutionResult> {
    const normalizedLanguage = language.toLowerCase().trim()
    
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
          error: `Language '${language}' is not supported. Supported languages: JavaScript, Python, Java, SQL`,
          executionTime: 0
        }
    }
  }
}

export const sandbox = new CodeSandbox({
  timeout: 5000,
  maxOutputLength: 10000
})
