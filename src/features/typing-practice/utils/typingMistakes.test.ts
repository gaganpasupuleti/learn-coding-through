import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearTypingMistakes,
  filterMistakesForSnippet,
  getRecentTypingMistakes,
  readTypingMistakes,
  recordTypingMistakes,
  recordTypingSession,
} from './typingMistakes'

class LocalStorageMock {
  private store = new Map<string, string>()

  getItem(key: string) {
    return this.store.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.store.set(key, value)
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  clear() {
    this.store.clear()
  }
}

describe('typingMistakes storage', () => {
  beforeEach(() => {
    const mock = new LocalStorageMock()
    Object.defineProperty(globalThis, 'localStorage', {
      value: mock,
      configurable: true,
    })
    clearTypingMistakes()
  })

  it('records and reads character mistakes', () => {
    recordTypingMistakes([
      {
        snippetId: 'py-print',
        language: 'python',
        expectedChar: '(',
        typedChar: '[',
        position: 5,
      },
    ])

    const mistakes = readTypingMistakes()
    expect(mistakes).toHaveLength(1)
    expect(mistakes[0].snippetId).toBe('py-print')
    expect(mistakes[0].expectedChar).toBe('(')
  })

  it('filters mistakes by snippet id', () => {
    recordTypingMistakes([
      {
        snippetId: 'py-print',
        language: 'python',
        expectedChar: 'a',
        typedChar: 'b',
        position: 1,
      },
      {
        snippetId: 'js-console-log',
        language: 'javascript',
        expectedChar: 'c',
        typedChar: 'd',
        position: 2,
      },
    ])

    expect(filterMistakesForSnippet('py-print')).toHaveLength(1)
    expect(getRecentTypingMistakes(1)).toHaveLength(1)
  })

  it('clears saved mistakes', () => {
    recordTypingMistakes([
      {
        snippetId: 'py-print',
        language: 'python',
        expectedChar: 'a',
        typedChar: 'b',
        position: 1,
      },
    ])
    clearTypingMistakes()
    expect(readTypingMistakes()).toHaveLength(0)
  })

  it('records local typing sessions', () => {
    const session = recordTypingSession({
      mode: 'code',
      snippetId: 'py-print',
      snippetTitle: 'Print greeting',
      language: 'python',
      difficulty: 'beginner',
      wpm: 42,
      accuracy: 96,
      mistakeCount: 1,
      elapsedSeconds: 25,
    })

    expect(session.id).toBeTruthy()
    expect(session.completedAt).toBeTruthy()
  })
})
