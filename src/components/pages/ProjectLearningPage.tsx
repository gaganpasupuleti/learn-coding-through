import { useState } from 'react'
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
  Eye
} from '@phosphor-icons/react'
import { Project, Step } from '@/lib/projects'
import { DigitalClockPreview } from '@/components/previews/DigitalClockPreview'
import { CalculatorPreview } from '@/components/previews/CalculatorPreview'
import { TemperatureConverterPreview } from '@/components/previews/TemperatureConverterPreview'
import { PasswordGeneratorPreview } from '@/components/previews/PasswordGeneratorPreview'
import { StudentDatabasePreview } from '@/components/previews/StudentDatabasePreview'
import { SalesAnalyticsPreview } from '@/components/previews/SalesAnalyticsPreview'
import { GradeCalculatorPreview } from '@/components/previews/GradeCalculatorPreview'
import { NumberGuesserPreview } from '@/components/previews/NumberGuesserPreview'
import { CodeEditor } from '@/components/CodeEditor'
import { SandboxInfo } from '@/components/SandboxInfo'

interface ProjectLearningPageProps {
  project: Project
  onBack: () => void
}

export function ProjectLearningPage({ project, onBack }: ProjectLearningPageProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const currentStep = project.steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === project.steps.length - 1

  const handleNext = () => {
    if (!isLastStep) {
      if (!completedSteps.includes(currentStep.id)) {
        setCompletedSteps([...completedSteps, currentStep.id])
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

  const getStepIcon = (step: Step) => {
    switch (step.type) {
      case 'understanding': return <Brain size={20} weight="duotone" />
      case 'logic': return <ListChecks size={20} weight="duotone" />
      case 'code': return <CodeIcon size={20} weight="duotone" />
      case 'preview': return <Play size={20} weight="duotone" />
      case 'challenge': return <Lightbulb size={20} weight="duotone" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="mr-2" size={18} />
              Back to Projects
            </Button>
            <SandboxInfo />
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

              <div className="space-y-6">
                {currentStep.content.description && (
                  <p className="text-lg leading-relaxed text-foreground">
                    {currentStep.content.description}
                  </p>
                )}

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

                {currentStep.content.code && (
                  <div className="space-y-3">
                    <Tabs defaultValue="editor" className="w-full">
                      <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                        <TabsTrigger value="editor" className="gap-2">
                          <CodeIcon size={16} />
                          Write Code
                        </TabsTrigger>
                        <TabsTrigger value="reference" className="gap-2">
                          <Eye size={16} />
                          View Reference
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="editor" className="mt-4">
                        <CodeEditor
                          initialCode={currentStep.content.code}
                          language={currentStep.content.language || 'typescript'}
                          projectId={project.id}
                        />
                      </TabsContent>
                      
                      <TabsContent value="reference" className="mt-4">
                        <Card className="border-2 overflow-hidden">
                          <div className="bg-muted/50 px-4 py-3 border-b">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
                                <div className="w-3 h-3 rounded-full bg-accent/60"></div>
                                <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                              </div>
                              <span className="text-sm font-medium text-muted-foreground ml-2">
                                Reference Code
                              </span>
                            </div>
                          </div>
                          <div className="bg-background p-4 max-h-[400px] overflow-auto">
                            <pre className="text-sm font-mono leading-relaxed">
                              <code>{currentStep.content.code}</code>
                            </pre>
                          </div>
                        </Card>
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
