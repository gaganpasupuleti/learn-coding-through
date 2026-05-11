import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Lightbulb,
  Code as CodeIcon,
  Play,
  ListChecks,
  Brain,
  Eye,
  Rocket,
  Trophy,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react'
import { CatalogProject, CatalogProjectStep, fetchCatalogProject, fetchUserProgress, saveProjectStepProgress, saveStepProgress } from '@/lib/api'
import type { ProjectStep, TestCase } from '@/types/project'
import { SkillVideoPlayer } from '@/components/common/SkillVideoPlayer'
import { DigitalClockPreview } from '@/components/previews/DigitalClockPreview'
import { CalculatorPreview } from '@/components/previews/CalculatorPreview'
import { TemperatureConverterPreview } from '@/components/previews/TemperatureConverterPreview'
import { PasswordGeneratorPreview } from '@/components/previews/PasswordGeneratorPreview'
import { StudentDatabasePreview } from '@/components/previews/StudentDatabasePreview'
import { SalesAnalyticsPreview } from '@/components/previews/SalesAnalyticsPreview'
import { GradeCalculatorPreview } from '@/components/previews/GradeCalculatorPreview'
import { NumberGuesserPreview } from '@/components/previews/NumberGuesserPreview'
import { CodeDisplay } from '@/components/CodeDisplay'
import { SandboxInfo } from '@/components/SandboxInfo'
import { InteractiveProjectBuilder } from '@/components/InteractiveProjectBuilder'
import { projectBuilderConfigs } from '@/lib/project-builder-configs'
import { ProjectStepWalkthrough, type TestResult } from '@/components/project/ProjectStepWalkthrough'
import { sandbox } from '@/lib/sandboxInstance'

function toPythonLiteral(val: unknown): string {
  if (val === null) return 'None'
  if (val === true) return 'True'
  if (val === false) return 'False'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'string') return JSON.stringify(val)
  if (Array.isArray(val)) return `[${val.map(toPythonLiteral).join(', ')}]`
  if (typeof val === 'object') {
    const pairs = Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => `${JSON.stringify(k)}: ${toPythonLiteral(v)}`)
    return `{${pairs.join(', ')}}`
  }
  return JSON.stringify(val)
}

interface ProjectLearningPageProps {
  projectId: string
  onBack: () => void
  onComplete?: () => void
}

export function ProjectLearningPage({ projectId, onBack, onComplete }: ProjectLearningPageProps) {
  const [project, setProject] = useState<CatalogProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<'tutorial' | 'builder'>('tutorial')

  // ── TDD validation state ────────────────────────────────────────────────────
  // TDD mode is detected from the loaded project data (steps that have testCases)
  const [tddStepIndex, setTddStepIndex] = useState(0)
  const [isExecuting, setIsExecuting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])  
  const [isStepValidated, setIsStepValidated] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState('')
  const [isProjectCompleted, setIsProjectCompleted] = useState(false)
  // ── Tutorial video accordion state ─────────────────────────────────────────
  const [tutorialVideoOpen, setTutorialVideoOpen] = useState(false)

  // Derived: a project is TDD if its first step has test cases populated
  const isTddMode = !loading && !!project?.steps[0]?.content?.testCases?.length

  const handleRunTests = useCallback(async (code: string) => {
    if (!project) return
    const step = project.steps[tddStepIndex]
    const testCases = step?.content?.testCases
    if (!testCases?.length) return
    const language = step.content.language || 'python'
    const callableName = step.content.callableName

    setIsExecuting(true)
    setTestResults([])
    setIsStepValidated(false)
    setConsoleOutput('')

    const results: TestResult[] = []
    let terminalOutput = ''

    try {
      for (const tc of testCases) {
        let execCode = code

        if (tc.input_data !== undefined && callableName) {
          const pyLiteral = toPythonLiteral(tc.input_data)
          // Array input_data → spread as positional args; object → single arg
          const callExpr = Array.isArray(tc.input_data)
            ? `${callableName}(*__td__)`
            : `${callableName}(__td__)`
          execCode = `${code}\n\n__td__ = ${pyLiteral}\nprint(${callExpr})`
        } else if (language === 'sql' && tc.input_data !== undefined) {
          // SQL TDD setup: prepend hidden setup SQL before executing user query.
          const setupSql = typeof tc.input_data === 'string'
            ? tc.input_data
            : ((tc.input_data as { setup_sql?: unknown })?.setup_sql as string | undefined)
          if (setupSql) {
            execCode = `${setupSql}\n${code}`
          }
        }

        const result = await sandbox.execute(execCode, language)

        // Capture raw stdout from the first visible test for the terminal panel
        if (!terminalOutput && !tc.hidden) {
          const parts = [result.output?.trim(), result.error ? `Error: ${result.error}` : '']
          terminalOutput = parts.filter(Boolean).join('\n').trim()
        }

        const rawOutput = (result.output ?? '').trim()
        const lines = rawOutput.split('\n').map(l => l.trim()).filter(Boolean)
        const shouldExtractLastLine = tc.input_data !== undefined && !!callableName
        const actualOutput = shouldExtractLastLine
          ? (lines[lines.length - 1] ?? '')
          : rawOutput

        let passed = false
        if (result.error && !tc.validation_regex && !tc.input_data) {
          passed = false
        } else if (tc.expected_output !== undefined) {
          passed = actualOutput === tc.expected_output.trim()
        } else if (tc.validation_regex) {
          passed = new RegExp(tc.validation_regex).test(actualOutput)
        }

        results.push({
          hidden: tc.hidden,
          expected: tc.expected_output,
          actualOutput,
          passed,
          error: result.error,
        })
      }

      setTestResults(results)
      setConsoleOutput(terminalOutput)
      const allPassed = results.every(r => r.passed)
      setIsStepValidated(allPassed)
      // Non-blocking: save to DB if authenticated
      if (allPassed) {
        saveStepProgress(projectId, {
          step_id: tddStepIndex + 1,
          code_snapshot: code,
          passed: true,
        }).catch(() => {})
      }
    } catch (err: any) {
      // Timeout (or other fatal) errors: surface as a failed console entry
      const msg = err?.message ?? String(err)
      setConsoleOutput(msg)
      setTestResults([{
        hidden: false,
        actualOutput: '',
        passed: false,
        error: msg,
      }])
    } finally {
      // Always re-enable the Run & Test button, even if execution was aborted
      setIsExecuting(false)
    }
  }, [project, projectId, tddStepIndex])

  // Reset terminal/test state whenever the active TDD step changes
  useEffect(() => {
    setTestResults([])
    setIsStepValidated(false)
    setConsoleOutput('')
  }, [tddStepIndex])

  // ── Catalog project fetch ──────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true)
    fetchCatalogProject(projectId)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [projectId])

  // Restore persisted step completion for the tutorial view
  useEffect(() => {
    fetchUserProgress()
      .then((progress) => {
        const saved = progress.completedSteps
          .filter((s) => s.projectSlug === projectId)
          .map((s) => s.stepId)
        if (saved.length > 0) setCompletedSteps(saved)
      })
      .catch(() => {})
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-10 w-2/3 rounded-lg bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="h-64 rounded-xl bg-muted/80 mt-8" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground text-center">This project could not be loaded. It may have been removed or the catalog is unavailable.</p>
        <Button type="button" variant="default" onClick={onBack}>
          Back to projects
        </Button>
      </div>
    )
  }

  // Helper: map DB step to ProjectStep shape expected by TddStepView
  const toProjectStep = (s: CatalogProjectStep): ProjectStep => ({
    id: s.slug || String(s.id),
    title: s.title,
    instructions: s.content.description || '',
    initialCode: s.content.initialCode || '',
    testCases: (s.content.testCases || []) as TestCase[],
    callableName: s.content.callableName ?? undefined,
    videoId: s.videoId ?? undefined,
  })

  // ── TDD project view (early return) ─────────────────────────────────────────
  if (isTddMode) {
    // ── Completion celebration ──────────────────────────────────────────────
    if (isProjectCompleted) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
          <div className="max-w-lg w-full mx-auto text-center space-y-8 px-6 py-16">
            <div className="flex justify-center">
              <div className="w-28 h-28 rounded-full bg-green-500/15 flex items-center justify-center animate-bounce">
                <Trophy size={56} className="text-green-500" weight="fill" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold">Project Complete! 🎉</h1>
              <p className="text-lg text-muted-foreground">
                You successfully built a{' '}
                <span className="font-semibold text-foreground">{project.steps.length}-Step Python CRUD Engine!</span>
              </p>
            </div>
            <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-6 space-y-3 text-left">
              {project.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <CheckCircle size={18} className="text-green-600 shrink-0" weight="fill" />
                  <span className="font-medium">{s.title}</span>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              onClick={() => { onComplete?.(); onBack() }}
              className="bg-primary hover:bg-primary/90 px-10 gap-2"
            >
              <Rocket size={18} />
              Back to Projects
            </Button>
          </div>
        </div>
      )
    }

    const tddStep = toProjectStep(project.steps[tddStepIndex])
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-secondary">
                <ArrowLeft className="mr-2" size={18} />
                Back to Projects
              </Button>
              <SandboxInfo />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
                <Badge className="bg-indigo-500/15 text-indigo-600 border border-indigo-500/30">
                  TDD Mode
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Your code must pass all automated tests before you can advance.
              </p>
            </div>

            {/* Step pill navigation */}
            <div className="flex flex-wrap gap-2">
              {project.steps.map((s, i) => (
                <Badge
                  key={s.slug || s.id}
                  variant={i === tddStepIndex ? 'default' : 'secondary'}
                  className={`px-3 py-2 text-sm cursor-pointer transition-all ${
                    i === tddStepIndex ? 'bg-indigo-600 text-white scale-105' : ''
                  }`}
                  onClick={() => setTddStepIndex(i)}
                >
                  Step {i + 1}
                </Badge>
              ))}
            </div>

            <ProjectStepWalkthrough
              tddProps={{
                step: tddStep,
                language: project.steps[tddStepIndex].content.language || 'python',
                stepIndex: tddStepIndex,
                totalSteps: project.steps.length,
                testResults,
                isExecuting,
                isStepValidated,
                consoleOutput,
                onRunTests: handleRunTests,
                onNext: () => setTddStepIndex(i => i + 1),
                onPrevious: () => setTddStepIndex(i => i - 1),
                onComplete: () => setIsProjectCompleted(true),
                isFirst: tddStepIndex === 0,
                isLast: tddStepIndex === project.steps.length - 1,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Catalog tutorial view ────────────────────────────────────────────────────
  // project is guaranteed non-null here: guarded by the `if (!project && !tddConfig)` check above
  const project_ = project!
  const currentStep = project_.steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === project_.steps.length - 1

  // Check if this project has an interactive builder available
  const hasInteractiveBuilder = projectBuilderConfigs[project_.id] !== undefined

  const handleNext = () => {
    if (!isLastStep) {
      if (!completedSteps.includes(currentStep.id)) {
        setCompletedSteps([...completedSteps, currentStep.id])
        saveProjectStepProgress(projectId, currentStep.id).catch(() => {})
      }
      setCurrentStepIndex(currentStepIndex + 1)
      setTutorialVideoOpen(false)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1)
      setTutorialVideoOpen(false)
    }
  }

  const handleComplete = () => {
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps([...completedSteps, currentStep.id])
    }
    onComplete?.()
    onBack()
  }

  const getStepIcon = (step: CatalogProjectStep) => {
    switch (step.type) {
      case 'understanding': return <Brain size={20} weight="duotone" />
      case 'logic': return <ListChecks size={20} weight="duotone" />
      case 'code': return <CodeIcon size={20} weight="duotone" />
      case 'preview': return <Play size={20} weight="duotone" />
      case 'challenge': return <Lightbulb size={20} weight="duotone" />
    }
  }

  // Render interactive builder if available and selected
  if (viewMode === 'builder' && hasInteractiveBuilder) {
    return (
      <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden bg-background">
        {/* ── Slim header bar ── */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur-sm flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 h-8 text-xs"
          >
            <ArrowLeft size={15} />
            Projects
          </Button>

          <span className="text-sm font-semibold text-foreground">{project_.title}</span>

          <div className="flex items-center gap-2">
            <SandboxInfo />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('tutorial')}
              className="h-8 text-xs gap-1.5"
            >
              <Eye size={13} />
              Tutorial
            </Button>
          </div>
        </div>

        {/* ── Builder fills remaining height ── */}
        <div className="flex-1 min-h-0">
          <InteractiveProjectBuilder
            projectId={project_.id}
            projectTitle={project_.title}
            buildSteps={projectBuilderConfigs[project_.id]}
            onComplete={handleComplete}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="mr-2" size={18} />
              Back to Projects
            </Button>
            
            <div className="flex items-center gap-3">
              <SandboxInfo />
              {hasInteractiveBuilder && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setViewMode('builder')}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Rocket className="mr-2" size={16} weight="duotone" />
                  Build Interactive
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">{project_.title}</h1>
            <p className="text-muted-foreground text-lg">{project_.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {project_.steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = index === currentStepIndex
              
              return (
                <Badge
                  key={step.id}
                  variant={isCurrent ? 'default' : 'secondary'}
                  className={`px-3 py-2 text-sm transition-all cursor-pointer ${
                    isCurrent 
                      ? 'bg-accent text-accent-foreground scale-105' 
                      : isCompleted 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-secondary'
                  }`}
                  onClick={() => setCurrentStepIndex(index)}
                >
                  {isCompleted && !isCurrent && (
                    <CheckCircle className="mr-1.5" size={16} weight="fill" />
                  )}
                  Step {step.id}
                </Badge>
              )
            })}
          </div>

          <Card className="border-2 animate-slide-in-right">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  {getStepIcon(currentStep)}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Step {currentStep.id} of {project_.steps.length}
                  </div>
                  <h2 className="text-2xl font-bold">{currentStep.title}</h2>
                </div>
              </div>

              <Separator />

              {/* ── Video accordion (tutorial view) ── */}
              {currentStep.videoId && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTutorialVideoOpen(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100/70 transition-colors"
                  >
                    <span>📺 Watch Step Explanation</span>
                    {tutorialVideoOpen
                      ? <CaretUp size={14} weight="bold" className="text-indigo-400" />
                      : <CaretDown size={14} weight="bold" className="text-indigo-400" />
                    }
                  </button>
                  {tutorialVideoOpen && (
                    <div className="px-4 pb-4">
                      <SkillVideoPlayer
                        videoId={currentStep.videoId}
                        title={currentStep.title}
                        desc="Watch this video explanation before starting the step."
                        level="Beginner"
                        channel="Tutorial"
                        accentColor="bg-indigo-600"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-6 py-6 min-h-[400px]">
                {currentStep.content.description && (
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border-2 border-primary/20">
                    <p className="text-lg leading-relaxed text-foreground font-medium">
                      {currentStep.content.description}
                    </p>
                  </div>
                )}

                {currentStep.content.points && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Key Points:</h3>
                    <ul className="space-y-3">
                      {currentStep.content.points.map((point, index) => (
                        <li key={index} className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary text-sm font-semibold">{index + 1}</span>
                          </div>
                          <span className="text-foreground leading-relaxed flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentStep.content.code && (
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 font-semibold text-foreground">
                      <CodeIcon size={20} className="text-primary" />
                      Reference solution
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Read-only sample for this step. Use the builder or TDD panel when you are ready to implement.
                    </p>
                    <CodeDisplay
                      code={currentStep.content.code}
                      language={currentStep.content.language || 'typescript'}
                      title="Reference code"
                      maxHeight="560px"
                    />
                  </div>
                )}

                {currentStep.type === 'preview' && (
                  <div className="space-y-3">
                    {project_.id === 'digital-clock' && <DigitalClockPreview />}
                    {project_.id === 'calculator' && <CalculatorPreview />}
                    {project_.id === 'temperature-converter' && <TemperatureConverterPreview />}
                    {project_.id === 'password-generator' && <PasswordGeneratorPreview />}
                    {project_.id === 'student-database' && <StudentDatabasePreview />}
                    {project_.id === 'sales-analytics' && <SalesAnalyticsPreview />}
                    {project_.id === 'grade-calculator' && <GradeCalculatorPreview />}
                    {project_.id === 'number-guesser' && <NumberGuesserPreview />}
                  </div>
                )}

                {currentStep.content.challenge && (
                  <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-6 space-y-3">
                    <div className="flex items-center gap-2 text-accent font-semibold">
                      <Lightbulb size={22} weight="fill" />
                      <span>Challenge</span>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {currentStep.content.challenge}
                    </p>
                    {currentStep.content.hint && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors font-medium">
                          💡 Need a hint?
                        </summary>
                        <p className="mt-2 text-muted-foreground leading-relaxed pl-4 border-l-2 border-accent/30">
                          {currentStep.content.hint}
                        </p>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="border-2"
            >
              <ArrowLeft className="mr-2" size={18} />
              Previous
            </Button>

            {isLastStep ? (
              <Button
                size="lg"
                onClick={handleComplete}
                className="bg-accent hover:bg-accent/90"
              >
                <CheckCircle className="mr-2" size={20} weight="fill" />
                Complete Project
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90"
              >
                Next Step
                <ArrowRight className="ml-2" size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
