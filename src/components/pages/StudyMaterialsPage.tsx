import { useEffect, useMemo, useState } from 'react'

import { STUDY_MATERIALS_SAMPLE } from '@/data/studyMaterialsSample'

export function StudyMaterialsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [contentType, setContentType] = useState('')
  const [domain, setDomain] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('materialsError') === '1') {
      setError('Sample study materials could not be loaded.')
      setLoading(false)
      return
    }
    const timer = window.setTimeout(() => setLoading(false), 150)
    return () => window.clearTimeout(timer)
  }, [])

  const items = error ? [] : STUDY_MATERIALS_SAMPLE

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (contentType && item.content_type !== contentType) return false
      if (domain && !item.domains.includes(domain)) return false
      if (!q) return true
      const haystack = [item.title, item.author, ...item.tags].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [items, search, contentType, domain])

  const domains = useMemo(
    () => [...new Set(STUDY_MATERIALS_SAMPLE.flatMap((item) => item.domains))].sort(),
    [],
  )

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Study Materials</h1>
        <p className="text-sm text-slate-600">
          Functional test shell — static sample content only. No API or downloads.
        </p>
      </header>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
        <label className="block space-y-1 md:col-span-3">
          <span className="text-xs font-medium uppercase text-slate-500">Search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, author, or tag"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            disabled={loading || Boolean(error)}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium uppercase text-slate-500">Content type</span>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            disabled={loading || Boolean(error)}
          >
            <option value="">All</option>
            <option value="book">Book</option>
            <option value="article">Article</option>
            <option value="audiobook">Audiobook</option>
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium uppercase text-slate-500">Domain</span>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            disabled={loading || Boolean(error)}
          >
            <option value="">All</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <p className="flex items-end text-sm text-slate-600 md:col-span-3">
          {loading
            ? 'Loading sample materials…'
            : error
              ? 'Unable to show materials.'
              : `Showing ${filtered.length} of ${items.length} items`}
        </p>
      </div>

      {loading && (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
          Loading…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="font-medium text-slate-800">No materials match</p>
          <p className="mt-1 text-sm text-slate-600">Try a different search or filter.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded bg-slate-100 px-2 py-0.5 uppercase">{item.content_type}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5">{item.domains.join(', ')}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5">{item.review_status}</span>
              </div>
              <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
              <p className="text-sm text-slate-600">{item.author}</p>
              <p className="mt-2 text-sm text-slate-700">{item.summary}</p>
              <p className="mt-2 text-xs text-slate-500">
                Metadata only · {item.license_status} · no downloaded file
              </p>
              {item.source_url ? (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  Open source
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
