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
  const { waitlistEntries, userActivityEntries, isLoading, handleUpdateWaitlistStatus } = useAdminWorkspaceContext()

  return (
    <div className={adminSectionRootClass}>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden xl:grid-cols-2 xl:grid-rows-1">
        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0')}>
          <div className={cn(adminPaneHeaderClass, 'flex items-center justify-between gap-2')}>
            <span>Waitlist</span>
            <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground">{waitlistEntries.length}</span>
          </div>
          <p className="shrink-0 border-b border-slate-200/80 px-2 py-1 text-[10px] text-muted-foreground dark:border-border">
            Approve beyond the 1500-user cap.
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

        <Card className={cn(adminPaneCardClass, 'min-h-0 p-0')}>
          <div className={cn(adminPaneHeaderClass, 'flex items-center justify-between gap-2')}>
            <span>User activity</span>
            <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground">{userActivityEntries.length}</span>
          </div>
          <div className={cn(adminPaneScrollBodyClass, 'space-y-2')}>
            {userActivityEntries.map((entry) => (
              <div key={entry.id} className="rounded-md border p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge text={entry.event_type} variant={entry.status_code && entry.status_code >= 400 ? 'danger' : 'default'} />
                  <p className="min-w-0 truncate font-mono text-[10px] text-muted-foreground">
                    {entry.method ?? ''} {entry.route}
                  </p>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  User #{entry.user_id ?? 'anon'} · {entry.status_code ?? '-'} · {entry.duration_ms ?? 0}ms ·{' '}
                  {entry.occurred_at_ist ?? formatDateTimeIST(entry.occurred_at)}
                </p>
              </div>
            ))}
            {userActivityEntries.length === 0 && <p className="text-[11px] text-muted-foreground">No user activity.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
