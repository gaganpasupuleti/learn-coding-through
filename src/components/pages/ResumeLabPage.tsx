import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { LocalConnectorPanel } from '@/components/resume-lab/LocalConnectorPanel'
import { STUDENT_PAGE_BG } from '@/components/student-dashboard/dashboard-styles'
import { attachResumeBridge } from '@/lib/ai/resume-bridge'
import { resolveResumeAppUrl } from '@/lib/resume-app-url'
import { cn } from '@/lib/utils'

export function ResumeLabPage() {
  const resolved = useMemo(() => resolveResumeAppUrl(), [])
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const bridgeCleanupRef = useRef<(() => void) | null>(null)
  const [iframeKey, setIframeKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
    bridgeCleanupRef.current?.()
    bridgeCleanupRef.current = attachResumeBridge(iframeRef.current)
  }, [])

  useEffect(() => () => bridgeCleanupRef.current?.(), [])

  const handleReload = useCallback(() => {
    setIsLoading(true)
    setIframeKey((key) => key + 1)
  }, [])

  const handleOpenFullscreen = useCallback(() => {
    if (!resolved.ok) return
    window.open(resolved.url, '_blank', 'noopener,noreferrer')
  }, [resolved])

  if (!resolved.ok) {
    return (
      <div className={cn(STUDENT_PAGE_BG, 'flex min-h-full items-center justify-center p-6')}>
        <div className="max-w-lg rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Resume Lab configuration error</h1>
          <p className="mt-2 text-sm text-slate-600">{resolved.error}</p>
          <p className="mt-4 text-sm text-slate-500">
            Set <code className="rounded bg-slate-100 px-1.5 py-0.5">VITE_RESUME_APP_URL</code> in
            your Code Quest environment or runtime configuration.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(STUDENT_PAGE_BG, 'flex min-h-full flex-col p-4 md:p-6')}>
      <header className="mb-4 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Code Quest Resume Lab
            </h1>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              Full Resume Builder
            </Badge>
          </div>
          <p className="max-w-2xl text-sm text-slate-600">
            Professional templates, live editing and preview, and PDF/DOCX export — powered by
            Reactive Resume.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReload}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Reload
          </button>
          <button
            type="button"
            onClick={handleOpenFullscreen}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Open full screen
          </button>
        </div>
      </header>

      <div className="mb-4">
        <LocalConnectorPanel />
      </div>

      <div className="relative min-h-[min(72vh,900px)] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/80"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" aria-hidden />
            <span className="sr-only">Loading Resume Lab</span>
          </div>
        )}

        <iframe
          ref={iframeRef}
          key={iframeKey}
          title="Code Quest Resume Lab — full resume builder"
          src={resolved.url}
          className="h-full min-h-[min(72vh,900px)] w-full border-0"
          loading="lazy"
          allow="clipboard-read; clipboard-write"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  )
}
