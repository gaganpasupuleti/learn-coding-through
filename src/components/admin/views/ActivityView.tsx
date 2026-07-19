import { Card } from '@/components/ui/card'
import { formatDateTimeIST } from '@/lib/formatDateTimeIST'
import { cn } from '@/lib/utils'

import { useAdminWorkspaceContext } from '../AdminWorkspaceContext'
import { StatusBadge } from '../widgets/StatusBadge'

import {
  adminPaneCardClass,
  adminPaneHeaderClass,
  adminPaneScrollBodyClass,
  adminSectionRootClass,
} from './dashboardPolish'

export function ActivityView() {
  const { activityLogs } = useAdminWorkspaceContext()

  return (
    <div className={adminSectionRootClass}>
      <Card className={cn(adminPaneCardClass, 'min-h-0 flex-1 p-0')}>
        <div className={cn(adminPaneHeaderClass, 'flex items-center justify-between')}>
          <span>Admin activity</span>
          <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground">{activityLogs.length} entries</span>
        </div>
        <div className={cn(adminPaneScrollBodyClass, 'space-y-2')}>
          {activityLogs.map((entry) => (
            <div key={entry.id} className="rounded-md border p-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge text={entry.action} />
                <p className="text-[10px] text-muted-foreground">{entry.created_at_ist ?? formatDateTimeIST(entry.created_at)}</p>
              </div>
              <p className="mt-1 text-[11px] leading-snug">{entry.details || 'No details'}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Admin #{entry.admin_user_id}
                {entry.target_user_id ? ` → User #${entry.target_user_id}` : ''}
              </p>
            </div>
          ))}
          {activityLogs.length === 0 && <p className="text-[11px] text-muted-foreground">No activity.</p>}
        </div>
      </Card>
    </div>
  )
}
