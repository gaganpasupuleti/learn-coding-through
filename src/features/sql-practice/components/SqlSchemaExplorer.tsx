import { ChevronRight, Table2 } from 'lucide-react'

const PLACEHOLDER_TABLES = [
  { name: 'employees', columns: ['id', 'name', 'department_id', 'salary'] },
  { name: 'departments', columns: ['id', 'name', 'location'] },
  { name: 'orders', columns: ['id', 'customer_id', 'amount', 'order_date'] },
]

export function SqlSchemaExplorer() {
  return (
    <aside className="flex h-full flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Database Explorer
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-xs">
        <p className="mb-2 px-1 text-[10px] text-slate-600">Sample schema (placeholder)</p>
        <ul className="space-y-1">
          {PLACEHOLDER_TABLES.map((table) => (
            <li key={table.name}>
              <div className="flex items-center gap-1 rounded px-1.5 py-1 text-slate-300 hover:bg-slate-900">
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <Table2 className="h-3.5 w-3.5 text-emerald-500/80" />
                {table.name}
              </div>
              <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-slate-800 pl-2">
                {table.columns.map((col) => (
                  <li key={col} className="text-[10px] text-slate-500">
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
