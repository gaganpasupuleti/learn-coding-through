import { Button } from '@/components/ui/button'
import { Cube, SignOut, User } from '@phosphor-icons/react'
import { type AuthUser, clearAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

export type AdminShellSectionNavItem = { id: string; label: string }

interface AdminShellProps {
  user: AuthUser
  onLogout: () => void
  children: React.ReactNode
  currentSection?: string
  sectionNav?: AdminShellSectionNavItem[]
  onSectionChange?: (sectionId: string) => void
}

export function AdminShell({
  user,
  onLogout,
  children,
  currentSection,
  sectionNav,
  onSectionChange,
}: AdminShellProps) {
  const handleLogout = () => {
    clearAuth()
    onLogout()
  }

  const hasPillNav = Boolean(sectionNav?.length && onSectionChange)

  return (
    <div className="admin-theme flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-background">
      {/* Navigation — white topbar + segmented pill track */}
      <nav className="z-50 shrink-0 border-b border-slate-200 bg-white" aria-label="Admin">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Brand */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/25">
                <Cube size={20} className="text-primary-foreground" weight="bold" />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-lg font-bold tracking-tight text-slate-900 block truncate">CodeQuest</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Admin</span>
              </div>
            </div>

            {hasPillNav ? (
              <div className="flex min-w-0 flex-1 justify-center order-last lg:order-none">
                <div
                  className="hidden md:flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200/80"
                  role="tablist"
                  aria-label="Workspace sections"
                >
                  {sectionNav!.map((item) => {
                    const active = currentSection === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        className={cn(
                          'px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-in-out',
                          active
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                            : 'text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-200/70',
                        )}
                        onClick={() => onSectionChange!(item.id)}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {/* User area */}
            <div className="flex items-center justify-end gap-2 shrink-0 self-end lg:self-auto">
              <span
                className="text-xs text-muted-foreground items-center gap-1 hidden sm:flex max-w-[10rem] truncate rounded-full border border-border/70 bg-card px-2.5 py-1"
                title={`${user.full_name} · ${user.email}`}
              >
                <User size={13} className="shrink-0" aria-hidden />
                <span className="truncate font-medium text-foreground/90">{user.full_name}</span>
              </span>
              <Button variant="outline" size="sm" className="rounded-full border-border/80" onClick={handleLogout} aria-label="Log out">
                <SignOut size={16} className="mr-1" aria-hidden />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main id="admin-main-content" className="flex min-h-0 flex-1 flex-col outline-none" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
}
