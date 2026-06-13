#!/usr/bin/env node
/**
 * Prints SQL Practice Ground smoke-test commands and checklist path.
 * No browser automation — use docs/sql-practice-smoke-checklist.md for manual steps.
 */

const checklist = 'docs/sql-practice-smoke-checklist.md'

const lines = [
  '',
  'SQL Practice Ground — smoke workflow',
  '==================================',
  '',
  '1. Automated verification:',
  '   npm run verify:sql-practice',
  '',
  '2. Production build (separate):',
  '   npm run build',
  '',
  '3. Start local app:',
  '   npm run dev',
  '   # or: npm run dev:all',
  '',
  '4. Manual browser checklist:',
  `   See ${checklist}`,
  '',
  'Quick manual targets at http://localhost:5000/practice/sql',
  '  • University System: 25 questions',
  '  • Hospital Management: 20 questions',
  '  • Shipping & Logistics: 20 questions',
  '',
  'Minimum manual pass:',
  '  • Run SELECT in each DB',
  '  • Check Answer (correct) in each DB',
  '  • Fail once → Mistakes → Retry',
  '  • Expected Output Preview per DB',
  '  • Review Mode + Suggested Question',
  '  • /practice/code JavaScript Run',
  '',
  'Documentation:',
  '  src/features/sql-practice/README.md',
  '',
]

console.log(lines.join('\n'))
