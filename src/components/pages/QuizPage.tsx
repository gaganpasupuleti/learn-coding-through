import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CodeDisplay } from '@/components/CodeDisplay'
import {
  CatalogQuiz as Quiz,
  CatalogQuizSummary,
  CatalogQuizQuestion as QuizQuestion,
  QuizAttemptSubmitResult,
  fetchCatalogQuizzes,
  fetchCatalogQuiz,
  startCatalogQuizAttempt,
  submitCatalogQuizAttempt,
} from '@/lib/api'
import { logQuizWrongAnswersToMistakesReview } from '@/lib/quiz-mistakes-adapter'
import { applyAttemptShuffle } from '@/lib/quiz-shuffle'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, ListChecks, Lock, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { isDemoUser } from '@/lib/auth'
import {
  canAttemptDemoQuiz,
  recordDemoQuizAttempt,
  triggerQuizLockedError,
} from '@/lib/demo-limits'

const normalizeText = (value: string) => value.trim().replace(/\r\n/g, '\n')

const getQuestionTypeLabel = (type: QuizQuestion['type']) => {
  switch (type) {
    case 'multiple-choice':
      return 'Multiple Choice'
    case 'true-false':
      return 'True or False'
    case 'code-completion':
      return 'Code Completion'
    case 'code-output':
      return 'Code Output'
    case 'fill-blank':
      return 'Fill in the Blank'
    case 'sql-query':
      return 'SQL Query'
    case 'python-debug':
      return 'Python Debugging'
    case 'scenario':
      return 'Scenario'
  }
}

const isChoiceQuestion = (question: QuizQuestion): question is QuizQuestion & { options: string[]; correctIndex: number } =>
  question.type === 'multiple-choice' ||
  question.type === 'true-false' ||
  (question.type === 'scenario' && Array.isArray(question.options) && question.options.length > 0)

const isTextAnswerQuestion = (
  question: QuizQuestion,
): question is QuizQuestion & { answer: string; acceptableAnswers?: string[] | null } =>
  question.type === 'code-completion' ||
  question.type === 'fill-blank' ||
  question.type === 'sql-query' ||
  question.type === 'python-debug' ||
  (question.type === 'scenario' && (!question.options || question.options.length === 0))

const getLetter = (index: number) => String.fromCharCode(65 + index)

const getCorrectAnswerText = (question: QuizQuestion) => {
  if (isChoiceQuestion(question)) {
    const correctOption = question.options[question.correctIndex]
    return `${getLetter(question.correctIndex)}. ${correctOption}`
  }

  if (isTextAnswerQuestion(question)) {
    return question.answer
  }

  if (question.type === 'code-output') {
    return question.expectedOutput
  }

  return ''
}

const getUserAnswerText = (question: QuizQuestion, answer: string | number | undefined) => {
  if (answer === undefined) {
    return 'No answer provided'
  }

  if (isChoiceQuestion(question)) {
    const selectedIndex = Number(answer)
    const selectedOption = question.options[selectedIndex]

    if (!selectedOption) {
      return 'No answer provided'
    }

    return `${getLetter(selectedIndex)}. ${selectedOption}`
  }

  return String(answer)
}

const getWhyWrongText = (question: QuizQuestion, answer: string | number | undefined) => {
  if (isChoiceQuestion(question)) {
    const userAnswer = getUserAnswerText(question, answer)
    const correctAnswer = getCorrectAnswerText(question)
    return `You selected ${userAnswer}, but the correct choice is ${correctAnswer}. ${question.explanation}`
  }

  if (isTextAnswerQuestion(question)) {
    return `Your answer does not match the expected response. ${question.explanation}`
  }

  if (question.type === 'code-output') {
    return `Your output does not match the exact expected output. ${question.explanation}`
  }

  return question.explanation
}

/** Challenge countdown length (HackerRank-style timer); does not auto-submit when it hits zero. */
const QUIZ_CHALLENGE_SECONDS = 15 * 60

const getWhyRightText = (question: QuizQuestion) => {
  if (isChoiceQuestion(question)) {
    return `${getCorrectAnswerText(question)} is correct because ${question.explanation.charAt(0).toLowerCase()}${question.explanation.slice(1)}`
  }

  return question.explanation
}

interface QuizPageProps {
  /** Quiz IDs that should be shown as locked (demo limit reached). */
  lockedQuizIds?: string[]
  /** Called before a quiz is selected; return false to block selection. */
  onBeforeSelect?: (quizId: string) => boolean
  /** Pre-select a specific quiz by slug on mount. */
  initialQuizId?: string
  /** Called when the user clicks "Finish Quiz" on the last question. */
  onComplete?: (passed: boolean) => void
  /** Override the "back to list" action (e.g. navigate back to roadmap). */
  onBack?: () => void
}

export function QuizPage({ lockedQuizIds = [], onBeforeSelect, initialQuizId, onComplete, onBack }: QuizPageProps = {}) {
  const [quizList, setQuizList] = useState<CatalogQuizSummary[]>([])
  const [quizzesLoading, setQuizzesLoading] = useState(true)
  const [quizListError, setQuizListError] = useState(false)
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(initialQuizId ?? null)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [draftAnswers, setDraftAnswers] = useState<Record<number, string | number>>({})
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({})
  /** Elapsed seconds for the active quiz; starts when the quiz payload is ready (not when the list is shown). Resets per quiz id. */
  const [elapsedSec, setElapsedSec] = useState(0)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [quizResult, setQuizResult] = useState<QuizAttemptSubmitResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const demoMode = isDemoUser()

  useEffect(() => {
    if (!selectedQuiz) {
      setElapsedSec(0)
      return
    }
    setElapsedSec(0)
    const t0 = Date.now()
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - t0) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [selectedQuiz?.id])

  const loadQuizList = useCallback(() => {
    setQuizzesLoading(true)
    setQuizListError(false)
    fetchCatalogQuizzes()
      .then((list) => {
        setQuizList(list)
      })
      .catch(() => {
        setQuizList([])
        setQuizListError(true)
      })
      .finally(() => setQuizzesLoading(false))
  }, [])

  useEffect(() => {
    loadQuizList()
  }, [loadQuizList])

  useEffect(() => {
    if (!selectedQuizId) return
    setQuizLoading(true)
    setQuizResult(null)
    setAttemptId(null)
    Promise.all([fetchCatalogQuiz(selectedQuizId), startCatalogQuizAttempt(selectedQuizId)])
      .then(([quiz, attempt]) => {
        if (attempt) {
          setAttemptId(attempt.attempt_id)
          setSelectedQuiz(applyAttemptShuffle(quiz, attempt))
          return
        }
        setSelectedQuiz(quiz)
      })
      .catch(() => setSelectedQuiz(null))
      .finally(() => setQuizLoading(false))
  }, [selectedQuizId])

  const resetQuizState = () => {
    setCurrentQuestionIndex(0)
    setDraftAnswers({})
    setSubmittedAnswers({})
    setSelectedQuiz(null)
    setAttemptId(null)
    setQuizResult(null)
    setIsSubmitting(false)
  }

  const handleSelectQuiz = (quizId: string) => {
    if (onBeforeSelect && !onBeforeSelect(quizId)) return

    if (demoMode && !canAttemptDemoQuiz(quizId)) {
      triggerQuizLockedError()
      return
    }

    if (demoMode) {
      recordDemoQuizAttempt(quizId)
    }

    resetQuizState()
    setSelectedQuizId(quizId)
  }

  const handleBackToList = () => {
    if (onBack) { onBack(); return }
    resetQuizState()
    setSelectedQuizId(null)
  }

  const evaluateAnswer = (question: QuizQuestion, answer: string | number) => {
    if (isChoiceQuestion(question)) {
      return Number(answer) === question.correctIndex
    }

    if (isTextAnswerQuestion(question)) {
      const normalized = normalizeText(String(answer))
      const acceptableAnswers = question.acceptableAnswers ?? [question.answer]
      return acceptableAnswers.some((option) => normalizeText(option) === normalized)
    }

    if (question.type === 'code-output') {
      return normalizeText(String(answer)) === normalizeText(question.expectedOutput)
    }

    return false
  }

  const handleFinishQuiz = async (quiz: Quiz) => {
    const answers = quiz.questions
      .filter((item) => draftAnswers[item.id] !== undefined)
      .map((item) => ({
        question_id: item.id,
        answer: draftAnswers[item.id],
      }))
    const answeredCorrect = Object.values(submittedAnswers).filter(Boolean).length
    const localPassed = answeredCorrect >= Math.ceil(quiz.questions.length * 0.6)

    if (!attemptId) {
      onComplete?.(localPassed)
      handleBackToList()
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitCatalogQuizAttempt(attemptId, answers, elapsedSec)
      if (!result) {
        toast.error('Could not save quiz attempt. Showing local score only.')
        onComplete?.(localPassed)
        handleBackToList()
        return
      }
      setQuizResult(result)
      logQuizWrongAnswersToMistakesReview(result.wrong_answers, quiz.title)
      onComplete?.(result.passed)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAnswer = (question: QuizQuestion) => {
    const answer = draftAnswers[question.id]

    if (answer === undefined || String(answer).trim() === '') {
      toast.error('Pick or type an answer first.')
      return
    }

    if (submittedAnswers[question.id] !== undefined) {
      return
    }

    const isCorrect = evaluateAnswer(question, answer)
    setSubmittedAnswers((prev) => ({ ...prev, [question.id]: isCorrect }))

    if (isCorrect) {
      toast.success('Nice! That is correct.')
    } else {
      toast.error('Not quite. Review the explanation.')
    }
  }

  const handleNext = (quiz: Quiz) => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  if (!selectedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Quiz Zone</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Test your knowledge with short quizzes. Each one is quick, focused, and beginner friendly.
              </p>
            </div>

            {quizzesLoading || quizLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                {quizLoading ? 'Loading quiz...' : 'Loading quizzes...'}
              </div>
            ) : quizListError ? (
              <div className="text-center py-16 space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6">
                <p className="text-muted-foreground">Could not load quizzes. Check the API and try again.</p>
                <Button type="button" onClick={loadQuizList} variant="default">
                  Retry
                </Button>
              </div>
            ) : quizList.length === 0 ? (
              <div className="text-center py-16 space-y-3 text-muted-foreground">
                <p>No quizzes are published yet.</p>
                <Button type="button" variant="outline" onClick={loadQuizList}>
                  Refresh
                </Button>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 gap-6 pt-4">
              {quizList.map((quiz) => {
                const isLockedByProps = lockedQuizIds.includes(quiz.id)
                const isLockedByDemo = demoMode && !canAttemptDemoQuiz(quiz.id)
                const isLocked = isLockedByProps || isLockedByDemo
                return (
                  <Card
                    key={quiz.id}
                    className={`transition-all duration-300 border-2 bg-card relative ${
                      isLocked ? 'opacity-70' : 'hover:shadow-xl hover:-translate-y-1 hover:border-primary/50'
                    }`}
                  >
                    {isLocked && (
                      <div className="absolute inset-0 rounded-xl bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 gap-2">
                        <Lock size={20} className="text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground text-center px-4">
                          Demo limit reached. Upgrade for full access.
                        </p>
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">{quiz.title}</h2>
                        <p className="text-muted-foreground">{quiz.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="px-3 py-1">
                          {quiz.difficulty}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                          {quiz.estimatedTime}
                        </Badge>
                        <Badge className="px-3 py-1 bg-primary/10 text-primary">
                          {quiz.questionCount} Questions
                        </Badge>
                      </div>

                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                        onClick={() => handleSelectQuiz(quiz.id)}
                        disabled={isLocked}
                      >
                        {isLocked ? (
                          <>
                            <Lock size={16} className="mr-2" />
                            Locked
                          </>
                        ) : (
                          <>
                            Start Quiz
                            <ArrowRight className="ml-2" size={18} weight="bold" />
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6 py-12 max-w-3xl space-y-6">
          <Card className="border-2 p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Quiz Result</h1>
              <p className="text-muted-foreground">{selectedQuiz.title}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Score</p>
                <p className="text-3xl font-bold">{quizResult.score}%</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Correct</p>
                <p className="text-3xl font-bold">
                  {quizResult.correct_count}/{quizResult.total_questions}
                </p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Time</p>
                <p className="text-3xl font-bold">{quizResult.time_taken_seconds}s</p>
              </div>
            </div>
            <div className="text-center">
              <Badge className={quizResult.passed ? 'bg-emerald-500/15 text-emerald-700' : 'bg-rose-500/15 text-rose-700'}>
                {quizResult.passed ? 'Passed' : 'Keep practicing'}
              </Badge>
            </div>
            {quizResult.wrong_answers.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Wrong answers saved to Mistakes Review</h2>
                <ul className="space-y-2">
                  {quizResult.wrong_answers.map((item) => (
                    <li key={item.question_id} className="rounded-md border border-rose-200 bg-rose-50/70 p-3 text-sm">
                      <p className="font-medium text-rose-900">{item.title}</p>
                      <p className="mt-1 text-rose-800">
                        Your answer: {item.user_answer} · Correct: {item.correct_answer}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Button className="w-full" onClick={handleBackToList}>
              Back to Quiz Zone
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const question = selectedQuiz.questions[currentQuestionIndex]
  const isSubmitted = submittedAnswers[question.id] !== undefined
  const isCorrect = submittedAnswers[question.id] === true
  const answeredCount = Object.keys(submittedAnswers).length
  const correctCount = Object.values(submittedAnswers).filter(Boolean).length
  const progressValue = (answeredCount / selectedQuiz.questions.length) * 100
  const draftAnswer = draftAnswers[question.id]
  const isLastQuestion = currentQuestionIndex === selectedQuiz.questions.length - 1
  const remainingSec = Math.max(0, QUIZ_CHALLENGE_SECONDS - elapsedSec)
  const challengeTimeLabel = `${String(Math.floor(remainingSec / 60)).padStart(2, '0')}:${String(remainingSec % 60).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl py-3 space-y-3">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button variant="ghost" size="sm" onClick={handleBackToList} className="shrink-0 hover:bg-secondary -ml-2">
                <ArrowLeft className="mr-1" size={18} />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold tracking-tight truncate">{selectedQuiz.title}</h1>
                <p className="text-xs text-muted-foreground truncate md:max-w-md">{selectedQuiz.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
              <Badge className="px-2.5 py-1 text-xs font-semibold bg-amber-500/15 text-amber-900 border border-amber-400/50">
                Challenge
              </Badge>
              <Badge variant="secondary" className="px-2.5 py-1 text-xs font-medium tabular-nums">
                Q{currentQuestionIndex + 1} / {selectedQuiz.questions.length}
              </Badge>
              <Badge variant="outline" className="px-2.5 py-1 text-xs tabular-nums gap-1" title="Time remaining for this attempt (optional pacing aid; quiz does not auto-submit).">
                <Clock size={14} weight="duotone" className="opacity-80" />
                {challengeTimeLabel}
              </Badge>
              <Badge variant="secondary" className="px-2.5 py-1 text-xs hidden md:inline-flex">
                {correctCount}/{selectedQuiz.questions.length} correct
              </Badge>
              <Badge className="px-2.5 py-1 text-xs bg-primary/10 text-primary hidden md:inline-flex">
                {answeredCount} answered
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="tabular-nums">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6 max-w-6xl space-y-5">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
          {selectedQuiz.questions.map((item, index) => {
            const submitted = submittedAnswers[item.id] !== undefined
            const isCurrent = index === currentQuestionIndex
            const isCorrectAnswer = submittedAnswers[item.id] === true

            return (
              <Badge
                key={item.id}
                variant={isCurrent ? 'default' : 'secondary'}
                className={`px-3 py-2 text-sm transition-all cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'bg-accent text-accent-foreground scale-105'
                    : submitted
                      ? isCorrectAnswer
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : 'bg-rose-500/15 text-rose-700'
                      : 'bg-secondary'
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                Q{item.id}
              </Badge>
            )
          })}
        </div>

        <Card className="border-2 animate-slide-in-right overflow-hidden">
          <div className="grid md:grid-cols-2 md:divide-x md:divide-border">
            {/* Stem: prompt, type, reference code */}
            <div className="p-6 md:p-8 space-y-5 md:pr-8 bg-muted/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                  <ListChecks size={20} weight="duotone" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold leading-snug">{question.title}</h2>
                </div>
              </div>
              <Separator className="md:hidden" />
              <div className="space-y-3">
                <Badge variant="outline" className="px-3 py-1">
                  {getQuestionTypeLabel(question.type)}
                </Badge>
                <p className="text-base md:text-lg leading-relaxed text-foreground">{question.prompt}</p>
              </div>
              {question.code ? (
                <CodeDisplay
                  code={question.code}
                  language={question.language ?? 'javascript'}
                  title="Code"
                  maxHeight="280px"
                />
              ) : null}
            </div>

            {/* Answer controls + feedback */}
            <div className="p-6 md:p-8 space-y-5 md:pl-8">
              {isChoiceQuestion(question) ? (
                <div className="grid gap-3">
                  {question.options.map((option, index) => {
                    const isSelected = draftAnswer === index
                    const isCorrectOption = index === question.correctIndex
                    return (
                      <Button
                        key={option}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`justify-start text-left h-auto py-3 ${
                          isSubmitted && isCorrectOption ? 'ring-2 ring-emerald-500/40' : ''
                        }`}
                        onClick={() =>
                          setDraftAnswers((prev) => ({
                            ...prev,
                            [question.id]: index,
                          }))
                        }
                        disabled={isSubmitted}
                      >
                        <span className="mr-3 text-xs font-semibold text-muted-foreground">
                          {getLetter(index)}
                        </span>
                        {option}
                      </Button>
                    )
                  })}
                </div>
              ) : null}

              {isTextAnswerQuestion(question) ? (
                <div className="space-y-2">
                  <Input
                    value={typeof draftAnswer === 'string' ? draftAnswer : ''}
                    onChange={(event) =>
                      setDraftAnswers((prev) => ({
                        ...prev,
                        [question.id]: event.target.value,
                      }))
                    }
                    placeholder={
                      question.type === 'sql-query'
                        ? 'Type your SQL query'
                        : question.type === 'python-debug'
                          ? 'Type the corrected Python line'
                          : question.type === 'fill-blank'
                            ? 'Fill in the blank'
                            : 'Type the missing line'
                    }
                    disabled={isSubmitted}
                  />
                  <p className="text-sm text-muted-foreground">Keep the answer short and exact.</p>
                </div>
              ) : null}

              {question.type === 'code-output' ? (
                <div className="space-y-2">
                  <Textarea
                    value={typeof draftAnswer === 'string' ? draftAnswer : ''}
                    onChange={(event) =>
                      setDraftAnswers((prev) => ({
                        ...prev,
                        [question.id]: event.target.value,
                      }))
                    }
                    placeholder="Type the exact output"
                    rows={4}
                    disabled={isSubmitted}
                  />
                  <p className="text-sm text-muted-foreground">
                    Match the output exactly, including line breaks if any.
                  </p>
                </div>
              ) : null}

              {isSubmitted && (
                <div
                  className={`rounded-lg border-2 p-4 ${
                    isCorrect
                      ? 'border-emerald-300 bg-emerald-500/10'
                      : 'border-rose-300 bg-rose-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {isCorrect ? (
                      <CheckCircle size={20} weight="fill" className="text-emerald-600" />
                    ) : (
                      <XCircle size={20} weight="fill" className="text-rose-600" />
                    )}
                    {isCorrect ? 'Correct!' : 'Not quite.'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{question.explanation}</p>

                  {!isCorrect && (
                    <div className="mt-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-md border border-rose-300 bg-rose-500/10 p-3">
                          <div className="text-xs font-semibold text-rose-700">Your answer</div>
                          {question.type === 'code-output' || isTextAnswerQuestion(question) ? (
                            <pre className="mt-2 whitespace-pre-wrap text-sm text-rose-900">
                              {getUserAnswerText(question, draftAnswer)}
                            </pre>
                          ) : (
                            <p className="mt-2 text-sm text-rose-900">
                              {getUserAnswerText(question, draftAnswer)}
                            </p>
                          )}
                        </div>

                        <div className="rounded-md border border-emerald-300 bg-emerald-500/10 p-3">
                          <div className="text-xs font-semibold text-emerald-700">Correct answer</div>
                          {question.type === 'code-output' || isTextAnswerQuestion(question) ? (
                            <pre className="mt-2 whitespace-pre-wrap text-sm text-emerald-900">
                              {getCorrectAnswerText(question)}
                            </pre>
                          ) : (
                            <p className="mt-2 text-sm text-emerald-900">
                              {getCorrectAnswerText(question)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {!isCorrect && (
                      <div className="rounded-md border border-rose-300 bg-rose-500/10 p-3">
                        <div className="text-xs font-semibold text-rose-700">Why this answer is wrong</div>
                        <p className="mt-2 text-sm text-rose-900">
                          {getWhyWrongText(question, draftAnswer)}
                        </p>
                      </div>
                    )}

                    <div className="rounded-md border border-emerald-300 bg-emerald-500/10 p-3">
                      <div className="text-xs font-semibold text-emerald-700">Why the correct answer is right</div>
                      <p className="mt-2 text-sm text-emerald-900">
                        {getWhyRightText(question)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSubmitAnswer(question)}
                  disabled={isSubmitted}
                  className="w-full sm:w-auto"
                >
                  Check Answer
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-stretch sm:justify-end">
                  {!isLastQuestion ? (
                    <Button
                      onClick={() => handleNext(selectedQuiz)}
                      disabled={currentQuestionIndex >= selectedQuiz.questions.length - 1}
                      className="flex-1 sm:flex-initial"
                    >
                      Next Question
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => void handleFinishQuiz(selectedQuiz)}
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 flex-1 sm:flex-initial"
                    >
                      {isSubmitting ? 'Submitting…' : 'Finish Quiz'}
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
