export interface BookReportChapter {
  number: number
  title: string
  topic: string
  content: string
  key_takeaways: string[]
  what_it_is?: string
  when_to_use?: string
  where_to_use?: string
  real_use_example?: string
}

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
}

export interface BookReportFamily {
  id: string
  name: string
  description: string
  source_count: number
  report_count: number
  reports: CatalogReport[]
}

export interface BookReportsCatalog {
  title: string
  description: string
  families: BookReportFamily[]
  reports: CatalogReport[]
  author?: string
}
