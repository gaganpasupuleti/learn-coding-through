import type { CatalogQuiz, CatalogQuizQuestion, QuizAttemptStart } from '@/lib/api'

function shuffleChoiceQuestion(
  question: CatalogQuizQuestion,
  optionOrder: number[] | undefined,
): CatalogQuizQuestion {
  if (
    optionOrder &&
    optionOrder.length > 0 &&
    (question.type === 'multiple-choice' || question.type === 'true-false')
  ) {
    const shuffledOptions = optionOrder.map((index) => question.options[index])
    const newCorrectIndex = optionOrder.indexOf(question.correctIndex)
    return {
      ...question,
      options: shuffledOptions,
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : question.correctIndex,
    }
  }

  if (question.type === 'scenario' && question.options && question.options.length > 0 && optionOrder) {
    const shuffledOptions = optionOrder.map((index) => question.options![index])
    const correctIndex = question.correctIndex ?? 0
    const newCorrectIndex = optionOrder.indexOf(correctIndex)
    return {
      ...question,
      options: shuffledOptions,
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : correctIndex,
    }
  }

  return question
}

export function applyAttemptShuffle(quiz: CatalogQuiz, attempt: QuizAttemptStart): CatalogQuiz {
  const orderIndex = new Map(attempt.question_order.map((id, index) => [id, index]))
  const questions = [...quiz.questions]
    .sort((a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0))
    .map((question) =>
      shuffleChoiceQuestion(question, attempt.option_orders[String(question.id)]),
    )

  return {
    ...quiz,
    questions,
  }
}
