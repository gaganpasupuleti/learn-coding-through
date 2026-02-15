import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { careerRoles, CareerRole } from '@/lib/roadmapper'
import { CheckCircle, Lock, Briefcase, CurrencyDollar, Timer, Target } from '@phosphor-icons/react'
import {
  BackendRoadmapStage,
  ensureDemoSessionToken,
  fetchProgress,
  fetchRoadmap,
  fetchRoles,
  updateProgress,
} from '@/lib/roadmapper-api'
import { toast } from 'sonner'

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
  const [activeStageId, setActiveStageId] = useState<number | null>(null)
  const [stageMetrics, setStageMetrics] = useState<Record<number, StageMetrics>>({})
  const [backendRoleMap, setBackendRoleMap] = useState<Record<string, number>>({})
  const [roadmapStages, setRoadmapStages] = useState<BackendRoadmapStage[]>([])
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const selectedRole = useMemo(
    () => careerRoles.find((role) => role.id === selectedRoleId) ?? careerRoles[0],
    [selectedRoleId]
  )

  const getStageMetrics = (stageId: number): StageMetrics => {
    return stageMetrics[stageId] ?? defaultMetrics
  }

  const selectedBackendRoleId = backendRoleMap[selectedRole.title]

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true)
        const sessionToken = await ensureDemoSessionToken()
        setToken(sessionToken)

        const roles = await fetchRoles()
        const roleMap = roles.reduce<Record<string, number>>((acc, role) => {
          acc[role.name] = role.id
          return acc
        }, {})
        setBackendRoleMap(roleMap)

        const progressRecords = await fetchProgress(sessionToken)
        const mappedProgress = progressRecords.reduce<Record<number, StageMetrics>>((acc, record) => {
          acc[record.stage_id] = {
            quizScore: record.latest_quiz_score,
            exerciseCompletion: record.exercises_completed_pct,
          }
          return acc
        }, {})
        setStageMetrics(mappedProgress)
      } catch {
        toast.error('Unable to connect Roadmapper to backend APIs.')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  useEffect(() => {
    const loadRoadmap = async () => {
      if (!token || !selectedBackendRoleId) {
        return
      }

      try {
        const roadmap = await fetchRoadmap(selectedBackendRoleId, token)
        setRoadmapStages(roadmap.stages)
        setActiveStageId((current) => {
          if (current && roadmap.stages.some((stage) => stage.id === current)) {
            return current
          }
          return roadmap.stages[0]?.id ?? null
        })
      } catch {
        toast.error('Failed to load roadmap stages from backend.')
      }
    }

    loadRoadmap()
  }, [selectedBackendRoleId, token])

  const isStageUnlocked = (stageId: number) => {
    const stageIndex = roadmapStages.findIndex((stage) => stage.id === stageId)
    if (stageIndex <= 0) return true

    const previousStage = roadmapStages[stageIndex - 1]
    if (!previousStage) return false

    const previousMetrics = getStageMetrics(previousStage.id)
    return previousMetrics.quizScore >= previousStage.unlock_quiz_score
  }

  const updateMetric = async (stageId: number, field: keyof StageMetrics, value: number) => {
    if (!token || !selectedBackendRoleId) {
      toast.error('Backend session unavailable. Reload and try again.')
      return
    }

    const clampedValue = Math.max(0, Math.min(100, value))
    const current = stageMetrics[stageId] ?? defaultMetrics
    const updated = {
      ...current,
      [field]: clampedValue,
    }

    setStageMetrics((prev) => ({
      ...prev,
      [stageId]: updated,
    }))

    try {
      setIsSaving(true)
      await updateProgress(
        {
          role_id: selectedBackendRoleId,
          stage_id: stageId,
          lessons_completed: updated.exerciseCompletion > 0 ? 1 : 0,
          total_lessons: 1,
          exercises_completed_pct: updated.exerciseCompletion,
          latest_quiz_score: updated.quizScore,
        },
        token
      )
    } catch {
      toast.error('Failed to save progress to backend.')
    } finally {
      setIsSaving(false)
    }
  }

  const activeStage = roadmapStages.find((stage) => stage.id === activeStageId) ?? roadmapStages[0]
  const activeMetrics = activeStage ? getStageMetrics(activeStage.id) : defaultMetrics
  const activeStageIndex = activeStage ? roadmapStages.findIndex((stage) => stage.id === activeStage.id) : -1
  const nextStage = activeStageIndex >= 0 ? roadmapStages[activeStageIndex + 1] : undefined

  const overallProgress = Math.round(
    ((roadmapStages.length > 0
      ? roadmapStages.filter((stage) => {
      const metrics = getStageMetrics(stage.id)
      return metrics.quizScore >= stage.unlock_quiz_score
    }).length
      : 0) /
      Math.max(roadmapStages.length, 1)) *
      100
  )

  const activeStageTopics =
    selectedRole.stages.find((item) => item.id === activeStage?.order_number)?.topics ??
    ['Core Concepts', 'Hands-on Practice', 'Assessment Readiness']

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
                  {roadmapStages.map((stage) => {
                    const unlocked = isStageUnlocked(stage.id)
                    const metrics = getStageMetrics(stage.id)
                    const stageCompleted = metrics.quizScore >= stage.unlock_quiz_score

                    return (
                      <button
                        key={stage.id}
                        type="button"
                        className={`text-left rounded-lg border p-4 transition-all ${
                          activeStage?.id === stage.id
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
                  <h3 className="text-xl font-semibold">{activeStage?.title ?? 'Loading stage...'}</h3>
                  <p className="text-muted-foreground mt-1">{activeStage?.description ?? 'Please wait while stages load.'}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-semibold">Topics</div>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
                    {activeStageTopics.map((topic) => (
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
                        <Button
                          key={score}
                          variant="outline"
                          size="sm"
                          onClick={() => activeStage && updateMetric(activeStage.id, 'quizScore', score)}
                          disabled={!activeStage || isSaving}
                        >
                          Set {score}%
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Required: {activeStage?.unlock_quiz_score ?? 70}%</p>
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
                          onClick={() => activeStage && updateMetric(activeStage.id, 'exerciseCompletion', score)}
                          disabled={!activeStage || isSaving}
                        >
                          Set {score}%
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Recommended: {activeStage?.unlock_exercise_completion ?? 80}%</p>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-muted/40 text-sm">
                  {!nextStage
                    ? 'Final stage selected. Focus on capstone, resume building, and interview prep.'
                    : isStageUnlocked(nextStage.id)
                      ? 'Next stage is unlocked. Continue with projects, interview prep, and resume tasks.'
                      : 'Pass the stage quiz to unlock the next stage.'}
                </div>

                {isLoading && (
                  <div className="text-xs text-muted-foreground">Connecting to backend and loading roadmap...</div>
                )}
                {isSaving && (
                  <div className="text-xs text-muted-foreground">Saving progress...</div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
