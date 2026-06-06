export type PracticeGroundSection = 'typing' | 'sql' | 'java' | 'python' | 'mistakes'

export type CodePracticeLanguage = 'python' | 'sql' | 'java'

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
