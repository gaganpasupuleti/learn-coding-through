import type { CareerPath, StageStatus } from './careerPaths'

interface Props {
  path: CareerPath
  stageStatuses: Record<string, StageStatus>
}

export function CareerReadinessPanel({ path, stageStatuses }: Props) {
  const total = path.stages.length
  const completed = path.stages.filter((s) => stageStatuses[s.id] === 'completed').length
  const isCurrent = (id: string) => stageStatuses[id] === 'current'
  const currentStage = path.stages.find((s) => isCurrent(s.id))
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

  const isJobReady = pct >= 85

  return (
    <div className={`rounded-xl border p-4 space-y-4 ${path.theme.bg} border-current/20`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">
            Job Readiness
          </p>
          <p className="text-2xl font-black text-slate-900">
            {pct}%
          </p>
        </div>
        <div
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border ${
            isJobReady
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {isJobReady ? '🎉 Job Ready!' : `${total - completed} stages left`}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 rounded-full bg-white/60 border border-current/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${path.theme.progressBar}`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${pct}% job readiness`}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          {completed} of {total} stages complete
        </p>
      </div>

      {/* Stage breakdown */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {(['completed', 'current', 'locked'] as const).map((status) => {
          const count = path.stages.filter((s) => stageStatuses[s.id] === status).length
          const label = status === 'completed' ? '✓ Done' : status === 'current' ? '▶ Active' : '🔒 Locked'
          const cls =
            status === 'completed'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : status === 'current'
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-slate-500 bg-slate-50 border-slate-200'
          return (
            <div key={status} className={`rounded-lg border py-2 px-1 ${cls}`}>
              <p className="text-base font-black">{count}</p>
              <p className="text-[10px] font-semibold">{label}</p>
            </div>
          )
        })}
      </div>

      {currentStage && (
        <div className="rounded-lg border border-current/20 bg-white/60 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Now Learning
          </p>
          <p className="text-xs font-bold text-slate-900">{currentStage.title}</p>
          <p className="text-[11px] text-slate-500">{currentStage.subtitle}</p>
        </div>
      )}

      <div className="border-t border-current/10 pt-3">
        <p className="text-[10px] text-slate-500 font-medium">
          <span className="font-bold text-slate-700">{path.roleLabel}</span>{' '}
          · {path.salaryRange} · {path.duration}
        </p>
      </div>
    </div>
  )
}
