/**
 * Offline completion intelligence checks (items 1–4) using real TS modules.
 * Validates print/console snippets, variable extraction, and React keywords
 * without a browser — useful because Monaco suggest UI is flaky in headless Playwright.
 *
 * Run (from repo root, no secrets required):
 *   npx tsx scripts/code-intelligence-smoke.mjs
 */
import { extractVariablesForLanguage } from '../src/features/code-practice/editor-intelligence/variableExtractor.ts'
import { getSnippetsForLanguage } from '../src/features/code-practice/editor-intelligence/snippetLibrary.ts'
import { REACT_KEYWORDS } from '../src/features/code-practice/editor-intelligence/reactCompletions.ts'

function matchPrefix(label, prefix) {
  return label.toLowerCase().startsWith(prefix.toLowerCase())
}

function snippetsForPrefix(language, prefix) {
  return getSnippetsForLanguage(language)
    .filter((s) => matchPrefix(s.filterText ?? s.label, prefix))
    .map((s) => s.label)
}

function keywordsForPrefix(prefix) {
  return REACT_KEYWORDS.filter((k) => matchPrefix(k.label, prefix)).map((k) => k.label)
}

const checks = [
  {
    name: 'python_pri_print',
    run: () => {
      const labels = snippetsForPrefix('python', 'pri')
      if (!labels.some((l) => l.includes('print'))) throw new Error(`got ${labels.join(',')}`)
      return labels.join(', ')
    },
  },
  {
    name: 'python_xy_after_plus',
    run: () => {
      const code = 'x = 10\ny = 20\nprint(x + '
      const vars = extractVariablesForLanguage('python', code)
      if (!vars.includes('x') || !vars.includes('y')) throw new Error(vars.join(','))
      return vars.join(', ')
    },
  },
  {
    name: 'javascript_console_and_vars',
    run: () => {
      const code = 'const x = 10;\nconst y = 20;\nconsole.log(x + '
      const vars = extractVariablesForLanguage('javascript', code)
      const con = snippetsForPrefix('javascript', 'con')
      if (!vars.includes('x') || !vars.includes('y')) throw new Error(`vars ${vars}`)
      if (!con.some((l) => l.includes('console'))) throw new Error(`snippets ${con}`)
      return `${vars.join(',')} + ${con.join(',')}`
    },
  },
  {
    name: 'react_keywords',
    run: () => {
      for (const [prefix, expect] of [
        ['use', 'useState'],
        ['but', 'button'],
        ['onC', 'onClick'],
        ['cla', 'className'],
      ]) {
        const found = keywordsForPrefix(prefix)
        if (!found.some((l) => l.toLowerCase().includes(expect.toLowerCase()))) {
          throw new Error(`${prefix} -> ${expect} missing in [${found}]`)
        }
      }
      return 'useState, button, onClick, className'
    },
  },
]

let failed = 0
console.log('Code intelligence smoke')
for (const check of checks) {
  try {
    const detail = check.run()
    console.log(`PASS ${check.name} — ${detail}`)
  } catch (error) {
    failed += 1
    console.log(`FAIL ${check.name} — ${error instanceof Error ? error.message : error}`)
  }
}
process.exit(failed > 0 ? 1 : 0)
