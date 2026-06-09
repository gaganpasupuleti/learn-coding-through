import type { CodePracticeFeedback } from '../types/codePractice.types'

export function formatFeedbackForError(feedback: CodePracticeFeedback): string {
  const parts = [feedback.title, feedback.message]
  if (feedback.lineNumber) parts.push(`Line: ${feedback.lineNumber}`)
  if (feedback.suggestion) parts.push(`Suggestion: ${feedback.suggestion}`)
  return parts.join('\n')
}

function extractErrorTail(error: string): string {
  const lines = error.trim().split('\n').filter(Boolean)
  return lines[lines.length - 1] ?? error
}

export function formatFeedbackForConsole(feedback: CodePracticeFeedback, rawError?: string): string[] {
  const lines = [`[${feedback.ruleId}] ${feedback.title}: ${feedback.message}`]
  if (feedback.suggestion) lines.push(`Suggestion: ${feedback.suggestion}`)
  if (rawError) lines.push(`Technical: ${extractErrorTail(rawError)}`)
  return lines
}

export function formatHintsForConsole(hints: CodePracticeFeedback[]): string[] {
  return hints.map((hint) => {
    const prefix = hint.severity === 'info' ? 'Hint' : 'Notice'
    const line = hint.lineNumber ? ` (line ${hint.lineNumber})` : ''
    const suggestion = hint.suggestion ? ` — ${hint.suggestion}` : ''
    return `${prefix}${line}: ${hint.message}${suggestion}`
  })
}
