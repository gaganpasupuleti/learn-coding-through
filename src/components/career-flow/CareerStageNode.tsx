import type { CareerStage, StageStatus, PathTheme } from './careerPaths'
import { CareerCheckpointBadge } from './CareerCheckpointBadge'

interface Props {
  stage: CareerStage
  status: StageStatus
  index: number
  isSelected: boolean
  theme: PathTheme
  onClick: () => void
}

const STATUS_LABEL: Record<StageStatus, { text: string; class: string }> = {
  completed: { text: '✓ Completed', class: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  current:   { text: '▶ In Progress', class: 'text-amber-700 bg-amber-50 border-amber-200' },
  locked:    { text: '🔒 Locked', class: 'text-slate-500 bg-slate-100 border-slate-200' },
}

export function CareerStageNode({ stage, status, index, isSelected, theme, onClick }: Props) {
  const nodeColor = status === 'locked' ? 'bg-slate-200' : theme.nodeBg
  const ringColor = status === 'current' ? theme.currentRing : ''
  const cardBorder = isSelected ? `border-2 ${status === 'locked' ? 'border-slate-300' : 'border-current/60'}` : 'border'
  const statusLabel = STATUS_LABEL[status]

  return (
    <div className="flex flex-col items-center group">
      {/* Index bubble */}
      <button
        type="button"
        aria-label={`Stage ${index + 1}: ${stage.title} — ${status}`}
        onClick={status !== 'locked' ? onClick : undefined}
        disabled={status === 'locked'}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0
          transition-all duration-200 z-10 relative
          ${nodeColor} text-white
          ${status === 'current' ? `ring-4 ring-offset-2 ${ringColor}` : ''}
          ${status === 'locked' ? 'cursor-default text-slate-400' : 'cursor-pointer hover:scale-110'}
          ${isSelected && status !== 'locked' ? 'scale-110' : ''}
        `}
      >
        {status === 'completed' ? '✓' : index + 1}
      </button>

      {/* Stage card */}
      <button
        type="button"
        onClick={status !== 'locked' ? onClick : undefined}
        disabled={status === 'locked'}
        className={`
          mt-3 w-full max-w-[180px] rounded-xl p-3 text-left
          transition-all duration-200
          ${cardBorder}
          ${status === 'locked' ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}
          ${isSelected ? 'shadow-md' : ''}
          ${status === 'current' ? theme.bg : status === 'completed' ? 'bg-white' : 'bg-slate-50/80'}
        `}
        aria-pressed={isSelected}
      >
        <div className="flex flex-col gap-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest border rounded px-1.5 py-0.5 w-fit
              ${statusLabel.class}`}
          >
            {statusLabel.text}
          </span>

          <span
            className={`text-xs font-bold leading-snug ${
              status === 'locked' ? 'text-slate-400' : 'text-slate-900'
            }`}
          >
            {stage.title}
          </span>

          <span className={`text-[11px] leading-snug ${status === 'locked' ? 'text-slate-400' : 'text-slate-500'}`}>
            {stage.subtitle}
          </span>

          {status !== 'locked' && stage.checkpoints.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {stage.checkpoints.map((cp) => (
                <CareerCheckpointBadge key={cp.label} checkpoint={cp} size="sm" />
              ))}
            </div>
          )}

          {status === 'locked' && (
            <span className="text-[10px] text-slate-400 italic mt-0.5">
              Complete prior stages to unlock
            </span>
          )}
        </div>
      </button>
    </div>
  )
}
