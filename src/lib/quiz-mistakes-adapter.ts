import { logPracticeMistake, type PracticeMistakeLanguage } from '@/lib/practice-mistakes'
import type { QuizWrongAnswer } from '@/lib/api'

function mapQuizTypeToLanguage(type: string): PracticeMistakeLanguage {
  const normalized = type.toLowerCase()
  if (normalized.includes('sql')) return 'sql'
  if (normalized.includes('python') || normalized.includes('debug')) return 'python'
  if (normalized.includes('java')) return 'java'
  return 'quiz'
}

function buildQuizMistakeMessage(item: QuizWrongAnswer, quizTitle?: string): string {
  const prefix = quizTitle ? `[Quiz: ${quizTitle}] ` : '[Quiz] '
  return `${prefix}${item.title}: You answered "${item.user_answer}". Correct: "${item.correct_answer}". ${item.explanation}`
}

export function logQuizWrongAnswersToMistakesReview(
  wrongAnswers: QuizWrongAnswer[],
  quizTitle?: string,
): void {
  for (const item of wrongAnswers) {
    logPracticeMistake(
      mapQuizTypeToLanguage(item.question_type),
      buildQuizMistakeMessage(item, quizTitle),
      item.code_snippet ?? item.prompt,
    )
  }
}
