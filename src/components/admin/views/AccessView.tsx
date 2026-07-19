import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { formatDateTimeIST } from '@/lib/formatDateTimeIST'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { StatusBadge } from '../widgets/StatusBadge'

import {
  adminPaneCardClass,
  adminPaneHeaderClass,
  adminPaneScrollBodyClass,
  adminSectionRootClass,
} from './dashboardPolish'

export function AccessView() {
  const {
    waitlistEntries,
    loginAttemptEntries,
    loginAttemptSummary,
    isLoading,
    handleUpdateWaitlistStatus,
  } = useAdminWorkspaceContext()

  const totalSuccessfulLogins = loginAttemptSummary.reduce((sum, item) => sum + item.successful_attempts, 0)
  const totalBlockedLogins = loginAttemptSummary.reduce((sum, item) => sum + item.blocked_attempts, 0)

  return (
    <div className={adminSectionRootClass}>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden xl:grid-cols-[0.9fr_1.1fr] xl:grid-rows-1">
        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0')}>
          <div className={cn(adminPaneHeaderClass, 'flex items-center justify-between gap-2')}>
            <span>Waitlist</span>
            <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground">{waitlistEntries.length}</span>
          </div>
          <p className="shrink-0 border-b border-slate-200/80 px-2 py-1 text-[10px] text-muted-foreground dark:border-border">
            Login is currently limited to admins and kundetiriya@gmail.com.
          </p>
          <div className={cn(adminPaneScrollBodyClass, 'space-y-2')}>
            {waitlistEntries.map((entry) => (
              <div key={entry.id} className="space-y-2 rounded-md border p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{entry.email}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {entry.full_name || 'No name'} · {entry.source} · tries {entry.attempt_count}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {entry.last_attempted_at_ist ?? formatDateTimeIST(entry.last_attempted_at)}
                    </p>
                  </div>
                  <StatusBadge
                    text={entry.status}
                    variant={entry.status === 'approved' ? 'success' : entry.status === 'rejected' ? 'danger' : 'warning'}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={() => handleUpdateWaitlistStatus(entry.id, 'approved')}
                    disabled={isLoading || entry.status === 'approved'}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => handleUpdateWaitlistStatus(entry.id, 'pending')}
                    disabled={isLoading || entry.status === 'pending'}
                  >
                    Pending
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] text-red-500"
                    onClick={() => handleUpdateWaitlistStatus(entry.id, 'rejected')}
                    disabled={isLoading || entry.status === 'rejected'}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {waitlistEntries.length === 0 && <p className="text-[11px] text-muted-foreground">No waitlist entries.</p>}
          </div>
        </Card>

        <div className="grid min-h-0 grid-rows-[auto_1fr] gap-2 overflow-hidden">
          <Card className={cn(adminPaneCardClass, 'p-0')}>
            <div className={cn(adminPaneHeaderClass, 'flex items-center justify-between gap-2')}>
              <span>Login attempts</span>
              <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
                {loginAttemptEntries.length} recent
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-slate-200/80 p-2 dark:border-border">
              <div className="rounded-md border bg-white p-2 dark:bg-background">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">People</p>
                <p className="text-lg font-bold">{loginAttemptSummary.length}</p>
              </div>
              <div className="rounded-md border bg-white p-2 dark:bg-background">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Logged in</p>
                <p className="text-lg font-bold text-emerald-600">{totalSuccessfulLogins}</p>
              </div>
              <div className="rounded-md border bg-white p-2 dark:bg-background">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Blocked</p>
                <p className="text-lg font-bold text-amber-600">{totalBlockedLogins}</p>
              </div>
            </div>
            <div className={cn(adminPaneScrollBodyClass, 'max-h-44 space-y-2')}>
              {loginAttemptSummary.map((entry) => (
                <div key={entry.email} className="rounded-md border p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{entry.email}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {entry.total_attempts} attempts · {entry.successful_attempts} success · {entry.blocked_attempts} blocked ·{' '}
                        {entry.failed_attempts} failed
                      </p>
                    </div>
                    <p className="shrink-0 text-[10px] text-muted-foreground">
                      {formatDateTimeIST(entry.last_attempted_at)}
                    </p>
                  </div>
                </div>
              ))}
              {loginAttemptSummary.length === 0 && <p className="text-[11px] text-muted-foreground">No login attempts yet.</p>}
            </div>
          </Card>

          <Card className={cn(adminPaneCardClass, 'min-h-0 p-0')}>
            <div className={cn(adminPaneHeaderClass, 'flex items-center justify-between gap-2')}>
              <span>Recent attempt log</span>
              <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground">{loginAttemptEntries.length}</span>
            </div>
            <div className={cn(adminPaneScrollBodyClass, 'space-y-2')}>
              {loginAttemptEntries.map((entry) => (
                <div key={entry.id} className="rounded-md border p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      text={entry.status}
                      variant={entry.status === 'success' ? 'success' : entry.status === 'blocked' ? 'warning' : 'danger'}
                    />
                    <p className="min-w-0 truncate text-xs font-semibold">{entry.email}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{entry.provider}</p>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {entry.full_name || 'No name'} · {entry.reason || 'ok'} · User #{entry.user_id ?? 'anon'} ·{' '}
                    {formatDateTimeIST(entry.attempted_at)}
                  </p>
                </div>
              ))}
              {loginAttemptEntries.length === 0 && <p className="text-[11px] text-muted-foreground">No recent login attempts.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
