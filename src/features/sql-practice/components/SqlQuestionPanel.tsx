import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

export function SqlQuestionPanel() {
  return (
    <aside className={cn('flex h-full flex-col border-l', wb.panel, wb.border)}>
      <div className={cn('border-b px-4 py-3 text-xs font-bold uppercase tracking-widest', wb.border, wb.textMuted)}>
        Task
      </div>
      <div className={cn('flex-1 overflow-y-auto p-4 space-y-4 text-[15px] leading-relaxed', wb.textSecondary)}>
        <p className={cn('text-base font-semibold', wb.textPrimary)}>List employee names</p>
        <p>
          Write a query that returns each employee&apos;s <code className="text-emerald-300">name</code> and{' '}
          <code className="text-emerald-300">department_id</code> from the sample{' '}
          <code className="text-emerald-300">employees</code> table.
        </p>
        <div className={cn('rounded-lg border p-4 text-sm', wb.border, 'bg-[#111827]', wb.textMuted)}>
          Expected columns: name, department_id
        </div>
        <p className="text-sm text-amber-300 leading-relaxed">
          SQL Practice Ground is being rebuilt as a separate workbench under Issue #30.
        </p>
      </div>
    </aside>
  )
}
