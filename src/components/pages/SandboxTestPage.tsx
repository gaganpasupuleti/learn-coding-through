import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CodeEditor } from '@/components/CodeEditor'
import { SandboxInfo } from '@/components/SandboxInfo'
import { getAllTestsForLanguage } from '@/lib/test-cases'
import { Code, Flask } from '@phosphor-icons/react'

export function SandboxTestPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java' | 'sql'>('javascript')
  const [selectedTest, setSelectedTest] = useState('basic')

  const testOptions = getAllTestsForLanguage(selectedLanguage)
  const currentCode = testOptions[selectedTest] || ''

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value as 'javascript' | 'python' | 'java' | 'sql')
    setSelectedTest('basic')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <Flask size={36} weight="duotone" className="text-primary" />
                Sandbox Testing Lab
              </h1>
              <p className="text-muted-foreground text-lg">
                Test the sandboxed code execution with various examples
              </p>
            </div>
            <SandboxInfo />
          </div>

          <Card className="border-2 p-6">
            <div className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Test Case</label>
                  <Select value={selectedTest} onValueChange={setSelectedTest}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(testOptions).map((testName) => (
                        <SelectItem key={testName} value={testName}>
                          {testName.charAt(0).toUpperCase() + testName.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          <CodeEditor
            initialCode={currentCode}
            language={selectedLanguage}
            projectId="sandbox-test"
          />

          <Card className="border-2 p-6 bg-muted/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Code size={20} weight="duotone" />
              About This Sandbox
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                The sandbox executes your code in a secure, isolated environment. Here's what happens:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>JavaScript:</strong> Runs in an isolated iframe with restricted access</li>
                <li><strong>Python:</strong> Interpreted line-by-line for educational purposes</li>
                <li><strong>Java:</strong> Simulates compilation and execution with output parsing</li>
                <li><strong>SQL:</strong> Simulates database operations with sample data</li>
              </ul>
              <p className="mt-3">
                All code is executed with a 5-second timeout and output is limited to prevent abuse.
                The sandbox cannot access your filesystem, network, or any system resources.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
