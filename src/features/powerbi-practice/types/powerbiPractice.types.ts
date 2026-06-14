/**
 * Issue #30 Phase 24 — Power BI Practice Ground types.
 */

export const POWERBI_PRACTICE_ROUTE = '/practice/powerbi'

export const DAX_PRACTICE_ROUTE = '/practice/powerbi/dax'

export type PowerBiModuleStatus = 'active' | 'available-soon' | 'coming-soon'

export type PowerBiModuleId =
  | 'dax-practice'
  | 'powerbi-quiz'
  | 'power-query'
  | 'data-modeling'
  | 'dashboard-builder'
  | 'case-studies'
  | 'report-analysis'
  | 'report-lab'

export interface PowerBiModuleDefinition {
  id: PowerBiModuleId
  title: string
  description: string
  status: PowerBiModuleStatus
  href?: string
}

export type DaxDatasetId = 'retail_sales'

export type DaxPracticeDifficulty = 'easy' | 'medium'

export type DaxPracticeTopic = 'aggregation' | 'counting' | 'distinct'

export interface DaxColumnMeta {
  name: string
  dataType: string
}

export interface DaxTableMeta {
  name: string
  columns: DaxColumnMeta[]
}

export interface DaxDatasetMeta {
  id: DaxDatasetId
  displayName: string
  description: string
  tables: DaxTableMeta[]
}

export interface DaxPlaceholderRules {
  requiredFunctions?: string[]
  requiredTableRefs?: string[]
  requiredColumnRefs?: string[]
}

export interface DaxPracticeQuestion {
  id: string
  title: string
  datasetId: DaxDatasetId
  difficulty: DaxPracticeDifficulty
  topic: DaxPracticeTopic
  businessContext: string
  learningObjective: string
  problemStatement: string
  starterFormula: string
  hints: string[]
  explanation: string
  placeholderRules: DaxPlaceholderRules
}

export interface DaxAnswerFeedback {
  passed: boolean
  feedback: string[]
  checkedAt: string
  explanation?: string
}
