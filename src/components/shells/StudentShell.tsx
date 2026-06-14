import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  User,
  ChevronDown,
  BookOpen,
  MessageSquare,
  Database,
  Keyboard,
  TrendingUp,
  FileText,
  BarChart3,
} from 'lucide-react'
import { SubmitFeedbackDialog } from '@/components/feedback/SubmitFeedbackDialog'
import { type AuthUser, clearAuth, isDemoUser } from '@/lib/auth'

type StudentPage =
  | 'landing'
  | 'dashboard'
  | 'hub'
  | 'jobspy'
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
}

type NavItem = { page: StudentPage; label: string; icon: React.ReactNode }

const LEARN_NAV: NavItem[] = [
  { page: 'calendar', label: 'Calendar', icon: <CalendarDays size={14} aria-hidden /> },
  { page: 'progress', label: 'Progress', icon: <TrendingUp size={14} aria-hidden /> },
  { page: 'learning-planner', label: 'Learning Planner', icon: <BookOpen size={14} aria-hidden /> },
  { page: 'projects', label: 'Projects', icon: <Boxes size={14} aria-hidden /> },
  { page: 'hub', label: 'Hub', icon: <LayoutGrid size={14} aria-hidden /> },
]

const PRACTICE_NAV: NavItem[] = [
  { page: 'practice-code', label: 'Code Workbench', icon: <Code2 size={14} aria-hidden /> },
  { page: 'practice-sql', label: 'SQL Practice', icon: <Database size={14} aria-hidden /> },
  { page: 'practice-typing', label: 'Typing Practice', icon: <Keyboard size={14} aria-hidden /> },
  {
    page: 'practice-powerbi',
    label: 'Power BI Practice Ground',
    icon: <BarChart3 size={14} aria-hidden />,
  },
  { page: 'quiz', label: 'Quiz', icon: <ClipboardList size={14} aria-hidden /> },
  { page: 'flow-roadmap', label: 'Flow Path', icon: <GitBranch size={14} aria-hidden /> },
]

const CAREER_NAV: NavItem[] = [
  { page: 'roadmapper', label: 'Career Map', icon: <Map size={14} aria-hidden /> },
  { page: 'resume', label: 'Resume', icon: <FileText size={14} aria-hidden /> },
]

const LEARN_PAGES = new Set<StudentPage>(LEARN_NAV.map((item) => item.page))
const PRACTICE_PAGES = new Set<StudentPage>(PRACTICE_NAV.map((item) => item.page))
const CAREER_PAGES = new Set<StudentPage>(CAREER_NAV.map((item) => item.page))

function navLinkClass(active: boolean, compact = false) {
  return `flex items-center gap-1 ${compact ? 'gap-1.5 px-2.5 py-1.5 text-sm' : 'px-2.5 py-1.5 text-[13px]'} font-medium rounded-lg whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
    active
      ? 'bg-blue-600 text-white shadow-sm'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
  }`
}

function NavLinkButton({
  page,
  label,
  icon,
  currentPage,
  onNavigate,
  compact = false,
}: NavItem & {
  currentPage: StudentPage
  onNavigate: (page: StudentPage) => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(page)}
      aria-current={currentPage === page ? 'page' : undefined}
      className={navLinkClass(currentPage === page, compact)}
    >
      {icon}
      {label}
    </button>
  )
}

function NavGroupDropdown({
  label,
  icon,
  items,
  pages,
  currentPage,
  onNavigate,
  compact = false,
  ariaLabel,
}: {
  label: string
  icon: React.ReactNode
  items: NavItem[]
  pages: Set<StudentPage>
  currentPage: StudentPage
  onNavigate: (page: StudentPage) => void
  compact?: boolean
  ariaLabel: string
}) {
  const groupActive = pages.has(currentPage)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label={ariaLabel}
        aria-current={groupActive ? 'true' : undefined}
        className={navLinkClass(groupActive, compact)}
      >
        {icon}
        {label}
        <ChevronDown size={12} className="opacity-70" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="text-xs text-slate-500">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map(({ page, label: itemLabel, icon: itemIcon }) => (
          <DropdownMenuItem
            key={page}
            onClick={() => onNavigate(page)}
            className={`cursor-pointer gap-2 ${currentPage === page ? 'bg-slate-100 font-medium text-slate-900' : ''}`}
          >
            {itemIcon}
            {itemLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PrimaryNav({
  currentPage,
  onNavigate,
  compact = false,
}: {
  currentPage: StudentPage
  onNavigate: (page: StudentPage) => void
  compact?: boolean
}) {
  return (
    <>
      <NavLinkButton
        page="dashboard"
        label="Dashboard"
        icon={<LayoutDashboard size={14} aria-hidden />}
        currentPage={currentPage}
        onNavigate={onNavigate}
        compact={compact}
      />
      <NavGroupDropdown
        label="Learn"
        icon={<BookOpen size={14} aria-hidden />}
        items={LEARN_NAV}
        pages={LEARN_PAGES}
        currentPage={currentPage}
        onNavigate={onNavigate}
        compact={compact}
        ariaLabel="Learn menu"
      />
      <NavGroupDropdown
        label="Practice"
        icon={<Code2 size={14} aria-hidden />}
        items={PRACTICE_NAV}
        pages={PRACTICE_PAGES}
        currentPage={currentPage}
        onNavigate={onNavigate}
        compact={compact}
        ariaLabel="Practice menu"
      />
      <NavLinkButton
        page="jobspy"
        label="Jobs"
        icon={<Briefcase size={14} aria-hidden />}
        currentPage={currentPage}
        onNavigate={onNavigate}
        compact={compact}
      />
      <NavGroupDropdown
        label="Career"
        icon={<Map size={14} aria-hidden />}
        items={CAREER_NAV}
        pages={CAREER_PAGES}
        currentPage={currentPage}
        onNavigate={onNavigate}
        compact={compact}
        ariaLabel="Career menu"
      />
    </>
  )
}

export function StudentShell({ currentPage, user, onNavigate, onLogout, children }: StudentShellProps) {
  const isDemo = isDemoUser()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const handleLogout = () => {
    clearAuth()
    onLogout()
  }

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <nav className="z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm" aria-label="Primary">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-0">
          <div className="h-10 md:h-14 flex items-center justify-between gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 flex-shrink-0 group"
              aria-label="CodeQuest dashboard"
            >
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors duration-150">
                <Code2 size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">CodeQuest</span>
              {isDemo && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-full border-amber-400/70 text-amber-600 bg-amber-50 font-medium">
                  Demo
                </Badge>
              )}
            </button>

            <div className="hidden md:flex items-center gap-0.5">
              <PrimaryNav currentPage={currentPage} onNavigate={onNavigate} />
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:text-slate-900 rounded-lg hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                aria-label="Send feedback"
              >
                <MessageSquare size={14} aria-hidden />
                <span className="hidden sm:inline">Feedback</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  aria-label="Account menu"
                >
                  <User size={14} className="flex-shrink-0 sm:hidden" aria-hidden />
                  <span className="hidden sm:inline max-w-[10rem] md:max-w-[14rem] truncate">{user.full_name}</span>
                  <ChevronDown size={14} className="text-slate-500 flex-shrink-0" aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-slate-900 truncate">{user.full_name}</span>
                      <span className="text-xs text-slate-500 truncate">{user.email}</span>
                      {isDemo && (
                        <Badge variant="outline" className="mt-1 w-fit text-[10px] border-amber-400/70 text-amber-700 bg-amber-50">
                          Demo session
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut size={14} className="mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="md:hidden -mx-4 px-4 pb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1 min-w-max">
              <PrimaryNav currentPage={currentPage} onNavigate={onNavigate} compact />
            </div>
          </div>
        </div>
      </nav>

      <SubmitFeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />

      <main
        id="main-content"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain bg-slate-50 pb-[max(1rem,env(safe-area-inset-bottom))]"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  )
}
