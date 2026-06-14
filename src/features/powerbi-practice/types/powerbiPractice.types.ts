/**
 * Issue #30 Phase 24 — Power BI Practice Ground types.
 */

export const POWERBI_PRACTICE_ROUTE = '/practice/powerbi'

export type PowerBiModuleStatus = 'available-soon' | 'coming-soon'

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
}
