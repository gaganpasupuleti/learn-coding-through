import { rolesForBookFamily, familyLabel } from '@/data/bookReportFamilyRoles'
import type { BookReportsCatalog, CatalogReport, StudyReport } from '@/types/bookReports'

import catalogJson from '../../Book_Reports/catalog.json'

const reportModules = import.meta.glob('../../Book_Reports/**/report.json', {
  eager: true,
  import: 'default',
}) as Record<string, StudyReport>

const coverModules = import.meta.glob('../../Book_Reports/**/cover.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export const BOOK_REPORTS_CATALOG = catalogJson as BookReportsCatalog

export function getCatalogReports(): CatalogReport[] {
  return BOOK_REPORTS_CATALOG.reports
}

export function getCoverUrl(reportPath: string): string | undefined {
  const key = `../../${reportPath.replace(/\\/g, '/').replace(/report\.json$/i, 'cover.svg')}`
  return coverModules[key]
}

export function getReportRoleIds(report: CatalogReport): string[] {
  return rolesForBookFamily(report.family_id)
}

export function getFamilyName(familyId: string): string {
  const fam = BOOK_REPORTS_CATALOG.families.find((f) => f.id === familyId)
  return fam?.name ?? familyLabel(familyId)
}

export function loadStudyReport(path: string): StudyReport | null {
  const key = `../../${path.replace(/\\/g, '/')}`
  return reportModules[key] ?? null
}

export function loadStudyReportById(reportId: string): StudyReport | null {
  const entry = getCatalogReports().find((r) => r.id === reportId)
  if (!entry) return null
  return loadStudyReport(entry.path)
}

export function countReportsForRole(roleId: string): number {
  return getCatalogReports().filter((r) => getReportRoleIds(r).includes(roleId)).length
}

export function totalChapterCount(): number {
  return getCatalogReports().reduce((sum, r) => sum + r.chapter_count, 0)
}
