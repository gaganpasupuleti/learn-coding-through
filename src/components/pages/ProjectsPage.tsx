import { useEffect, useState } from 'react'
import { ArrowRight, Clock, BarChart2, Lock } from 'lucide-react'
import { canStartDemoProject, recordDemoProjectStart, triggerProjectLockedError } from '@/lib/demo-limits'
import { CatalogProjectSummary, fetchCatalogProjects } from '@/lib/api'
import { isDemoUser } from '@/lib/auth'

interface ProjectsPageProps {
  onSelectProject: (projectId: string) => void
}

export function ProjectsPage({ onSelectProject }: ProjectsPageProps) {
  const [projects, setProjects] = useState<CatalogProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const demoMode = isDemoUser()

  useEffect(() => {
    fetchCatalogProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="text-slate-500 max-w-xl">
            Pick a project to start learning. Each one teaches important coding concepts through hands-on building.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 h-52 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No projects available yet. Check back soon!</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {projects.map((project) => {
              const unlocked = !demoMode || canStartDemoProject(project.id)

              return (
                <div
                  key={project.id}
                  className={`relative group rounded-xl border bg-white p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    unlocked ? 'border-slate-200 hover:border-blue-200' : 'border-slate-200 opacity-80'
                  }`}
                >
                  {!unlocked && (
                    <span className="absolute top-4 right-4 text-slate-400">
                      <Lock size={16} />
                    </span>
                  )}

                  <div className="space-y-1 flex-1">
                    <h3 className="text-base font-semibold text-slate-900">{project.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {project.description || project.shortDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      <BarChart2 size={11} />
                      {project.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Clock size={11} />
                      {project.estimatedTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                      {project.stepCount} Steps
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-2.5 px-4 rounded-lg transition-all duration-150 ${
                      unlocked
                        ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (!unlocked) {
                        triggerProjectLockedError()
                        return
                      }
                      if (demoMode) {
                        recordDemoProjectStart(project.id)
                      }
                      onSelectProject(project.id)
                    }}
                  >
                    {unlocked ? (
                      <>
                        Start Project
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </>
                    ) : (
                      <>
                        <Lock size={13} />
                        Locked
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
