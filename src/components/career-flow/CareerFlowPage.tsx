import { useEffect, useState } from 'react'
import type { CareerPath, StageStatus } from './careerPaths'
import { CAREER_PATHS, getDefaultStageStatuses } from './careerPaths'
import { CareerPathSelector } from './CareerPathSelector'
import { CareerJourneyMap } from './CareerJourneyMap'
import { CareerStageDetailPanel } from './CareerStageDetailPanel'
import { CareerReadinessPanel } from './CareerReadinessPanel'

const LS_PATH_KEY = 'career-flow-selected-path'
const LS_STAGE_KEY = 'career-flow-stage-statuses'

function loadStatuses(pathId: string): Record<string, StageStatus> {
  try {
    const raw = localStorage.getItem(`${LS_STAGE_KEY}-${pathId}`)
    return raw ? (JSON.parse(raw) as Record<string, StageStatus>) : {}
  } catch {
    return {}
  }
}

export function CareerFlowPage() {
  const [selectedPathId, setSelectedPathId] = useState<CareerPath['id']>(() => {
    try {
      const saved = localStorage.getItem(LS_PATH_KEY)
      if (saved && CAREER_PATHS.find((p) => p.id === saved)) return saved as CareerPath['id']
    } catch { /* ignore */ }
    return 'data-analytics'
  })

  const [stageStatuses, setStageStatuses] = useState<Record<string, StageStatus>>(() => {
    const path = CAREER_PATHS.find((p) => p.id === 'data-analytics')!
    const saved = loadStatuses('data-analytics')
    return Object.keys(saved).length > 0 ? saved : getDefaultStageStatuses(path)
  })

  const [selectedStageId, setSelectedStageId] = useState<string | null>(() => {
    const path = CAREER_PATHS.find((p) => p.id === 'data-analytics')!
    const defaultStatuses = getDefaultStageStatuses(path)
    return path.stages.find((s) => defaultStatuses[s.id] === 'current')?.id ?? path.stages[0]?.id ?? null
  })

  const [detailOpen, setDetailOpen] = useState(false)

  const selectedPath = CAREER_PATHS.find((p) => p.id === selectedPathId)!

  const handleSelectPath = (id: CareerPath['id']) => {
    setSelectedPathId(id)
    try { localStorage.setItem(LS_PATH_KEY, id) } catch { /* ignore */ }

    const path = CAREER_PATHS.find((p) => p.id === id)!
    const saved = loadStatuses(id)
    const statuses = Object.keys(saved).length > 0 ? saved : getDefaultStageStatuses(path)
    setStageStatuses(statuses)

    // Auto-select the current stage
    const currentStage = path.stages.find((s) => statuses[s.id] === 'current')
    setSelectedStageId(currentStage?.id ?? path.stages[0]?.id ?? null)
    setDetailOpen(false)
  }

  const handleSelectStage = (stageId: string) => {
    setSelectedStageId(stageId)
    setDetailOpen(true)
  }

  // Sync statuses when path changes externally (shouldn't happen normally)
  useEffect(() => {
    // no-op – handled in handleSelectPath
  }, [selectedPathId])

  const selectedStage = selectedStageId
    ? selectedPath.stages.find((s) => s.id === selectedStageId) ?? null
    : null

  const selectedStageStatus: StageStatus = selectedStageId
    ? (stageStatuses[selectedStageId] ?? 'locked')
    : 'locked'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* ── Page header ── */}
        <header className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Career Flow Roadmap
            </h1>
            <span className="text-xs font-bold uppercase tracking-widest border border-indigo-200 text-indigo-600 bg-indigo-50 rounded px-2 py-0.5">
              Beta
            </span>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Choose your data career path and follow a structured journey through every stage —
            skills, projects, quizzes, and interview prep — until you're job-ready.
          </p>
        </header>

        {/* ── Path selector ── */}
        <CareerPathSelector
          paths={CAREER_PATHS}
          selectedId={selectedPathId}
          onSelect={handleSelectPath}
        />

        {/* ── Path description ── */}
        <div className={`rounded-xl border border-current/20 px-4 py-3 ${selectedPath.theme.bg}`}>
          <p className={`text-sm leading-relaxed ${selectedPath.theme.primary} font-medium`}>
            {selectedPath.description}
          </p>
        </div>

        {/* ── Main layout: map + sidebar ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

          {/* Left: Journey map + detail panel (mobile stacked) */}
          <div className="space-y-4">

            {/* Roadmap board */}
            <section
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              aria-label={`${selectedPath.title} learning journey`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Learning Journey
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedPath.stages.length} stages · click any stage to explore
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${selectedPath.theme.badgeClass}`}>
                  {selectedPath.title}
                </span>
              </div>

              <div className="p-4">
                <CareerJourneyMap
                  path={selectedPath}
                  stageStatuses={stageStatuses}
                  selectedStageId={selectedStageId}
                  onSelectStage={handleSelectStage}
                />
              </div>
            </section>

            {/* Detail panel (desktop: shown inline below map on < xl; xl+ shown in sidebar) */}
            {selectedStage && detailOpen && (
              <section
                className="xl:hidden bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                aria-label="Stage detail"
              >
                <CareerStageDetailPanel
                  stage={selectedStage}
                  status={selectedStageStatus}
                  theme={selectedPath.theme}
                  onClose={() => setDetailOpen(false)}
                />
              </section>
            )}

            {/* Empty state when no stage selected */}
            {(!selectedStage || !detailOpen) && (
              <div className="xl:hidden rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <p className="text-3xl mb-2" aria-hidden>👆</p>
                <p className="text-sm font-bold text-slate-700">Click a stage to explore it</p>
                <p className="text-xs text-slate-400 mt-1">
                  See lessons, tools, practice tasks, and checkpoints
                </p>
              </div>
            )}
          </div>

          {/* Right: Sidebar (xl+ only) */}
          <aside className="hidden xl:flex xl:flex-col gap-4">
            {/* Readiness panel always visible */}
            <CareerReadinessPanel
              path={selectedPath}
              stageStatuses={stageStatuses}
            />

            {/* Detail panel in sidebar */}
            {selectedStage ? (
              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-h-[600px]">
                <CareerStageDetailPanel
                  stage={selectedStage}
                  status={selectedStageStatus}
                  theme={selectedPath.theme}
                />
              </div>
            ) : (
              <div className="flex-1 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <p className="text-3xl mb-2" aria-hidden>👆</p>
                <p className="text-sm font-bold text-slate-700">Click a stage</p>
                <p className="text-xs text-slate-400 mt-1">
                  Lessons, tools, practice tasks &amp; checkpoints appear here
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* ── Mobile: Readiness panel below everything ── */}
        <div className="xl:hidden">
          <CareerReadinessPanel
            path={selectedPath}
            stageStatuses={stageStatuses}
          />
        </div>

      </div>
    </div>
  )
}
