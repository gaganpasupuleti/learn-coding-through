import { TableProperties } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

export function SqlResultsPanel() {
  return (
    <div className={cn('flex min-h-[140px] flex-col items-center justify-center gap-2 p-6 text-center', wb.textMuted)}>
      <TableProperties className="h-8 w-8 text-[#475569]" />
      <p className="text-sm">No results yet.</p>
      <p className="max-w-md text-xs leading-relaxed">
        Query results will appear here when SQL execution is enabled in Phase 2.
      </p>
    </div>
  )
}
