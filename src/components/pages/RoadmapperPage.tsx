import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { careerRoles, CareerRole } from '@/lib/roadmapper'
import { CheckCircle, Lock, Briefcase, CurrencyDollar, Timer, Target } from '@phosphor-icons/react'

interface StageMetrics {
  quizScore: number
  exerciseCompletion: number
}

const defaultMetrics: StageMetrics = {
  quizScore: 0,
  exerciseCompletion: 0,
}

const getDifficultyBadgeVariant = (difficulty: CareerRole['difficultyLevel']) => {
  if (difficulty === 'beginner') return 'secondary'
  if (difficulty === 'intermediate') return 'outline'
  return 'default'
}

export function RoadmapperPage() {
  const [selectedRoleId, setSelectedRoleId] = useState(careerRoles[0].id)
  const [activeStageId, setActiveStageId] = useState(1)
  const [stageMetrics, setStageMetrics] = useState<Record<string, StageMetrics>>({})

  const selectedRole = useMemo(
    () => careerRoles.find((role) => role.id === selectedRoleId) ?? careerRoles[0],
    [selectedRoleId]
  )

  const getStageKey = (stageId: number) => `${selectedRole.id}-${stageId}`

  const getStageMetrics = (stageId: number): StageMetrics => {
    const key = getStageKey(stageId)
    return stageMetrics[key] ?? defaultMetrics
  }

  const isStageUnlocked = (stageId: number) => {
    if (stageId === 1) return true

    const previousStage = selectedRole.stages.find((stage) => stage.id === stageId - 1)
    if (!previousStage) return false

    const metrics = getStageMetrics(previousStage.id)
    return metrics.quizScore >= previousStage.quizPassThreshold
  }

  const updateMetric = (stageId: number, field: keyof StageMetrics, value: number) => {
    const key = getStageKey(stageId)
    const current = stageMetrics[key] ?? defaultMetrics
    setStageMetrics((prev) => ({
      ...prev,
      [key]: {
        ...current,
        [field]: Math.max(0, Math.min(100, value)),
      },
    }))
  }

  const activeStage = selectedRole.stages.find((stage) => stage.id === activeStageId) ?? selectedRole.stages[0]
  const activeMetrics = getStageMetrics(activeStage.id)

  const overallProgress = Math.round(
    (selectedRole.stages.filter((stage) => {
      const metrics = getStageMetrics(stage.id)
      return metrics.quizScore >= stage.quizPassThreshold
    }).length /
      selectedRole.stages.length) *
      100
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Career Roadmapper</h1>
            <p className="text-muted-foreground text-lg">
              Choose a target role, complete stages, and unlock your job-focused acceleration path.
            </p>
          </div>

          <div className="grid lg:grid-cols-[340px_1fr] gap-6">
            <Card className="p-4 space-y-4 h-fit lg:sticky lg:top-24">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Target Job Roles</h2>
                <p className="text-sm text-muted-foreground">Select a role to load roadmap stages.</p>
              </div>

              <div className="space-y-2">
                {careerRoles.map((role) => (
                  <Button
                    key={role.id}
                    variant={selectedRole.id === role.id ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedRoleId(role.id)
                      setActiveStageId(1)
                    }}
                  >
                    {role.title}
                  </Button>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6 space-y-4 border-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold">{selectedRole.title}</h2>
                  <Badge variant={getDifficultyBadgeVariant(selectedRole.difficultyLevel)}>
                    {selectedRole.difficultyLevel}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border p-3 bg-card">
                    <div className="flex items-center gap-2 font-semibold"><CurrencyDollar size={16} /> Salary</div>
                    <div className="text-muted-foreground mt-1">{selectedRole.salaryRange}</div>
                  </div>
                  <div className="rounded-lg border p-3 bg-card">
                    <div className="flex items-center gap-2 font-semibold"><Timer size={16} /> Duration</div>
                    <div className="text-muted-foreground mt-1">{selectedRole.estimatedDuration}</div>
                  </div>
                  <div className="rounded-lg border p-3 bg-card">
                    <div className="flex items-center gap-2 font-semibold"><Target size={16} /> Progress</div>
                    <div className="text-muted-foreground mt-1">{overallProgress}% completed</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Skills Required</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.skillsRequired.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Companies Hiring</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.companiesHiring.map((company) => (
                      <Badge key={company} variant="outline">
                        <Briefcase size={12} className="mr-1" />
                        {company}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4 border-2">
                <h3 className="text-xl font-semibold">Stage Roadmap</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedRole.stages.map((stage) => {
                    const unlocked = isStageUnlocked(stage.id)
                    const metrics = getStageMetrics(stage.id)
                    const stageCompleted = metrics.quizScore >= stage.quizPassThreshold

                    return (
                      <button
                        key={stage.id}
                        type="button"
                        className={`text-left rounded-lg border p-4 transition-all ${
                          activeStage.id === stage.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card'
                        } ${!unlocked ? 'opacity-70 cursor-not-allowed' : 'hover:border-primary/40'}`}
                        onClick={() => unlocked && setActiveStageId(stage.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{stage.title}</div>
                          {unlocked ? (
                            stageCompleted ? (
                              <CheckCircle size={18} className="text-emerald-600" weight="fill" />
                            ) : (
                              <Badge variant="outline">Open</Badge>
                            )
                          ) : (
                            <Lock size={18} className="text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                      </button>
                    )
                  })}
                </div>
              </Card>

              <Card className="p-6 border-2 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{activeStage.title}</h3>
                  <p className="text-muted-foreground mt-1">{activeStage.description}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-semibold">Topics</div>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
                    {activeStage.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Quiz Score ({activeMetrics.quizScore}%)</div>
                    <Progress value={activeMetrics.quizScore} className="h-2" />
                    <div className="flex gap-2">
                      {[50, 70, 85].map((score) => (
                        <Button key={score} variant="outline" size="sm" onClick={() => updateMetric(activeStage.id, 'quizScore', score)}>
                          Set {score}%
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Required: {activeStage.quizPassThreshold}%</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Exercise Completion ({activeMetrics.exerciseCompletion}%)</div>
                    <Progress value={activeMetrics.exerciseCompletion} className="h-2" />
                    <div className="flex gap-2">
                      {[60, 80, 100].map((score) => (
                        <Button
                          key={score}
                          variant="outline"
                          size="sm"
                          onClick={() => updateMetric(activeStage.id, 'exerciseCompletion', score)}
                        >
                          Set {score}%
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Recommended: {activeStage.exerciseCompletionThreshold}%</p>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-muted/40 text-sm">
                  {isStageUnlocked(activeStage.id + 1)
                    ? 'Next stage is unlocked. Continue with projects, interview prep, and resume tasks.'
                    : 'Pass the stage quiz to unlock the next stage.'}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
