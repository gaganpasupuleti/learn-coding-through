import { ChevronRight, Table2 } from 'lucide-react'

const PLACEHOLDER_TABLES = [
  { name: 'employees', columns: ['id', 'name', 'department_id', 'salary'] },
  { name: 'departments', columns: ['id', 'name', 'location'] },
  { name: 'orders', columns: ['id', 'customer_id', 'amount', 'order_date'] },
]

export function SqlSchemaExplorer() {
  return (
    <aside className="flex h-full flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Database Explorer
      </div>
      <div className="flex-1 overflow-y-auto p-3 text-sm">
        <p className="mb-3 px-1 text-xs text-slate-500">Sample schema (placeholder)</p>
        <ul className="space-y-1.5">
          {PLACEHOLDER_TABLES.map((table) => (
            <li key={table.name}>
              <div className="flex items-center gap-1.5 rounded px-2 py-1.5 text-slate-300 hover:bg-slate-900">
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                <Table2 className="h-4 w-4 text-emerald-500/80" />
                {table.name}
              </div>
              <ul className="ml-6 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
                {table.columns.map((col) => (
                  <li key={col} className="text-sm text-slate-500">
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
