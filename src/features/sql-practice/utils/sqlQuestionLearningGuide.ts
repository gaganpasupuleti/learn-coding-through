import type { SqlPracticeQuestion, SqlPracticeTopic } from '../types/sqlPractice.types'

export type SqlSkillTag =
  | 'SELECT'
  | 'WHERE'
  | 'GROUP BY'
  | 'HAVING'
  | 'ORDER BY'
  | 'JOIN'
  | 'LEFT JOIN'
  | 'LIMIT'
  | 'DISTINCT'
  | 'COUNT'
  | 'SUM'
  | 'AVG'
  | 'CASE'

export interface SqlConceptGuide {
  title: string
  body: string
}

export interface SqlQuestionLearningContext {
  concept: string
  tables: string[]
  sqlSkills: SqlSkillTag[]
  steps: string[]
  commonMistake: string
  conceptGuides: SqlConceptGuide[]
}

const TOPIC_LABELS: Record<SqlPracticeTopic, string> = {
  select: 'Basic SELECT',
  filtering: 'Filtering with WHERE',
  joins: 'Table JOINs',
  aggregates: 'Aggregates & GROUP BY',
  subqueries: 'Subqueries & advanced filters',
}

function extractTables(sql: string): string[] {
  const tables = new Set<string>()
  const pattern = /\b(?:FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi
  let match: RegExpExecArray | null
  while ((match = pattern.exec(sql)) !== null) {
    const name = match[1]
    if (name && !['ON', 'AS', 'AND', 'OR'].includes(name.toUpperCase())) {
      tables.add(name)
    }
  }
  return [...tables]
}

function detectSqlSkills(question: SqlPracticeQuestion): SqlSkillTag[] {
  const haystack = `${question.starterSql}\n${question.solutionSql}`.toUpperCase()
  const skills: SqlSkillTag[] = ['SELECT']

  if (/\bLEFT\s+JOIN\b/.test(haystack)) skills.push('LEFT JOIN')
  else if (/\bJOIN\b/.test(haystack)) skills.push('JOIN')

  if (/\bWHERE\b/.test(haystack)) skills.push('WHERE')
  if (/\bGROUP\s+BY\b/.test(haystack)) skills.push('GROUP BY')
  if (/\bHAVING\b/.test(haystack)) skills.push('HAVING')
  if (/\bORDER\s+BY\b/.test(haystack)) skills.push('ORDER BY')
  if (/\bLIMIT\b/.test(haystack)) skills.push('LIMIT')
  if (/\bDISTINCT\b/.test(haystack)) skills.push('DISTINCT')
  if (/\bCOUNT\s*\(/.test(haystack)) skills.push('COUNT')
  if (/\bSUM\s*\(/.test(haystack)) skills.push('SUM')
  if (/\bAVG\s*\(/.test(haystack)) skills.push('AVG')
  if (/\bCASE\b/.test(haystack)) skills.push('CASE')

  return skills
}

function buildSteps(question: SqlPracticeQuestion, skills: SqlSkillTag[]): string[] {
  const steps: string[] = [
    `Read the task and note the expected columns: ${question.expectedColumns.join(', ')}.`,
  ]

  const tables = extractTables(`${question.starterSql}\n${question.solutionSql}`)
  if (tables.length === 1) {
    steps.push(`Start from the ${tables[0]} table.`)
  } else if (tables.length > 1) {
    steps.push(`Use these tables: ${tables.join(', ')}.`)
  }

  if (skills.includes('JOIN') || skills.includes('LEFT JOIN')) {
    steps.push('Connect tables with JOIN (or LEFT JOIN) on the matching key columns.')
  }
  if (skills.includes('WHERE')) {
    steps.push('Add WHERE to filter individual rows before any grouping.')
  }
  if (skills.includes('GROUP BY')) {
    steps.push('Add GROUP BY for each non-aggregated column you SELECT.')
  }
  if (skills.includes('COUNT') || skills.includes('SUM') || skills.includes('AVG')) {
    steps.push('Use an aggregate function (COUNT, SUM, or AVG) to summarize values.')
  }
  if (skills.includes('HAVING')) {
    steps.push('Add HAVING to filter grouped results (not the same as WHERE).')
  }
  if (skills.includes('ORDER BY')) {
    steps.push('Add ORDER BY to sort the final result (ASC = low→high, DESC = high→low).')
  }
  if (skills.includes('LIMIT')) {
    steps.push('Use LIMIT when the task asks for top N or first N rows.')
  }

  steps.push('Run the query, then use Check Answer when the columns and values look right.')

  return steps.slice(0, 6)
}

function buildCommonMistake(skills: SqlSkillTag[]): string {
  if (skills.includes('HAVING') && skills.includes('WHERE')) {
    return 'Using WHERE on an aggregate (e.g. COUNT(*) > 1) — put row filters in WHERE and group filters in HAVING.'
  }
  if (skills.includes('HAVING')) {
    return 'Putting HAVING before GROUP BY, or using WHERE instead of HAVING to filter counts.'
  }
  if (skills.includes('GROUP BY')) {
    return 'Selecting a column that is not in GROUP BY and not inside an aggregate function.'
  }
  if (skills.includes('LEFT JOIN')) {
    return 'Using INNER JOIN when the task says to keep all rows from the left table.'
  }
  if (skills.includes('JOIN')) {
    return 'Forgetting the ON condition or joining on the wrong key column.'
  }
  if (skills.includes('ORDER BY')) {
    return 'Sorting by the wrong column, or using DESC when the task asks for ascending order.'
  }
  if (skills.includes('WHERE')) {
    return 'Comparing text without quotes, or filtering the wrong column.'
  }
  return 'Selecting extra columns that are not listed in Expected columns.'
}

function buildConceptGuides(skills: SqlSkillTag[]): SqlConceptGuide[] {
  const guides: SqlConceptGuide[] = []

  if (skills.includes('GROUP BY')) {
    guides.push({
      title: 'GROUP BY',
      body:
        'GROUP BY creates one summary row per group. Every normal column in SELECT must appear in GROUP BY. ' +
        'Functions like COUNT(*), SUM(), and AVG() calculate totals across each group.',
    })
  }

  if (skills.includes('HAVING')) {
    guides.push({
      title: 'HAVING vs WHERE',
      body:
        'WHERE filters rows before grouping. HAVING filters groups after GROUP BY — use it for conditions on ' +
        'COUNT(*), SUM(), AVG(), or other aggregates.',
    })
  }

  if (skills.includes('ORDER BY')) {
    guides.push({
      title: 'ORDER BY',
      body:
        'ORDER BY sorts the final result. ASC (default) goes A→Z or low→high. DESC goes high→low. ' +
        'Sort by the column named in the task (often a count, date, or name).',
    })
  }

  if (skills.includes('JOIN')) {
    guides.push({
      title: 'JOIN',
      body:
        'JOIN combines rows from two tables when keys match in the ON clause. ' +
        'Only matching rows from both sides appear in an INNER JOIN.',
    })
  }

  if (skills.includes('LEFT JOIN')) {
    guides.push({
      title: 'LEFT JOIN',
      body:
        'LEFT JOIN keeps every row from the left table. When no match exists on the right, right-side columns are NULL — ' +
        'useful for finding missing related records.',
    })
  }

  return guides
}

export function buildQuestionLearningContext(question: SqlPracticeQuestion): SqlQuestionLearningContext {
  const sqlSkills = detectSqlSkills(question)
  const tables = extractTables(`${question.starterSql}\n${question.solutionSql}`)

  return {
    concept: TOPIC_LABELS[question.topic],
    tables,
    sqlSkills,
    steps: buildSteps(question, sqlSkills),
    commonMistake: buildCommonMistake(sqlSkills),
    conceptGuides: buildConceptGuides(sqlSkills),
  }
}
