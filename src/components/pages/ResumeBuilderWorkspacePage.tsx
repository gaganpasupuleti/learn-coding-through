import { useCallback, useMemo, useState } from 'react'
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { STUDENT_PAGE_BG } from '@/components/student-dashboard/dashboard-styles'
import { resolveResumeAppUrl } from '@/lib/resume-app-url'
import { cn } from '@/lib/utils'

type Props = {
  onBack: () => void
}

export function ResumeBuilderWorkspacePage({ onBack }: Props) {
  const resolved = useMemo(() => resolveResumeAppUrl(), [])
  const [iframeKey, setIframeKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const iframeSrc = resolved.ok ? resolved.url : null

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleReload = useCallback(() => {
    setIsLoading(true)
    setIframeKey((key) => key + 1)
  }, [])

  const handleOpenFullscreen = useCallback(() => {
    if (!iframeSrc) return
    window.open(iframeSrc, '_blank', 'noopener,noreferrer')
  }, [iframeSrc])

  if (!resolved.ok) {
    return (
      <div className={cn(STUDENT_PAGE_BG, 'flex min-h-full items-center justify-center p-6')}>
        <div className="max-w-lg rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Resume builder configuration error</h1>
          <p className="mt-2 text-sm text-slate-600">{resolved.error}</p>
          <button type="button" onClick={onBack} className="mt-4 text-sm font-medium text-slate-900 underline">
            Back to Resume Lab
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(STUDENT_PAGE_BG, 'flex min-h-0 min-w-0 flex-1 flex-col p-2 sm:p-3 md:p-4')}>
      <header className="mb-2 flex flex-shrink-0 flex-col gap-2 border-b border-slate-200 pb-2 sm:mb-3 sm:gap-3 sm:pb-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Resume Lab
          </button>
          <h1 className="truncate text-[clamp(1rem,2vw,1.25rem)] font-bold tracking-tight text-slate-900">
            Resume builder
          </h1>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            Resume Matcher
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReload}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Reload
          </button>
          <button
            type="button"
            onClick={handleOpenFullscreen}
            disabled={!iframeSrc}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:opacity-50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Open full screen</span>
            <span className="sm:hidden">Fullscreen</span>
          </button>
        </div>
      </header>

      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/80"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" aria-hidden />
            <span className="ml-3 text-sm text-slate-600">Opening Resume Matcher…</span>
          </div>
        ) : null}

        {iframeSrc ? (
          <iframe
            key={iframeKey}
            title="Resume Matcher — resume builder workspace"
            src={iframeSrc}
            className="h-full min-h-0 w-full border-0"
            allow="clipboard-read; clipboard-write"
            onLoad={handleIframeLoad}
          />
        ) : null}
      </div>
    </div>
  )
}
