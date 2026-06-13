import type { TypingCompletionSummary, TypingLiveMetrics } from '../types/typingPractice.types'

export interface TypingMetricsInput {
  sourceText: string
  typedText: string
  elapsedSeconds: number
}

function visibleChar(char: string): string {
  if (char === '\n') return '\\n'
  if (char === '\t') return '\\t'
  if (char === ' ') return 'space'
  return char
}

export function calculateTypingMetrics({
  sourceText,
  typedText,
  elapsedSeconds,
}: TypingMetricsInput): TypingLiveMetrics {
  const safeElapsedSeconds = Math.max(elapsedSeconds, 1)
  const typedLength = typedText.length
  const comparedLength = Math.min(sourceText.length, typedLength)

  let correctChars = 0
  let wrongChars = 0

  for (let index = 0; index < comparedLength; index += 1) {
    if (typedText[index] === sourceText[index]) {
      correctChars += 1
    } else {
      wrongChars += 1
    }
  }

  const overflowErrors = Math.max(typedLength - sourceText.length, 0)
  const totalMistakes = wrongChars + overflowErrors
  const minutes = safeElapsedSeconds / 60
  const rawWpm = Number(((typedLength / 5) / minutes).toFixed(2))
  const wpm = Number(((correctChars / 5) / minutes).toFixed(2))
  const accuracy = typedLength > 0 ? Number(((correctChars / typedLength) * 100).toFixed(2)) : 100
  const completionPct = sourceText.length > 0
    ? Math.min(100, Number(((typedLength / sourceText.length) * 100).toFixed(1)))
    : 0

  return {
    wpm,
    rawWpm,
    accuracy,
    correctChars,
    wrongChars,
    totalMistakes,
    elapsedSeconds: safeElapsedSeconds,
    completionPct,
  }
}

export function buildCompletionSummary(
  input: TypingMetricsInput,
  mistakePositions: Array<{ position: number; expectedChar: string; typedChar: string }>,
): TypingCompletionSummary {
  const base = calculateTypingMetrics(input)
  const charCounts = new Map<string, number>()
  const tokenCounts = new Map<string, number>()

  for (const mistake of mistakePositions) {
    const key = visibleChar(mistake.expectedChar)
    charCounts.set(key, (charCounts.get(key) ?? 0) + 1)

    const start = Math.max(0, mistake.position - 8)
    const end = Math.min(input.sourceText.length, mistake.position + 8)
    const token = input.sourceText.slice(start, end).split(/\s+/).find((part) => part.length > 0) ?? key
    tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1)
  }

  const weakCharacters = [...charCounts.entries()]
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const weakTokens = [...tokenCounts.entries()]
    .map(([token, count]) => ({ token, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    ...base,
    weakCharacters,
    weakTokens,
  }
}

export function finalizeTypingSession(input: TypingMetricsInput) {
  const mistakePositions = collectMistakePositions(input.sourceText, input.typedText)
  const summary = buildCompletionSummary(input, mistakePositions)
  return { mistakePositions, summary }
}

/** Prefer explicit override when auto-finishing before React state commits. */
export function resolveFinishTypedText(stateTypedText: string, typedTextOverride?: string): string {
  return typedTextOverride ?? stateTypedText
}

export function collectMistakePositions(sourceText: string, typedText: string) {
  const comparedLength = Math.min(sourceText.length, typedText.length)
  const mistakes: Array<{ position: number; expectedChar: string; typedChar: string }> = []

  for (let index = 0; index < comparedLength; index += 1) {
    if (typedText[index] !== sourceText[index]) {
      mistakes.push({
        position: index,
        expectedChar: sourceText[index],
        typedChar: typedText[index],
      })
    }
  }

  return mistakes
}

export function getUpcomingPromptSegment(sourceText: string, typedLength: number, windowSize = 220): string {
  if (!sourceText) return ''
  const start = Math.max(0, typedLength)
  const end = Math.min(sourceText.length, start + windowSize)
  const visible = sourceText.slice(start, end)
  if (!visible) return 'Completed. Great work!'
  return end < sourceText.length ? `${visible}...` : visible
}
