/**
 * Practice hub sections. SQL is owned by GitHub Issue #30 (SQL Practice Ground)
 * and is excluded from Issue #29 (multi-language Code Practice Ground rebuild).
 */
export type PracticeGroundSection = 'typing' | 'sql' | 'java' | 'python' | 'mistakes'

/** Languages embedded in PracticePage today (includes legacy SQL; see Issue #30). */
export type CodePracticeLanguage = 'python' | 'sql' | 'java'

/**
 * Issue #29 rebuild scope — multi-language code practice only.
 * SQL is intentionally omitted; add javascript/react/java/c/c++ here in later phases.
 */
export const ISSUE_29_CODE_PRACTICE_LANGUAGES = ['python', 'java'] as const

export type Issue29CodePracticeLanguage = (typeof ISSUE_29_CODE_PRACTICE_LANGUAGES)[number]

export const PRACTICE_GROUND_SECTIONS: Array<{
  id: PracticeGroundSection
  label: string
  description: string
}> = [
  {
    id: 'typing',
    label: 'Typing Practice',
    description: 'Sentence and code typing with WPM tracking.',
  },
  // Issue #30 — SQL Practice Ground (not part of Issue #29 rebuild scope).
  {
    id: 'sql',
    label: 'SQL Practice',
    description: 'Query the practice database with live results.',
  },
  {
    id: 'java',
    label: 'Java Practice',
    description: 'Classes, loops, and method drills.',
  },
  {
    id: 'python',
    label: 'Python Practice',
    description: 'Loops, functions, and list exercises.',
  },
  {
    id: 'mistakes',
    label: 'Mistakes Review',
    description: 'Revisit failed runs and retry in the editor.',
  },
]

export function isCodeSection(section: PracticeGroundSection): section is CodePracticeLanguage {
  return section === 'python' || section === 'sql' || section === 'java'
}

export function sectionFromLegacyPage(page: 'practice' | 'typing'): PracticeGroundSection {
  return page === 'typing' ? 'typing' : 'python'
}
