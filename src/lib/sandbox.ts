export interface ExecutionResult {
  output: string
  executionTime: number
  error?: string
}

export interface ExecutorConfig {
  timeout?: number
  maxOutputLength?: number
}

export class CodeSandbox {
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

  /* ---------- JavaScript ---------- */
  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const logs: string[] = []
    let error: string | undefined

    const originalLog = console.log
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }

    try {
      new Function(`"use strict";\n${code}`)()
    } catch (err: any) {
      error = err?.message ?? String(err)
    } finally {
      console.log = originalLog
    }

    return {
      output: this.truncate(logs.join('\n') || 'JavaScript executed'),
      executionTime: performance.now() - start,
      error
    }
  }

  /* ---------- Python (simulated) ---------- */
  async executePython(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const output: string[] = []
    let error: string | undefined

    try {
      for (const line of code.split('\n')) {
        const match = line.match(/^print\((.*)\)$/)
        if (match) output.push(match[1].replace(/['"]/g, ''))
      }
    } catch (err: any) {
      error = err?.message ?? String(err)
    }

    return {
      output: this.truncate(output.join('\n') || 'Python executed (simulated)'),
      executionTime: performance.now() - start,
      error
    }
  }

  /* ---------- Java (simulated) ---------- */
  async executeJava(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    const output: string[] = []
    let error: string | undefined

    try {
      const matches = code.matchAll(/System\.out\.println\((.*)\);/g)
      for (const m of matches) {
        output.push(m[1].replace(/['"]/g, ''))
      }
    } catch (err: any) {
      error = err?.message ?? String(err)
    }

    return {
      output: this.truncate(output.join('\n') || 'Java executed (simulated)'),
      executionTime: performance.now() - start,
      error
    }
  }

  /* ---------- SQL (simulated) ---------- */
  async executeSQL(code: string): Promise<ExecutionResult> {
    const start = performance.now()
    let error: string | undefined
    const output: string[] = []

    const database: Record<string, any[]> = {
      users: [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28 },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34 },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', age: 22 },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', age: 29 },
        { id: 5, name: 'John Doe', email: 'john@example.com', age: 25 }
      ],
      customers: [
        { id: 1, name: 'Alice Johnson', city: 'New York' },
        { id: 2, name: 'Bob Smith', city: 'Los Angeles' },
        { id: 3, name: 'Charlie Brown', city: 'Chicago' }
      ],
      orders: [
        { id: 101, customer_id: 1, total: 150.00, date: '2024-01-15' },
        { id: 102, customer_id: 2, total: 75.50, date: '2024-01-16' },
        { id: 103, customer_id: 1, total: 200.00, date: '2024-01-17' },
        { id: 104, customer_id: 3, total: 125.75, date: '2024-01-18' }
      ],
      products: []
    }

    try {
      const statements = code
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'))

      for (const statement of statements) {
        const upperStmt = statement.toUpperCase()

        if (upperStmt.startsWith('SELECT')) {
          const selectMatch = statement.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)/i)
          if (selectMatch) {
            const tableName = selectMatch[2].toLowerCase()
            const table = database[tableName]

            if (!table) {
              output.push(`Error: Table '${tableName}' does not exist`)
              continue
            }

            const whereMatch = statement.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i)
            let filteredData = [...table]

            if (whereMatch) {
              const condition = whereMatch[1].trim()
              filteredData = table.filter((row: any) => {
                const eqMatch = condition.match(/(\w+)\s*=\s*['"]?(.+?)['"]?$/i)
                const gtMatch = condition.match(/(\w+)\s*>\s*(\d+)/i)
                const ltMatch = condition.match(/(\w+)\s*<\s*(\d+)/i)

                if (eqMatch) {
                  const [, field, value] = eqMatch
                  return String(row[field]) === value
                } else if (gtMatch) {
                  const [, field, value] = gtMatch
                  return Number(row[field]) > Number(value)
                } else if (ltMatch) {
                  const [, field, value] = ltMatch
                  return Number(row[field]) < Number(value)
                }
                return true
              })
            }

            const joinMatch = statement.match(/INNER\s+JOIN\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i)
            if (joinMatch) {
              const [, joinTable, table1, field1, table2, field2] = joinMatch
              const joinData = database[joinTable.toLowerCase()]
              
              if (!joinData) {
                output.push(`Error: Table '${joinTable}' does not exist`)
                continue
              }

              filteredData = filteredData.flatMap((row1: any) => {
                return joinData
                  .filter((row2: any) => row1[field1] === row2[field2])
                  .map((row2: any) => ({ ...row1, ...row2 }))
              })
            }

            if (filteredData.length === 0) {
              output.push('0 rows returned')
            } else {
              const headers = Object.keys(filteredData[0])
              const headerRow = headers.join(' | ')
              const separator = headers.map(() => '---').join('-+-')
              
              output.push(headerRow)
              output.push(separator)
              
              filteredData.forEach((row: any) => {
                const values = headers.map(h => String(row[h] ?? 'NULL'))
                output.push(values.join(' | '))
              })
              
              output.push(`\n${filteredData.length} row(s) returned`)
            }
          }
        } else if (upperStmt.startsWith('INSERT')) {
          const insertMatch = statement.match(/INSERT\s+INTO\s+(\w+)\s*\((.+?)\)\s*VALUES\s*\((.+?)\)/i)
          if (insertMatch) {
            const tableName = insertMatch[1].toLowerCase()
            const fields = insertMatch[2].split(',').map(f => f.trim())
            const values = insertMatch[3].split(',').map(v => {
              const trimmed = v.trim()
              return trimmed.replace(/^['"]|['"]$/g, '')
            })

            if (!database[tableName]) {
              database[tableName] = []
            }

            const newRow: any = {}
            fields.forEach((field, i) => {
              const value = values[i]
              newRow[field] = isNaN(Number(value)) ? value : Number(value)
            })

            database[tableName].push(newRow)
            output.push(`1 row inserted into ${tableName}`)
          }
        } else if (upperStmt.startsWith('UPDATE')) {
          const updateMatch = statement.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i)
          if (updateMatch) {
            const tableName = updateMatch[1].toLowerCase()
            const setClause = updateMatch[2]
            const whereClause = updateMatch[3]

            const table = database[tableName]
            if (!table) {
              output.push(`Error: Table '${tableName}' does not exist`)
              continue
            }

            const setMatch = setClause.match(/(\w+)\s*=\s*['"]?(.+?)['"]?$/i)
            if (setMatch) {
              const [, field, value] = setMatch
              let updatedCount = 0

              table.forEach((row: any) => {
                let shouldUpdate = true

                if (whereClause) {
                  const whereMatch = whereClause.match(/(\w+)\s*=\s*['"]?(.+?)['"]?$/i)
                  if (whereMatch) {
                    const [, whereField, whereValue] = whereMatch
                    shouldUpdate = String(row[whereField]) === whereValue
                  }
                }

                if (shouldUpdate) {
                  row[field] = isNaN(Number(value)) ? value : Number(value)
                  updatedCount++
                }
              })

              output.push(`${updatedCount} row(s) updated in ${tableName}`)
            }
          }
        } else if (upperStmt.startsWith('DELETE')) {
          const deleteMatch = statement.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i)
          if (deleteMatch) {
            const tableName = deleteMatch[1].toLowerCase()
            const whereClause = deleteMatch[2]

            const table = database[tableName]
            if (!table) {
              output.push(`Error: Table '${tableName}' does not exist`)
              continue
            }

            if (!whereClause) {
              const count = table.length
              database[tableName] = []
              output.push(`${count} row(s) deleted from ${tableName}`)
            } else {
              const whereMatch = whereClause.match(/(\w+)\s*([<>=!]+)\s*['"]?(.+?)['"]?$/i)
              if (whereMatch) {
                const [, field, operator, value] = whereMatch
                const initialLength = table.length

                database[tableName] = table.filter((row: any) => {
                  const rowValue = row[field]
                  const compareValue = isNaN(Number(value)) ? value : Number(value)

                  switch (operator) {
                    case '=': return rowValue !== compareValue
                    case '>': return !(rowValue > compareValue)
                    case '<': return !(rowValue < compareValue)
                    case '>=': return !(rowValue >= compareValue)
                    case '<=': return !(rowValue <= compareValue)
                    case '!=': return rowValue === compareValue
                    default: return true
                  }
                })

                const deletedCount = initialLength - database[tableName].length
                output.push(`${deletedCount} row(s) deleted from ${tableName}`)
              }
            }
          }
        } else if (upperStmt.startsWith('CREATE TABLE')) {
          const createMatch = statement.match(/CREATE\s+TABLE\s+(\w+)\s*\((.+)\)/i)
          if (createMatch) {
            const tableName = createMatch[1].toLowerCase()
            database[tableName] = []
            output.push(`Table '${tableName}' created successfully`)
          }
        } else {
          output.push(`Executed: ${statement.substring(0, 50)}...`)
        }
      }
    } catch (err: any) {
      error = err?.message ?? String(err)
    }

    return {
      output: this.truncate(output.join('\n') || 'SQL executed'),
      executionTime: performance.now() - start,
      error
    }
  }

  async execute(code: string, language: string): Promise<ExecutionResult> {
    switch (language.toLowerCase()) {
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
