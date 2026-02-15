import { useEffect, useRef, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CodeEditor } from '@/components/CodeEditor'
import { Play, Eraser } from '@phosphor-icons/react'
import { CodeSandbox } from '@/lib/sandbox'
import { getAllTestsForLanguage } from '@/lib/test-cases'
import { fetchSqlPracticeSchema, SqlSchemaTable } from '@/lib/api'
import { toast } from 'sonner'

type Language = 'python' | 'sql' | 'java'
type Difficulty = 'easy' | 'medium' | 'hard'

interface ParsedSqlTable {
  headers: string[]
  rows: string[][]
  notes: string[]
}

const parseSqlTableOutput = (rawOutput: string): ParsedSqlTable | null => {
  const lines = rawOutput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return null
  }

  const separatorIndex = lines.findIndex((line, index) => {
    if (index === 0) return false
    const previous = lines[index - 1]
    return line.includes('+') && line.includes('-') && previous.includes('|')
  })

  if (separatorIndex <= 0) {
    return {
      headers: [],
      rows: [],
      notes: lines,
    }
  }

  const headerLine = lines[separatorIndex - 1]
  const headers = headerLine.split('|').map((item) => item.trim())

  const rows: string[][] = []
  const notes: string[] = []

  const linesBeforeTable = lines.slice(0, separatorIndex - 1)
  if (linesBeforeTable.length > 0) {
    notes.push(...linesBeforeTable)
  }

  for (let index = separatorIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.includes('|')) {
      rows.push(line.split('|').map((item) => item.trim()))
      continue
    }

    notes.push(line)
  }

  if (headers.length === 0 || rows.length === 0) {
    return {
      headers: [],
      rows: [],
      notes: lines,
    }
  }

  return { headers, rows, notes }
}

const defaultCode: Record<Language, string> = {
  python: `# Write your Python code here
print("Hello, World!")

# Try some basic operations
x = 10
y = 20
print(f"Sum: {x + y}")`,
  sql: `-- Write your SQL queries here
-- Sample tables already available:
-- users, customers, orders, products, students, courses, enrollments
-- Start by querying existing data:

SELECT id, name, email, age
FROM users;

-- Try this join next:
-- SELECT o.id, c.name, o.total, o.order_date
-- FROM orders o
-- JOIN customers c ON o.customer_id = c.id
-- WHERE o.total > 100;

-- Student practice join:
-- SELECT s.full_name, c.title, e.status
-- FROM enrollments e
-- JOIN students s ON e.student_id = s.id
-- JOIN courses c ON e.course_id = c.id;
`,
  java: `// Write your Java code here
public class Practice {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Try some basic operations
        int x = 10;
        int y = 20;
        System.out.println("Sum: " + (x + y));
    }
}`
}

export function PracticePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy')
  const [pythonCode, setPythonCode] = useKV('practice-python-code', defaultCode.python)
  const [sqlCode, setSqlCode] = useKV('practice-sql-code', defaultCode.sql)
  const [javaCode, setJavaCode] = useKV('practice-java-code', defaultCode.java)
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [sqlSchemaTables, setSqlSchemaTables] = useState<SqlSchemaTable[]>([])
  const [isSchemaLoading, setIsSchemaLoading] = useState(false)
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const outputRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (output) {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [output])

  useEffect(() => {
    if (selectedLanguage !== 'sql' || sqlSchemaTables.length > 0 || isSchemaLoading) {
      return
    }

    const loadSchema = async () => {
      try {
        setIsSchemaLoading(true)
        setSchemaError(null)
        const response = await fetchSqlPracticeSchema()
        setSqlSchemaTables(response.tables)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load SQL schema'
        setSchemaError(message)
      } finally {
        setIsSchemaLoading(false)
      }
    }

    loadSchema()
  }, [selectedLanguage, sqlSchemaTables.length, isSchemaLoading])

  const getCurrentCode = (): string => {
    switch (selectedLanguage) {
      case 'python': return pythonCode || ''
      case 'sql': return sqlCode || ''
      case 'java': return javaCode || ''
    }
  }

  const setCurrentCode = (code: string) => {
    switch (selectedLanguage) {
      case 'python': setPythonCode(code); break
      case 'sql': setSqlCode(code); break
      case 'java': setJavaCode(code); break
    }
  }

  const handleRunCode = async () => {
    const code = getCurrentCode()
    
    if (!code.trim()) {
      toast.error('Please write some code first!')
      return
    }

    setIsRunning(true)
    setOutput('Running code...')
    setExecutionTime(null)

    try {
      const executor = new CodeSandbox()
      const result = await executor.execute(code, selectedLanguage)

      const javaRuntimeMissing =
        selectedLanguage === 'java' &&
        !!result.error &&
        (result.error.includes('WinError 2') ||
          result.error.toLowerCase().includes('javac') ||
          result.error.toLowerCase().includes('java runtime not found') ||
          result.error.toLowerCase().includes('cannot find the file specified'))
      
      if (result.error) {
        if (javaRuntimeMissing) {
          setOutput(
            'Java runtime not available on server.\n' +
            'Please install JDK (17+) and add both `java` and `javac` to PATH, then restart backend.'
          )
          toast.error('Java needs JDK setup on backend host.')
        } else {
          setOutput(`Error:\n${result.error}`)
          toast.error('Execution failed. Check the output for details.')
        }
        setExecutionTime(result.executionTime)
      } else {
        setOutput(result.output || 'Code executed successfully with no output.')
        setExecutionTime(result.executionTime)
        toast.success('Code executed successfully!')
      }
    } catch (error) {
      setOutput(`Unexpected error:\n${error}`)
      setExecutionTime(null)
      toast.error('An unexpected error occurred.')
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the code to default?')) {
      setCurrentCode(defaultCode[selectedLanguage])
      setOutput('')
      setExecutionTime(null)
      toast.success('Code reset to default!')
    }
  }

  const handleLoadExercise = (exerciseKey: string) => {
    const tests = getAllTestsForLanguage(selectedLanguage)
    const snippet = tests[exerciseKey]
    if (!snippet) {
      toast.error('Exercise snippet not available for this language.')
      return
    }

    setCurrentCode(snippet)
    setOutput('')
    setExecutionTime(null)
    toast.success('Exercise loaded. Run and modify the code to practice!')
  }

  const languageLabels: Record<Language, string> = {
    python: 'Python',
    sql: 'SQL',
    java: 'Java'
  }

  const languageFocusMap: Record<Language, string[]> = {
    python: ['Loops & conditions', 'Functions', 'List operations'],
    sql: ['SELECT + WHERE', 'JOINs', 'Table updates'],
    java: ['Classes & methods', 'Loops', 'Input/output'],
  }

  const availableExercises = getAllTestsForLanguage(selectedLanguage)

  const difficultyMap: Record<Language, Record<Difficulty, string[]>> = {
    python: {
      easy: ['basic', 'loops'],
      medium: ['functions', 'lists'],
      hard: ['lists'],
    },
    sql: {
      easy: ['basic', 'insert'],
      medium: ['update', 'join'],
      hard: ['join', 'createTable', 'delete'],
    },
    java: {
      easy: ['basic', 'loops'],
      medium: ['methods'],
      hard: ['numberGuesser'],
    },
  }

  const allowedExerciseNames = difficultyMap[selectedLanguage][selectedDifficulty]
  const exerciseEntries = Object.entries(availableExercises).filter(([name]) =>
    allowedExerciseNames.includes(name)
  )
  const sqlTableResult = selectedLanguage === 'sql' ? parseSqlTableOutput(output) : null
  const hasSqlRows = !!sqlTableResult && sqlTableResult.headers.length > 0 && sqlTableResult.rows.length > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">Practice Playground</h1>
            <p className="text-muted-foreground text-lg">
              Pick a language, load a quick exercise, and practice with instant output.
            </p>
          </div>

          <Card className="p-4 border">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold">What students usually practice first</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {languageFocusMap[selectedLanguage].map((focus) => (
                    <span key={focus} className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                      {focus}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={selectedDifficulty}
                  onChange={(event) => setSelectedDifficulty(event.target.value as Difficulty)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  defaultValue=""
                  onChange={(event) => {
                    const value = event.target.value
                    if (value) {
                      handleLoadExercise(value)
                      event.currentTarget.value = ''
                    }
                  }}
                >
                  <option value="" disabled>Load exercise template</option>
                  {exerciseEntries.map(([name]) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Tabs 
            value={selectedLanguage} 
            onValueChange={(value) => {
              setSelectedLanguage(value as Language)
              setOutput('')
              setExecutionTime(null)
            }}
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-md grid-cols-3 h-12">
              <TabsTrigger value="python" className="text-base">
                {languageLabels.python}
              </TabsTrigger>
              <TabsTrigger value="sql" className="text-base">
                {languageLabels.sql}
              </TabsTrigger>
              <TabsTrigger value="java" className="text-base">
                {languageLabels.java}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="python" className="space-y-4 mt-6">
              <Card className="overflow-hidden">
                <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Python Editor</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                    >
                      <Eraser size={16} className="mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      size="sm"
                    >
                      <Play size={16} className="mr-2" weight="fill" />
                      {isRunning ? 'Running...' : 'Run Code'}
                    </Button>
                  </div>
                </div>
                <CodeEditor
                  code={pythonCode}
                  onChange={setPythonCode}
                  language="python"
                  showExecutionControls={false}
                  showOutputPanel={false}
                />
                <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
                  Tip: Start with an exercise template, run, then modify one thing at a time.
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="sql" className="space-y-4 mt-6">
              <Card className="p-4 border">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Practice Database Schema</h3>
                  <p className="text-xs text-muted-foreground">
                    Use these tables and primary keys for `SELECT`, `JOIN`, `GROUP BY`, and filtering queries.
                  </p>
                </div>

                {isSchemaLoading && (
                  <p className="text-xs text-muted-foreground mt-3">Loading schema...</p>
                )}

                {schemaError && (
                  <p className="text-xs text-destructive mt-3">{schemaError}</p>
                )}

                {!isSchemaLoading && !schemaError && sqlSchemaTables.length > 0 && (
                  <div className="mt-3 border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Table</TableHead>
                          <TableHead>Primary Key</TableHead>
                          <TableHead>Columns</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sqlSchemaTables.map((table) => (
                          <TableRow key={table.name}>
                            <TableCell>
                              <div className="font-medium">{table.name}</div>
                              {table.description && (
                                <p className="text-xs text-muted-foreground mt-1">{table.description}</p>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{table.primary_key}</TableCell>
                            <TableCell className="font-mono text-xs">{table.columns.join(', ')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>

              <Card className="overflow-hidden">
                <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">SQL Editor</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                    >
                      <Eraser size={16} className="mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      size="sm"
                    >
                      <Play size={16} className="mr-2" weight="fill" />
                      {isRunning ? 'Running...' : 'Run Code'}
                    </Button>
                  </div>
                </div>
                <CodeEditor
                  code={sqlCode}
                  onChange={setSqlCode}
                  language="sql"
                  showExecutionControls={false}
                  showOutputPanel={false}
                />
                <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
                  Tip: Practice by changing filters, joins, and selected columns.
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="java" className="space-y-4 mt-6">
              <Card className="overflow-hidden">
                <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Java Editor</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                    >
                      <Eraser size={16} className="mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      size="sm"
                    >
                      <Play size={16} className="mr-2" weight="fill" />
                      {isRunning ? 'Running...' : 'Run Code'}
                    </Button>
                  </div>
                </div>
                <CodeEditor
                  code={javaCode}
                  onChange={setJavaCode}
                  language="java"
                  showExecutionControls={false}
                  showOutputPanel={false}
                />
                <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
                  Tip: Practice method logic first, then refactor into cleaner classes.
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {output && (
            <div ref={outputRef}>
            <Card className="overflow-hidden">
              <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg">Output</h3>
                  {executionTime !== null && (
                    <p className="text-xs text-muted-foreground">Execution time: {executionTime} ms</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOutput('')
                    setExecutionTime(null)
                  }}
                >
                  Clear Output
                </Button>
              </div>
              <div className="p-4 bg-muted/30 text-sm whitespace-pre-wrap max-h-[500px] overflow-auto">
                {selectedLanguage === 'sql' && sqlTableResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Output</h4>
                      {hasSqlRows ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {sqlTableResult.headers.map((header) => (
                                <TableHead key={header}>{header}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sqlTableResult.rows.map((row, rowIndex) => (
                              <TableRow key={`${row.join('-')}-${rowIndex}`}>
                                {row.map((cell, cellIndex) => (
                                  <TableCell key={`${rowIndex}-${cellIndex}`}>{cell}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-xs text-muted-foreground">No table rows returned for this query.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Notes</h4>
                      {sqlTableResult.notes.length > 0 ? (
                        <ul className="list-disc ml-5 space-y-1 text-xs text-muted-foreground">
                          {sqlTableResult.notes.map((note, index) => (
                            <li key={`${note}-${index}`}>{note}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">No notes for this query.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="font-mono">{output}</div>
                )}
              </div>
            </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
