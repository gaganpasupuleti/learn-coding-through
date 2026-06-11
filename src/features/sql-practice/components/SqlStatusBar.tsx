import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

interface SqlStatusBarProps {
  databaseName: string
  tableCount: number
  questionTitle: string
  lineInfo?: string
}

export function SqlStatusBar({ databaseName, tableCount, questionTitle, lineInfo }: SqlStatusBarProps) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 text-xs',
        wb.border,
        'bg-[#007ACC]/10',
        wb.textMuted,
      )}
    >
      <span>
        Database: <span className={cn('font-medium', wb.textSecondary)}>{databaseName}</span>
      </span>
      <span>{tableCount} tables (metadata)</span>
      <span>
        Question: <span className={cn('font-medium', wb.textSecondary)}>{questionTitle}</span>
      </span>
      {lineInfo && <span className="ml-auto font-mono">{lineInfo}</span>}
      <span className={lineInfo ? '' : 'ml-auto'}>Phase 1 — no execution</span>
    </footer>
  )
}
