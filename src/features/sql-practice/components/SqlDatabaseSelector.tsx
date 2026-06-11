import type { SqlDatabaseId, SqlDatabaseMeta } from '../types/sqlPractice.types'
import { wb } from '@/lib/workbench-theme'
import { cn } from '@/lib/utils'
import { Database } from 'lucide-react'

interface SqlDatabaseSelectorProps {
  databases: SqlDatabaseMeta[]
  activeId: SqlDatabaseId
  onSelect: (id: SqlDatabaseId) => void
}

export function SqlDatabaseSelector({ databases, activeId, onSelect }: SqlDatabaseSelectorProps) {
  return (
    <div className="space-y-1 px-2 py-2">
      <p className={cn('px-2 text-xs font-bold uppercase tracking-widest', wb.textMuted)}>Databases</p>
      <ul className="space-y-0.5">
        {databases.map((db) => {
          const active = db.id === activeId
          return (
            <li key={db.id}>
              <button
                type="button"
                onClick={() => onSelect(db.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
                  active
                    ? 'bg-emerald-950/50 text-emerald-100 ring-1 ring-emerald-600/50'
                    : cn(wb.textSecondary, 'hover:bg-[#111827] hover:text-[#E5E7EB]'),
                )}
              >
                <Database className={cn('h-4 w-4 shrink-0', active ? 'text-emerald-400' : 'text-[#64748B]')} />
                <span className="truncate font-medium">{db.displayName}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
