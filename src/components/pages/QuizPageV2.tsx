import { useState } from 'react'
import { CheckCircle, ListChecks, Sparkle, Target, Timer, Lock } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizPage } from '@/components/pages/QuizPage'
import { isDemoUser } from '@/lib/auth'
import {
  canAttemptDemoQuiz,
  getDemoAttemptedQuizzes,
  recordDemoQuizAttempt,
  DEMO_QUIZ_LIMIT,
} from '@/lib/demo-limits'
import { quizzes } from '@/lib/quizzes'

export function QuizPageV2() {
  const isDemo = isDemoUser()
  const [, setForceRenderKey] = useState(0)

  // Build locked quiz IDs for demo users
  const attemptedQuizzes = isDemo ? getDemoAttemptedQuizzes() : []
  const lockedQuizIds = isDemo
    ? quizzes.filter((q) => !canAttemptDemoQuiz(q.id)).map((q) => q.id)
    : []

  const handleBeforeSelect = (quizId: string): boolean => {
    if (!isDemo) return true
    if (!canAttemptDemoQuiz(quizId)) return false
    recordDemoQuizAttempt(quizId)
    setForceRenderKey((n) => n + 1)
    return true
  }

  return (
    <div data-v2-page="quiz" className="min-h-screen bg-gradient-to-b from-background to-secondary/15">
      <div className="container mx-auto px-6 py-8 space-y-6">
        <Card className="border-border/60 bg-card/90 backdrop-blur py-5">
          <CardHeader className="space-y-3">
            <Badge className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wide">
              <Sparkle size={12} className="mr-1" weight="fill" />
              Quiz Arena
            </Badge>
            <CardTitle className="text-3xl md:text-4xl tracking-tight">
              Validate Readiness with
              <span className="block text-primary">Structured Assessments</span>
            </CardTitle>
            <CardDescription className="text-base max-w-3xl leading-relaxed">
              Attempt focused quizzes, get immediate validation, and build confidence stage by stage before moving ahead.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Format</p>
                <p className="text-2xl font-semibold mt-1">MCQ + Code</p>
                <p className="text-xs text-muted-foreground mt-1">Mixed question types</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Feedback</p>
                <p className="text-2xl font-semibold mt-1">Instant</p>
                <p className="text-xs text-muted-foreground mt-1">Right/wrong explanations</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Goal</p>
                <p className="text-2xl font-semibold mt-1">Unlock Stages</p>
                <p className="text-xs text-muted-foreground mt-1">Progress-driven advancement</p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><ListChecks size={16} className="text-primary" />Focused Questions</div>
                </CardContent>
              </Card>
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><CheckCircle size={16} className="text-primary" />Clear Explanations</div>
                </CardContent>
              </Card>
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><Timer size={16} className="text-primary" />Quick Rounds</div>
                </CardContent>
              </Card>
              <Card className="py-4 border-border/60 bg-background/70">
                <CardContent className="px-4 pt-0">
                  <div className="flex items-center gap-2 text-sm font-medium"><Target size={16} className="text-primary" />Readiness Score</div>
                </CardContent>
              </Card>
            </div>

            {isDemo && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-400/40 bg-amber-500/5 px-4 py-2">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Demo mode:</strong> You can attempt any {DEMO_QUIZ_LIMIT} quizzes.{' '}
                  {attemptedQuizzes.length} of {DEMO_QUIZ_LIMIT} used.
                </p>
                <Badge variant="outline" className="border-amber-400/60 text-amber-600 rounded-full flex items-center gap-1">
                  <Lock size={11} />
                  {DEMO_QUIZ_LIMIT - attemptedQuizzes.length} remaining
                </Badge>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline">Warmup Quiz</Button>
              <Button size="sm" variant="outline">Core Quiz</Button>
              <Button size="sm" variant="outline">Challenge Quiz</Button>
              <Badge variant="secondary" className="px-3 py-1 rounded-full">Assessment</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90 backdrop-blur py-3">
          <CardContent className="px-3 md:px-4">
            <div className="rounded-xl border bg-background/50 p-1 md:p-2 v2-content-shell">
              <QuizPage lockedQuizIds={lockedQuizIds} onBeforeSelect={handleBeforeSelect} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
