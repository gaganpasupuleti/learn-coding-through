import { BookOpen, ChevronLeft, ChevronRight, List, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { marked } from 'marked'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  CQActionButton,
  CQCard,
  CQProgressBar,
  CQSectionTitle,
  CQStatCard,
} from '@/components/student-dashboard/cq/CQKit'
import { useStudentNavCollapsed } from '@/hooks/useStudentNavCollapsed'
import { JOB_ROLE_CATALOG, roleName } from '@/data/jobRoleCatalog'
import {
  BOOK_REPORTS_CATALOG,
  countReportsForRole,
  getCatalogReports,
  getCoverUrl,
  getFamilyName,
  getReportRoleIds,
  loadStudyReportById,
  totalChapterCount,
} from '@/lib/bookReports'
import { cn } from '@/lib/utils'
import type { BookReportChapter, CatalogReport, ReportType, StudyReport } from '@/types/bookReports'
import { REPORT_TYPE_LABELS } from '@/types/bookReports'

const PROGRESS_KEY = 'cq-study-report-progress'

function loadProgress(reportId: string): number {
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY}:${reportId}`)
    return raw ? Math.min(100, Math.max(0, Number(raw))) : 0
  } catch {
    return 0
  }
}

function saveProgress(reportId: string, percent: number) {
  try {
    localStorage.setItem(`${PROGRESS_KEY}:${reportId}`, String(Math.round(percent)))
  } catch {
    /* ponytail: localStorage optional */
  }
}

function renderMarkdown(body: string): string {
  return marked.parse(prepareReadingMarkdown(body), { async: false }) as string
}

function prepareReadingMarkdown(body: string): string {
  return body
    .replace(/^\*\*Chapter focus:.*?\*\*[^\n]*\n\n?/i, '')
    .replace(/^Code Reference:\n/m, '### Code reference\n\n')
    .replace(/^What it shows: /m, '> **What it shows:** ')
}

function splitChapterIntoPages(body: string): string[] {
  const prepared = prepareReadingMarkdown(body)
  const parts = prepared
    .split(/\n(?=### )/)
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : [prepared || '']
}

function displayTitle(title: string): string {
  return title.replace(/^(Study|Project) Report:\s*/i, '').trim()
}

function setUrlParams(reportId: string | null, chapter: number | null) {
  const url = new URL(window.location.href)
  if (reportId) url.searchParams.set('report', reportId)
  else url.searchParams.delete('report')
  if (chapter != null && reportId) url.searchParams.set('chapter', String(chapter))
  else url.searchParams.delete('chapter')
  url.searchParams.delete('item')
  window.history.replaceState({}, '', url.toString())
}

export function StudyMaterialsPage() {
  const allReports = useMemo(() => getCatalogReports(), [])
  const [search, setSearch] = useState('')
  const [familyFilter, setFamilyFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [progress, setProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reportParam = params.get('report') ?? params.get('item')
    if (reportParam) {
      setSelectedReportId(reportParam)
      const ch = Number(params.get('chapter'))
      if (ch > 0) setSelectedChapter(ch)
    }
    const next: Record<string, number> = {}
    for (const r of allReports) next[r.id] = loadProgress(r.id)
    setProgress(next)
  }, [allReports])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allReports.filter((report) => {
      if (familyFilter && report.family_id !== familyFilter) return false
      if (roleFilter && !getReportRoleIds(report).includes(roleFilter)) return false
      if (typeFilter && report.report_type !== typeFilter) return false
      if (levelFilter && report.level !== levelFilter) return false
      if (!q) return true
      const haystack = [
        report.title,
        report.author ?? '',
        getFamilyName(report.family_id),
        report.level,
        ...getReportRoleIds(report).map(roleName),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [allReports, search, familyFilter, roleFilter, typeFilter, levelFilter])

  const levels = useMemo(
    () => [...new Set(allReports.map((r) => r.level))].sort(),
    [allReports],
  )

  const selectedReport = useMemo(
    () => (selectedReportId ? loadStudyReportById(selectedReportId) : null),
    [selectedReportId],
  )

  const openReport = useCallback((reportId: string) => {
    setSelectedReportId(reportId)
    setSelectedChapter(1)
    setUrlParams(reportId, 1)
  }, [])

  const closeReport = useCallback(() => {
    setSelectedReportId(null)
    setUrlParams(null, null)
  }, [])

  const markProgress = useCallback((reportId: string, percent: number) => {
    saveProgress(reportId, percent)
    setProgress((prev) => ({ ...prev, [reportId]: percent }))
  }, [])

  if (selectedReport) {
    return (
      <StudyReportReader
        report={selectedReport}
        chapterNumber={selectedChapter}
        progressPercent={progress[selectedReport.id] ?? 0}
        onBack={closeReport}
        onChapterChange={(n) => {
          setSelectedChapter(n)
          setUrlParams(selectedReport.id, n)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onProgress={markProgress}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <header>
        <CQSectionTitle
          icon={<BookOpen className="h-5 w-5" aria-hidden />}
          sub="Role-based career paths, book studies, and project guides — mapped to your target job."
        >
          Study Materials
        </CQSectionTitle>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CQStatCard label="Reports" value={allReports.length} detail="Career, books, projects" tone="blue" />
        <CQStatCard label="Chapters" value={totalChapterCount()} detail="Full library" tone="green" />
        <CQStatCard
          label="Role families"
          value={BOOK_REPORTS_CATALOG.families.length}
          detail="Job-aligned paths"
          tone="yellow"
        />
        <CQStatCard label="Job roles" value={JOB_ROLE_CATALOG.length} detail="Filter below" tone="purple" />
      </div>

      <CQCard tone="cream" className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <label className="block space-y-1 md:col-span-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#111827]/60">Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title, family, level, or role…"
              className="w-full rounded-lg border border-[#0A1020]/15 bg-white px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#708090] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </label>

          <FilterSelect
            label="Target role"
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: '', label: 'All roles' },
              ...JOB_ROLE_CATALOG.map((role) => ({
                value: role.role_id,
                label: `${role.role_name} (${countReportsForRole(role.role_id)})`,
              })),
            ]}
          />
          <FilterSelect
            label="Report type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: '', label: 'All types' },
              ...(Object.entries(REPORT_TYPE_LABELS) as [ReportType, string][]).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <FilterSelect
            label="Role family"
            value={familyFilter}
            onChange={setFamilyFilter}
            options={[
              { value: '', label: 'All families' },
              ...BOOK_REPORTS_CATALOG.families.map((f) => ({
                value: f.id,
                label: `${f.name} (${f.report_count})`,
              })),
            ]}
          />
          <FilterSelect
            label="Level"
            value={levelFilter}
            onChange={setLevelFilter}
            options={[
              { value: '', label: 'All levels' },
              ...levels.map((level) => ({ value: level, label: level })),
            ]}
          />
        </div>
        <p className="text-sm text-[#4B5563]">
          Showing <strong className="text-[#111827]">{filtered.length}</strong> of {allReports.length}{' '}
          reports
          {roleFilter ? (
            <>
              {' '}
              for <strong className="text-[#111827]">{roleName(roleFilter)}</strong>
            </>
          ) : null}
        </p>
      </CQCard>

      {filtered.length === 0 ? (
        <CQCard tone="cream" className="py-12 text-center">
          <p className="font-semibold text-[#111827]">No reports match</p>
          <p className="mt-1 text-sm text-[#4B5563]">Try clearing a filter or changing your search.</p>
        </CQCard>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              progressPercent={progress[report.id] ?? 0}
              onOpen={() => openReport(report.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#111827]/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#0A1020]/15 bg-white px-3 py-2.5 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
      >
        {options.map((opt) => (
          <option key={opt.value || '__all'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ReportCard({
  report,
  progressPercent,
  onOpen,
}: {
  report: CatalogReport
  progressPercent: number
  onOpen: () => void
}) {
  const roleIds = getReportRoleIds(report)
  const coverUrl = getCoverUrl(report.path)

  return (
    <li>
      <CQCard interactive tone="cream" className="flex h-full flex-col overflow-hidden p-0">
        <button type="button" onClick={onOpen} className="flex h-full flex-col text-left">
          <div className="relative aspect-[320/440] w-full overflow-hidden bg-[#0A1020]/5">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                className="h-full w-full object-contain p-2"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#708090]">
                <BookOpen className="h-10 w-10 opacity-40" aria-hidden />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex flex-wrap gap-1.5">
              {report.report_type ? (
                <Badge type={report.report_type}>{REPORT_TYPE_LABELS[report.report_type]}</Badge>
              ) : null}
              <Badge muted>{report.level}</Badge>
            </div>
            <h2 className="font-serif text-base font-semibold leading-snug text-[#0A1020] line-clamp-3">
              {displayTitle(report.title)}
            </h2>
            <p className="text-xs text-[#708090]">
              {getFamilyName(report.family_id)} · {report.chapter_count} chapters
            </p>
            {roleIds.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {roleIds.slice(0, 2).map((roleId) => (
                  <Badge key={roleId} role>
                    {roleName(roleId)}
                  </Badge>
                ))}
                {roleIds.length > 2 ? (
                  <span className="text-xs text-[#708090]">+{roleIds.length - 2}</span>
                ) : null}
              </div>
            ) : null}
            {progressPercent > 0 ? <CQProgressBar value={progressPercent} className="mt-auto" /> : null}
            <span className="mt-1 inline-flex items-center text-sm font-semibold text-[#2563EB]">
              Read now →
            </span>
          </div>
        </button>
      </CQCard>
    </li>
  )
}

function Badge({
  children,
  muted,
  role,
  type,
}: {
  children: React.ReactNode
  muted?: boolean
  role?: boolean
  type?: ReportType
}) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        type === 'role_career_path'
          ? 'bg-[#0A1020] text-[#FAF3E0]'
          : type === 'role_book_study'
            ? 'bg-[#2563EB]/12 text-[#1D4ED8]'
            : type === 'role_project'
              ? 'bg-[#0D9488]/12 text-[#0F766E]'
              : role
                ? 'bg-[#2563EB]/10 text-[#1D4ED8]'
                : muted
                  ? 'bg-[#0A1020]/6 text-[#4B5563]'
                  : 'bg-[#0A1020] text-[#FAF3E0]',
      )}
    >
      {children}
    </span>
  )
}

const READER_PROSE =
  'prose prose-lg max-w-none text-[#2D3748] prose-p:my-4 prose-p:text-[17px] prose-p:leading-[1.85] prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#0A1020] prose-h3:mt-8 prose-h3:mb-3 prose-h3:border-b prose-h3:border-[#0A1020]/10 prose-h3:pb-2 prose-h3:text-xl prose-strong:font-semibold prose-strong:text-[#0A1020] prose-a:text-[#2563EB] prose-a:no-underline hover:prose-a:underline prose-code:rounded-md prose-code:bg-[#0A1020]/8 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.88em] prose-code:text-[#0A1020] prose-code:before:content-none prose-code:after:content-none prose-pre:my-5 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-[#0A1020]/15 prose-pre:bg-[#0A1020] prose-pre:px-5 prose-pre:py-4 prose-pre:font-mono prose-pre:text-[14px] prose-pre:leading-relaxed prose-pre:text-[#E8E0D4] prose-pre:shadow-[0_12px_40px_-20px_rgba(10,16,32,0.65)] prose-blockquote:my-5 prose-blockquote:border-l-4 prose-blockquote:border-[#2563EB]/70 prose-blockquote:bg-transparent prose-blockquote:py-0 prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-[#374151] prose-li:my-1 prose-li:marker:text-[#2563EB]'

function StudyReportReader({
  report,
  chapterNumber,
  progressPercent,
  onBack,
  onChapterChange,
  onProgress,
}: {
  report: StudyReport
  chapterNumber: number
  progressPercent: number
  onBack: () => void
  onChapterChange: (n: number) => void
  onProgress: (reportId: string, percent: number) => void
}) {
  const [tocOpen, setTocOpen] = useState(false)
  const [tocCollapsed, setTocCollapsed] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const pendingPageRef = useRef<number | null>(null)
  const { collapsed: navCollapsed, toggleCollapsed: toggleNav } = useStudentNavCollapsed()

  const chapter =
    report.chapters.find((c) => c.number === chapterNumber) ?? report.chapters[0] ?? null
  const contentPages = useMemo(
    () => (chapter ? splitChapterIntoPages(chapter.content) : []),
    [chapter],
  )
  const hasTakeaways = Boolean(chapter?.key_takeaways.length)
  const totalPages = contentPages.length + (hasTakeaways ? 1 : 0)
  const isTakeawaysPage = hasTakeaways && pageIndex === contentPages.length
  const pageHtml =
    !isTakeawaysPage && contentPages[pageIndex]
      ? renderMarkdown(contentPages[pageIndex])
      : ''

  const catalogEntry = getCatalogReports().find((r) => r.id === report.id)
  const coverUrl = catalogEntry ? getCoverUrl(catalogEntry.path) : undefined
  const total = report.chapters.length
  const title = displayTitle(report.title)

  useEffect(() => {
    setTocOpen(false)
    if (pendingPageRef.current != null) {
      setPageIndex(pendingPageRef.current)
      pendingPageRef.current = null
    } else {
      setPageIndex(0)
    }
  }, [chapterNumber])

  useEffect(() => {
    const chapterShare = total > 0 ? 100 / total : 100
    const pageShare = totalPages > 0 ? chapterShare / totalPages : chapterShare
    const base = ((chapterNumber - 1) / total) * 100
    onProgress(report.id, Math.min(100, base + (pageIndex + 1) * pageShare))
  }, [chapterNumber, onProgress, pageIndex, report.id, total, totalPages])

  const goNextPage = useCallback(() => {
    if (pageIndex < totalPages - 1) {
      setPageIndex((p) => p + 1)
      return
    }
    if (chapterNumber < total) onChapterChange(chapterNumber + 1)
    else onProgress(report.id, 100)
  }, [chapterNumber, onChapterChange, onProgress, pageIndex, report.id, total, totalPages])

  const goPrevPage = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex((p) => p - 1)
      return
    }
    if (chapterNumber > 1) {
      const prevChapter = report.chapters.find((ch) => ch.number === chapterNumber - 1)
      if (prevChapter) {
        const prevContentPages = splitChapterIntoPages(prevChapter.content)
        const prevTotal = prevContentPages.length + (prevChapter.key_takeaways.length ? 1 : 0)
        pendingPageRef.current = Math.max(0, prevTotal - 1)
        onChapterChange(chapterNumber - 1)
      }
    }
  }, [chapterNumber, onChapterChange, pageIndex, report.chapters])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goNextPage()
      if (event.key === 'ArrowLeft') goPrevPage()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNextPage, goPrevPage])

  const showToc = !tocCollapsed || tocOpen

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col bg-[#E8DFC8] lg:min-h-dvh">
      <header className="sticky top-0 z-30 shrink-0 border-b border-[#0A1020]/10 bg-[#FFFDF6]/95 backdrop-blur-md">
        <div className="flex items-center gap-2 px-3 py-2.5 md:px-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-[#2563EB] hover:bg-[#0A1020]/5 hover:text-[#1D4ED8]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Library</span>
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-serif text-sm font-semibold text-[#0A1020]">{title}</p>
            <p className="text-[11px] text-[#708090]">
              Ch. {chapterNumber}/{total} · Page {pageIndex + 1}/{totalPages || 1}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleNav}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#0A1020]/12 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#0A1020] hover:bg-[#FAF3E0]"
            title={navCollapsed ? 'Show app menu' : 'Hide app menu'}
          >
            {navCollapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{navCollapsed ? 'Menu' : 'Focus'}</span>
          </button>

          <button
            type="button"
            onClick={() => (window.innerWidth >= 1024 ? setTocCollapsed((v) => !v) : setTocOpen((v) => !v))}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#0A1020]/12 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#0A1020] hover:bg-[#FAF3E0]"
            aria-expanded={showToc}
            aria-controls="study-reader-toc"
          >
            <List className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden md:inline">Contents</span>
          </button>
        </div>
        <div className="h-0.5 bg-[#0A1020]/8">
          <div
            className="h-full bg-[#2563EB] transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {showToc ? (
          <aside
            id="study-reader-toc"
            className={cn(
              'shrink-0 border-[#0A1020]/10 bg-[#FFFDF6]',
              tocOpen
                ? 'absolute inset-x-0 top-14 z-20 max-h-96 overflow-y-auto border-b shadow-lg lg:static lg:max-h-none lg:w-64 lg:border-r lg:shadow-none xl:w-72'
                : '',
            )}
          >
            <div className="p-4 md:p-5">
              <div className="mb-4 flex gap-3 border-b border-[#0A1020]/8 pb-4">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt=""
                    className="h-20 w-14 shrink-0 rounded-md object-cover shadow-md ring-1 ring-[#0A1020]/10"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="font-serif text-sm font-semibold leading-snug text-[#0A1020]">{title}</p>
                  <p className="mt-1 text-xs text-[#708090]">{report.author ?? 'Gagan Pasupuleti'}</p>
                </div>
              </div>
              <nav className="space-y-0.5" aria-label="Chapters">
                {report.chapters.map((ch) => {
                  const active = ch.number === (chapter?.number ?? 0)
                  return (
                    <button
                      key={ch.number}
                      type="button"
                      onClick={() => onChapterChange(ch.number)}
                      className={cn(
                        'group flex w-full gap-2 rounded-lg px-2 py-2 text-left transition-colors',
                        active ? 'bg-[#0A1020]/6' : 'hover:bg-[#0A1020]/4',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-1 w-1 shrink-0 rounded-full',
                          active ? 'bg-[#2563EB]' : 'bg-transparent group-hover:bg-[#0A1020]/15',
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className={cn('block text-[10px] font-semibold uppercase tracking-wider', active ? 'text-[#2563EB]' : 'text-[#708090]')}>
                          Chapter {ch.number}
                        </span>
                        <span className={cn('block text-sm leading-snug', active ? 'font-semibold text-[#0A1020]' : 'text-[#374151]')}>
                          {ch.title}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>
        ) : null}

        <main className="flex min-w-0 flex-1 flex-col p-3 md:p-5 lg:p-6">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
            <article className="flex flex-1 flex-col rounded-2xl bg-[#FFFDF6] px-6 py-8 shadow-[0_20px_60px_-30px_rgba(10,16,32,0.45)] ring-1 ring-[#0A1020]/10 md:px-10 md:py-10">
              {chapter ? (
                <ChapterPage
                  chapter={chapter}
                  html={pageHtml}
                  pageIndex={pageIndex}
                  totalPages={totalPages}
                  isTakeawaysPage={isTakeawaysPage}
                />
              ) : (
                <p className="text-sm text-[#4B5563]">No chapters in this report.</p>
              )}
            </article>

            <nav
              className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#0A1020]/10 bg-[#FFFDF6]/90 px-4 py-3 backdrop-blur-sm"
              aria-label="Page navigation"
            >
              <CQActionButton
                variant="ghost"
                disabled={pageIndex <= 0 && chapterNumber <= 1}
                onClick={goPrevPage}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Previous
              </CQActionButton>

              <div className="text-center text-sm text-[#708090]">
                <p className="font-medium text-[#0A1020]">
                  Page {pageIndex + 1} of {totalPages || 1}
                </p>
                <p className="text-xs">Chapter {chapterNumber} of {total}</p>
              </div>

              {pageIndex < totalPages - 1 || chapterNumber < total ? (
                <CQActionButton variant="primary" onClick={goNextPage} className="gap-1">
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </CQActionButton>
              ) : (
                <CQActionButton variant="navy" onClick={() => onProgress(report.id, 100)}>
                  Finish
                </CQActionButton>
              )}
            </nav>
          </div>
        </main>
      </div>
    </div>
  )
}

function ChapterPage({
  chapter,
  html,
  pageIndex,
  totalPages,
  isTakeawaysPage,
}: {
  chapter: BookReportChapter
  html: string
  pageIndex: number
  totalPages: number
  isTakeawaysPage: boolean
}) {
  if (isTakeawaysPage) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="mb-6 border-b border-[#0A1020]/10 pb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#708090]">
            Chapter {chapter.number} · Summary
          </p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-[#0A1020] md:text-3xl">Before you move on</h1>
        </header>
        <ul className="space-y-5">
          {chapter.key_takeaways.map((t, i) => (
            <li key={t} className="flex gap-3 text-[17px] leading-relaxed text-[#374151]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A1020] font-serif text-sm font-semibold text-[#FAF3E0]">
                {i + 1}
              </span>
              <span className="pt-1">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {pageIndex === 0 ? (
        <header className="mb-8 border-b border-[#0A1020]/10 pb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#708090]">
            Chapter {chapter.number}
            {chapter.level ? ` · ${chapter.level}` : ''}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight text-[#0A1020] md:text-4xl">
            {chapter.title}
          </h1>
        </header>
      ) : (
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-[#708090]">
          {chapter.title} · page {pageIndex + 1} of {totalPages}
        </p>
      )}

      <div className={READER_PROSE} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
