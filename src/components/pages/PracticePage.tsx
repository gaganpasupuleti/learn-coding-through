import { useEffect, useMemo, useRef, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CodeEditor } from '@/components/CodeEditor'
import { Play, Eraser, ChevronDown, Download } from 'lucide-react'
import { sandbox } from '@/lib/sandboxInstance'
import { getAllTestsForLanguage } from '@/lib/test-cases'
import { fetchSqlPracticeSchema, SqlSchemaTable } from '@/lib/api'
import { toast } from 'sonner'

type Language = 'python' | 'sql' | 'java'
type Difficulty = 'easy' | 'medium' | 'hard'

interface PracticeTopic {
  label: string
  exerciseKey: string
}

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

const LANGUAGE_FOCUS_MAP: Record<Language, PracticeTopic[]> = {
  python: [
    { label: 'Loops & conditions', exerciseKey: 'loops' },
    { label: 'Functions', exerciseKey: 'functions' },
    { label: 'List operations', exerciseKey: 'lists' },
  ],
  sql: [
    { label: 'SELECT + WHERE', exerciseKey: 'basic' },
    { label: 'JOINs', exerciseKey: 'join' },
    { label: 'Table updates', exerciseKey: 'update' },
  ],
  java: [
    { label: 'Classes & methods', exerciseKey: 'methods' },
    { label: 'Loops', exerciseKey: 'loops' },
    { label: 'Input/output', exerciseKey: 'basic' },
  ],
}

const DIFFICULTY_MAP: Record<Language, Record<Difficulty, string[]>> = {
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

function downloadSampleRowsCsv(table: SqlSchemaTable) {
  const rows = table.sample_rows ?? []
  if (rows.length === 0) return
  const cols = table.columns
  const escapeCell = (value: string | number | null | undefined) => {
    const s = value === null || value === undefined ? '' : String(value)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [
    cols.map(escapeCell).join(','),
    ...rows.map((row) => cols.map((c) => escapeCell(row[c] as string | number | null | undefined)).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${table.name}-sample.csv`
  anchor.click()
  URL.revokeObjectURL(url)
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

  const availableExercises = getAllTestsForLanguage(selectedLanguage)
  const allowedExerciseNames = DIFFICULTY_MAP[selectedLanguage][selectedDifficulty]
  const visibleTopicPills = useMemo(() => {
    const allowed = DIFFICULTY_MAP[selectedLanguage][selectedDifficulty]
    return LANGUAGE_FOCUS_MAP[selectedLanguage].filter(
      (topic) => allowed.includes(topic.exerciseKey) && Boolean(availableExercises[topic.exerciseKey]),
    )
  }, [selectedLanguage, selectedDifficulty, availableExercises])

  const [activeTopic, setActiveTopic] = useState(LANGUAGE_FOCUS_MAP.python[0].label)

  useEffect(() => {
    if (visibleTopicPills.length === 0) {
      return
    }
    setActiveTopic((previous) =>
      visibleTopicPills.some((topic) => topic.label === previous) ? previous : visibleTopicPills[0].label,
    )
  }, [selectedLanguage, selectedDifficulty, visibleTopicPills])

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
      const result = await sandbox.execute(code, selectedLanguage)

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

  const exerciseEntries = Object.entries(availableExercises).filter(([name]) =>
    allowedExerciseNames.includes(name)
  )
  const sqlTableResult = selectedLanguage === 'sql' ? parseSqlTableOutput(output) : null
  const hasSqlRows = !!sqlTableResult && sqlTableResult.headers.length > 0 && sqlTableResult.rows.length > 0

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Practice Playground</h1>
            <p className="text-slate-500">
              Pick a language, load a quick exercise, and practice with instant output.
            </p>
            <p className="text-sm text-slate-400">
              Running code requires the CodeQuest API (local or deployed). SQL practice loads schema from the backend when you select SQL.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Common practice topics</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {visibleTopicPills.map((topic) => (
                    <button
                      key={topic.label}
                      type="button"
                      onClick={() => {
                        setActiveTopic(topic.label)
                        handleLoadExercise(topic.exerciseKey)
                      }}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${activeTopic === topic.label
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
                  value={selectedDifficulty}
                  onChange={(event) => setSelectedDifficulty(event.target.value as Difficulty)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
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
          </div>

          <Tabs
            value={selectedLanguage}
            onValueChange={(value) => {
              const nextLanguage = value as Language
              setSelectedLanguage(nextLanguage)
              setOutput('')
              setExecutionTime(null)
            }}
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-xs grid-cols-3 h-9 bg-slate-100 rounded-lg p-1">
              <TabsTrigger value="python" className="text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">
                {languageLabels.python}
              </TabsTrigger>
              <TabsTrigger value="sql" className="text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">
                {languageLabels.sql}
              </TabsTrigger>
              <TabsTrigger value="java" className="text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500">
                {languageLabels.java}
              </TabsTrigger>
            </TabsList>

            {/* ---------- Python tab ---------- */}
            <TabsContent value="python" className="space-y-4 mt-0">
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Python Editor</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleReset} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-200 border border-slate-200 bg-white transition-all duration-150">
                      <Eraser size={13} /> Reset
                    </button>
                    <button type="button" onClick={handleRunCode} disabled={isRunning} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-1.5 rounded-md transition-all duration-150">
                      <Play size={13} strokeWidth={2.5} /> {isRunning ? 'Running…' : 'Run Code'}
                    </button>
                  </div>
                </div>
                <CodeEditor
                  code={pythonCode}
                  onChange={setPythonCode}
                  language="python"
                  showExecutionControls={false}
                  showOutputPanel={false}
                />
                <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
                  Tip: Start with an exercise template, run, then modify one thing at a time.
                </div>
              </div>
            </TabsContent>

            {/* ---------- SQL tab ---------- */}
            <TabsContent value="sql" className="space-y-4 mt-0">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-800">Practice Database Schema</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Use these tables for <code className="font-mono bg-slate-100 px-1 rounded">SELECT</code>, <code className="font-mono bg-slate-100 px-1 rounded">JOIN</code>, <code className="font-mono bg-slate-100 px-1 rounded">GROUP BY</code>, and filtering queries.
                  </p>
                </div>
                {isSchemaLoading && <p className="text-xs text-slate-400 p-4">Loading schema…</p>}
                {schemaError && <p className="text-xs text-red-500 p-4">{schemaError}</p>}
                {!isSchemaLoading && !schemaError && sqlSchemaTables.length > 0 && (
                  <div className="divide-y divide-slate-100">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 w-32">Table</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 w-28">Primary Key</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Columns</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sqlSchemaTables.map((table) => (
                            <tr key={table.name} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors duration-100">
                              <td className="px-4 py-3">
                                <span className="font-semibold text-slate-800 text-xs">{table.name}</span>
                                {table.description && <p className="text-xs text-slate-400 mt-0.5">{table.description}</p>}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-slate-600">{table.primary_key}</td>
                              <td className="px-4 py-3 font-mono text-xs text-slate-500">{table.columns.join(', ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {sqlSchemaTables.some((table) => (table.sample_rows?.length ?? 0) > 0) && (
                      <div className="p-4 space-y-3 bg-slate-50/80">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Sample data</h4>
                          <p className="text-xs text-slate-500">Preview rows from the in-memory practice database (Excel-friendly CSV per table).</p>
                        </div>
                        <div className="space-y-2">
                          {sqlSchemaTables.map((table) => {
                            const samples = table.sample_rows ?? []
                            if (samples.length === 0) {
                              return null
                            }
                            return (
                              <Collapsible key={`sample-${table.name}`} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                                <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 [&[data-state=open]>svg]:rotate-180">
                                  <span>Preview rows: <span className="font-mono text-xs text-slate-600">{table.name}</span></span>
                                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="border-t border-slate-200 px-3 py-2 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        downloadSampleRowsCsv(table)
                                        toast.success(`Downloaded ${table.name} sample as CSV`)
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      Download CSV
                                    </button>
                                  </div>
                                  <div className="max-h-64 overflow-auto border-t border-slate-200">
                                    <table className="w-full border-collapse text-xs">
                                      <thead className="sticky top-0 z-[1] bg-slate-100 shadow-[0_1px_0_0_rgb(226_232_240)]">
                                        <tr>
                                          {table.columns.map((col) => (
                                            <th
                                              key={col}
                                              className="border border-slate-300 px-2 py-2 text-left font-semibold text-slate-700 whitespace-nowrap"
                                            >
                                              {col}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {samples.map((row, rowIndex) => (
                                          <tr
                                            key={rowIndex}
                                            className={rowIndex % 2 === 1 ? 'bg-slate-50/90' : 'bg-white'}
                                          >
                                            {table.columns.map((col) => (
                                              <td
                                                key={col}
                                                className="border border-slate-300 px-2 py-1.5 font-mono text-slate-800 whitespace-nowrap max-w-[14rem] truncate"
                                                title={String(row[col] ?? '')}
                                              >
                                                {row[col] === null || row[col] === undefined ? (
                                                  <span className="text-slate-400">NULL</span>
                                                ) : (
                                                  String(row[col])
                                                )}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">SQL Editor</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleReset} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-200 border border-slate-200 bg-white transition-all duration-150">
                      <Eraser size={13} /> Reset
                    </button>
                    <button type="button" onClick={handleRunCode} disabled={isRunning} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-1.5 rounded-md transition-all duration-150">
                      <Play size={13} strokeWidth={2.5} /> {isRunning ? 'Running…' : 'Run Code'}
                    </button>
                  </div>
                </div>
                <CodeEditor
                  code={sqlCode}
                  onChange={setSqlCode}
                  language="sql"
                  showExecutionControls={false}
                  showOutputPanel={false}
                />
                <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
                  Tip: Practice by changing filters, joins, and selected columns.
                </div>
              </div>
            </TabsContent>

            {/* ---------- Java tab ---------- */}
            <TabsContent value="java" className="space-y-4 mt-0">
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Java Editor</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleReset} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-200 border border-slate-200 bg-white transition-all duration-150">
                      <Eraser size={13} /> Reset
                    </button>
                    <button type="button" onClick={handleRunCode} disabled={isRunning} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-1.5 rounded-md transition-all duration-150">
                      <Play size={13} strokeWidth={2.5} /> {isRunning ? 'Running…' : 'Run Code'}
                    </button>
                  </div>
                </div>
                <CodeEditor
                  code={javaCode}
                  onChange={setJavaCode}
                  language="java"
                  showExecutionControls={false}
                  showOutputPanel={false}
                />
                <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
                  Tip: Practice method logic first, then refactor into cleaner classes.
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Output panel */}
          {output && (
            <div ref={outputRef}>
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">Output</span>
                    {executionTime !== null && (
                      <span className="text-xs text-slate-400">{executionTime} ms</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setOutput(''); setExecutionTime(null) }}
                    className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 transition-all duration-150"
                  >
                    Clear
                  </button>
                </div>
                <div className="p-4 bg-white max-h-[500px] overflow-auto">
                  {selectedLanguage === 'sql' && sqlTableResult ? (
                    <div className="space-y-5">
                      {hasSqlRows ? (
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50">
                                {sqlTableResult.headers.map((header) => (
                                  <th key={header} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sqlTableResult.rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors duration-100">
                                  {row.map((cell, cellIndex) => (
                                    <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 text-slate-700 font-mono text-xs">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No rows returned for this query.</p>
                      )}
                      {sqlTableResult.notes.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Notes</p>
                          <ul className="list-disc ml-4 space-y-0.5 text-xs text-slate-500">
                            {sqlTableResult.notes.map((note, index) => (
                              <li key={`${note}-${index}`}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <pre className="font-mono text-xs text-slate-700 whitespace-pre-wrap">{output}</pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
