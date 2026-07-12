import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { AdminShell } from '@/components/shells/AdminShell'
import { AdminWorkspaceProvider } from '@/components/admin/AdminWorkspaceContext'
import { adminNavItems } from '@/components/admin/navConfig'
import { useAdminWorkspace } from '@/components/admin/hooks/useAdminWorkspace'
import { AdminHeroBar } from '@/components/admin/layout/AdminHeroBar'
import { ActivityView } from '@/components/admin/views/ActivityView'
import { FeedbackView } from '@/components/admin/views/FeedbackView'
import { AccessView } from '@/components/admin/views/AccessView'
import { BoardView } from '@/components/admin/views/BoardView'
import { ClassesView } from '@/components/admin/views/ClassesView'
import { DashboardView } from '@/components/admin/views/DashboardView'
import { EmailStationView } from '@/components/admin/views/EmailStationView'
import { JobSpyOpsView } from '@/components/admin/views/JobSpyOpsView'
import { JobEnrichmentView } from '@/components/admin/views/JobEnrichmentView'
import { QuizzesView } from '@/components/admin/views/QuizzesView'
import { StudentsView } from '@/components/admin/views/StudentsView'
import type { AuthUser } from '@/lib/auth'

import type { AdminSection } from '@/components/admin/types'

interface AdminPageProps {
  user: AuthUser
  onLogout: () => void
}

export function AdminPage({ user, onLogout }: AdminPageProps) {
  const ws = useAdminWorkspace()

  return (
    <AdminWorkspaceProvider value={ws}>
      <AdminShell
        user={user}
        onLogout={onLogout}
        currentSection={ws.section}
        sectionNav={adminNavItems.map((item) => ({ id: item.key, label: item.label }))}
        onSectionChange={(id) => ws.setSection(id as AdminSection)}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <CommandDialog
            open={ws.commandOpen}
            onOpenChange={ws.setCommandOpen}
            title="Admin command palette"
            description="Jump to a section or run a system action"
            overlayClassName="bg-background/50 backdrop-blur-sm"
          >
            <CommandInput placeholder="Search sections and actions…" className="border-border/60 bg-background/40" />
            <CommandList className="bg-background/30">
              <CommandEmpty>No matches.</CommandEmpty>
              <CommandGroup heading="Navigation">
                {adminNavItems.map((item) => (
                  <CommandItem
                    key={item.key}
                    value={`${item.label} ${item.key}`}
                    onSelect={() => {
                      ws.setSection(item.key)
                      ws.setCommandOpen(false)
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="System Actions">
                <CommandItem
                  value="refresh data reload"
                  onSelect={() => {
                    void ws.loadAdminData()
                    ws.setCommandOpen(false)
                  }}
                >
                  Refresh Data
                </CommandItem>
                <CommandItem
                  value="check database health db"
                  onSelect={() => {
                    void ws.checkDbHealth()
                    ws.setCommandOpen(false)
                  }}
                >
                  Check Database Health
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>

          <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-slate-200/80 via-slate-200/70 to-slate-200/85 dark:bg-background">
            <AdminHeroBar
              user={user}
              section={ws.section}
              compact
              isLoading={ws.isLoading}
              search={ws.search}
              onSearchChange={(v) => ws.setSearch(v)}
              onRefresh={ws.loadAdminData}
              onOpenCommand={() => ws.setCommandOpen(true)}
            />

            <div className="mx-auto flex min-h-0 w-full max-w-[1680px] flex-1 flex-col overflow-hidden px-3 pb-3 pt-2 md:px-4 md:pb-4">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {ws.section === 'dashboard' && <DashboardView />}
                {ws.section === 'board' && <BoardView />}
                {ws.section === 'students' && <StudentsView />}
                {ws.section === 'classes' && <ClassesView />}
                {ws.section === 'jobspy-ops' && <JobSpyOpsView />}
                {ws.section === 'email-station' && <EmailStationView />}
                {ws.section === 'job-enrichment' && <JobEnrichmentView />}
                {ws.section === 'quizzes' && <QuizzesView />}
                {ws.section === 'activity' && <ActivityView />}
                {ws.section === 'feedback' && <FeedbackView />}
                {ws.section === 'access' && <AccessView />}
              </div>
            </div>
          </div>
        </div>
      </AdminShell>
    </AdminWorkspaceProvider>
  )
}
