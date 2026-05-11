import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Clock, BarChart2, Lock } from 'lucide-react'
import { canStartDemoProject, recordDemoProjectStart, triggerProjectLockedError } from '@/lib/demo-limits'
import { CatalogProjectSummary, fetchCatalogProjects } from '@/lib/api'
import { isDemoUser } from '@/lib/auth'
import { motion } from 'framer-motion'

interface ProjectsPageProps {
  onSelectProject: (projectId: string) => void
}

export function ProjectsPage({ onSelectProject }: ProjectsPageProps) {
  const [projects, setProjects] = useState<CatalogProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const demoMode = isDemoUser()

  const loadProjects = useCallback(() => {
    setLoading(true)
    setLoadError(false)
    fetchCatalogProjects()
      .then((data) => {
        setProjects(data)
      })
      .catch(() => {
        setProjects([])
        setLoadError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 py-14 relative z-10">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground max-w-xl">
            Pick a project to start learning. Each one teaches important coding concepts through hands-on building.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/50 h-52 animate-pulse" />
            ))}
          </div>
        ) : loadError ? (
          <div className="text-center py-20 space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 px-6">
            <p className="text-muted-foreground">Could not load projects. Check that the API is running and try again.</p>
            <button
              type="button"
              onClick={loadProjects}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No projects in the catalog yet. Seed the backend or check back soon.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {projects.map((project, idx) => {
              const unlocked = !demoMode || canStartDemoProject(project.id)

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={unlocked ? { y: -5, scale: 1.02, boxShadow: "0px 10px 30px rgba(99, 102, 241, 0.15)" } : {}}
                  className={`relative group rounded-xl border bg-card/50 backdrop-blur-sm p-6 flex flex-col gap-4 transition-all duration-300 ${
                    unlocked ? 'border-border/50 hover:border-indigo-500/50' : 'border-border/30 opacity-70'
                  }`}
                >
                  {!unlocked && (
                    <span className="absolute top-4 right-4 text-muted-foreground">
                      <Lock size={16} />
                    </span>
                  )}

                  <div className="space-y-1 flex-1">
                    <h3 className="text-base font-semibold text-card-foreground">{project.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {project.description || project.shortDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/50">
                      <BarChart2 size={11} />
                      {project.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/50">
                      <Clock size={11} />
                      {project.estimatedTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                      {project.stepCount} Steps
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-2.5 px-4 rounded-lg transition-all duration-150 ${
                      unlocked
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
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
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

