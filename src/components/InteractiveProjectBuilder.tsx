import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Play,
  Eye,
  Code as CodeIcon,
  Trophy,
  Target,
  ArrowRight,
  Sparkle
} from '@phosphor-icons/react'
import { CodeEditor } from '@/components/CodeEditor'
import { toast } from 'sonner'
import { sandbox } from '@/lib/sandboxInstance'
import { fetchUserProgress, saveProjectStepProgress } from '@/lib/api'

interface TestCase {
  id: number
  description: string
  input?: any
  expected: any
  test: (code: string) => Promise<boolean>
}

interface Hint {
  level: number
  text: string
  codeSnippet?: string
}

interface BuildStep {
  id: number
  title: string
  description: string
  requirements: string[]
  starterCode: string
  testCases: TestCase[]
  hints: Hint[]
  successMessage: string
}

interface InteractiveProjectBuilderProps {
  projectId: string
  projectTitle: string
  buildSteps: BuildStep[]
  onComplete?: () => void
}

export function InteractiveProjectBuilder({
  projectId,
  projectTitle,
  buildSteps,
  onComplete
}: InteractiveProjectBuilderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [code, setCode] = useState('')
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [testResults, setTestResults] = useState<Map<number, boolean>>(new Map())
  const [showHints, setShowHints] = useState(false)
  const [currentHintLevel, setCurrentHintLevel] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [livePreview, setLivePreview] = useState<string>('')
  const [previewError, setPreviewError] = useState<string>('')

  // Restore persisted progress on mount
  useEffect(() => {
    fetchUserProgress()
      .then((progress) => {
        const saved = progress.completedSteps
          .filter((s) => s.projectSlug === projectId)
          .map((s) => s.stepId)
        if (saved.length > 0) {
          setCompletedSteps(saved)
        }
      })
      .catch(() => { /* offline / backend unavailable — start fresh */ })
  }, [projectId])

  const currentStep = buildSteps[currentStepIndex]
  const passedTests = Array.from(testResults.values()).filter(Boolean).length
  const totalTests = currentStep.testCases.length
  const progressPercentage = (passedTests / totalTests) * 100

  // Initialize code when step changes
  useEffect(() => {
    setCode(currentStep.starterCode)
    setTestResults(new Map())
    setShowHints(false)
    setCurrentHintLevel(0)
    setLivePreview('')
    setPreviewError('')
  }, [currentStepIndex, currentStep.starterCode])

  // Live preview with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updateLivePreview(code)
    }, 1000)
    return () => clearTimeout(timer)
  }, [code])

  const updateLivePreview = async (userCode: string) => {
    if (!userCode.trim()) {
      setLivePreview('')
      return
    }

    try {
      const result = await sandbox.executeJavaScript(userCode)
      if (result.error) {
        setPreviewError(result.error)
        setLivePreview('')
      } else {
        setPreviewError('')
        setLivePreview(result.output)
      }
    } catch (err: any) {
      setPreviewError(err.message || 'Preview error')
      setLivePreview('')
    }
  }

  const runTests = useCallback(async () => {
    setIsRunning(true)
    const results = new Map<number, boolean>()

    for (const testCase of currentStep.testCases) {
      try {
        const passed = await testCase.test(code)
        results.set(testCase.id, passed)
      } catch (err) {
        results.set(testCase.id, false)
      }
    }

    setTestResults(results)
    setIsRunning(false)

    const allPassed = Array.from(results.values()).every(Boolean)

    if (allPassed) {
      toast.success(currentStep.successMessage, {
        description: `All ${totalTests} tests passed! 🎉`,
        duration: 4000,
      })

      if (!completedSteps.includes(currentStep.id)) {
        const updated = [...completedSteps, currentStep.id]
        setCompletedSteps(updated)
        // Persist to backend (fire-and-forget)
        saveProjectStepProgress(projectId, currentStep.id).catch(() => {})
      }
    } else {
      const failed = totalTests - passedTests
      toast.error('Some tests failed', {
        description: `${failed} test${failed > 1 ? 's' : ''} need${failed === 1 ? 's' : ''} attention. Check the feedback below.`,
      })
    }
  }, [code, currentStep, completedSteps, totalTests, passedTests])

  const handleNextStep = () => {
    if (currentStepIndex < buildSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      onComplete?.()
    }
  }

  const showNextHint = () => {
    if (currentHintLevel < currentStep.hints.length - 1) {
      setCurrentHintLevel(currentHintLevel + 1)
    }
    setShowHints(true)
  }

  const isStepComplete = completedSteps.includes(currentStep.id)
  const canProceed = isStepComplete || passedTests === totalTests

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-2">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground font-medium">
                Step {currentStepIndex + 1} of {buildSteps.length}
              </div>
              <h2 className="text-2xl font-bold">{currentStep.title}</h2>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {passedTests}/{totalTests}
              </div>
              <div className="text-sm text-muted-foreground">Tests Passed</div>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          <p className="text-muted-foreground leading-relaxed">
            {currentStep.description}
          </p>
        </div>
      </Card>

      {/* Requirements */}
      <Card className="border-2 border-accent/30">
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-accent font-semibold">
            <Target size={20} weight="duotone" />
            <span>Requirements</span>
          </div>
          <ul className="space-y-2">
            {currentStep.requirements.map((req, index) => {
              const relatedTest = currentStep.testCases[index]
              const isPassed = relatedTest && testResults.get(relatedTest.id)
              
              return (
                <li key={index} className="flex gap-3 items-start">
                  {isPassed ? (
                    <CheckCircle size={20} weight="fill" className="text-primary mt-0.5 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={isPassed ? 'text-foreground' : 'text-muted-foreground'}>
                    {req}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </Card>

      {/* Code Editor and Preview */}
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="editor" className="gap-2">
            <CodeIcon size={16} />
            Code Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye size={16} />
            Live Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="mt-4 space-y-4">
          <CodeEditor
            code={code}
            onChange={setCode}
            language="javascript"
            projectId={projectId}
          />
          
          <div className="flex gap-3">
            <Button 
              onClick={runTests}
              disabled={isRunning}
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Play className="mr-2" size={18} weight="fill" />
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={showNextHint}
              disabled={currentHintLevel >= currentStep.hints.length - 1 && showHints}
            >
              <Lightbulb className="mr-2" size={18} weight="duotone" />
              Hint
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card className="border-2">
            <div className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkle size={18} weight="duotone" />
                Live Output
              </h3>
              {previewError ? (
                <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4">
                  <p className="text-destructive font-mono text-sm">{previewError}</p>
                </div>
              ) : livePreview ? (
                <div className="bg-secondary/50 rounded-lg p-4">
                  <pre className="font-mono text-sm whitespace-pre-wrap">{livePreview}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Write code in the editor to see live output...
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Results */}
      {testResults.size > 0 && (
        <Card className="border-2">
          <div className="p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target size={20} weight="duotone" />
              Test Results
            </h3>
            <div className="space-y-3">
              {currentStep.testCases.map((testCase) => {
                const result = testResults.get(testCase.id)
                const passed = result === true
                const failed = result === false
                
                return (
                  <div
                    key={testCase.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                      passed 
                        ? 'bg-primary/5 border-primary/30' 
                        : failed 
                          ? 'bg-destructive/5 border-destructive/30'
                          : 'bg-muted/30 border-muted'
                    }`}
                  >
                    {passed ? (
                      <CheckCircle size={24} weight="fill" className="text-primary flex-shrink-0" />
                    ) : failed ? (
                      <XCircle size={24} weight="fill" className="text-destructive flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{testCase.description}</div>
                      {testCase.expected && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Expected: <code className="text-xs bg-muted px-1 py-0.5 rounded">{JSON.stringify(testCase.expected)}</code>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Hints */}
      {showHints && currentStep.hints.length > 0 && (
        <Card className="border-2 border-accent/30 bg-accent/5">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent font-semibold">
                <Lightbulb size={20} weight="fill" />
                <span>Hint {currentHintLevel + 1} of {currentStep.hints.length}</span>
              </div>
              {currentHintLevel < currentStep.hints.length - 1 && (
                <Button variant="ghost" size="sm" onClick={showNextHint}>
                  Next Hint
                  <ArrowRight className="ml-2" size={14} />
                </Button>
              )}
            </div>
            {currentStep.hints.slice(0, currentHintLevel + 1).map((hint) => (
              <div key={hint.level} className="space-y-2">
                <p className="text-foreground leading-relaxed">{hint.text}</p>
                {hint.codeSnippet && (
                  <pre className="bg-background/50 border border-accent/20 rounded-lg p-3 text-sm font-mono overflow-x-auto">
                    <code>{hint.codeSnippet}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Success Message & Navigation */}
      {canProceed && (
        <Card className="border-2 border-primary bg-primary/5 animate-slide-in-bottom">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Trophy size={32} weight="duotone" className="text-primary" />
              <div>
                <h3 className="font-bold text-lg">Step Complete!</h3>
                <p className="text-muted-foreground">
                  {currentStepIndex === buildSteps.length - 1 
                    ? 'Congratulations! You\'ve completed the entire project!' 
                    : 'Great work! Ready for the next challenge?'}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleNextStep}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
            >
              {currentStepIndex === buildSteps.length - 1 ? (
                <>
                  <Trophy className="mr-2" size={18} weight="fill" />
                  Complete Project
                </>
              ) : (
                <>
                  Continue to Next Step
                  <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
