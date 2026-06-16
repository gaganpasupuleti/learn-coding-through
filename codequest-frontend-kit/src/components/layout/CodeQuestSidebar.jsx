import { MENU_ITEMS, TOOL_ITEMS } from '../../config/navigation';
import { NavIcon } from '../icons';

function NavLink({ item, activeKey }) {
  const isActive = activeKey === item.key;
  return (
    <a href={item.path} className={`cq-nav-link${isActive ? ' active' : ''}`}>
      <NavIcon name={item.icon} />
      <span>{item.label}</span>
    </a>
  );
}

export default function CodeQuestSidebar({ activeKey }) {
  const mobileItems = MENU_ITEMS.filter((item) =>
    ['dashboard', 'classes', 'practice-studio', 'assignments', 'progress'].includes(item.key),
  );

  return (
    <aside className="bg-navy text-cream/60 w-full min-w-0 flex flex-col p-4 lg:p-5 lg:overflow-y-auto max-lg:flex-row max-lg:overflow-x-auto max-lg:gap-1">
      <a
        href="/dashboard"
        className="flex items-center gap-2 mb-0 lg:mb-5 px-1 shrink-0 max-lg:mr-2 hover:opacity-90 transition-opacity"
      >
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cta to-progress grid place-items-center text-[8px] font-mono text-white font-medium">
          CQ
        </div>
        <span className="font-display font-semibold text-sm text-cream max-lg:hidden">Code Quest</span>
      </a>

      <div className="max-lg:hidden flex flex-col flex-1 min-h-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-cream/50 px-2 mb-1">Menu</p>
        <nav className="flex flex-col gap-px">
          {MENU_ITEMS.map((item) => (
            <NavLink key={item.key} item={item} activeKey={activeKey} />
          ))}
        </nav>

        <p className="text-[11px] font-semibold uppercase tracking-widest text-cream/50 px-2 mt-4 mb-1 pt-4 border-t border-cream/10">
          Tools
        </p>
        <nav className="flex flex-col gap-px">
          {TOOL_ITEMS.map((item) => (
            <NavLink key={item.key} item={item} activeKey={activeKey} />
          ))}
        </nav>

        <div className="mt-auto pt-3 border-t border-cream/10">
          <a
            href="/progress"
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <NavIcon name="LogOut" />
            <span>Logout</span>
          </a>
        </div>
      </div>

      <nav className="lg:hidden flex items-center gap-1">
        {mobileItems.map((item) => (
          <a
            key={item.key}
            href={item.path}
            className={`cq-nav-link p-2 rounded-lg${activeKey === item.key ? ' active' : ''}`}
            aria-label={item.label}
          >
            <NavIcon name={item.icon} />
          </a>
        ))}
      </nav>
    </aside>
  );
}
