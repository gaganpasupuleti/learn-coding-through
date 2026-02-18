import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Lock, Briefcase, CurrencyDollar, Timer, Target, ListChecks } from '@phosphor-icons/react'
import {
  ApiError,
  BackendRole,
  BackendRoadmapStage,
  clearStoredToken,
  ensureRoadmapperToken,
  fetchProgress,
  fetchRoadmap,
  fetchRoles,
  getStoredToken,
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

const SELECTED_ROLE_KEY = 'career-portal-selected-role-id'

const getDifficultyBadgeVariant = (difficulty: string) => {
  if (difficulty === 'beginner') return 'secondary'
  if (difficulty === 'intermediate') return 'outline'
  return 'default'
}

const formatApiError = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    const endpoint = error.endpoint.startsWith('/') ? error.endpoint : `/${error.endpoint}`
    const status = error.status === 0 ? 'NETWORK' : String(error.status)
    return `[${status}] ${endpoint}: ${error.message}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

export function RoadmapperPage() {
  const [roles, setRoles] = useState<BackendRole[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(() => {
    const stored = localStorage.getItem(SELECTED_ROLE_KEY)
    if (!stored) return null
    const parsed = Number(stored)
    return Number.isFinite(parsed) ? parsed : null
  })
  const [activeStageId, setActiveStageId] = useState<number | null>(null)
  const [stageMetrics, setStageMetrics] = useState<Record<number, StageMetrics>>({})
  const [roadmapStages, setRoadmapStages] = useState<BackendRoadmapStage[]>([])
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  )

  const getStageMetrics = (stageId: number): StageMetrics => {
    return stageMetrics[stageId] ?? defaultMetrics
  }

  const chooseRole = (roleId: number) => {
    setSelectedRoleId(roleId)
    localStorage.setItem(SELECTED_ROLE_KEY, String(roleId))
  }

  const resetSelectedRole = () => {
    setSelectedRoleId(null)
    setRoadmapStages([])
    setActiveStageId(null)
    localStorage.removeItem(SELECTED_ROLE_KEY)
  }

  useEffect(() => {
    const loadRolesAndProgress = async () => {
      if (!token) {
        try {
          setIsLoading(true)
          setApiError(null)
          const autoToken = await ensureRoadmapperToken()
          setToken(autoToken)
        } catch (error) {
          const message = formatApiError(error, 'Failed to initialize Roadmapper session.')
          setApiError(message)
          toast.error(message)
        } finally {
          setIsLoading(false)
        }
        return
      }

      try {
        setIsLoading(true)
        setApiError(null)

        const [loadedRoles, progressRecords] = await Promise.all([
          fetchRoles(),
          fetchProgress(token),
        ])

        setRoles(loadedRoles)
        setSelectedRoleId((current) => {
          if (current && loadedRoles.some((role) => role.id === current)) {
            return current
          }
          localStorage.removeItem(SELECTED_ROLE_KEY)
          return null
        })

        const mappedProgress = progressRecords.reduce<Record<number, StageMetrics>>((acc, record) => {
          acc[record.stage_id] = {
            quizScore: record.latest_quiz_score,
            exerciseCompletion: record.exercises_completed_pct,
          }
          return acc
        }, {})
        setStageMetrics(mappedProgress)
      } catch (error) {
        const message = formatApiError(error, 'Failed to load roles and progress.')
        setApiError(message)
        toast.error(message)
        if (error instanceof ApiError && error.status === 401) {
          clearStoredToken()
          setToken(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadRolesAndProgress()
  }, [token])

  useEffect(() => {
    const loadRoadmap = async () => {
      if (!token || !selectedRoleId) {
        return
      }

      try {
        setApiError(null)
        const roadmap = await fetchRoadmap(selectedRoleId, token)
        setRoadmapStages(roadmap.stages)
        setActiveStageId((current) => {
          if (current && roadmap.stages.some((stage) => stage.id === current)) {
            return current
          }
          return roadmap.stages[0]?.id ?? null
        })
      } catch (error) {
        const message = formatApiError(error, 'Failed to load roadmap stages.')
        setApiError(message)
        toast.error(message)
      }
    }

    loadRoadmap()
  }, [selectedRoleId, token])

  const isStageUnlocked = (stageId: number) => {
    const stageIndex = roadmapStages.findIndex((stage) => stage.id === stageId)
    if (stageIndex <= 0) return true

    const previousStage = roadmapStages[stageIndex - 1]
    if (!previousStage) return false

    const previousMetrics = getStageMetrics(previousStage.id)
    return previousMetrics.quizScore >= previousStage.unlock_quiz_score
  }

  const updateMetric = async (stageId: number, field: keyof StageMetrics, value: number) => {
    if (!token || !selectedRoleId) {
      toast.error('Session unavailable. Please refresh and try again.')
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
      setApiError(null)
      await updateProgress(
        {
          role_id: selectedRoleId,
          stage_id: stageId,
          lessons_completed: updated.exerciseCompletion > 0 ? 1 : 0,
          total_lessons: 1,
          exercises_completed_pct: updated.exerciseCompletion,
          latest_quiz_score: updated.quizScore,
        },
        token
      )
    } catch (error) {
      const message = formatApiError(error, 'Failed to save progress.')
      setApiError(message)
      toast.error(message)
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

  const activeStageTopics = ['Core Concepts', 'Hands-on Practice', 'Assessment Readiness']

  const completedStages = roadmapStages.filter((stage) => {
    const metrics = getStageMetrics(stage.id)
    const requiredExercise = stage.unlock_exercise_completion ?? 0
    return metrics.quizScore >= stage.unlock_quiz_score && metrics.exerciseCompletion >= requiredExercise
  })

  const inProgressStages = roadmapStages.filter((stage) => {
    const metrics = getStageMetrics(stage.id)
    const requiredExercise = stage.unlock_exercise_completion ?? 0
    const isCompleted = metrics.quizScore >= stage.unlock_quiz_score && metrics.exerciseCompletion >= requiredExercise
    return isStageUnlocked(stage.id) && !isCompleted
  })

  const pendingLockedStages = roadmapStages.filter((stage) => !isStageUnlocked(stage.id))

  const activeStageAssignments = activeStage
    ? [
      {
        label: `Reach quiz score ${activeStage.unlock_quiz_score}%`,
        done: activeMetrics.quizScore >= activeStage.unlock_quiz_score,
      },
      {
        label: `Reach exercise completion ${activeStage.unlock_exercise_completion ?? 80}%`,
        done: activeMetrics.exerciseCompletion >= (activeStage.unlock_exercise_completion ?? 80),
      },
      {
        label: nextStage ? `Unlock next stage: ${nextStage.title}` : 'Complete capstone and interview prep',
        done: nextStage ? isStageUnlocked(nextStage.id) : completedStages.length === roadmapStages.length && roadmapStages.length > 0,
      },
    ]
    : []

  if (!token && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto px-6 py-10 max-w-xl">
          <Card className="p-6 border-2 space-y-3">
            <h1 className="text-2xl font-bold">Career Mapper</h1>
            <p className="text-sm text-muted-foreground">Preparing your Career Mapper session...</p>
            {apiError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {apiError}
              </div>
            )}
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Career Mapper</h1>
            <p className="text-muted-foreground text-lg">
              Choose a target role, complete stages, and unlock your job-focused acceleration path.
            </p>
          </div>

          {apiError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}

          {!selectedRole ? (
            <Card className="p-6 border-2 space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Career Explorer</h2>
                <p className="text-sm text-muted-foreground">
                  Explore role outcomes first. Choose one role to start your staged learning path.
                </p>
              </div>

              {!isLoading && roles.length === 0 && (
                <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                  No roles available right now. Please try again shortly.
                </div>
              )}

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <Card key={role.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold">{role.name}</h3>
                      <Badge variant={getDifficultyBadgeVariant(role.difficulty_level)}>{role.difficulty_level}</Badge>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2"><CurrencyDollar size={14} /> {role.salary_range}</div>
                      <div className="flex items-center gap-2"><Timer size={14} /> {role.estimated_duration_weeks} weeks</div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold mb-2">Top Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {role.skills_required.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full" onClick={() => chooseRole(role.id)} disabled={isLoading}>
                      Choose This Role
                    </Button>
                  </Card>
                ))}
              </div>

              {isLoading && (
                <div className="text-xs text-muted-foreground">Connecting to backend and loading roles...</div>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="p-6 space-y-4 border-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold">{selectedRole.name}</h2>
                    <Badge variant={getDifficultyBadgeVariant(selectedRole.difficulty_level)}>
                      {selectedRole.difficulty_level}
                    </Badge>
                  </div>
                  <Button variant="outline" onClick={resetSelectedRole}>Change Role</Button>
                </div>

                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border p-3 bg-card">
                    <div className="flex items-center gap-2 font-semibold"><CurrencyDollar size={16} /> Salary</div>
                    <div className="text-muted-foreground mt-1">{selectedRole.salary_range}</div>
                  </div>
                  <div className="rounded-lg border p-3 bg-card">
                    <div className="flex items-center gap-2 font-semibold"><Timer size={16} /> Duration</div>
                    <div className="text-muted-foreground mt-1">{selectedRole.estimated_duration_weeks} weeks</div>
                  </div>
                  <div className="rounded-lg border p-3 bg-card">
                    <div className="flex items-center gap-2 font-semibold"><Target size={16} /> Progress</div>
                    <div className="text-muted-foreground mt-1">{overallProgress}% completed</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Skills Required</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.skills_required.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Companies Hiring</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.companies_hiring.map((company) => (
                      <Badge key={company} variant="outline">
                        <Briefcase size={12} className="mr-1" />
                        {company}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 space-y-4">
                <div className="flex items-center gap-2">
                  <ListChecks size={18} className="text-primary" weight="duotone" />
                  <h3 className="text-xl font-semibold">Stage Progress & Pending Assignments</h3>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-lg border p-4 bg-card space-y-3">
                    <div className="font-semibold">Completed So Far ({completedStages.length})</div>
                    {completedStages.length === 0 ? (
                      <p className="text-muted-foreground">No stage fully completed yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {completedStages.map((stage) => (
                          <Badge key={stage.id} variant="secondary" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                            <CheckCircle size={12} className="mr-1" weight="fill" />
                            {stage.title}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border p-4 bg-card space-y-3">
                    <div className="font-semibold">Current Stage</div>
                    <div className="text-muted-foreground">{activeStage?.title ?? 'No active stage selected'}</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">In Progress: {inProgressStages.length}</Badge>
                      <Badge variant="outline">Locked: {pendingLockedStages.length}</Badge>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 bg-card space-y-3">
                    <div className="font-semibold">Pending Tasks / Assignments</div>
                    {activeStageAssignments.length === 0 ? (
                      <p className="text-muted-foreground">Select a stage to see assignments.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeStageAssignments.map((assignment) => (
                          <div key={assignment.label} className="flex items-start gap-2">
                            {assignment.done ? (
                              <CheckCircle size={14} className="text-emerald-600 mt-0.5" weight="fill" />
                            ) : (
                              <Lock size={14} className="text-amber-600 mt-0.5" />
                            )}
                            <span className={assignment.done ? 'text-foreground' : 'text-muted-foreground'}>{assignment.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <div className="grid xl:grid-cols-[380px_1fr] gap-6">
                <Card className="p-6 space-y-4 border-2 h-fit">
                  <h3 className="text-xl font-semibold">Stage Roadmap</h3>
                  <div className="space-y-3">
                    {!isLoading && roadmapStages.length === 0 && (
                      <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                        No stages found for this role yet.
                      </div>
                    )}
                    {roadmapStages.map((stage) => {
                      const unlocked = isStageUnlocked(stage.id)
                      const metrics = getStageMetrics(stage.id)
                      const stageCompleted = metrics.quizScore >= stage.unlock_quiz_score

                      return (
                        <button
                          key={stage.id}
                          type="button"
                          className={`w-full text-left rounded-lg border p-4 transition-all ${
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
                            disabled={!activeStage || isSaving || isLoading}
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
                            disabled={!activeStage || isSaving || isLoading}
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
          )}
        </div>
      </div>
    </div>
  )
}
