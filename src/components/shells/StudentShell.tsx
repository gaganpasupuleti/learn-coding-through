import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cube, House, MapTrifold, Code, ListChecks, SignOut, User } from '@phosphor-icons/react'
import { type AuthUser, clearAuth, isDemoUser } from '@/lib/auth'

type StudentPage = 'landing' | 'projects' | 'practice' | 'quiz' | 'roadmapper'

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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Cube size={20} className="text-primary-foreground" weight="bold" />
              </div>
              <span className="text-xl font-bold">CodeQuest</span>
              {isDemo && (
                <Badge variant="outline" className="text-xs rounded-full border-amber-400/60 text-amber-600">
                  Demo
                </Badge>
              )}
            </div>

            {/* Nav links */}
            <div className="flex items-center gap-1 flex-wrap">
              <Button
                variant={currentPage === 'landing' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('landing')}
              >
                <House size={16} className="mr-1.5" weight={currentPage === 'landing' ? 'fill' : 'regular'} />
                Home
              </Button>
              <Button
                variant={currentPage === 'roadmapper' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('roadmapper')}
              >
                <MapTrifold size={16} className="mr-1.5" weight={currentPage === 'roadmapper' ? 'fill' : 'regular'} />
                Career Map
              </Button>
              <Button
                variant={currentPage === 'projects' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('projects')}
              >
                <Cube size={16} className="mr-1.5" weight={currentPage === 'projects' ? 'fill' : 'regular'} />
                Projects
              </Button>
              <Button
                variant={currentPage === 'practice' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('practice')}
              >
                <Code size={16} className="mr-1.5" weight={currentPage === 'practice' ? 'fill' : 'regular'} />
                Practice
              </Button>
              <Button
                variant={currentPage === 'quiz' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('quiz')}
              >
                <ListChecks size={16} className="mr-1.5" weight={currentPage === 'quiz' ? 'fill' : 'regular'} />
                Quiz
              </Button>
            </div>

            {/* User area */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1 hidden sm:flex">
                <User size={13} />
                {user.full_name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <SignOut size={16} className="mr-1" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      {children}
    </div>
  )
}
