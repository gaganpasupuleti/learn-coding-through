import { ChevronRight, Table2 } from 'lucide-react'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'

const PLACEHOLDER_TABLES = [
  { name: 'employees', columns: ['id', 'name', 'department_id', 'salary'] },
  { name: 'departments', columns: ['id', 'name', 'location'] },
  { name: 'orders', columns: ['id', 'customer_id', 'amount', 'order_date'] },
]

export function SqlSchemaExplorer() {
  return (
    <aside className={cn('flex h-full flex-col border-r', wb.panel, wb.border)}>
      <div className={cn('border-b px-4 py-3 text-xs font-bold uppercase tracking-widest', wb.border, wb.textMuted)}>
        Database Explorer
      </div>
      <div className={cn('flex-1 overflow-y-auto p-3 text-sm', wb.textSecondary)}>
        <p className={cn('mb-3 px-1 text-xs', wb.textMuted)}>Sample schema (placeholder)</p>
        <ul className="space-y-2">
          {PLACEHOLDER_TABLES.map((table) => (
            <li key={table.name}>
              <div className={cn('flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#111827]', wb.textPrimary)}>
                <ChevronRight className={cn('h-3.5 w-3.5', wb.textMuted)} />
                <Table2 className="h-4 w-4 text-emerald-400/90" />
                {table.name}
              </div>
              <ul className={cn('ml-7 mt-1 space-y-0.5 border-l pl-3', wb.border)}>
                {table.columns.map((col) => (
                  <li key={col} className={cn('text-sm', wb.textMuted)}>
                    {col}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
