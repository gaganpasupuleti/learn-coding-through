import type { CheckpointBadge } from './careerPaths'
import { CHECKPOINT_COLORS, CHECKPOINT_ICONS } from './careerPaths'

interface Props {
  checkpoint: CheckpointBadge
  size?: 'sm' | 'md'
}

export function CareerCheckpointBadge({ checkpoint, size = 'sm' }: Props) {
  const colorClass = CHECKPOINT_COLORS[checkpoint.type]
  const icon = CHECKPOINT_ICONS[checkpoint.type]
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-semibold tracking-wide
        ${colorClass} ${textSize} ${padding}`}
    >
      <span aria-hidden>{icon}</span>
      {checkpoint.label}
    </span>
  )
}
