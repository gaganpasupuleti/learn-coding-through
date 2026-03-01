import { Button } from '@/components/ui/button'
import { Cube, SquaresFour, SignOut, User } from '@phosphor-icons/react'
import { type AuthUser, clearAuth } from '@/lib/auth'

interface AdminShellProps {
  user: AuthUser
  onLogout: () => void
  children: React.ReactNode
}

export function AdminShell({ user, onLogout, children }: AdminShellProps) {
  const handleLogout = () => {
    clearAuth()
    onLogout()
  }

  return (
    <div className="admin-theme min-h-screen bg-background">
      {/* Navigation */}
      <nav className="admin-topbar backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shadow-sm">
                <Cube size={20} className="text-primary-foreground" weight="bold" />
              </div>
              <span className="text-xl font-bold">CodeQuest</span>
              <span className="text-xs text-muted-foreground border border-border rounded-md px-2 py-0.5 bg-muted/40">
                Admin
              </span>
            </div>

            {/* Nav link */}
            <div className="flex items-center gap-1">
              <Button variant="default" size="sm">
                <SquaresFour size={16} className="mr-1.5" weight="fill" />
                Dashboard
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
