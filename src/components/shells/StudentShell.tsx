import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Briefcase,
  Map,
  GitBranch,
  Boxes,
  Code2,
  ClipboardList,
  LogOut,
  User,
  Keyboard,
  ChevronDown,
} from 'lucide-react'
import { type AuthUser, clearAuth, isDemoUser } from '@/lib/auth'

type StudentPage =
  | 'landing'
  | 'dashboard'
  | 'projects'
  | 'practice'
  | 'typing'
  | 'quiz'
  | 'roadmapper'
  | 'flow-roadmap'
  | 'hub'
  | 'jobs'

interface StudentShellProps {
  currentPage: StudentPage
  user: AuthUser
  onNavigate: (page: StudentPage) => void
  onLogout: () => void
  children: React.ReactNode
}

export function StudentShell({ currentPage, user, onNavigate, onLogout, children }: StudentShellProps) {
  const isDemo = isDemoUser()

  const handleLogout = () => {
    clearAuth()
    onLogout()
  }

  const navItems: { page: StudentPage; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} aria-hidden /> },
    { page: 'jobs', label: 'Jobs', icon: <Briefcase size={15} aria-hidden /> },
    { page: 'landing', label: 'Home', icon: <Boxes size={15} aria-hidden /> },
    { page: 'roadmapper', label: 'Career Map', icon: <Map size={15} aria-hidden /> },
    { page: 'flow-roadmap', label: 'Flow Path', icon: <GitBranch size={15} aria-hidden /> },
    { page: 'projects', label: 'Projects', icon: <Boxes size={15} aria-hidden /> },
    { page: 'practice', label: 'Practice', icon: <Code2 size={15} aria-hidden /> },
    { page: 'typing', label: 'Typing', icon: <Keyboard size={15} aria-hidden /> },
    { page: 'quiz', label: 'Quiz', icon: <ClipboardList size={15} aria-hidden /> },
  ]

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-white">
      {/* Navigation */}
      <nav className="z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm" aria-label="Primary">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-0">
          <div className="h-10 md:h-14 flex items-center justify-between gap-3 md:gap-4">
            {/* Brand */}
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 flex-shrink-0 group"
              aria-label="CodeQuest home"
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

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5 flex-wrap">
              {navItems.map(({ page, label, icon }) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onNavigate(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Account + logout */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  aria-label="Account menu"
                >
                  <User size={14} className="flex-shrink-0 sm:hidden" aria-hidden />
                  <span className="hidden sm:inline max-w-[10rem] md:max-w-[14rem] truncate">{user.full_name}</span>
                  <ChevronDown size={14} className="text-slate-400 flex-shrink-0" aria-hidden />
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

          {/* Mobile nav links */}
          <div className="md:hidden -mx-4 px-4 pb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1 min-w-max">
              {navItems.map(({ page, label, icon }) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onNavigate(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main
        id="main-content"
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  )
}
