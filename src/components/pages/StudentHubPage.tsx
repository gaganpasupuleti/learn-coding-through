import { useCallback, useEffect, useState } from 'react'
import { Briefcase, BookOpenCheck, ClipboardList, ExternalLink, Loader2, Map } from 'lucide-react'
import { toast } from 'sonner'
import {
  applyToJob,
  fetchMyStageProgress,
  fetchOpenJobs,
  fetchUserProgress,
  type StageProgressRecord,
  type StudentJobOpen,
} from '@/lib/api'
import { readCareerMapLocalSummary } from '@/lib/career-local-summary'

interface StudentHubPageProps {
  onOpenJobBoard?: () => void
}

export function StudentHubPage({ onOpenJobBoard }: StudentHubPageProps) {
  const [stageRows, setStageRows] = useState<StageProgressRecord[] | null>(null)
  const [catalogSteps, setCatalogSteps] = useState<number | null>(null)
  const [careerLocal, setCareerLocal] = useState<{ title: string; pct: number } | null>(null)
  const [jobs, setJobs] = useState<StudentJobOpen[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [applyBusyId, setApplyBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setCareerLocal(readCareerMapLocalSummary())
    try {
      const [stages, catalog, openJobs] = await Promise.all([
        fetchMyStageProgress().catch(() => [] as StageProgressRecord[]),
        fetchUserProgress().catch(() => ({ completedSteps: [] })),
        fetchOpenJobs().catch(() => [] as StudentJobOpen[]),
      ])
      setStageRows(stages)
      setCatalogSteps(catalog.completedSteps?.length ?? 0)
      setJobs(openJobs)
    } catch {
      toast.error('Could not load hub data. Is the API running?')
      setStageRows([])
      setCatalogSteps(0)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleApply = async (jobId: number) => {
    setApplyBusyId(jobId)
    try {
      const result = await applyToJob(jobId)
      toast.success(result.message || 'Applied')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Apply failed')
    } finally {
      setApplyBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Progress & jobs</h1>
          <p className="text-slate-600 max-w-2xl leading-relaxed">
            Track learning progress across Career Map, catalog projects, and stages—then browse open roles posted by your program.
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
                      <p className="text-xs text-slate-400 mt-2">Based on syllabus items completed in this browser.</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">Select a role in Career Map to track syllabus completion here.</p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                    <BookOpenCheck className="h-4 w-4" />
                    Catalog projects
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">{catalogSteps ?? 0}</p>
                  <p className="text-sm text-slate-600 mt-1">Project steps marked complete (backend)</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                    Stage tracking
                  </div>
                  <p className="text-sm text-slate-600">
                    {(stageRows?.length ?? 0) > 0
                      ? `${stageRows!.length} stage record(s) synced with the server.`
                      : 'No stage progress rows yet—progress from legacy roadmap flows will appear here when recorded.'}
                  </p>
                </div>
              </div>

              {(stageRows?.length ?? 0) > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Stage</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Lessons</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Quiz</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Unlocked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stageRows!.map((row) => (
                        <tr key={row.stage_id} className="border-b border-slate-50 last:border-0">
                          <td className="px-4 py-3 font-mono text-xs text-slate-800">{row.stage_id}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.lessons_completed}/{row.total_lessons}
                          </td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">{row.latest_quiz_score}%</td>
                          <td className="px-4 py-3 text-slate-600">{row.unlocked ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  Open jobs
                </h2>
                {onOpenJobBoard ? (
                  <button
                    type="button"
                    onClick={onOpenJobBoard}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 w-fit"
                  >
                    Full job board →
                  </button>
                ) : null}
              </div>
              {!jobs || jobs.length === 0 ? (
                <p className="text-sm text-slate-600 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
                  No open jobs right now. Check back after admins publish roles.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {jobs.map((job) => (
                    <article
                      key={job.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3"
                    >
                      <div>
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <p className="text-sm text-slate-500">
                          {job.company_name} · {job.location} · {job.employment_type}
                        </p>
                        {job.eligible_batch_name && (
                          <p className="text-xs text-slate-400 mt-1">Eligible batch: {job.eligible_batch_name}</p>
                        )}
                      </div>
                      {job.description && (
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{job.description}</p>
                      )}
                      <div className="mt-auto flex flex-col gap-2">
                        {job.external_apply_url ? (
                          <a
                            href={job.external_apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex justify-center items-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm font-semibold px-4 py-2 hover:bg-slate-50"
                          >
                            View listing
                            <ExternalLink className="h-4 w-4" aria-hidden />
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleApply(job.id)}
                          disabled={applyBusyId === job.id}
                          className="inline-flex justify-center items-center gap-2 rounded-lg bg-blue-600 text-white text-sm font-semibold px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
                        >
                          {applyBusyId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {job.external_apply_url ? 'Log interest' : 'Apply'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
