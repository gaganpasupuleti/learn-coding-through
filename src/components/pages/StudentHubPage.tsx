import { useCallback, useEffect, useState } from 'react'
import { Briefcase, BookOpenCheck, ClipboardList, Loader2, Map } from 'lucide-react'
import { toast } from 'sonner'
import { fetchMyStageProgress, fetchUserProgress, type StageProgressRecord } from '@/lib/api'
import { readCareerMapLocalSummary } from '@/lib/career-local-summary'

interface StudentHubPageProps {
  onOpenJobBoard?: () => void
}

export function StudentHubPage({ onOpenJobBoard }: StudentHubPageProps) {
  const [stageRows, setStageRows] = useState<StageProgressRecord[] | null>(null)
  const [catalogSteps, setCatalogSteps] = useState<number | null>(null)
  const [careerLocal, setCareerLocal] = useState<{ title: string; pct: number } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setCareerLocal(readCareerMapLocalSummary())
    try {
      const [stages, catalog] = await Promise.all([
        fetchMyStageProgress().catch(() => [] as StageProgressRecord[]),
        fetchUserProgress().catch(() => ({ completedSteps: [] })),
      ])
      setStageRows(stages)
      setCatalogSteps(catalog.completedSteps?.length ?? 0)
    } catch {
      toast.error('Could not load hub data. Is the API running?')
      setStageRows([])
      setCatalogSteps(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Progress hub</h1>
          <p className="text-slate-600 max-w-2xl leading-relaxed">
            Track learning progress across Career Map, catalog projects, and stages.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 py-12">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your hub…
          </div>
        ) : (
          <>
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                Learning progress
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                    <Map className="h-4 w-4" />
                    Career Map
                  </div>
                  {careerLocal ? (
                    <>
                      <p className="text-2xl font-bold text-slate-900 tabular-nums">{careerLocal.pct}%</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">Role: {careerLocal.title}</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">Select a role in Career Map to track syllabus completion.</p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                    <BookOpenCheck className="h-4 w-4" />
                    Catalog projects
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">{catalogSteps ?? 0}</p>
                  <p className="text-sm text-slate-600 mt-1">Project steps marked complete</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Stage tracking</div>
                  <p className="text-sm text-slate-600">
                    {(stageRows?.length ?? 0) > 0
                      ? `${stageRows!.length} stage record(s) synced with the server.`
                      : 'No stage progress rows yet.'}
                  </p>
                </div>
              </div>
            </section>

            {onOpenJobBoard && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-semibold text-slate-900">Job Board</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Browse live roles curated for Code Quest students — internships, fresher, and entry-level positions.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenJobBoard}
                  className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Open Job Board
                </button>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
