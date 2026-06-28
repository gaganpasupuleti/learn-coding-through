import { Bell, Search } from 'lucide-react';

export default function CodeQuestTopHeader({
  title,
  subtitle,
  searchPlaceholder = 'Search lessons, practice sets, assignments...',
  pills,
  activePill,
  onPillChange,
  profileInitials = 'Gk',
}) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-charcoal sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <button type="button" className="cq-icon-btn" aria-label="Search">
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button type="button" className="cq-icon-btn" aria-label="Notifications">
            <Bell className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <div className="grid h-8 w-8 place-items-center rounded-full border border-slate/20 bg-cream text-[11px] font-semibold">
            {profileInitials}
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-slate/20 bg-cream px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-slate" strokeWidth={1.75} />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="w-full min-w-0 border-0 bg-transparent text-sm outline-none placeholder:text-slate"
        />
      </div>

      {pills && pills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => onPillChange?.(pill)}
              className={`cq-pill px-3 py-1.5${activePill === pill ? ' active' : ''}`}
            >
              {pill}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
