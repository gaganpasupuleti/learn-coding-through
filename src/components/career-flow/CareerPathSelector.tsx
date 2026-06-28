import type { CareerPath } from './careerPaths'

interface Props {
  paths: CareerPath[]
  selectedId: CareerPath['id']
  onSelect: (id: CareerPath['id']) => void
}

const PATH_EMOJI: Record<string, string> = {
  'data-analytics':    '📊',
  'data-science':      '🧠',
  'data-engineering':  '⚙️',
}

export function CareerPathSelector({ paths, selectedId, onSelect }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Career path selector"
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      {paths.map((path) => {
        const isActive = path.id === selectedId
        return (
          <button
            key={path.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onSelect(path.id)}
            className={`
              group relative rounded-xl border-2 px-4 py-4 text-left transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              ${isActive
                ? `${path.theme.tabActive} border-transparent shadow-lg`
                : `bg-white border-slate-200 text-slate-700 ${path.theme.tabHover} hover:border-current/30 hover:shadow-sm`
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>{PATH_EMOJI[path.id]}</span>
              <div className="min-w-0">
                <p className={`text-sm font-bold leading-snug ${isActive ? 'text-white' : 'text-slate-900'}`}>
                  {path.title}
                </p>
                <p className={`text-[11px] leading-snug mt-0.5 ${isActive ? 'text-white/75' : 'text-slate-500'}`}>
                  {path.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className={`text-[11px] font-semibold ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                {path.stages.length} stages · {path.duration}
              </span>
              <span className={`text-[11px] font-bold ${isActive ? 'text-white/90' : path.theme.primary}`}>
                {path.salaryRange}
              </span>
            </div>

            {isActive && (
              <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-white/60" aria-hidden />
            )}
          </button>
        )
      })}
    </div>
  )
}
