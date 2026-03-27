import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboard, Map, Boxes, Code2, ClipboardList, LogOut, User, FileText, Keyboard } from 'lucide-react'
import { type AuthUser, clearAuth, isDemoUser } from '@/lib/auth'

type StudentPage = 'landing' | 'projects' | 'practice' | 'typing' | 'quiz' | 'roadmapper' | 'resume'

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
    { page: 'landing', label: 'Home', icon: <LayoutDashboard size={15} /> },
    { page: 'roadmapper', label: 'Career Map', icon: <Map size={15} /> },
    { page: 'projects', label: 'Projects', icon: <Boxes size={15} /> },
    { page: 'practice', label: 'Practice', icon: <Code2 size={15} /> },
    { page: 'typing', label: 'Typing', icon: <Keyboard size={15} /> },
    { page: 'quiz', label: 'Quiz', icon: <ClipboardList size={15} /> },
    { page: 'resume', label: 'Resume', icon: <FileText size={15} /> },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 flex-shrink-0 group"
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

          {/* Nav links */}
          <div className="flex items-center gap-0.5 flex-wrap">
            {navItems.map(({ page, label, icon }) => (
              <button
                key={page}
                type="button"
                onClick={() => onNavigate(page)}
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

          {/* User area */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <User size={12} />
              {user.full_name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-150"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      {children}
    </div>
  )
}
