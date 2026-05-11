import { Card } from '@/components/ui/card'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { StatusBadge } from '../widgets/StatusBadge'

export function ActivityView() {
  const { activityLogs } = useAdminWorkspaceContext()

  return (
    <Card className="admin-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Admin Activity</h3>
        <span className="text-xs text-muted-foreground">{activityLogs.length} entries</span>
      </div>
      <div className="space-y-2 max-h-[700px] overflow-auto pr-1">
        {activityLogs.map((entry) => (
          <div key={entry.id} className="rounded-md border p-3">
            <div className="flex items-center gap-2">
              <StatusBadge text={entry.action} />
              <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
            </div>
            <p className="text-sm mt-1">{entry.details || 'No details'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Admin #{entry.admin_user_id} {entry.target_user_id ? `→ User #${entry.target_user_id}` : ''}
            </p>
          </div>
        ))}
        {activityLogs.length === 0 && <p className="text-sm text-muted-foreground">No activity found.</p>}
      </div>
    </Card>
  )
}
