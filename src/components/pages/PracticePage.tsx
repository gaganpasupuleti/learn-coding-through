import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { CodeEditor } from '@/components/CodeEditor'
import { Play, Eraser } from '@phosphor-icons/react'
import { CodeSandbox } from '@/lib/sandbox'
import { toast } from 'sonner'

type Language = 'python' | 'sql' | 'java'

const defaultCode: Record<Language, string> = {
  python: `# Write your Python code here
print("Hello, World!")

# Try some basic operations
x = 10
y = 20
print(f"Sum: {x + y}")`,
  sql: `-- Write your SQL queries here
-- Example: Create and query a table

CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    age INT
);

INSERT INTO users VALUES (1, 'Alice', 25);
INSERT INTO users VALUES (2, 'Bob', 30);

SELECT * FROM users;`,
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
  const [pythonCode, setPythonCode] = useKV('practice-python-code', defaultCode.python)
  const [sqlCode, setSqlCode] = useKV('practice-sql-code', defaultCode.sql)
  const [javaCode, setJavaCode] = useKV('practice-java-code', defaultCode.java)
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)

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

    try {
      const executor = new CodeSandbox()
      const result = await executor.execute(code, selectedLanguage)
      
      if (result.error) {
        setOutput(`Error:\n${result.error}`)
        toast.error('Execution failed. Check the output for details.')
      } else {
        setOutput(result.output || 'Code executed successfully with no output.')
        toast.success('Code executed successfully!')
      }
    } catch (error) {
      setOutput(`Unexpected error:\n${error}`)
      toast.error('An unexpected error occurred.')
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the code to default?')) {
      setCurrentCode(defaultCode[selectedLanguage])
      setOutput('')
      toast.success('Code reset to default!')
    }
  }

  const languageLabels: Record<Language, string> = {
    python: 'Python',
    sql: 'SQL',
    java: 'Java'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">Practice Playground</h1>
            <p className="text-muted-foreground text-lg">
              Experiment and practice coding without any guided projects. Select a language and start writing!
            </p>
          </div>

          <Tabs 
            value={selectedLanguage} 
            onValueChange={(value) => {
              setSelectedLanguage(value as Language)
              setOutput('')
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
                />
              </Card>
            </TabsContent>

            <TabsContent value="sql" className="space-y-4 mt-6">
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
                />
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
                />
              </Card>
            </TabsContent>
          </Tabs>

          {output && (
            <Card className="overflow-hidden">
              <div className="bg-card border-b border-border px-4 py-3">
                <h3 className="font-semibold text-lg">Output</h3>
              </div>
              <div className="p-4 bg-muted/30 font-mono text-sm whitespace-pre-wrap max-h-[400px] overflow-auto">
                {output}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
