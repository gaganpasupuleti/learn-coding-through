import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Rocket
} from '@phosphor-icons/react'
import { CatalogProject, CatalogProjectStep, fetchCatalogProject, fetchUserProgress, saveProjectStepProgress } from '@/lib/api'
import { DigitalClockPreview } from '@/components/previews/DigitalClockPreview'
import { CalculatorPreview } from '@/components/previews/CalculatorPreview'
import { TemperatureConverterPreview } from '@/components/previews/TemperatureConverterPreview'
import { PasswordGeneratorPreview } from '@/components/previews/PasswordGeneratorPreview'
import { StudentDatabasePreview } from '@/components/previews/StudentDatabasePreview'
import { SalesAnalyticsPreview } from '@/components/previews/SalesAnalyticsPreview'
import { GradeCalculatorPreview } from '@/components/previews/GradeCalculatorPreview'
import { NumberGuesserPreview } from '@/components/previews/NumberGuesserPreview'
import { CodeEditor } from '@/components/CodeEditor'
import { CodeDisplay } from '@/components/CodeDisplay'
import { SandboxInfo } from '@/components/SandboxInfo'
import { InteractiveProjectBuilder } from '@/components/InteractiveProjectBuilder'
import { projectBuilderConfigs } from '@/lib/project-builder-configs'
import { ProjectStepWalkthrough } from '@/components/project/ProjectStepWalkthrough'

interface ProjectLearningPageProps {
  projectId: string
  onBack: () => void
}

export function ProjectLearningPage({ projectId, onBack }: ProjectLearningPageProps) {
  const [project, setProject] = useState<CatalogProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<'tutorial' | 'builder'>('tutorial')

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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  const currentStep = project.steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === project.steps.length - 1

  // Check if this project has an interactive builder available
  const hasInteractiveBuilder = projectBuilderConfigs[project.id] !== undefined

  const handleNext = () => {
    if (!isLastStep) {
      if (!completedSteps.includes(currentStep.id)) {
        setCompletedSteps([...completedSteps, currentStep.id])
        saveProjectStepProgress(projectId, currentStep.id).catch(() => {})
      }
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleComplete = () => {
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps([...completedSteps, currentStep.id])
    }
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewMode('tutorial')}
                >
                  <Eye className="mr-2" size={16} />
                  View Tutorial
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
                <Badge variant="default" className="bg-primary">
                  <Rocket size={14} className="mr-1" weight="duotone" />
                  Interactive Mode
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">{project.description}</p>
            </div>

            <InteractiveProjectBuilder
              projectId={project.id}
              projectTitle={project.title}
              buildSteps={projectBuilderConfigs[project.id]}
              onComplete={handleComplete}
            />
          </div>
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
            <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground text-lg">{project.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.steps.map((step, index) => {
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
                    Step {currentStep.id} of {project.steps.length}
                  </div>
                  <h2 className="text-2xl font-bold">{currentStep.title}</h2>
                </div>
              </div>

              <Separator />

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
                    <Tabs defaultValue="why" className="w-full">
                      <TabsList className="grid w-full max-w-[600px] grid-cols-3">
                        <TabsTrigger value="why" className="gap-2">
                          <Lightbulb size={16} />
                          Why & How
                        </TabsTrigger>
                        <TabsTrigger value="reference" className="gap-2">
                          <Eye size={16} />
                          See It
                        </TabsTrigger>
                        <TabsTrigger value="editor" className="gap-2">
                          <CodeIcon size={16} />
                          Try It
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="why" className="mt-4 space-y-4">
                        {currentStep.content.points && (
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
                        )}
                        <ProjectStepWalkthrough
                          gifUrl={currentStep.content.walkthroughGif}
                          caption={currentStep.content.walkthroughCaption}
                        />
                      </TabsContent>

                      <TabsContent value="reference" className="mt-4">
                        <CodeDisplay
                          code={currentStep.content.code}
                          language={currentStep.content.language || 'typescript'}
                          title="Reference Code"
                          maxHeight="500px"
                        />
                      </TabsContent>
                      
                      <TabsContent value="editor" className="mt-4">
                        <CodeDisplay
                          code={currentStep.content.code}
                          language={currentStep.content.language || 'typescript'}
                          title="TypeScript Editor"
                          maxHeight="600px"
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                 )}

                {currentStep.type === 'preview' && (
                  <div className="space-y-3">
                    {project.id === 'digital-clock' && <DigitalClockPreview />}
                    {project.id === 'calculator' && <CalculatorPreview />}
                    {project.id === 'temperature-converter' && <TemperatureConverterPreview />}
                    {project.id === 'password-generator' && <PasswordGeneratorPreview />}
                    {project.id === 'student-database' && <StudentDatabasePreview />}
                    {project.id === 'sales-analytics' && <SalesAnalyticsPreview />}
                    {project.id === 'grade-calculator' && <GradeCalculatorPreview />}
                    {project.id === 'number-guesser' && <NumberGuesserPreview />}
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
