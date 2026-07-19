import { useState } from 'react'
import {
  CalendarDays,
  LayoutDashboard,
  Briefcase,
  Map,
  GitBranch,
  Boxes,
  Code2,
  ClipboardList,
  LayoutGrid,
  LogOut,
  ChevronDown,
  BookOpen,
  MessageSquare,
  Database,
  Keyboard,
  TrendingUp,
  FileText,
  BarChart3,
  GraduationCap,
  FlaskConical,
  Settings,
  Menu,
  X,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SubmitFeedbackDialog } from '@/components/feedback/SubmitFeedbackDialog'
import { useStudentNavCollapsed } from '@/hooks/useStudentNavCollapsed'
import { type AuthUser, clearAuth, isDemoUser } from '@/lib/auth'
import { canAccessResumeLab } from '@/lib/resume-lab-access'
import { cn } from '@/lib/utils'

type StudentPage =
  | 'dashboard'
  | 'hub'
  | 'jobspy'
  | 'study-materials'
  | 'projects'
  | 'practice-code'
  | 'practice-sql'
  | 'practice-typing'
  | 'practice-powerbi'
  | 'quiz'
  | 'roadmapper'
  | 'flow-roadmap'
  | 'learning-planner'
  | 'calendar'
  | 'progress'
  | 'resume'

interface StudentShellProps {
  currentPage: StudentPage
  user: AuthUser
  onNavigate: (page: StudentPage) => void
  onLogout: () => void
  children: React.ReactNode
  /** `fill` locks main scroll so child workspaces (e.g. resume builder) own the viewport. */
  contentMode?: 'scroll' | 'fill'
}

/** A real, navigable destination, a placeholder (`soon`), or a locked feature (`locked`). */
type SidebarItem = { page?: StudentPage; label: string; icon: React.ReactNode; soon?: boolean; locked?: boolean }
type SidebarGroup = { label: string; items: SidebarItem[] }

const ICON = 16

const NAV_GROUPS: SidebarGroup[] = [
  {
    label: 'Menu',
    items: [
      { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={ICON} aria-hidden /> },
      { page: 'jobspy', label: 'Jobs', icon: <Briefcase size={ICON} aria-hidden /> },
      { label: 'Live Classes', icon: <GraduationCap size={ICON} aria-hidden />, soon: true },
      { label: 'Practice Studio', icon: <FlaskConical size={ICON} aria-hidden />, soon: true },
      { page: 'study-materials', label: 'Study Materials', icon: <BookOpen size={ICON} aria-hidden /> },
      { label: 'Assignments', icon: <ClipboardList size={ICON} aria-hidden />, soon: true },
      { page: 'progress', label: 'Progress', icon: <TrendingUp size={ICON} aria-hidden /> },
      { label: 'Settings', icon: <Settings size={ICON} aria-hidden />, soon: true },
    ],
  },
  {
    label: 'Practice',
    items: [
      { page: 'practice-code', label: 'Code Workbench', icon: <Code2 size={ICON} aria-hidden /> },
      { page: 'practice-sql', label: 'SQL Practice', icon: <Database size={ICON} aria-hidden /> },
      { page: 'practice-typing', label: 'Typing Practice', icon: <Keyboard size={ICON} aria-hidden /> },
      { page: 'practice-powerbi', label: 'Power BI Practice Ground', icon: <BarChart3 size={ICON} aria-hidden /> },
      { page: 'quiz', label: 'Quiz', icon: <ClipboardList size={ICON} aria-hidden /> },
      { page: 'flow-roadmap', label: 'Flow Path', icon: <GitBranch size={ICON} aria-hidden /> },
    ],
  },
  {
    label: 'Learn',
    items: [
      { page: 'calendar', label: 'Calendar', icon: <CalendarDays size={ICON} aria-hidden /> },
      { page: 'learning-planner', label: 'Learning Planner', icon: <BookOpen size={ICON} aria-hidden /> },
      { page: 'projects', label: 'Projects', icon: <Boxes size={ICON} aria-hidden />, locked: true },
      { page: 'hub', label: 'Hub', icon: <LayoutGrid size={ICON} aria-hidden /> },
    ],
  },
  {
    label: 'Career',
    items: [
      { page: 'roadmapper', label: 'Career Map', icon: <Map size={ICON} aria-hidden /> },
      { page: 'resume', label: 'Resume Lab', icon: <FileText size={ICON} aria-hidden /> },
    ],
  },
]

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: SidebarItem
  active: boolean
  onNavigate: (page: StudentPage) => void
}) {
  const base =
    'group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-400/50'

  if (item.locked) {
    return (
      <span aria-disabled title="Locked" className={cn(base, 'cursor-not-allowed text-white/35')}>
        {item.icon}
        <span className="truncate">{item.label}</span>
        <Lock size={12} className="ml-auto flex-shrink-0 text-white/35" aria-hidden />
      </span>
    )
  }

  if (item.soon || !item.page) {
    return (
      <span aria-disabled title="Coming soon" className={cn(base, 'cursor-not-allowed text-white/30')}>
        {item.icon}
        <span className="truncate">{item.label}</span>
        <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/45">
          Soon
        </span>
      </span>
    )
  }

  const page = item.page
  return (
    <button
      type="button"
      onClick={() => onNavigate(page)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        base,
        active ? 'bg-white/15 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white',
      )}
    >
      {item.icon}
      <span className="truncate">{item.label}</span>
    </button>
  )
}

function SidebarBody({
  currentPage,
  onToggleHidden,
  onNavigate,
  user,
  isDemo,
  onLogout,
  onOpenFeedback,
}: {
  currentPage: StudentPage
  onToggleHidden: () => void
  onNavigate: (page: StudentPage) => void
  user: AuthUser
  isDemo: boolean
  onLogout: () => void
  onOpenFeedback: () => void
}) {
  const initials =
    user.full_name
      ?.split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'

  return (
    <div className="flex h-full w-60 flex-col">
      <div className="flex items-center gap-1 px-3 py-3">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-1 outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
          aria-label="CodeQuest dashboard"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
            <Code2 size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="truncate text-[15px] font-bold tracking-tight text-white">CodeQuest</span>
          {isDemo && (
            <Badge
              variant="outline"
              className="h-4 shrink-0 rounded-full border-amber-400/60 bg-amber-400/10 px-1.5 text-[10px] font-medium text-amber-300"
            >
              Demo
            </Badge>
          )}
        </button>
        <button
          type="button"
          onClick={onToggleHidden}
          className="shrink-0 rounded-lg p-2 text-white/60 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400/50"
          aria-label="Hide menu"
          title="Hide menu"
        >
          <PanelLeftClose size={ICON} aria-hidden />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Primary">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              {group.label}
            </p>
            {group.items.map((item) => {
              const gated =
                item.page === 'resume' && !canAccessResumeLab(user.email)
                  ? { ...item, locked: true as const }
                  : item
              return (
                <SidebarLink
                  key={item.label}
                  item={gated}
                  active={item.page === currentPage}
                  onNavigate={onNavigate}
                />
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onOpenFeedback}
          className="mb-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-white/65 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400/50"
        >
          <MessageSquare size={ICON} aria-hidden />
          <span>Feedback</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400/50"
            aria-label="Account menu"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold text-white">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-white">{user.full_name}</span>
              <span className="block truncate text-[11px] text-white/45">{user.email}</span>
            </span>
            <ChevronDown size={14} className="flex-shrink-0 text-white/45" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-slate-900">{user.full_name}</span>
                <span className="truncate text-xs text-slate-500">{user.email}</span>
                {isDemo && (
                  <Badge
                    variant="outline"
                    className="mt-1 w-fit border-amber-400/70 bg-amber-50 text-[10px] text-amber-700"
                  >
                    Demo session
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut size={14} className="mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function NavToggleButton({
  hidden,
  onToggle,
  className,
}: {
  hidden: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-[#0A1020]/12 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0A1020] shadow-sm transition-colors hover:bg-[#FAF3E0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40',
        className,
      )}
      aria-label={hidden ? 'Show navigation menu' : 'Hide navigation menu'}
      title={hidden ? 'Show menu' : 'Hide menu'}
    >
      {hidden ? <PanelLeftOpen className="h-4 w-4" aria-hidden /> : <PanelLeftClose className="h-4 w-4" aria-hidden />}
      <span>{hidden ? 'Show menu' : 'Hide menu'}</span>
    </button>
  )
}

export function StudentShell({
  currentPage,
  user,
  onNavigate,
  onLogout,
  children,
  contentMode = 'scroll',
}: StudentShellProps) {
  const isDemo = isDemoUser()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const fillMode = contentMode === 'fill'
  const { hidden, toggleHidden } = useStudentNavCollapsed()

  const handleLogout = () => {
    clearAuth()
    onLogout()
  }

  const go = (page: StudentPage) => {
    setMobileOpen(false)
    onNavigate(page)
  }

  const sidebar = (
    <SidebarBody
      currentPage={currentPage}
      onToggleHidden={toggleHidden}
      onNavigate={go}
      user={user}
      isDemo={isDemo}
      onLogout={handleLogout}
      onOpenFeedback={() => setFeedbackOpen(true)}
    />
  )

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 overflow-hidden bg-slate-50">
      <aside
        className={cn(
          'hidden flex-shrink-0 overflow-hidden bg-[#0A1020] transition-[width,margin] duration-200 lg:block',
          hidden ? 'w-0' : 'w-60',
        )}
        aria-hidden={hidden}
      >
        {!hidden ? sidebar : null}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 bg-[#0A1020] transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-2 top-3 rounded-lg p-1.5 text-white/60 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400/50"
          aria-label="Close menu"
        >
          <X size={18} aria-hidden />
        </button>
        {sidebar}
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 flex-shrink-0 items-center gap-2 border-b border-slate-200 bg-[#FFFDF6] px-3 pt-[env(safe-area-inset-top)] lg:h-11">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-[#0A1020] outline-none hover:bg-[#0A1020]/5 focus-visible:ring-2 focus-visible:ring-blue-400/50 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={20} aria-hidden />
          </button>

          <NavToggleButton hidden={hidden} onToggle={toggleHidden} className="hidden lg:inline-flex" />

          <button
            type="button"
            onClick={() => go('dashboard')}
            className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 lg:hidden"
            aria-label="CodeQuest dashboard"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <Code2 size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#0A1020]">CodeQuest</span>
          </button>
        </div>
        <main
          id="main-content"
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-x-hidden bg-slate-50',
            fillMode
              ? 'overflow-hidden'
              : 'overflow-y-auto overscroll-y-contain pb-[max(1rem,env(safe-area-inset-bottom))]',
          )}
          tabIndex={-1}
        >
          {fillMode ? <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div> : children}
        </main>
      </div>

      <SubmitFeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  )
}

export { NavToggleButton }
