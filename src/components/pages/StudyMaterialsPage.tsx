import { BookOpen, ChevronLeft, ChevronRight, List } from 'lucide-react'
import { marked } from 'marked'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  CQActionButton,
  CQCard,
  CQProgressBar,
  CQSectionTitle,
  CQStatCard,
} from '@/components/student-dashboard/cq/CQKit'
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
  'prose prose-lg max-w-none text-[#2D3748] prose-p:my-5 prose-p:text-[17px] prose-p:leading-[1.85] prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#0A1020] prose-h3:mt-10 prose-h3:mb-3 prose-h3:border-b prose-h3:border-[#0A1020]/10 prose-h3:pb-2 prose-h3:text-xl prose-strong:font-semibold prose-strong:text-[#0A1020] prose-a:text-[#2563EB] prose-a:no-underline hover:prose-a:underline prose-code:rounded-md prose-code:bg-[#0A1020]/8 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.88em] prose-code:text-[#0A1020] prose-code:before:content-none prose-code:after:content-none prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-[#0A1020]/15 prose-pre:bg-[#0A1020] prose-pre:px-5 prose-pre:py-4 prose-pre:font-mono prose-pre:text-[14px] prose-pre:leading-relaxed prose-pre:text-[#E8E0D4] prose-pre:shadow-[0_12px_40px_-20px_rgba(10,16,32,0.65)] prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-[#2563EB] prose-blockquote:bg-[#FFF9EA] prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-[#374151] prose-li:my-1 prose-li:marker:text-[#2563EB]'

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
  const chapter =
    report.chapters.find((c) => c.number === chapterNumber) ?? report.chapters[0] ?? null
  const html = chapter ? renderMarkdown(chapter.content) : ''
  const catalogEntry = getCatalogReports().find((r) => r.id === report.id)
  const coverUrl = catalogEntry ? getCoverUrl(catalogEntry.path) : undefined
  const total = report.chapters.length
  const title = displayTitle(report.title)

  useEffect(() => {
    setTocOpen(false)
  }, [chapterNumber])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrollHeight = el.scrollHeight - el.clientHeight
      const pct = scrollHeight > 0 ? el.scrollTop / scrollHeight : 1
      const chapterShare = total > 0 ? 100 / total : 100
      const base = ((chapterNumber - 1) / total) * 100
      onProgress(report.id, Math.min(100, Math.max(progressPercent, base + pct * chapterShare)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [chapterNumber, onProgress, progressPercent, report.id, total])

  return (
    <div className="min-h-full bg-[#F2EBD6] text-[#111827]">
      <header className="sticky top-0 z-30 border-b border-[#0A1020]/10 bg-[#FFFDF6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Library</span>
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-serif text-sm font-semibold text-[#0A1020] md:text-base">{title}</p>
            <p className="text-xs text-[#708090]">
              Chapter {chapterNumber} of {total}
              {chapter?.title ? ` · ${chapter.title}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTocOpen((open) => !open)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#0A1020]/12 bg-white px-3 py-1.5 text-xs font-semibold text-[#0A1020] lg:hidden"
            aria-expanded={tocOpen}
            aria-controls="study-reader-toc"
          >
            <List className="h-3.5 w-3.5" aria-hidden />
            Contents
          </button>

          <div className="hidden w-[72px] shrink-0 lg:block" aria-hidden />
        </div>
        <div className="h-0.5 bg-[#0A1020]/8">
          <div
            className="h-full bg-[#2563EB] transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside
          id="study-reader-toc"
          className={cn(
            'w-full shrink-0 border-[#0A1020]/10 bg-[#FFFDF6] lg:block lg:w-72 lg:border-r',
            tocOpen ? 'block border-b' : 'hidden',
          )}
        >
          <div className="sticky top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto p-4 md:p-5">
            <div className="mb-5 flex gap-3 border-b border-[#0A1020]/8 pb-4">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt=""
                  className="h-24 w-[4.5rem] shrink-0 rounded-md object-cover shadow-md ring-1 ring-[#0A1020]/10"
                />
              ) : null}
              <div className="min-w-0">
                {report.report_type ? (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2563EB]">
                    {REPORT_TYPE_LABELS[report.report_type]}
                  </p>
                ) : null}
                <p className="font-serif text-sm font-semibold leading-snug text-[#0A1020]">{title}</p>
                <p className="mt-1 text-xs text-[#708090]">{report.author ?? 'Gagan Pasupuleti'}</p>
              </div>
            </div>

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#708090]">
              Table of contents
            </p>
            <nav className="space-y-0.5" aria-label="Chapters">
              {report.chapters.map((ch) => {
                const active = ch.number === (chapter?.number ?? 0)
                return (
                  <button
                    key={ch.number}
                    type="button"
                    onClick={() => onChapterChange(ch.number)}
                    className={cn(
                      'group flex w-full gap-2 rounded-lg px-2 py-2.5 text-left transition-colors',
                      active
                        ? 'bg-[#0A1020]/6'
                        : 'hover:bg-[#0A1020]/4',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 w-1 shrink-0 rounded-full transition-colors',
                        active ? 'bg-[#2563EB]' : 'bg-transparent group-hover:bg-[#0A1020]/15',
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          'block text-[10px] font-semibold uppercase tracking-wider',
                          active ? 'text-[#2563EB]' : 'text-[#708090]',
                        )}
                      >
                        Chapter {ch.number}
                      </span>
                      <span
                        className={cn(
                          'block text-sm leading-snug',
                          active ? 'font-semibold text-[#0A1020]' : 'text-[#374151]',
                        )}
                      >
                        {ch.title}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <article className="px-4 py-8 md:px-10 md:py-12 lg:px-14">
            <div className="mx-auto max-w-[42rem]">
              {chapter ? (
                <ChapterBody chapter={chapter} html={html} />
              ) : (
                <p className="text-sm text-[#4B5563]">No chapters in this report.</p>
              )}

              <nav
                className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[#0A1020]/10 pt-8"
                aria-label="Chapter navigation"
              >
                <CQActionButton
                  variant="ghost"
                  disabled={chapterNumber <= 1}
                  onClick={() => onChapterChange(chapterNumber - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  Previous chapter
                </CQActionButton>
                <span className="text-sm tabular-nums text-[#708090]">
                  {chapterNumber} / {total}
                </span>
                {chapterNumber < total ? (
                  <CQActionButton
                    variant="primary"
                    onClick={() => onChapterChange(chapterNumber + 1)}
                    className="gap-1"
                  >
                    Next chapter
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </CQActionButton>
                ) : (
                  <CQActionButton variant="navy" onClick={() => onProgress(report.id, 100)}>
                    Finish reading
                  </CQActionButton>
                )}
              </nav>
            </div>
          </article>
        </main>
      </div>
    </div>
  )
}

function ChapterBody({ chapter, html }: { chapter: BookReportChapter; html: string }) {
  return (
    <div className="space-y-8">
      <header className="border-b border-[#0A1020]/10 pb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#708090]">
          Chapter {chapter.number}
          {chapter.level ? ` · ${chapter.level}` : ''}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight text-[#0A1020] md:text-4xl">
          {chapter.title}
        </h1>
        {chapter.topic && chapter.topic !== 'intro' ? (
          <p className="mt-3 text-sm italic text-[#708090]">{chapter.topic.replace(/-/g, ' ')}</p>
        ) : null}
      </header>

      <div
        className={READER_PROSE}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {chapter.key_takeaways.length > 0 ? (
        <section className="rounded-2xl border border-[#0A1020]/10 bg-[#FFFDF6] p-6 shadow-[0_8px_30px_-20px_rgba(10,16,32,0.35)]">
          <h2 className="font-serif text-xl font-semibold text-[#0A1020]">Before you move on</h2>
          <p className="mt-1 text-sm text-[#708090]">Three ideas worth keeping from this chapter.</p>
          <ul className="mt-5 space-y-4">
            {chapter.key_takeaways.map((t, i) => (
              <li key={t} className="flex gap-3 text-[16px] leading-relaxed text-[#374151]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1020] font-serif text-sm font-semibold text-[#FAF3E0]">
                  {i + 1}
                </span>
                <span className="pt-0.5">{t}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
