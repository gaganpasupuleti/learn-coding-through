import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { SkillVideoPlayer } from '@/components/common/SkillVideoPlayer'
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Play,
  Code as CodeIcon,
  Trophy,
  Target,
  ArrowRight,
} from '@phosphor-icons/react'
import { CodeEditor } from '@/components/CodeEditor'
import { toast } from 'sonner'
import { sandbox } from '@/lib/sandboxInstance'
import { fetchProjectProgress, fetchUserProgress, saveProjectProgressStep } from '@/lib/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

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
  videoId?: string
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

  const runWithFallback = useCallback(async (userCode: string, language: string) => {
    try {
      return await Promise.race([
        sandbox.execute(userCode, language),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Sandbox timeout')), 3500)
        ),
      ])
    } catch {
      const response = await fetch(`${API_BASE_URL}/api/v1/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: userCode, language }),
      })
      const backend = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(backend.detail || `Backend execute failed (${response.status})`)
      }

      return {
        output: backend.output,
        executionTime: backend.execution_time ?? 0,
        error: backend.error,
      }
    }
  }, [])

  // Restore persisted progress on mount
  useEffect(() => {
    fetchProjectProgress(projectId)
      .then((progress) => {
        const saved = progress.completedStepIds
        if (saved.length > 0) {
          setCompletedSteps(saved)
        }
        const safeIndex = Math.max(
          0,
          Math.min((progress.nextStepId ?? 1) - 1, Math.max(buildSteps.length - 1, 0))
        )
        setCurrentStepIndex(safeIndex)
      })
      .catch(() => {
        // Fallback to existing aggregate progress endpoint.
        fetchUserProgress()
          .then((progress) => {
            const saved = progress.completedSteps
              .filter((s) => s.projectSlug === projectId)
              .map((s) => s.stepId)
            if (saved.length > 0) {
              setCompletedSteps(saved)
              const contiguous = saved
                .sort((a, b) => a - b)
                .reduce((acc, stepId) => (stepId === acc + 1 ? stepId : acc), 0)
              setCurrentStepIndex(Math.min(contiguous, Math.max(buildSteps.length - 1, 0)))
            }
          })
          .catch(() => { /* offline / backend unavailable — start fresh */ })
      })
  }, [projectId, buildSteps.length])

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

  const updateLivePreview = useCallback(async (userCode: string) => {
    if (!userCode.trim()) {
      setLivePreview('')
      return
    }

    try {
      const result = await runWithFallback(userCode, 'javascript')
      if (result.error) {
        setPreviewError(result.error)
        setLivePreview('')
      } else {
        setPreviewError('')
        setLivePreview(result.output)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Preview error'
      setPreviewError(message)
      setLivePreview('')
    }
  }, [runWithFallback])

  // Live preview with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updateLivePreview(code)
    }, 1000)
    return () => clearTimeout(timer)
  }, [code, updateLivePreview])

  const runTests = useCallback(async () => {
    setIsRunning(true)
    const results = new Map<number, boolean>()

    for (const testCase of currentStep.testCases) {
      try {
        const passed = await testCase.test(code)
        results.set(testCase.id, passed)
      } catch {
        // Fallback: run code on backend executor when sandbox-driven tests fail/hang.
        try {
          const fallback = await runWithFallback(code, 'javascript')
          if (fallback.error) {
            results.set(testCase.id, false)
          } else if (testCase.expected !== undefined) {
            results.set(testCase.id, String(fallback.output).includes(String(testCase.expected)))
          } else {
            results.set(testCase.id, true)
          }
        } catch {
          results.set(testCase.id, false)
        }
      }
    }

    setTestResults(results)
    setIsRunning(false)

    const allPassed = Array.from(results.values()).every(Boolean)

    if (allPassed) {
      try {
        // Secure persistence must succeed before unlocking the next step in the UI.
        await saveProjectProgressStep(projectId, {
          step_id: currentStep.id,
          code_snapshot: code,
          passed: true,
        })

        if (!completedSteps.includes(currentStep.id)) {
          const updated = [...completedSteps, currentStep.id]
          setCompletedSteps(updated)
        }

        toast.success(currentStep.successMessage, {
          description: `All ${totalTests} tests passed! 🎉`,
          duration: 4000,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to persist step completion'
        toast.error('Step verification failed', {
          description: `${message}. Step remains locked until backend save succeeds.`,
        })
      }
    } else {
      const passedCount = Array.from(results.values()).filter(Boolean).length
      const failed = totalTests - passedCount
      toast.error('Some tests failed', {
        description: `${failed} test${failed > 1 ? 's' : ''} need${failed === 1 ? 's' : ''} attention. Check the feedback below.`,
      })
    }
  }, [code, currentStep, completedSteps, totalTests, projectId, runWithFallback])

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
    <div className="h-full flex flex-col bg-background">

      {/* ── Top bar: step breadcrumb + progress ── */}
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b bg-background/95 backdrop-blur-sm flex-shrink-0">
        {/* Left: step pills + title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-1">
            {buildSteps.map((step, i) => (
              <button
                key={step.id}
                type="button"
                onClick={() => (completedSteps.includes(step.id) || i <= currentStepIndex) && setCurrentStepIndex(i)}
                title={step.title}
                className={[
                  'w-7 h-7 rounded-full text-xs font-bold transition-all',
                  i === currentStepIndex
                    ? 'bg-primary text-primary-foreground shadow-sm scale-110'
                    : completedSteps.includes(step.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground opacity-60',
                ].join(' ')}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground leading-none mb-0.5">
              {projectTitle} · Step {currentStepIndex + 1} of {buildSteps.length}
            </p>
            <h2 className="text-sm font-bold truncate">{currentStep.title}</h2>
          </div>
        </div>

        {/* Right: test score + progress bar */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-sm font-semibold tabular-nums">
            <span className="text-primary">{passedTests}</span>
            <span className="text-muted-foreground">/{totalTests}</span>
          </span>
          <Progress value={progressPercentage} className="w-20 h-1.5" />
          {canProceed && (
            <span className="text-[11px] font-semibold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
              ✓ Ready
            </span>
          )}
        </div>
      </div>

      {/* ── Resizable main area ── */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">

        {/* ════ LEFT PANEL (35 %): video + instructions ════ */}
        <ResizablePanel defaultSize={35} minSize={22} maxSize={52}>
          <div className="flex flex-col h-full">

            {/* Video player — top, fixed */}
            {currentStep.videoId && (
              <div className="p-3 border-b flex-shrink-0 bg-background/80">
                <SkillVideoPlayer
                  videoId={currentStep.videoId}
                  title={currentStep.title}
                  desc="Watch the walkthrough, then write the code yourself."
                  level="Beginner"
                  channel="Tutorial"
                  accentColor="bg-indigo-600"
                />
              </div>
            )}

            {/* Scrollable instructions */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>

              {/* Requirements */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wide">
                  <Target size={13} weight="duotone" />
                  Requirements
                </div>
                <ul className="space-y-2">
                  {currentStep.requirements.map((req, i) => {
                    const relatedTest = currentStep.testCases[i]
                    const isPassed = relatedTest && testResults.get(relatedTest.id)
                    return (
                      <li key={i} className="flex gap-2 items-start text-sm">
                        {isPassed ? (
                          <CheckCircle size={15} weight="fill" className="text-primary mt-0.5 flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={isPassed ? 'text-foreground' : 'text-muted-foreground'}>
                          {req}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Hints */}
              {showHints && currentStep.hints.length > 0 && (
                <div className="rounded-lg border-2 border-accent/30 bg-accent/5 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-accent font-semibold text-xs">
                      <Lightbulb size={14} weight="fill" />
                      Hint {currentHintLevel + 1} / {currentStep.hints.length}
                    </div>
                    {currentHintLevel < currentStep.hints.length - 1 && (
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={showNextHint}>
                        Next Hint
                      </Button>
                    )}
                  </div>
                  {currentStep.hints.slice(0, currentHintLevel + 1).map((hint) => (
                    <div key={hint.level} className="space-y-1.5">
                      <p className="text-sm leading-relaxed">{hint.text}</p>
                      {hint.codeSnippet && (
                        <pre className="bg-background/70 border border-accent/20 rounded-md p-2 text-xs font-mono overflow-x-auto">
                          {hint.codeSnippet}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step-complete banner */}
              {canProceed && (
                <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-3 flex items-center gap-2">
                  <Trophy size={20} weight="duotone" className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Step Complete!</p>
                    <p className="text-xs text-muted-foreground">
                      {currentStepIndex === buildSteps.length - 1
                        ? "You've finished the whole project!"
                        : 'Great work — move to the next step.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t flex-shrink-0 bg-background/80">
              <Button
                variant="outline"
                size="sm"
                onClick={showNextHint}
                disabled={currentHintLevel >= currentStep.hints.length - 1 && showHints}
                className="h-8 text-xs gap-1.5"
              >
                <Lightbulb size={13} weight="duotone" />
                Hint
              </Button>
              <Button
                size="sm"
                onClick={handleNextStep}
                disabled={!canProceed}
                className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-40"
              >
                {currentStepIndex === buildSteps.length - 1 ? (
                  <>
                    <Trophy size={13} weight="fill" />
                    Finish Project
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight size={13} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* ════ RIGHT PANEL (65 %): code editor + terminal ════ */}
        <ResizablePanel defaultSize={65}>
          <ResizablePanelGroup direction="vertical">

            {/* Code editor (70%) */}
            <ResizablePanel defaultSize={70} minSize={40}>
              <div className="flex flex-col h-full">
                {/* Editor header bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CodeIcon size={13} />
                    <span className="text-xs font-medium">JavaScript</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={runTests}
                    disabled={isRunning}
                    className="h-7 px-3 text-xs gap-1.5 bg-primary hover:bg-primary/90"
                  >
                    <Play size={12} weight="fill" />
                    {isRunning ? 'Running…' : 'Run Tests'}
                  </Button>
                </div>
                {/* Monaco editor fills the rest */}
                <div className="flex-1 overflow-hidden">
                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    language="javascript"
                    projectId={projectId}
                    showExecutionControls={false}
                    showOutputPanel={false}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Terminal / console output (30%) */}
            <ResizablePanel defaultSize={30} minSize={15}>
              <div className="flex flex-col h-full overflow-hidden">
                {/* Terminal chrome */}
                <div className="bg-zinc-800 px-3 py-1.5 flex items-center gap-2 flex-shrink-0">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-zinc-400 text-[11px] font-mono ml-1">Output</span>
                </div>

                {/* Scrollable output area */}
                <div className="flex-1 overflow-y-auto bg-zinc-950">
                  {/* Live preview / error output */}
                  {previewError ? (
                    <pre className="p-3 font-mono text-xs text-red-400 whitespace-pre-wrap">
                      {previewError.split('\n').find(l => l.trim() && !l.startsWith('    at ')) ?? previewError.split('\n')[0]}
                    </pre>
                  ) : livePreview ? (
                    <pre className="p-3 font-mono text-xs text-green-400 whitespace-pre-wrap">{livePreview}</pre>
                  ) : (
                    <p className="p-4 text-zinc-500 text-[11px] font-mono italic">
                      Output appears here after running tests…
                    </p>
                  )}

                  {/* Test results */}
                  {testResults.size > 0 && (
                    <div className="border-t border-zinc-800 px-3 py-2 space-y-1.5">
                      {currentStep.testCases.map((tc) => {
                        const result = testResults.get(tc.id)
                        const passed = result === true
                        const failed = result === false
                        return (
                          <div
                            key={tc.id}
                            className={[
                              'flex items-center gap-2 text-[11px] font-mono',
                              passed ? 'text-green-400' : failed ? 'text-red-400' : 'text-zinc-500',
                            ].join(' ')}
                          >
                            {passed
                              ? <CheckCircle size={11} weight="fill" className="flex-shrink-0" />
                              : failed
                                ? <XCircle size={11} weight="fill" className="flex-shrink-0" />
                                : <div className="w-2.5 h-2.5 rounded-full border border-zinc-600 flex-shrink-0" />
                            }
                            <span>{tc.description}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>

          </ResizablePanelGroup>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  )
}
