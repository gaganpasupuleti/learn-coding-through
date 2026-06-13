import { describe, expect, it } from 'vitest'
import {
  buildCompletionSummary,
  calculateTypingMetrics,
  collectMistakePositions,
  finalizeTypingSession,
  resolveFinishTypedText,
} from './typingMetrics'

describe('typingMetrics helpers', () => {
  it('calculates wpm, accuracy, and completion', () => {
    const metrics = calculateTypingMetrics({
      sourceText: 'hello world',
      typedText: 'hello worlx',
      elapsedSeconds: 60,
    })

    expect(metrics.correctChars).toBe(10)
    expect(metrics.wrongChars).toBe(1)
    expect(metrics.totalMistakes).toBe(1)
    expect(metrics.accuracy).toBeCloseTo(90.91, 1)
    expect(metrics.completionPct).toBe(100)
    expect(metrics.wpm).toBe(2)
  })

  it('collects character mistakes by position', () => {
    const mistakes = collectMistakePositions('abc', 'axc')
    expect(mistakes).toEqual([
      { position: 1, expectedChar: 'b', typedChar: 'x' },
    ])
  })

  it('uses typed text override when state lags on auto-finish', () => {
    const sourceText = 'abc'
    const staleState = 'ab'
    const next = 'abc'

    const stale = finalizeTypingSession({
      sourceText,
      typedText: resolveFinishTypedText(staleState),
      elapsedSeconds: 60,
    })
    const complete = finalizeTypingSession({
      sourceText,
      typedText: resolveFinishTypedText(staleState, next),
      elapsedSeconds: 60,
    })

    expect(stale.summary.completionPct).toBeLessThan(100)
    expect(stale.summary.correctChars).toBe(2)
    expect(complete.summary.completionPct).toBe(100)
    expect(complete.summary.correctChars).toBe(3)
  })

  it('builds weak character and token summary', () => {
    const summary = buildCompletionSummary(
      {
        sourceText: 'print(value)',
        typedText: 'print(vqlue)',
        elapsedSeconds: 30,
      },
      [{ position: 7, expectedChar: 'a', typedChar: 'q' }],
    )

    expect(summary.totalMistakes).toBe(1)
    expect(summary.weakCharacters[0]?.char).toBe('a')
    expect(summary.weakTokens.length).toBeGreaterThan(0)
  })
})
