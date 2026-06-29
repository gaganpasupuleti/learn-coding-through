import type { CareerStage, StageStatus, PathTheme } from './careerPaths'
import { CareerCheckpointBadge } from './CareerCheckpointBadge'

interface Props {
  stage: CareerStage
  status: StageStatus
  theme: PathTheme
  onClose?: () => void
}

const STATUS_HERO: Record<StageStatus, { badge: string; icon: string }> = {
  completed: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '✓' },
  current:   { badge: 'bg-amber-100 text-amber-800 border-amber-200',   icon: '▶' },
  locked:    { badge: 'bg-slate-100 text-slate-500 border-slate-200',    icon: '🔒' },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h4>
      {children}
    </div>
  )
}

export function CareerStageDetailPanel({ stage, status, theme, onClose }: Props) {
  const hero = STATUS_HERO[status]

  return (
    <aside
      className="flex flex-col h-full overflow-y-auto"
      aria-label={`Details for ${stage.title}`}
    >
      {/* Header */}
      <div className={`${theme.bg} px-5 pt-5 pb-4 border-b border-slate-200`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest border rounded px-2 py-0.5 mb-2 ${hero.badge}`}>
              <span>{hero.icon}</span>
              {status === 'completed' ? 'Completed' : status === 'current' ? 'In Progress' : 'Locked'}
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{stage.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{stage.subtitle}</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close detail panel"
              className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>⏱</span>
            {stage.durationWeeks} week{stage.durationWeeks !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>🛠</span>
            {stage.tools.length} tools
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-4 space-y-5 overflow-y-auto">

        {/* Checkpoints */}
        {stage.checkpoints.length > 0 && (
          <Section title="Checkpoints">
            <div className="flex flex-wrap gap-2">
              {stage.checkpoints.map((cp) => (
                <CareerCheckpointBadge key={cp.label} checkpoint={cp} size="md" />
              ))}
            </div>
          </Section>
        )}

        {/* Skills */}
        <Section title="Skills you'll gain">
          <div className="flex flex-wrap gap-1.5">
            {stage.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs border border-slate-200 rounded-full px-2.5 py-0.5 bg-white text-slate-700 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>

        {/* Lessons */}
        <Section title="Lessons covered">
          <ul className="space-y-1.5">
            {stage.lessons.map((lesson) => (
              <li key={lesson} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-slate-300 mt-0.5 shrink-0">›</span>
                {lesson}
              </li>
            ))}
          </ul>
        </Section>

        {/* Tools */}
        <Section title="Tools & tech">
          <div className="flex flex-wrap gap-1.5">
            {stage.tools.map((tool) => (
              <span
                key={tool}
                className="text-xs bg-slate-900 text-slate-100 rounded px-2 py-0.5 font-mono"
              >
                {tool}
              </span>
            ))}
          </div>
        </Section>

        {/* Practice tasks */}
        <Section title="Practice tasks">
          <ol className="space-y-2">
            {stage.practiceTasks.map((task, i) => (
              <li key={task} className="flex items-start gap-2.5 text-xs text-slate-600">
                <span
                  className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${theme.nodeBg} text-white`}
                >
                  {i + 1}
                </span>
                {task}
              </li>
            ))}
          </ol>
        </Section>

        {/* Expected outcome */}
        <Section title="Expected outcome">
          <p className={`text-xs leading-relaxed rounded-lg border px-3 py-2.5 ${theme.bg} ${theme.primary} font-medium`}>
            {stage.expectedOutcome}
          </p>
        </Section>
      </div>
    </aside>
  )
}
