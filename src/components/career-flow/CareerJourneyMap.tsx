import type { CareerPath, StageStatus } from './careerPaths'
import { CareerStageNode } from './CareerStageNode'

interface Props {
  path: CareerPath
  stageStatuses: Record<string, StageStatus>
  selectedStageId: string | null
  onSelectStage: (id: string) => void
}

export function CareerJourneyMap({ path, stageStatuses, selectedStageId, onSelectStage }: Props) {
  const { stages, theme } = path

  return (
    <div className="w-full">
      {/*
        Desktop: horizontal scroll row of nodes with connector lines
        Mobile: vertical column of nodes with left-side connector
      */}

      {/* ─── Desktop layout (md+): horizontal flow ─── */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="flex items-start gap-0 min-w-max px-2 py-4">
          {stages.map((stage, idx) => {
            const status = stageStatuses[stage.id] ?? 'locked'
            const isSelected = selectedStageId === stage.id
            const isLast = idx === stages.length - 1

            return (
              <div key={stage.id} className="flex items-start">
                <CareerStageNode
                  stage={stage}
                  status={status}
                  index={idx}
                  isSelected={isSelected}
                  theme={theme}
                  onClick={() => onSelectStage(stage.id)}
                />

                {/* Connector line between nodes */}
                {!isLast && (
                  <div className="flex items-center self-start mt-5 mx-1">
                    <div
                      className={`h-0.5 w-10 rounded-full transition-colors duration-300 ${
                        stageStatuses[stages[idx + 1]?.id] !== 'locked'
                          ? theme.connectorColor
                          : 'bg-slate-200'
                      }`}
                      aria-hidden
                    />
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      className={`shrink-0 ${
                        stageStatuses[stages[idx + 1]?.id] !== 'locked'
                          ? theme.primaryLight
                          : 'text-slate-300'
                      }`}
                      aria-hidden
                    >
                      <polygon points="0,0 8,4 0,8" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Mobile layout: vertical flow ─── */}
      <div className="flex flex-col gap-0 md:hidden px-2 py-2">
        {stages.map((stage, idx) => {
          const status = stageStatuses[stage.id] ?? 'locked'
          const isSelected = selectedStageId === stage.id
          const isLast = idx === stages.length - 1

          return (
            <div key={stage.id} className="flex items-stretch gap-3">
              {/* Left column: connector + bubble */}
              <div className="flex flex-col items-center gap-0 shrink-0">
                <button
                  type="button"
                  aria-label={`Stage ${idx + 1}: ${stage.title} — ${status}`}
                  onClick={status !== 'locked' ? () => onSelectStage(stage.id) : undefined}
                  disabled={status === 'locked'}
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    transition-all duration-200 z-10 relative mt-2
                    ${status === 'locked' ? 'bg-slate-200 text-slate-400 cursor-default' : `${theme.nodeBg} text-white cursor-pointer hover:scale-110`}
                    ${status === 'current' ? `ring-4 ring-offset-2 ${theme.currentRing}` : ''}
                    ${isSelected && status !== 'locked' ? 'scale-110' : ''}
                  `}
                >
                  {status === 'completed' ? '✓' : idx + 1}
                </button>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[2rem] rounded-full my-1 ${
                      stageStatuses[stages[idx + 1]?.id] !== 'locked'
                        ? theme.connectorColor
                        : 'bg-slate-200'
                    }`}
                    aria-hidden
                  />
                )}
              </div>

              {/* Right column: card */}
              <div className="flex-1 pb-3">
                <button
                  type="button"
                  onClick={status !== 'locked' ? () => onSelectStage(stage.id) : undefined}
                  disabled={status === 'locked'}
                  className={`
                    w-full rounded-xl border p-3 text-left transition-all duration-200
                    ${status === 'locked' ? 'cursor-default opacity-70 bg-slate-50 border-slate-200' : 'cursor-pointer hover:shadow-md'}
                    ${isSelected ? 'shadow-md border-2' : 'border'}
                    ${status === 'current' ? `${theme.bg} border-current` : status === 'completed' ? 'bg-white border-slate-200' : ''}
                    ${isSelected && status !== 'locked' ? 'border-current/60' : ''}
                  `}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 leading-snug">{stage.title}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                      status === 'completed' ? 'text-emerald-600' : status === 'current' ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {status === 'completed' ? '✓' : status === 'current' ? '▶' : '🔒'}
                    </span>
                  </div>
                  <p className={`text-[11px] ${status === 'locked' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {stage.subtitle}
                  </p>
                  {status !== 'locked' && stage.checkpoints.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stage.checkpoints.map((cp) => (
                        <span
                          key={cp.label}
                          className="text-[10px] px-1.5 py-0.5 rounded border bg-white text-slate-600 border-slate-200"
                        >
                          {cp.label}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stage count legend */}
      <div className="flex items-center gap-4 flex-wrap px-2 pt-2 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${theme.nodeBg}`} aria-hidden />
          <span className="text-[11px] text-slate-500">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${theme.nodeBg} ring-2 ${theme.currentRing} ring-offset-1`} aria-hidden />
          <span className="text-[11px] text-slate-500">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-200" aria-hidden />
          <span className="text-[11px] text-slate-500">Locked</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[11px] font-bold text-slate-500">{stages.length} stages total</span>
        </div>
      </div>
    </div>
  )
}
