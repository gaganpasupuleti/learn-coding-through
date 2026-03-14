import { useState, useEffect } from 'react'
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
  fetchCatalogQuizzes,
  fetchCatalogQuiz,
} from '@/lib/api'
import { ArrowLeft, ArrowRight, CheckCircle, ListChecks, Lock, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

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
  }
}

const getLetter = (index: number) => String.fromCharCode(65 + index)

const getCorrectAnswerText = (question: QuizQuestion) => {
  if (question.type === 'multiple-choice' || question.type === 'true-false') {
    const correctOption = question.options[question.correctIndex]
    return `${getLetter(question.correctIndex)}. ${correctOption}`
  }

  if (question.type === 'code-completion') {
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

  if (question.type === 'multiple-choice' || question.type === 'true-false') {
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
  if (question.type === 'multiple-choice' || question.type === 'true-false') {
    const userAnswer = getUserAnswerText(question, answer)
    const correctAnswer = getCorrectAnswerText(question)
    return `You selected ${userAnswer}, but the correct choice is ${correctAnswer}. ${question.explanation}`
  }

  if (question.type === 'code-completion') {
    return `Your line does not exactly match what the code needs. ${question.explanation}`
  }

  if (question.type === 'code-output') {
    return `Your output does not match the exact expected output. ${question.explanation}`
  }

  return question.explanation
}

const getWhyRightText = (question: QuizQuestion) => {
  if (question.type === 'multiple-choice' || question.type === 'true-false') {
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
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(initialQuizId ?? null)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [draftAnswers, setDraftAnswers] = useState<Record<number, string | number>>({})
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchCatalogQuizzes()
      .then(setQuizList)
      .catch(() => setQuizList([]))
      .finally(() => setQuizzesLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedQuizId) return
    setQuizLoading(true)
    fetchCatalogQuiz(selectedQuizId)
      .then(setSelectedQuiz)
      .catch(() => setSelectedQuiz(null))
      .finally(() => setQuizLoading(false))
  }, [selectedQuizId])

  const resetQuizState = () => {
    setCurrentQuestionIndex(0)
    setDraftAnswers({})
    setSubmittedAnswers({})
    setSelectedQuiz(null)
  }

  const handleSelectQuiz = (quizId: string) => {
    if (onBeforeSelect && !onBeforeSelect(quizId)) return
    resetQuizState()
    setSelectedQuizId(quizId)
  }

  const handleBackToList = () => {
    if (onBack) { onBack(); return }
    resetQuizState()
    setSelectedQuizId(null)
  }

  const evaluateAnswer = (question: QuizQuestion, answer: string | number) => {
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      return Number(answer) === question.correctIndex
    }

    if (question.type === 'code-completion') {
      const normalized = normalizeText(String(answer))
      const acceptableAnswers = question.acceptableAnswers ?? [question.answer]
      return acceptableAnswers.some((option) => normalizeText(option) === normalized)
    }

    if (question.type === 'code-output') {
      return normalizeText(String(answer)) === normalizeText(question.expectedOutput)
    }

    return false
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
            ) : (
            <div className="grid md:grid-cols-2 gap-6 pt-4">
              {quizList.map((quiz) => {
                const isLocked = lockedQuizIds.includes(quiz.id)
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

  const question = selectedQuiz.questions[currentQuestionIndex]
  const isSubmitted = submittedAnswers[question.id] !== undefined
  const isCorrect = submittedAnswers[question.id] === true
  const answeredCount = Object.keys(submittedAnswers).length
  const correctCount = Object.values(submittedAnswers).filter(Boolean).length
  const progressValue = (answeredCount / selectedQuiz.questions.length) * 100
  const draftAnswer = draftAnswers[question.id]
  const isLastQuestion = currentQuestionIndex === selectedQuiz.questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBackToList} className="hover:bg-secondary">
              <ArrowLeft className="mr-2" size={18} />
              Back to Quizzes
            </Button>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {correctCount} / {selectedQuiz.questions.length} Correct
              </Badge>
              <Badge className="px-3 py-1 bg-primary/10 text-primary">
                {answeredCount} Answered
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-bold">{selectedQuiz.title}</h1>
              <Badge variant="default" className="bg-primary">
                <ListChecks size={14} className="mr-1" weight="duotone" />
                Quiz
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">{selectedQuiz.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>
                Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedQuiz.questions.map((item, index) => {
              const submitted = submittedAnswers[item.id] !== undefined
              const isCurrent = index === currentQuestionIndex
              const isCorrectAnswer = submittedAnswers[item.id] === true

              return (
                <Badge
                  key={item.id}
                  variant={isCurrent ? 'default' : 'secondary'}
                  className={`px-3 py-2 text-sm transition-all cursor-pointer ${
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

          <Card className="border-2 animate-slide-in-right">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <ListChecks size={20} weight="duotone" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                  </div>
                  <h2 className="text-2xl font-bold">{question.title}</h2>
                </div>
              </div>

              <Separator />

              <div className="space-y-5">
                <div className="space-y-2">
                  <Badge variant="outline" className="px-3 py-1">
                    {getQuestionTypeLabel(question.type)}
                  </Badge>
                  <p className="text-lg leading-relaxed">{question.prompt}</p>
                </div>

                {question.code && (
                  <CodeDisplay
                    code={question.code}
                    language={question.language ?? 'javascript'}
                    title="Code"
                    maxHeight="300px"
                  />
                )}

                {question.type === 'multiple-choice' || question.type === 'true-false' ? (
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

                {question.type === 'code-completion' ? (
                  <div className="space-y-2">
                    <Input
                      value={typeof draftAnswer === 'string' ? draftAnswer : ''}
                      onChange={(event) =>
                        setDraftAnswers((prev) => ({
                          ...prev,
                          [question.id]: event.target.value,
                        }))
                      }
                      placeholder="Type the missing line"
                      disabled={isSubmitted}
                    />
                    <p className="text-sm text-muted-foreground">
                      Keep the answer short and exact.
                    </p>
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
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-md border border-rose-300 bg-rose-500/10 p-3">
                            <div className="text-xs font-semibold text-rose-700">Your answer</div>
                            {question.type === 'code-output' || question.type === 'code-completion' ? (
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
                            {question.type === 'code-output' || question.type === 'code-completion' ? (
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

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
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
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleSubmitAnswer(question)}
                  disabled={isSubmitted}
                >
                  Check Answer
                </Button>

                <div className="flex items-center gap-2">
                  {!isLastQuestion ? (
                    <Button
                      onClick={() => handleNext(selectedQuiz)}
                      disabled={currentQuestionIndex >= selectedQuiz.questions.length - 1}
                    >
                      Next Question
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  ) : (
                    <Button onClick={() => {
                      const passed = correctCount >= Math.ceil(selectedQuiz.questions.length * 0.6)
                      onComplete?.(passed)
                      handleBackToList()
                    }} className="bg-primary hover:bg-primary/90">
                      Finish Quiz
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
