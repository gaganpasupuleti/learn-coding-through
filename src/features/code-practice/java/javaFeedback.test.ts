import { describe, expect, it } from 'vitest'
import {
  analyzeJavaCodeBeforeRun,
  explainJavaError,
  getBlockingJavaPreRunFeedback,
  JAVA_RUNTIME_UNAVAILABLE_MESSAGE,
} from './javaFeedback'

describe('javaFeedback', () => {
  it('blocks missing public class Main', () => {
    const block = getBlockingJavaPreRunFeedback('class Foo { }')
    expect(block?.ruleId).toBe('missing-public-class')
  })

  it('blocks wrong class name', () => {
    const block = getBlockingJavaPreRunFeedback(
      'public class Practice { public static void main(String[] args) {} }',
    )
    expect(block?.ruleId).toBe('class-name-mismatch')
  })

  it('allows valid Main starter', () => {
    const code = `public class Main {
      public static void main(String[] args) {
        System.out.println("Hello, Java!");
      }
    }`
    expect(getBlockingJavaPreRunFeedback(code)).toBeNull()
    expect(analyzeJavaCodeBeforeRun(code).some((f) => f.severity === 'error')).toBe(false)
  })

  it('explains compile errors with semicolon hint', () => {
    const explained = explainJavaError('Compilation error:\nMain.java:3: error: expected ;', 'compile_error')
    expect(explained.ruleId).toBe('compile-missing-semicolon')
  })

  it('explains runtime unavailable', () => {
    const explained = explainJavaError('Java compiler not found', 'runtime_unavailable')
    expect(explained.message).toContain(JAVA_RUNTIME_UNAVAILABLE_MESSAGE)
  })

  it('warns on python-style print', () => {
    const hints = analyzeJavaCodeBeforeRun('public class Main { public static void main(String[] args) { print("x"); } }')
    expect(hints.some((h) => h.ruleId === 'python-style-print')).toBe(true)
  })
})
