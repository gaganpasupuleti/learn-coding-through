import { useEffect, useState } from 'react'
import { ArrowRight, Loader2, Map } from 'lucide-react'
import { fetchMyStageProgress, fetchUserProgress } from '@/lib/api'
import { readCareerMapLocalSummary } from '@/lib/career-local-summary'

interface LandingProgressStripProps {
  onOpenHub: () => void
  onOpenCareerMap: () => void
  onOpenJobBoard: () => void
}

export function LandingProgressStrip({ onOpenHub, onOpenCareerMap, onOpenJobBoard }: LandingProgressStripProps) {
  const [loading, setLoading] = useState(true)
  const [career, setCareer] = useState<{ title: string; pct: number } | null>(null)
  const [catalogSteps, setCatalogSteps] = useState(0)
  const [stageCount, setStageCount] = useState(0)

  useEffect(() => {
    setCareer(readCareerMapLocalSummary())
    let cancelled = false
    void (async () => {
      try {
        const [catalog, stages] = await Promise.all([
          fetchUserProgress().catch(() => ({ completedSteps: [] })),
          fetchMyStageProgress().catch(() => []),
        ])
        if (cancelled) return
        setCatalogSteps(catalog.completedSteps?.length ?? 0)
        setStageCount(stages.length)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="border-y border-slate-200 bg-gradient-to-b from-slate-50 to-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Your progress snapshot</h2>
            <p className="text-slate-600 mt-2 max-w-xl leading-relaxed">
              A quick read on where you stand—Career Map syllabus and catalog project steps.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenJobBoard}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-white text-slate-800 font-semibold px-5 py-3 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Job Board
            </button>
            <button
              type="button"
              onClick={onOpenHub}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white font-semibold px-5 py-3 shadow-sm hover:bg-blue-700 transition-colors"
            >
              Progress hub
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your stats…
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <Map className="h-4 w-4" />
                Career Map
              </div>
              {career ? (
                <>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">{career.pct}%</p>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-1">{career.title}</p>
                </>
              ) : (
                <button type="button" onClick={onOpenCareerMap} className="text-sm text-blue-600 font-semibold hover:underline">
                  Pick a role →
                </button>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Catalog steps</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{catalogSteps}</p>
              <p className="text-sm text-slate-600 mt-1">Project steps complete</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Stage records</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{stageCount}</p>
              <p className="text-sm text-slate-600 mt-1">Synced with server</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
