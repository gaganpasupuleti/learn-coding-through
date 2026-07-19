export interface BookReportChapter {
  number: number
  title: string
  topic: string
  content: string
  key_takeaways: string[]
  level?: string
  what_it_is?: string
  when_to_use?: string
  where_to_use?: string
  real_use_example?: string
}

export type ReportType = 'role_career_path' | 'role_book_study' | 'role_project'

export interface StudyReport {
  id: string
  title: string
  author?: string
  family_id: string
  family_name?: string
  level: string
  summary: string
  chapters: BookReportChapter[]
  chapter_count: number
  report_type?: ReportType
  source_file?: string
}

export interface CatalogReport {
  id: string
  title: string
  family_id: string
  chapter_count: number
  level: string
  path: string
  markdown: string
  author?: string
  report_type?: ReportType
  pdf?: string
  book_title?: string
  book_author?: string
  project_title?: string
  duration?: string
}

export interface BookReportFamily {
  id: string
  name: string
  description: string
  source_count: number
  report_count: number
  book_report_count?: number
  project_report_count?: number
  career_path_count?: number
  levels_covered?: string[]
  reports: CatalogReport[]
}

export interface BookReportsCatalog {
  title: string
  description: string
  families: BookReportFamily[]
  reports: CatalogReport[]
  author?: string
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  role_career_path: 'Career path',
  role_book_study: 'Book study',
  role_project: 'Project',
}
