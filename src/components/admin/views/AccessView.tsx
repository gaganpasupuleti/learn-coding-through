import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { StatusBadge } from '../widgets/StatusBadge'

export function AccessView() {
  const { waitlistEntries, userActivityEntries, isLoading, handleUpdateWaitlistStatus } = useAdminWorkspaceContext()

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="admin-surface p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Registration Waitlist</h3>
          <span className="text-xs text-muted-foreground">{waitlistEntries.length} entries</span>
        </div>
        <p className="text-xs text-muted-foreground">Approve one-by-one to allow sign-up beyond the 1500-user cap</p>
        <div className="space-y-2 max-h-[640px] overflow-auto pr-1">
          {waitlistEntries.map((entry) => (
            <div key={entry.id} className="rounded-md border p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{entry.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.full_name || 'No name'} · {entry.source} · attempts {entry.attempt_count}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last tried: {new Date(entry.last_attempted_at).toLocaleString()}
                  </p>
                </div>
                <StatusBadge
                  text={entry.status}
                  variant={entry.status === 'approved' ? 'success' : entry.status === 'rejected' ? 'danger' : 'warning'}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleUpdateWaitlistStatus(entry.id, 'approved')}
                  disabled={isLoading || entry.status === 'approved'}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateWaitlistStatus(entry.id, 'pending')}
                  disabled={isLoading || entry.status === 'pending'}
                >
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500"
                  onClick={() => handleUpdateWaitlistStatus(entry.id, 'rejected')}
                  disabled={isLoading || entry.status === 'rejected'}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
          {waitlistEntries.length === 0 && <p className="text-sm text-muted-foreground">No waitlist entries found.</p>}
        </div>
      </Card>

      <Card className="admin-surface p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Recent User Activity</h3>
          <span className="text-xs text-muted-foreground">{userActivityEntries.length} entries</span>
        </div>
        <div className="space-y-2 max-h-[640px] overflow-auto pr-1">
          {userActivityEntries.map((entry) => (
            <div key={entry.id} className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <StatusBadge text={entry.event_type} variant={entry.status_code && entry.status_code >= 400 ? 'danger' : 'default'} />
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {entry.method ?? ''} {entry.route}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                User #{entry.user_id ?? 'anon'} · {entry.status_code ?? '-'} · {entry.duration_ms ?? 0}ms ·{' '}
                {new Date(entry.occurred_at).toLocaleString()}
              </p>
            </div>
          ))}
          {userActivityEntries.length === 0 && <p className="text-sm text-muted-foreground">No user activity found.</p>}
        </div>
      </Card>
    </div>
  )
}
