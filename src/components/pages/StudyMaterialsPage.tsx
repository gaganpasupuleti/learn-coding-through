import { marked } from 'marked'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { familyLabel, rolesForBookFamily } from '@/data/bookReportFamilyRoles'
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
import type { BookReportChapter, CatalogReport, StudyReport } from '@/types/bookReports'

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
  return marked.parse(body, { async: false }) as string
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
  }, [allReports, search, familyFilter, roleFilter, levelFilter])

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
        }}
        onProgress={markProgress}
      />
    )
  }

  const totalChapters = totalChapterCount()

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Study Materials</h1>
        <p className="text-sm text-slate-600">
          Original Code Quest study reports by Gagan Pasupuleti — read in-app, mapped to job roles.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Study reports" value={allReports.length} hint="Reading-ready in-app" />
        <StatCard label="Chapters" value={totalChapters} hint="Across all reports" />
        <StatCard label="Topic families" value={BOOK_REPORTS_CATALOG.families.length} hint="Python learning paths" />
        <StatCard label="Job roles mapped" value={JOB_ROLE_CATALOG.length} hint="Filter by target role" />
      </div>

      {roleFilter ? (
        <p className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
          <strong>{roleName(roleFilter)}:</strong> {countReportsForRole(roleFilter)} study reports (
          {totalChapters} chapters shared across roles)
        </p>
      ) : null}

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
        <label className="block space-y-1 md:col-span-4">
          <span className="text-xs font-medium uppercase text-slate-500">Search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Report title, family, level, or role"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium uppercase text-slate-500">Target role</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All roles</option>
            {JOB_ROLE_CATALOG.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.role_name} ({countReportsForRole(role.role_id)})
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium uppercase text-slate-500">Topic family</span>
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All families</option>
            {BOOK_REPORTS_CATALOG.families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.report_count})
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium uppercase text-slate-500">Level</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All levels</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <p className="flex items-end text-sm text-slate-600 md:col-span-4">
          Showing {filtered.length} of {allReports.length} reports
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="font-medium text-slate-800">No reports match</p>
          <p className="mt-1 text-sm text-slate-600">Try a different search or filter.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Role → family guide</h2>
        <p className="mt-1 text-xs text-slate-500">
          Which topic families suit each job role (primary mapping for filters above).
        </p>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {JOB_ROLE_CATALOG.map((role) => {
            const families = BOOK_REPORTS_CATALOG.families.filter((f) =>
              rolesForBookFamily(f.id).includes(role.role_id),
            )
            if (families.length === 0) return null
            return (
              <li key={role.role_id} className="rounded-md bg-slate-50 px-3 py-2">
                <span className="font-medium text-slate-800">{role.role_name}</span>
                <span className="text-slate-600"> — {families.map((f) => f.name).join(', ')}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
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
    <li className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt=""
          className="h-44 w-full border-b border-slate-200 object-cover object-top"
          loading="lazy"
        />
      ) : null}
      <div className="flex flex-1 flex-col p-4">
      <div className="mb-2 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded bg-violet-100 px-2 py-0.5 text-violet-800">Study report</span>
        <span className="rounded bg-slate-100 px-2 py-0.5">{getFamilyName(report.family_id)}</span>
        <span className="rounded bg-slate-100 px-2 py-0.5">{report.level}</span>
      </div>
      <h2 className="text-base font-semibold leading-snug text-slate-900">{report.title}</h2>
      <p className="mt-1 text-sm text-slate-600">{report.author ?? 'Gagan Pasupuleti'}</p>
      <p className="mt-2 flex-1 text-sm text-slate-700">{report.chapter_count} chapters · reading-ready</p>
      {roleIds.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {roleIds.slice(0, 3).map((roleId) => (
            <span key={roleId} className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs text-indigo-800">
              {roleName(roleId)}
            </span>
          ))}
          {roleIds.length > 3 ? (
            <span className="text-xs text-slate-500">+{roleIds.length - 3}</span>
          ) : null}
        </div>
      ) : null}
      {progressPercent > 0 ? (
        <div className="mt-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-violet-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{progressPercent}% read</p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
      >
        Read now
      </button>
      </div>
    </li>
  )
}

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
  const chapter =
    report.chapters.find((c) => c.number === chapterNumber) ?? report.chapters[0] ?? null
  const roleIds = rolesForBookFamily(report.family_id)
  const html = chapter ? renderMarkdown(chapter.content) : ''
  const catalogEntry = getCatalogReports().find((r) => r.id === report.id)
  const coverUrl = catalogEntry ? getCoverUrl(catalogEntry.path) : undefined

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrollHeight = el.scrollHeight - el.clientHeight
      const pct = scrollHeight > 0 ? (el.scrollTop / scrollHeight) * 100 : 100
      const chapterShare = report.chapters.length > 0 ? 100 / report.chapters.length : 100
      const base = ((chapterNumber - 1) / report.chapters.length) * 100
      onProgress(report.id, Math.min(100, Math.max(progressPercent, base + (pct / 100) * chapterShare)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [chapterNumber, onProgress, progressPercent, report.chapters.length, report.id])

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-violet-700 hover:text-violet-900"
      >
        ← Back to library
      </button>

      <header className="space-y-2 border-b border-slate-200 pb-4">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="mx-auto h-56 w-full max-w-xs rounded-lg border border-slate-200 object-cover shadow-sm"
          />
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded bg-violet-100 px-2 py-0.5 text-violet-800">Study report</span>
          <span className="rounded bg-slate-100 px-2 py-0.5">
            {report.family_name ?? familyLabel(report.family_id)}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5">{report.level}</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{report.title}</h1>
        <p className="text-sm text-slate-600">{report.author ?? 'Gagan Pasupuleti'}</p>
        <p className="text-sm text-slate-700">{report.summary}</p>
        {roleIds.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-1">
            <span className="text-xs font-medium text-slate-500">Mapped roles:</span>
            {roleIds.map((roleId) => (
              <span key={roleId} className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-800">
                {roleName(roleId)}
              </span>
            ))}
          </div>
        ) : null}
        {progressPercent > 0 ? (
          <div className="pt-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-violet-500 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{Math.round(progressPercent)}% complete</p>
          </div>
        ) : null}
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Chapters">
        {report.chapters.map((ch) => (
          <button
            key={ch.number}
            type="button"
            onClick={() => onChapterChange(ch.number)}
            className={
              ch.number === (chapter?.number ?? 0)
                ? 'rounded-md bg-violet-600 px-2.5 py-1 text-xs font-medium text-white'
                : 'rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50'
            }
          >
            {ch.number}. {ch.title.length > 28 ? `${ch.title.slice(0, 28)}…` : ch.title}
          </button>
        ))}
      </nav>

      {chapter ? (
        <ChapterBody chapter={chapter} html={html} />
      ) : (
        <p className="text-sm text-slate-600">No chapters in this report.</p>
      )}

      <div className="flex flex-wrap gap-2 pb-8">
        {chapterNumber > 1 ? (
          <button
            type="button"
            onClick={() => onChapterChange(chapterNumber - 1)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Previous chapter
          </button>
        ) : null}
        {chapterNumber < report.chapters.length ? (
          <button
            type="button"
            onClick={() => onChapterChange(chapterNumber + 1)}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Next chapter
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onProgress(report.id, 100)}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Mark complete
          </button>
        )}
      </div>
    </div>
  )
}

function ChapterBody({ chapter, html }: { chapter: BookReportChapter; html: string }) {
  return (
    <article className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">
        Chapter {chapter.number}: {chapter.title}
      </h2>
      <div
        className="prose prose-sm max-w-none text-slate-800 prose-headings:text-slate-900 prose-pre:bg-slate-900 prose-pre:text-slate-100"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {chapter.key_takeaways.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Key takeaways</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {chapter.key_takeaways.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
