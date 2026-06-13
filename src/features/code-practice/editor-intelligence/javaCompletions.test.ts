import { describe, expect, it } from 'vitest'
import { JAVA_KEYWORDS } from './javaCompletions'
import { getSnippetsForLanguage } from './snippetLibrary'
import { extractJavaVariables, isInsideJavaPrintCall } from './variableExtractor'

describe('javaCompletions', () => {
  it('exposes keywords matching sys prefix', () => {
    const match = JAVA_KEYWORDS.find((k) => k.label.toLowerCase().startsWith('sys'))
    expect(match?.label).toContain('System.out')
  })

  it('exposes main-related keywords', () => {
    expect(JAVA_KEYWORDS.some((k) => k.label.includes('main'))).toBe(true)
    expect(JAVA_KEYWORDS.some((k) => k.label.includes('for'))).toBe(true)
    expect(JAVA_KEYWORDS.some((k) => k.label.includes('if'))).toBe(true)
  })

  it('notes Scanner stdin limitation', () => {
    const scanner = JAVA_KEYWORDS.find((k) => k.label === 'Scanner')
    expect(scanner?.detail).toMatch(/stdin/i)
  })

  it('provides nine Java snippets with Main class', () => {
    const snippets = getSnippetsForLanguage('java')
    expect(snippets.length).toBeGreaterThanOrEqual(9)
    expect(snippets.some((s) => s.filterText?.includes('main'))).toBe(true)
    expect(snippets.some((s) => s.insertText.includes('class Main'))).toBe(true)
  })

  it('extracts Java variable names', () => {
    const code = `public class Main {
      public static void main(String[] args) {
        int a = 2;
        int b = 3;
        for (int i = 0; i < 5; i++) {}
        for (int n : nums) {}
      }
    }`
    const vars = extractJavaVariables(code)
    expect(vars).toEqual(expect.arrayContaining(['a', 'b', 'i', 'n']))
  })

  it('detects inside System.out.println call', () => {
    expect(isInsideJavaPrintCall('System.out.println(')).toBe(true)
    expect(isInsideJavaPrintCall('System.out.println("x"')).toBe(true)
    expect(isInsideJavaPrintCall('int x = 1;')).toBe(false)
  })
})
